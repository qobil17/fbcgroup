import { Schema } from 'mongoose';
import { OrderStatus } from '../libs/enums/order.enum';
import { ServiceArea, ServiceCollection, ServiceDetailAlif, ServiceDetailHpline, ServiceType } from '../libs/enums/service.enum';

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
			enum: [...Object.values(ServiceDetailHpline), ...Object.values(ServiceDetailAlif)],
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
