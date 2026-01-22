import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { Member } from '../member/member';
import { OrderStatus } from '../../enums/order.enum';
import { ServiceArea, ServiceCollection, ServiceDetail, ServiceType } from '../../enums/service.enum';
import { IsNotEmpty } from 'class-validator';

@ObjectType()
export class Order {
	@Field(() => String)
	_id: string;

	@Field(() => Member)
	member: Member;

	@Field(() => String)
	phone: string;

	@Field(() => OrderStatus)
	orderStatus: OrderStatus;

	@Field(() => ServiceCollection)
	serviceCollection: ServiceCollection;

	@Field(() => ServiceDetail)
	serviceDetail: ServiceDetail;

	@Field(() => ServiceType)
	serviceType: ServiceType;

	@Field(() => ServiceArea)
	serviceArea: ServiceArea;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;

	@Field(() => Date, { nullable: true })
	deletedAt?: Date;
}

@ObjectType()
export class OrderTotalCounter {
	@Field(() => Int, { nullable: true })
	total: number;
}

@ObjectType()
export class Orders {
	@Field(() => [Order])
	list: Order[];

	@Field(() => OrderTotalCounter, { nullable: true })
	metaCounter: OrderTotalCounter;
}
