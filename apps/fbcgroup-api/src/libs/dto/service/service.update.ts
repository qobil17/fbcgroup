import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsIn, Length } from 'class-validator';
import { ObjectId } from 'mongoose';
import { ServiceDetailHpline, ServiceDetailAlif, ServiceArea, ServiceCollection, ServiceStatus, ServiceType } from '../../enums/service.enum';

@InputType()
export class ServiceUpdate {
	@IsNotEmpty()
	@Field(() => String)
	_id: ObjectId;

	@IsOptional()
	@Field(() => ServiceCollection, { nullable: true })
	serviceCollection?: ServiceCollection;

	@IsOptional()
	@Field(() => ServiceType, { nullable: true })
	serviceType?: ServiceType;

	@IsOptional()
	@Field(() => ServiceStatus, { nullable: true })
	serviceStatus?: ServiceStatus;

	@IsOptional()
	@IsIn([...Object.values(ServiceDetailHpline), ...Object.values(ServiceDetailAlif)])
	@Field(() => String, { nullable: true })
	serviceDetail?: string;

	@IsOptional()
	@Length(3, 200)
	@Field(() => String, { nullable: true })
	serviceTitle?: string;

	@IsOptional()
	@Field(() => ServiceArea, { nullable: true })
	serviceArea?: ServiceArea;

	@IsOptional()
	@Field(() => Number, { nullable: true })
	servicePrice?: number;

	@IsOptional()
	@Field(() => String, { nullable: true })
	serviceDesc?: string;

	@IsOptional()
	@Length(0, 200)
	@Field(() => String, { nullable: true })
	serviceTitleRu?: string;

	@IsOptional()
	@Length(0, 200)
	@Field(() => String, { nullable: true })
	serviceTitleEn?: string;

	@IsOptional()
	@Length(0, 10000)
	@Field(() => String, { nullable: true })
	serviceDescRu?: string;

	@IsOptional()
	@Length(0, 10000)
	@Field(() => String, { nullable: true })
	serviceDescEn?: string;

	@IsOptional()
	@Field(() => [String], { nullable: true })
	serviceImages?: string[];

	// ❗ soft delete uchun — @IsOptional so forbidNonWhitelisted skips it
	@IsOptional()
	deletedAt?: Date;

	// GraphQL input emas (auth’dan inject qilinadi) — @IsOptional so forbidNonWhitelisted skips it
	@IsOptional()
	memberId?: ObjectId;
}
