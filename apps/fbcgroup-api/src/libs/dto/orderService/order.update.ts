import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Min, Length } from 'class-validator';
import { ObjectId } from 'mongoose';
import { ServiceArea, ServiceCollection, ServiceDetail, ServiceType } from '../../enums/service.enum';
import { OrderStatus } from '../../enums/order.enum';

@InputType()
export class OrderUpdate {
	@IsNotEmpty()
	@Field(() => String)
	orderId: ObjectId; // Yangilanayotgan order ID

	@IsOptional()
	@Field(() => ServiceCollection, { nullable: true })
	serviceCollection?: ServiceCollection;

	@IsOptional()
	@Field(() => ServiceDetail, { nullable: true })
	serviceDetail?: ServiceDetail;

	@IsOptional()
	@Field(() => ServiceType, { nullable: true })
	serviceType?: ServiceType;

	@IsOptional()
	@Field(() => ServiceArea, { nullable: true })
	serviceArea?: ServiceArea;

	@IsOptional()
	@Min(1)
	@Field(() => Int, { nullable: true })
	estimatedSquare?: number;

	@IsOptional()
	@Length(7, 20)
	@Field(() => String, { nullable: true })
	phone?: string;

	@IsOptional()
	@Field(() => OrderStatus, { nullable: true })
	orderStatus?: OrderStatus;
}
