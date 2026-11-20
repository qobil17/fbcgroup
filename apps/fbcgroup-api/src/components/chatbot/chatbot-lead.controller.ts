import { Controller, Get, Param, Patch, UnauthorizedException, Headers } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthService } from '../auth/auth.service';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@Controller('api/chatbot-leads')
export class ChatbotLeadController {
	constructor(
		@InjectModel('ChatbotLead') private readonly leadModel: Model<any>,
		private readonly authService: AuthService,
	) {}

	/** Verify the request comes from an authenticated admin. */
	private async requireAdmin(authHeader: string | undefined): Promise<void> {
		const token = authHeader?.replace('Bearer ', '').trim();
		if (!token) throw new UnauthorizedException('Token required');
		const member = await this.authService.verifyToken(token);
		if (!member || member.memberType !== 'ADMIN') {
			throw new UnauthorizedException('Admin access required');
		}
	}

	/** GET /api/chatbot-leads — newest first */
	@Get()
	async getAll(@Headers('authorization') auth: string) {
		await this.requireAdmin(auth);
		return this.leadModel.find().sort({ createdAt: -1 }).lean();
	}

	/** PATCH /api/chatbot-leads/:id/read — mark a single lead as read */
	@Patch(':id/read')
	async markRead(@Param('id') id: string, @Headers('authorization') auth: string) {
		await this.requireAdmin(auth);
		return this.leadModel.findByIdAndUpdate(id, { isRead: true }, { new: true }).lean();
	}
}
