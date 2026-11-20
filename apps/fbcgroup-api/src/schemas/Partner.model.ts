import { Schema } from 'mongoose';
import { PartnerStatus } from '../libs/enums/project.enum';

// Hamkor: nomi, logotipi, sayti va saytdagi tartib raqami
const PartnerSchema = new Schema(
	{
		partnerName: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
		partnerLogo: { type: String, required: true },
		partnerLink: { type: String, trim: true },
		partnerDesc: { type: String, trim: true, maxlength: 300 },
		partnerOrder: { type: Number, default: 0 },
		partnerStatus: { type: String, enum: PartnerStatus, default: PartnerStatus.ACTIVE },
	},
	{ timestamps: true, collection: 'partners' },
);

export default PartnerSchema;
