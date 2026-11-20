import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Service, Services } from '../../libs/dto/service/service';
import { AllServicesInquiry, ServiceInput, ServicesInquiry } from '../../libs/dto/service/service.input';
import { Direction, Message } from '../../libs/enums/common.enum';
import { ServiceCollection, ServiceStatus } from '../../libs/enums/service.enum';
import { StatisticModifier, T } from '../../libs/types/common';
import { ViewGroup } from '../../libs/enums/view.enum';
import { ViewInput } from '../../libs/dto/view/view.input';
import { ViewService } from '../view/view.service';
import { MemberService } from '../member/member.service';
import { ServiceUpdate } from '../../libs/dto/service/service.update';
import * as moment from 'moment';
import { translateFromUzbek, TargetLang } from '../../libs/translate';
import { MemberType } from '../../libs/enums/member.enum';

@Injectable()
export class ServiceService {
	constructor(
		@InjectModel('Service') private readonly serviceModel: Model<Service>,
		private viewService: ViewService,
	) {}
	// Tarjima maydonlari: [maydon, manba (o'zbekcha), til]
	private static readonly I18N: [string, 'serviceTitle' | 'serviceDesc', TargetLang][] = [
		['serviceTitleRu', 'serviceTitle', 'ru'],
		['serviceTitleEn', 'serviceTitle', 'en'],
		['serviceDescRu', 'serviceDesc', 'ru'],
		['serviceDescEn', 'serviceDesc', 'en'],
	];

	/**
	 * Bo'sh RU/EN maydonlarni o'zbekchadan avtomatik tarjima qiladi.
	 * Admin qo'lda yozgan tarjimaga tegilmaydi; avtomatik tarjima esa o'zbekcha matn o'zgarsa yangilanadi.
	 */
	private async autoTranslate(input: T, existing: T = {}): Promise<T> {
		const auto = new Set<string>(existing.serviceAutoTranslated ?? []);
		const patch: T = {};
		const jobs: Promise<void>[] = [];
		for (const [field, source, lang] of ServiceService.I18N) {
			const provided = input[field];
			const manual = typeof provided === 'string' && provided.trim() !== '' && provided.trim() !== (existing[field] ?? '').trim();
			if (manual) {
				auto.delete(field);
				continue;
			}
			const sourceText = (input[source] ?? existing[source] ?? '').trim();
			const current = (provided !== undefined ? provided : existing[field] ?? '').trim();
			const sourceChanged = input[source] !== undefined && (input[source] ?? '').trim() !== (existing[source] ?? '').trim();
			const needs = sourceText && (!current || (auto.has(field) && sourceChanged));
			if (!needs) continue;
			jobs.push(
				translateFromUzbek(sourceText, lang).then((out) => {
					if (out) {
						patch[field] = out;
						auto.add(field);
					}
				}),
			);
		}
		await Promise.all(jobs);
		patch.serviceAutoTranslated = [...auto];
		return patch;
	}

	public async createService(input: ServiceInput): Promise<Service> {
		const translated = await this.autoTranslate(input as T);
		try {
			const result = await this.serviceModel.create({
				...input,
				...translated,
				serviceStatus: input.serviceStatus ?? ServiceStatus.ACTIVE,
			});

			return result;
		} catch (err) {
			console.log('createService error:', err);
			throw new BadRequestException(Message.CREATE_FAILED);
		}
	}

	public async getService(memberId: ObjectId, serviceId: ObjectId): Promise<Service> {
		const search: T = {
			_id: serviceId,
			serviceStatus: ServiceStatus.ACTIVE,
			deletedAt: null,
			serviceCollection: {
				$in: [ServiceCollection.ALIF, ServiceCollection.HPLINE],
			},
		};

		const targetServcie: Service = await this.serviceModel.findOne(search).lean().exec();
		if (!targetServcie) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		if (memberId) {
			const viewInput = { memberId: memberId, viewRefId: serviceId, viewGroup: ViewGroup.SERVICE };
			const newView = await this.viewService.recordView(viewInput);
			if (newView) {
				const updatedService = await this.serviceStatsEditor({
					_id: serviceId,
					targetKey: 'serviceViews',
					modifier: 1,
				});

				targetServcie.serviceViews = updatedService.serviceViews;
		}
		}

		// targetServcie.memberData = await this.memberService.getMember(null, targetServcie.memberId);

		return targetServcie;
	}

