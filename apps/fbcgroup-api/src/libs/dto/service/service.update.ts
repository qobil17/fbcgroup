import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Length } from 'class-validator';
import { ObjectId } from 'mongoose';
import { ServiceArea, ServiceCollection, ServiceStatus, ServiceType } from '../../enums/service.enum';

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
	@Field(() => [String], { nullable: true })
	serviceImages?: string[];

	// ❗ soft delete uchun
	deletedAt?: Date;

	// GraphQL input emas (auth’dan inject qilinadi)
	memberId?: ObjectId;
}
