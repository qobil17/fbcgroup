import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Service } from '../../libs/dto/service/service';
import { ServiceInput } from '../../libs/dto/service/service.input';
import { Message } from '../../libs/enums/common.enum';
import { ServiceCollection } from '../../libs/enums/service.enum';
import { StatisticModifier, T } from '../../libs/types/common';
import { ViewGroup } from '../../libs/enums/view.enum';
import { ViewInput } from '../../libs/dto/view/view.input';
import { ViewService } from '../view/view.service';
import { MemberService } from '../member/member.service';
import { ServiceUpdate } from '../../libs/dto/service/service.update';
import * as moment from 'moment';
import { MemberType } from '../../libs/enums/member.enum';

@Injectable()
export class ServiceService {
	constructor(
		@InjectModel('Service') private readonly serviceModel: Model<Service>,
		private viewService: ViewService,
		private memberService: MemberService,
	) {}
	public async createService(input: ServiceInput): Promise<Service> {
		try {
			const result = await this.serviceModel.create(input);
			return result;
		} catch (err) {
			console.log('Error, Service.model:', err.message);
			throw new BadRequestException(Message.CREATE_FAILED);
		}
	}

	public async getService(memberId: ObjectId, serviceId: ObjectId): Promise<Service> {
		const search: T = {
			_id: serviceId,
			serviceCollection: {
				$in: [ServiceCollection.ALIF, ServiceCollection.HPLINE],
			},
		};

		const targetServcie: Service = await this.serviceModel.findOne(search).lean().exec();
		console.log('targetServcie:', targetServcie);
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
				console.log('targetService:', targetServcie.serviceViews);
			}
		}

		// targetServcie.memberData = await this.memberService.getMember(null, targetServcie.memberId);

		return targetServcie;
	}

	public async updateService(input: ServiceUpdate): Promise<Service> {
		let { deletedAt } = input;

		const search: T = {
			_id: input._id,
			deletedAt: null,
		};

		// soft delete
		if (input.deletedAt) {
			deletedAt = moment().toDate();
			input.deletedAt = deletedAt;
		}

		const result = await this.serviceModel.findOneAndUpdate(search, input, { new: true }).exec();

		if (!result) {
			throw new InternalServerErrorException(Message.UPDATE_FAILED);
		}

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
