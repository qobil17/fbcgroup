import { InputType, Field, Int } from '@nestjs/graphql';

import { IsNotEmpty, IsOptional, Length, ArrayMinSize, Min, IsIn } from 'class-validator';
import { ObjectId } from 'mongoose';
import { OrderUpdate } from './order.update';
import { ServiceArea, ServiceCollection, ServiceDetail, ServiceType } from '../../enums/service.enum';
import { availableMemberSorts } from '../../config';
import { Direction } from '../../enums/common.enum';
import { OrderStatus } from '../../enums/order.enum';

@InputType()
export class OrderInput {
	@IsNotEmpty()
	@Field(() => ServiceCollection)
	serviceCollection: ServiceCollection;

	@IsNotEmpty()
	@Field(() => ServiceDetail)
	serviceDetail: ServiceDetail;

	@IsNotEmpty()
	@Field(() => ServiceType)
	serviceType: ServiceType;

	@IsNotEmpty()
	@Field(() => ServiceArea)
	serviceArea: ServiceArea;

	@IsOptional()
	@Min(1)
	@Field(() => Int, { nullable: true })
	estimatedSquare?: number;

	@IsNotEmpty()
	@Length(7, 20)
	@Field(() => String)
	phone: string;

	// ❗ GraphQL input emas (AuthGuard’dan keladi)
	memberId?: ObjectId;
}

@InputType()
export class OISearch {
	@IsOptional()
	@Field(() => OrderStatus, { nullable: true })
	orderStatus?: OrderStatus;

	@IsOptional()
	@Field(() => [ServiceCollection], { nullable: true })
	serviceCollection?: ServiceCollection[];

	@IsOptional()
	@Field(() => ServiceType, { nullable: true })
	serviceType?: ServiceType;

	@IsOptional()
	@Field(() => ServiceArea, { nullable: true })
	serviceArea?: ServiceArea;

	@IsOptional()
	@Field(() => String, { nullable: true })
	text?: string;
}

@InputType()
export class OrdersInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@IsIn(availableMemberSorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@Field(() => OISearch)
	search: OISearch;
}
