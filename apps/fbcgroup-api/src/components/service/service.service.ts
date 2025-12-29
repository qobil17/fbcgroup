import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Service } from '../../libs/dto/service/service';
import { ServiceInput } from '../../libs/dto/service/service.input';
import { Message } from '../../libs/enums/common.enum';

@Injectable()
export class ServiceService {
	constructor(@InjectModel('Service') private readonly serviceModel: Model<Service>) {}
	public async createService(input: ServiceInput): Promise<Service> {
		try {
			const result = await this.serviceModel.create(input);
			return result;
		} catch (err) {
			console.log('Error, Service.model:', err.message);
			throw new BadRequestException(Message.CREATE_FAILED);
		}
	}
}
