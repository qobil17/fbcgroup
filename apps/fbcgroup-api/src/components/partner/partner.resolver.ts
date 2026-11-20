import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PartnerService } from './partner.service';
import { Partner, PartnerInput, PartnerUpdate } from '../../libs/dto/partner/partner';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MemberType } from '../../libs/enums/member.enum';
import { shapeIntoMongoObjectId } from '../../libs/config';

@Resolver()
export class PartnerResolver {
	constructor(private readonly partnerService: PartnerService) {}

	// Sayt ("Biz haqimizda" sahifasi)
	@Query(() => [Partner])
	public async getPartners(): Promise<Partner[]> {
		return this.partnerService.getPartners();
	}

	// ===================== ADMIN =====================

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Query(() => [Partner])
	public async getAllPartnersByAdmin(): Promise<Partner[]> {
		return this.partnerService.getAllPartnersByAdmin();
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => Partner)
	public async createPartner(@Args('input') input: PartnerInput): Promise<Partner> {
		return this.partnerService.createPartner(input);
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => Partner)
	public async updatePartner(@Args('input') input: PartnerUpdate): Promise<Partner> {
		input._id = shapeIntoMongoObjectId(input._id);
		return this.partnerService.updatePartner(input);
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => Partner)
	public async removePartnerByAdmin(@Args('partnerId') partnerId: string): Promise<Partner> {
		return this.partnerService.removePartnerByAdmin(shapeIntoMongoObjectId(partnerId));
	}
}
