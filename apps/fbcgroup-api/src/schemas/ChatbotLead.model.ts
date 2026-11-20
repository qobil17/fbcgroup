import { Schema } from 'mongoose';

const ChatbotLeadSchema = new Schema(
	{
		phone: {
			type: String,
			required: true,
		},
		source: {
			type: String,
			default: 'chatbot',
		},
		isRead: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true, collection: 'chatbot_leads' },
);

export default ChatbotLeadSchema;