	public async updateService(input: ServiceUpdate): Promise<Service> {
		// let { deletedAt } = input;

		const search: T = {
			_id: input._id,
		};

		// soft delete
		// if (input.deletedAt) {
		// 	deletedAt = moment().toDate();
		// 	input.deletedAt = deletedAt;
		// }

		const existing = (await this.serviceModel.findOne(search).lean().exec()) as T | null;
		const translated = existing ? await this.autoTranslate(input as T, existing) : {};
		const result = await this.serviceModel.findOneAndUpdate(search, { ...input, ...translated }, { new: true }).exec();

		if (!result) {
			throw new InternalServerErrorException(Message.UPDATE_FAILED);
		}

		return result;
	}

	public async getServices(memberId: ObjectId, input: ServicesInquiry): Promise<Services> {
		const match: T = { deletedAt: null, serviceStatus: ServiceStatus.ACTIVE };

		const sort: T = {
			[input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC,
		};

		this.shapeMatchQuery(match, input);
		const result = await this.serviceModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [{ $skip: (input.page - 1) * input.limit }, { $limit: Math.min(input.limit, 100) }],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		if (!result.length) {
			throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		}

		return result[0];
	}

	private shapeMatchQuery(match: T, input: ServicesInquiry): void {
		const { serviceCollection, serviceType, serviceArea, serviceStatus, serviceTitle, text } = input.search;

		if (serviceCollection) {
			match.serviceCollection = serviceCollection;
		}

		if (serviceType) {
			match.serviceType = serviceType;
		}

		if (serviceStatus) {
			match.serviceStatus = serviceStatus;
		}

		if (serviceArea) {
			match.serviceArea = serviceArea;
		}
		if (serviceTitle) {
			match.serviceTitle = serviceTitle;
		}

		if (text) {
			const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
			const rx = { $regex: new RegExp(escaped, 'i') };
			// qidiruv barcha tillardagi nom va tavsif bo'yicha
			match.$or = ['serviceTitle', 'serviceTitleRu', 'serviceTitleEn', 'serviceDesc', 'serviceDescRu', 'serviceDescEn'].map(
				(f) => ({ [f]: rx }),
			);
		}
	}

	public async getAllServicesByAdmin(memberId: ObjectId, input: AllServicesInquiry): Promise<Services> {
		const { serviceStatus, serviceCollection } = input.search;
		const match: T = {};
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		if (serviceStatus) match.serviceStatus = serviceStatus;
		if (serviceCollection) match.serviceCollection = serviceCollection;

		const result = await this.serviceModel
			.aggregate([
				{
					$match: {
						...match,
						deletedAt: null, // faqat active service’lar
					},
				},
				{ $sort: sort },
				{
					$facet: {
						list: [{ $skip: (input.page - 1) * input.limit }, { $limit: Math.min(input.limit, 100) }],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		if (!result.length) {
			throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		}

		return result[0];
	}

	public async removeServiceByAdmin(serviceId: ObjectId): Promise<Service> {
		const search: T = { _id: serviceId, serviceStatus: ServiceStatus.DELETE };
		const result = await this.serviceModel.findOneAndDelete(search).exec();
		if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);

		return result;
	}

	public async serviceStatsEditor(input: StatisticModifier): Promise<Service> {
		const { _id, targetKey, modifier } = input;
		return await this.serviceModel
			.findByIdAndUpdate(
				_id,
				{ $inc: { [targetKey]: modifier } },
				{
					new: true,
				},
			)
			.exec();
	}
}
