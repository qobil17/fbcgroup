import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Length } from 'class-validator';
import { ServiceArea, ServiceCollection, ServiceType } from '../../enums/service.enum';
import { ObjectId } from 'mongoose';

@InputType()
export class ServiceInput {
	@IsNotEmpty()
	@Field(() => ServiceCollection)
	serviceCollection: ServiceCollection;

	@IsNotEmpty()
	@Field(() => ServiceType)
	serviceType: ServiceType;

	@IsNotEmpty()
	@Field(() => ServiceArea)
	serviceArea: ServiceArea;

	@IsNotEmpty()
	@Field(() => Number)
	servicePrice: number;

	@IsOptional()
	@Length(5, 10000)
	@Field(() => String, { nullable: true })
	serviceDesc?: string;

	@IsNotEmpty()
	@Field(() => [String])
	serviceImages: string[];

	// GraphQl input emas
	memberId?: ObjectId; // injected from auth
}
