import { Schema, Types } from 'mongoose';
import { ServiceArea, ServiceCollection, ServiceDetailAlif, ServiceDetailHpline, ServiceStatus, ServiceType } from '../libs/enums/service.enum';

const ServiceSchema = new Schema(
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

		serviceDetail: {
			type: String,
			enum: [...Object.values(ServiceDetailHpline), ...Object.values(ServiceDetailAlif)],
			required: true,
		},

		serviceArea: {
			type: String,
			enum: ServiceArea,
			required: true,
		},

		servicePrice: {
			type: Number,
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
