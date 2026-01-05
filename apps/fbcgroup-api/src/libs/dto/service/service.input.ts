import { Field, InputType, Int } from '@nestjs/graphql';
import { IsIn, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import { ServiceArea, ServiceCollection, ServiceType } from '../../enums/service.enum';
import { ObjectId } from 'mongoose';
import { availableServiceSorts } from '../../config';
import { Direction } from '../../enums/common.enum';

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

@InputType()
export class SISearch {
	@IsOptional()
	@Field(() => ServiceCollection, { nullable: true })
	serviceCollection?: ServiceCollection;

	@IsOptional()
	@Field(() => ServiceType, { nullable: true })
	serviceType?: ServiceType;

	@IsOptional()
	@Field(() => ServiceArea, { nullable: true })
	serviceArea?: ServiceArea;

	@IsOptional()
	@Field(() => Int, { nullable: true })
	minPrice?: number;

	@IsOptional()
	@Field(() => Int, { nullable: true })
	maxPrice?: number;

	@IsOptional()
	@Field(() => String, { nullable: true })
	text?: string;
}

@InputType()
export class ServicesInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@IsIn(availableServiceSorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@Field(() => SISearch)
	search: SISearch;
}
