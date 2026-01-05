import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ServiceService } from './service.service';
import { Service } from '../../libs/dto/service/service';
import { ServiceInput } from '../../libs/dto/service/service.input';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ObjectId } from 'mongoose';
import { WithoutGuard } from '../auth/guards/without.guard';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { ServiceUpdate } from '../../libs/dto/service/service.update';

@Resolver()
export class ServiceResolver {
	constructor(private readonly serviceService: ServiceService) {}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => Service)
	public async createService(
		@Args('input') input: ServiceInput,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Service> {
		console.log('Mutation: createService');
		input.memberId = memberId;
		return await this.serviceService.createService(input);
	}

	@UseGuards(WithoutGuard)
	@Query((returns) => Service)
	public async getService(@Args('serviceId') input: string, @AuthMember('_id') memberId: ObjectId): Promise<Service> {
		console.log('Query: getService');
		const serviceId = shapeIntoMongoObjectId(input);
		return await this.serviceService.getService(memberId, serviceId);
	}

	@Mutation(() => Service)
	@UseGuards(RolesGuard)
	@Roles(MemberType.ADMIN)
	public async updateService(
		@Args('input', { type: () => ServiceUpdate }) input: ServiceUpdate,
		@AuthMember('_id') memberId: ObjectId,
		@AuthMember('memberType') memberType: MemberType,
	): Promise<Service> {
		return this.serviceService.updateService(input);
	}
}
