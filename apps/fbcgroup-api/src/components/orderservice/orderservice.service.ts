import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Order, Orders } from '../../libs/dto/orderService/order';
import { OrderInput, OrdersInquiry } from '../../libs/dto/orderService/order.input';
import { OrderStatus } from '../../libs/enums/order.enum';
import { Direction, Message } from '../../libs/enums/common.enum';
import { T } from '../../libs/types/common';
import { ServiceCollection } from '../../libs/enums/service.enum';
import { OrderUpdate } from '../../libs/dto/orderService/order.update';

@Injectable()
export class OrderServiceService {
	constructor(@InjectModel('Order') private readonly orderModel: Model<Order>) {}

	public async createOrder(input: OrderInput): Promise<Order> {
		try {
			const order = new this.orderModel({
				...input,
				orderStatus: OrderStatus.PAUSE,
			});
			return await order.save();
		} catch (err) {
				throw new BadRequestException(Message.CREATE_FAILED);
		}
	}

	public async getOrder(memberId: ObjectId, orderId: ObjectId): Promise<Order> {
		const search: T = {
			_id: orderId,
			memberId: memberId,
			serviceCollection: {
				$in: [ServiceCollection.HPLINE, ServiceCollection.ALIF],
			},
		};
		const targetOrder: Order = await this.orderModel.findOne(search).lean().exec();

		if (!targetOrder) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		return targetOrder;
	}

	public async myOrder(memberId: ObjectId): Promise<Orders> {
		const match: T = {
			memberId,
			serviceCollection: {
				$in: [ServiceCollection.HPLINE, ServiceCollection.ALIF],
			},
			deletedAt: null,
		};

		const result = await this.orderModel.aggregate([
			{ $match: match },
			{ $sort: { createdAt: -1 } },
			{
				$facet: {
					list: [],
					metaCounter: [{ $count: 'total' }],
				},
			},
		]);

		return {
			list: result[0]?.list ?? [],
			metaCounter: result[0]?.metaCounter?.[0] ?? { total: 0 },
		};
	}

	public async updateOrder(memberId: ObjectId, input: OrderUpdate): Promise<Order> {
		const { orderId, ...updateData } = input;

		const search: T = {
			_id: orderId,
			memberId: memberId,
		};

		const result = await this.orderModel
			.findOneAndUpdate(search, updateData, { new: true })

			.exec();

		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

		return result;
	}

	public async updateOrderByAdmin(input: OrderUpdate): Promise<Order> {
		const { orderId, ...updateData } = input;
		const result = await this.orderModel
			.findByIdAndUpdate(orderId, updateData, { new: true })
			.exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);
		return result;
	}

	public async getAllOrdersByAdmin(input: OrdersInquiry, memberId: ObjectId): Promise<Orders> {
		const { orderStatus, serviceCollection } = input.search;

		const match: T = {};

		const sort: T = {
			[input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC,
		};

		if (orderStatus) match.orderStatus = orderStatus;
		if (serviceCollection) match.serviceCollection = { $in: serviceCollection };

		const result = await this.orderModel
			.aggregate([
				{
					$match: {
						...match,
						deletedAt: null,
					},
				},

				{
					$lookup: {
						from: 'members',
						localField: 'memberId',
						foreignField: '_id',
						as: 'member',
					},
				},
				{ $unwind: '$member' },

				{ $sort: sort },

				{
					$facet: {
						list: [{ $skip: (input.page - 1) * input.limit }, { $limit: Math.min(input.limit, 100) }],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		if (!result.length) {
			throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		}

		// $facet always returns result[0]; metaCounter is [{total:N}] (array) — normalize to object
		return {
			list: result[0].list,
			metaCounter: result[0].metaCounter?.[0] ?? { total: 0 },
		};
	}
}
