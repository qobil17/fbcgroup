import { Field, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { Member } from '../member/member';
import { OrderStatus } from '../../enums/order.enum';
import { ServiceArea, ServiceCollection, ServiceDetail, ServiceType } from '../../enums/service.enum';

@ObjectType()
export class Order {
	@Field(() => Member)
	memberId: Member;

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
