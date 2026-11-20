import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class WithoutGuard implements CanActivate {
	private readonly logger = new Logger(WithoutGuard.name);
	constructor(private authService: AuthService) {}

	async canActivate(context: ExecutionContext | any): Promise<boolean> {
		this.logger.verbose('--- @guard() Authentication [WithoutGuard] ---');

		if (context.contextType === 'graphql') {
			const request = context.getArgByIndex(2).req,
				bearerToken = request.headers.authorization;

			if (bearerToken) {
				try {
					const token = bearerToken.split(' ')[1],
						authMember = await this.authService.verifyToken(token);
					request.body.authMember = authMember;
				} catch (err) {
					request.body.authMember = null;
				}
			} else request.body.authMember = null;

			this.logger.verbose(`memberNick[without] => ${request.body.authMember?.memberNick ?? 'none'}`);
			return true;
		}
		return true;

		// description => http, rpc, gprs and etc are ignored
	}
}
