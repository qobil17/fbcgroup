import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * So'rovlar sonini cheklash (har bir IP uchun daqiqasiga limit).
 * GraphQL va oddiy HTTP (REST, sog'liq tekshiruvi) so'rovlari uchun ishlaydi;
 * WebSocket xabarlari cheklanmaydi (ularda HTTP javob obyekti yo'q).
 */
@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
	async canActivate(context: ExecutionContext): Promise<boolean> {
		if (context.getType() === 'ws') return true;
		return super.canActivate(context);
	}

	protected getRequestResponse(context: ExecutionContext) {
		if (context.getType<GqlContextType>() === 'graphql') {
			const ctx = GqlExecutionContext.create(context).getContext();
			return { req: ctx.req, res: ctx.res };
		}
		const http = context.switchToHttp();
		return { req: http.getRequest(), res: http.getResponse() };
	}
}
