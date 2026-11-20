import { Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'ws';
import * as WebSocket from 'ws';
import { ChatbotService } from './chatbot.service';

interface ChatMessage {
	event: 'user' | 'bot' | 'typing';
	text: string;
	timestamp: string;
}

@WebSocketGateway({ path: '/chatbot' })
export class ChatbotGateway implements OnGatewayConnection, OnGatewayDisconnect {
	private readonly logger = new Logger('ChatbotGateway');

	@WebSocketServer()
	server: Server;

	constructor(private readonly chatbotService: ChatbotService) {}

	handleConnection(client: WebSocket) {
		this.logger.verbose('Chatbot client connected');
		this.send(client, {
			event: 'bot',
			text: 'Assalomu alaykum! FBC GROUP chatbotiga xush kelibsiz! 👋 Men sizga xizmatlarimiz, materiallar va buyurtmalar haqida yordam bera olaman. Qanday savol bor?',
			timestamp: new Date().toISOString(),
		});
	}

	handleDisconnect(client: WebSocket) {
		this.logger.verbose('Chatbot client disconnected');
	}

	@SubscribeMessage('message')
	async handleMessage(client: WebSocket, payload: string): Promise<void> {
		const userText = typeof payload === 'string' ? payload : String(payload);

		this.logger.verbose(`Chatbot received: ${userText}`);

		// Echo user message back so frontend can confirm receipt
		this.send(client, {
			event: 'user',
			text: userText,
			timestamp: new Date().toISOString(),
		});

		// Show typing indicator briefly
		this.send(client, { event: 'typing', text: '', timestamp: new Date().toISOString() });

		// Simulate thinking delay (300–700ms)
		await new Promise((r) => setTimeout(r, 300 + Math.random() * 400));

		const botReply = await this.chatbotService.getResponse(userText);

		this.send(client, {
			event: 'bot',
			text: botReply,
			timestamp: new Date().toISOString(),
		});
	}

	private send(client: WebSocket, payload: ChatMessage) {
		if (client.readyState === WebSocket.OPEN) {
			client.send(JSON.stringify(payload));
		}
	}
}
