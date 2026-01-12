import { InputType, Field, Int } from '@nestjs/graphql';

import { IsNotEmpty, IsOptional, Length, ArrayMinSize, Min } from 'class-validator';
import { ObjectId } from 'mongoose';
import { OrderUpdate } from './order.update';
import { ServiceArea, ServiceCollection, ServiceDetail, ServiceType } from '../../enums/service.enum';

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
