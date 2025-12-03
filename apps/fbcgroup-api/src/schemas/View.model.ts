import { Schema, Types } from 'mongoose';
import { ViewGroup } from '../libs/enums/view.enum';

export const ViewSchema = new Schema(
	{
		memberId: {
			type: Schema.Types.ObjectId,
			ref: 'Member',
			required: true,
		},

		viewRefId: {
			type: Schema.Types.ObjectId,
			required: true,
		},

		viewGroup: {
			type: String,
			enum: ViewGroup,
			required: true,
		},
	},
	{ timestamps: true, collection: 'views' },
);
export default ViewSchema;
