import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatbotGateway } from './chatbot.gateway';
import { ChatbotService } from './chatbot.service';
import { ChatbotLeadController } from './chatbot-lead.controller';
import ChatbotLeadSchema from '../../schemas/ChatbotLead.model';
import { AuthModule } from '../auth/auth.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: 'ChatbotLead',
				schema: ChatbotLeadSchema,
			},
		]),
		AuthModule,
	],
	controllers: [ChatbotLeadController],
	providers: [ChatbotGateway, ChatbotService],
})
export class ChatbotModule {}
