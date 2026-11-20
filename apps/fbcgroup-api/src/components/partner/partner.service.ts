import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Partner, PartnerInput, PartnerUpdate } from '../../libs/dto/partner/partner';
import { Message } from '../../libs/enums/common.enum';
import { PartnerStatus } from '../../libs/enums/partner.enum';

@Injectable()
export class PartnerService {
	constructor(@InjectModel('Partner') private readonly partnerModel: Model<Partner>) {}

	// Saytda: faqat ko'rinadigan hamkorlar, tartib raqami bo'yicha
	public async getPartners(): Promise<Partner[]> {
		return (await this.partnerModel
			.find({ partnerStatus: PartnerStatus.ACTIVE })
			.sort({ partnerOrder: 1, createdAt: 1 })
			.lean()
			.exec()) as Partner[];
	}

	public async getAllPartnersByAdmin(): Promise<Partner[]> {
		return (await this.partnerModel.find().sort({ partnerOrder: 1, createdAt: 1 }).lean().exec()) as Partner[];
	}

	public async createPartner(input: PartnerInput): Promise<Partner> {
		try {
			return await this.partnerModel.create(input);
		} catch (err) {
			throw new BadRequestException(Message.CREATE_FAILED);
		}
	}

	public async updatePartner(input: PartnerUpdate): Promise<Partner> {
		const { _id, ...rest } = input;
		const result = await this.partnerModel.findByIdAndUpdate(_id, rest, { new: true }).lean().exec();
		if (!result) throw new BadRequestException(Message.UPDATE_FAILED);
		return result as Partner;
	}

	public async removePartnerByAdmin(partnerId: ObjectId): Promise<Partner> {
		const result = await this.partnerModel.findByIdAndDelete(partnerId).lean().exec();
		if (!result) throw new BadRequestException(Message.REMOVE_FAILED);
		return result as Partner;
	}
}
