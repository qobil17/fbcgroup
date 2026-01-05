import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { ServiceArea, ServiceCollection, ServiceType } from '../../enums/service.enum';
import { Member, TotalCounter } from '../member/member';

@ObjectType()
export class Service {
	@Field(() => String)
	_id: ObjectId;

	@Field(() => ServiceCollection)
	serviceCollection: ServiceCollection;

	@Field(() => ServiceType)
	serviceType: ServiceType;

	@Field(() => ServiceArea)
	serviceArea: ServiceArea;

	@Field(() => Number)
	servicePrice: number;

	@Field(() => String, { nullable: true })
	serviceDesc?: string;

	@Field(() => [String])
	serviceImages: string[];

	@Field(() => Int)
	serviceViews: number;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;

	@Field(() => Date, { nullable: true })
	deletedAt?: Date;
}

@ObjectType()
export class Services {
	@Field(() => [Service])
	list: Service[];

	@Field(() => [TotalCounter], { nullable: true })
	metaCounter: TotalCounter[];
}
