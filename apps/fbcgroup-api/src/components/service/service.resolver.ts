import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ServiceService } from './service.service';
import { Service, Services } from '../../libs/dto/service/service';
import { AllServicesInquiry, ServiceInput, ServicesInquiry } from '../../libs/dto/service/service.input';
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

	@UseGuards(WithoutGuard)
	@Query((returns) => Service)
	public async getService(@Args('serviceId') input: string, @AuthMember('_id') memberId: ObjectId): Promise<Service> {
		console.log('Query: getService');
		const serviceId = shapeIntoMongoObjectId(input);
		return await this.serviceService.getService(memberId, serviceId);
	}

	@UseGuards(WithoutGuard)
	@Query(() => Services)
	public async getServices(
		@Args('input') input: ServicesInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Services> {
		console.log('Query: getServices');
		return await this.serviceService.getServices(memberId, input);
	}

	// ADMIN API//
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

	@Mutation(() => Service)
	@UseGuards(RolesGuard)
	@Roles(MemberType.ADMIN)
	public async updateService(@Args('input') input: ServiceUpdate): Promise<Service> {
		console.log('Mutation: updateService');
		return this.serviceService.updateService(input);
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Query((returns) => Services)
	public async getAllServicesByAdmin(
		@Args('input') input: AllServicesInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Services> {
		console.log('Query: getAllServicesByAdmin');
		return await this.serviceService.getAllServicesByAdmin(memberId, input);
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation((returns) => Service)
	public async removeServiceByAdmin(@Args('propertyId') input: string): Promise<Service> {
		console.log('Mutation: removeServiceByAdmin');
		const serviceId = shapeIntoMongoObjectId(input);
		return await this.serviceService.removeServiceByAdmin(serviceId);
	}
}
