import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Order } from '../../libs/dto/orderService/order';
import { OrderInput } from '../../libs/dto/orderService/order.input';
import { OrderStatus } from '../../libs/enums/order.enum';

@Injectable()
export class OrderServiceService {
	constructor(@InjectModel('Order') private readonly orderModel: Model<Order>) {}

	async createOrder(input: OrderInput): Promise<Order> {
		const result = new this.orderModel({
			...input,
			createdAt: new Date(),
			updatedAt: new Date(),
		});
		return result;
	}
}
