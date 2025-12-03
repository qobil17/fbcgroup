import { Schema } from 'mongoose';
import { MemberType } from '../libs/enums/member.enum';
import { typeFromAST } from 'graphql';
import { ProductType, ServiceArea, ServiceCollection, ServiceType } from '../libs/enums/service.enum';

const ProductSchema = new Schema(
	{
		productType: {
			type: String,
			enum: ProductType,
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
	{ timestamps: true, collection: 'services' },
);
export default ProductSchema;
