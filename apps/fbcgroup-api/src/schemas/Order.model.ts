import { Schema } from 'mongoose';
import { OrderStatus } from '../libs/enums/order.enum';
import { ServiceArea, ServiceCollection, ServiceDetail, ServiceType } from '../libs/enums/service.enum';

const OrderSchema = new Schema(
	{
		memberId: {
			type: Schema.Types.ObjectId,
			ref: 'Member',
			required: true,
		},
		serviceCollection: {
			type: String,
			enum: ServiceCollection,
			required: true,
		},
		serviceDetail: {
			type: String,
			enum: ServiceDetail,
			required: true,
		},
		serviceType: {
			type: String,
			enum: ServiceType,
			required: true,
		},
		serviceArea: {
			type: String,
			enum: ServiceArea,
			required: true,
		},
		estimatedSquare: {
			type: Number,
			min: 1,
		},
		phone: {
			type: String,
			required: true,
		},
		orderTotal: {
			type: Number,
			required: true,
		},
		orderDelivery: {
			type: Number,
			required: true,
		},
		orderStatus: {
			type: String,
			enum: OrderStatus,
			default: OrderStatus.PAUSE,
		},
		deletedAt: {
			type: Date,
			default: null,
		},
	},
	{ timestamps: true, collection: 'orders' },
);

export default OrderSchema;
