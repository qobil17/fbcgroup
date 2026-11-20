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

		// Tarjimalar (ixtiyoriy). Bo'sh bo'lsa sayt o'zbekcha nom/tavsifni ko'rsatadi
		serviceTitleRu: { type: String, trim: true },
		serviceTitleEn: { type: String, trim: true },
		serviceDescRu: { type: String },
		serviceDescEn: { type: String },
		// qaysi tarjimalar avtomatik qilingan (o'zbekcha o'zgarsa qayta tarjima qilinadi; qo'lda yozilganiga tegilmaydi)
		serviceAutoTranslated: { type: [String], default: [] },

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
