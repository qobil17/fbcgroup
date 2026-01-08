import { Schema } from 'mongoose';

const ProductSchema = new Schema(
	{
		productType: {
			type: String,
			required: true,
		},

		productName: {
			type: String,
			required: true,
		},

		productPrice: {
			type: Number,
			required: true,
			min: 0,
		},

		productDesc: {
			type: String,
		},

		productImages: {
			type: [String],
			default: [],
		},

		productViews: {
			type: Number,
			default: 0,
			min: 0,
		},
	},
	{ timestamps: true, collection: 'products' },
);
export default ProductSchema;
