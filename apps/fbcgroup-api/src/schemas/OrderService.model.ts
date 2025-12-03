import { Schema } from 'mongoose';

const OrderServiceSchema = new Schema(
	{
		serviceType: {
			type: String,
			required: true,
		},

		servicePrice: {
			type: Number,
			required: true,
		},

		orderId: {
			type: Schema.Types.ObjectId,
			ref: 'Order',
		},

		serviceId: {
			type: String,
			ref: 'Service',
		},

		productId: {
			type: Schema.Types.ObjectId,
			ref: 'Product',
		},
	},
	{ timestamps: true, collection: 'orderService' },
);
export default OrderServiceSchema;
