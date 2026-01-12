import { Schema } from 'mongoose';
import { ServiceType } from '../libs/enums/service.enum';

const OrderServiceSchema = new Schema(
	{
		orderId: {
			type: Schema.Types.ObjectId,
			ref: 'Order',
			required: true,
		},
		serviceId: {
			type: String,
			ref: 'Service',
		},
		productId: {
			type: Schema.Types.ObjectId,
			ref: 'Product',
		},
		serviceType: {
			type: String,
			enum: ServiceType,
			required: true,
		},
		servicePrice: {
			type: Number,
			required: true,
		},
	},
	{ timestamps: true, collection: 'orderService' },
);

export default OrderServiceSchema;
