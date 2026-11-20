import { Field, InputType, Int } from '@nestjs/graphql';
import { IsIn, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import {
	ServiceDetailHpline,
	ServiceDetailAlif,
	ServiceArea,
	ServiceCollection,
	ServiceStatus,
	ServiceType,
} from '../../enums/service.enum';
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
	@Length(3, 200)
	@Field(() => String)
	serviceTitle: string;

	@IsOptional()
	@Field(() => ServiceStatus, { nullable: true })
	serviceStatus?: ServiceStatus;

	@IsNotEmpty()
	@IsIn([...Object.values(ServiceDetailHpline), ...Object.values(ServiceDetailAlif)])
	@Field(() => String)
	serviceDetail: string;

	@IsNotEmpty()
	@Field(() => ServiceArea)
	serviceArea: ServiceArea;

	@IsOptional()
	@Field(() => Number, { nullable: true })
	servicePrice?: number;

	@IsOptional()
	@Length(5, 10000)
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

	@IsNotEmpty()
	@Field(() => [String])
	serviceImages: string[];

	// GraphQL input emas — injected from auth; @IsOptional so forbidNonWhitelisted skips it
	@IsOptional()
	memberId?: ObjectId;
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
	@Field(() => ServiceStatus, { nullable: true })
	serviceStatus?: ServiceStatus;

	@IsOptional()
	@Length(3, 200)
	@Field(() => String, { nullable: true })
	serviceTitle?: string;

	@IsOptional()
	@IsIn([...Object.values(ServiceDetailHpline), ...Object.values(ServiceDetailAlif)])
	@Field(() => String, { nullable: true })
	serviceDetail?: string;

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

@InputType()
class SLPISearch {
	@IsOptional()
	@Field(() => ServiceStatus, { nullable: true })
	serviceStatus?: ServiceStatus;

	@IsOptional()
	@Field(() => [ServiceCollection], { nullable: true })
	serviceCollection?: ServiceCollection;
}

@InputType()
export class AllServicesInquiry {
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
	@Field(() => SLPISearch)
	search: SLPISearch;
}
