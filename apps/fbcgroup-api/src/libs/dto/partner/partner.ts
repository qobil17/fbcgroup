import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsUrl, Length } from 'class-validator';
import { ObjectId } from 'mongoose';
import { PartnerStatus } from '../../enums/partner.enum';

// ===================== PARTNER =====================

@ObjectType()
export class Partner {
	@Field(() => String)
	_id: ObjectId;

	@Field(() => String)
	partnerName: string;

	@Field(() => String)
	partnerLogo: string;

	@Field(() => String, { nullable: true })
	partnerLink?: string;

	@Field(() => String, { nullable: true })
	partnerDesc?: string;

	@Field(() => Int)
	partnerOrder: number;

	@Field(() => PartnerStatus)
	partnerStatus: PartnerStatus;

	@Field(() => Date)
	createdAt: Date;
}

@InputType()
export class PartnerInput {
	@IsNotEmpty()
	@Length(2, 120)
	@Field(() => String)
	partnerName: string;

	@IsNotEmpty()
	@Field(() => String)
	partnerLogo: string;

	@IsOptional()
	@IsUrl({ require_protocol: true }, { message: 'Sayt manzili https:// bilan boshlanishi kerak' })
	@Field(() => String, { nullable: true })
	partnerLink?: string;

	@IsOptional()
	@Length(0, 300)
	@Field(() => String, { nullable: true })
	partnerDesc?: string;

	@IsOptional()
	@IsInt()
	@Field(() => Int, { nullable: true })
	partnerOrder?: number;

	@IsOptional()
	@IsIn(Object.values(PartnerStatus))
	@Field(() => PartnerStatus, { nullable: true })
	partnerStatus?: PartnerStatus;
}

@InputType()
export class PartnerUpdate {
	@IsNotEmpty()
	@Field(() => String)
	_id: ObjectId;

	@IsOptional()
	@Length(2, 120)
	@Field(() => String, { nullable: true })
	partnerName?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	partnerLogo?: string;

	@IsOptional()
	@IsUrl({ require_protocol: true }, { message: 'Sayt manzili https:// bilan boshlanishi kerak' })
	@Field(() => String, { nullable: true })
	partnerLink?: string;

	@IsOptional()
	@Length(0, 300)
	@Field(() => String, { nullable: true })
	partnerDesc?: string;

	@IsOptional()
	@IsInt()
	@Field(() => Int, { nullable: true })
	partnerOrder?: number;

	@IsOptional()
	@Field(() => PartnerStatus, { nullable: true })
	partnerStatus?: PartnerStatus;
}
