import { Schema } from 'mongoose';
import { ServiceArea, ServiceCollection, ServiceStatus, ServiceType } from '../libs/enums/service.enum';

const ServiceSchema = new Schema(
	{
		serviceCollection: {
			type: String,
			enum: ServiceCollection,
			required: true,
		},

		serviceType: {
			type: String,
			enum: ServiceType,
			required: true,
		},

		serviceTitle: {
			type: String,
			required: true,
			trim: true,
			minlength: 3,
		},

		serviceStatus: {
			type: String,
			enum: ServiceStatus,
			default: ServiceStatus.ACTIVE,
		},

		serviceArea: {
			type: String,
			enum: ServiceArea,
			required: true,
		},

		servicePrice: {
			type: Number,
			required: true,
			min: 0,
		},

		serviceDesc: {
			type: String,
		},

		serviceImages: {
			type: [String],
			default: [],
		},

		serviceViews: {
			type: Number,
			default: 0,
			min: 0,
		},

		deletedAt: {
			type: Date,
		},
	},
	{ timestamps: true, collection: 'services' },
);
export default ServiceSchema;
