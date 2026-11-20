import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { LoggingInterceptor } from './libs/interceptor/Logging.interceptor';
import { graphqlUploadExpress } from 'graphql-upload';
import { WsAdapter } from '@nestjs/platform-ws';
import helmet from 'helmet';
import { join } from 'path';
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_FILES } from './libs/image';
import * as dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule);

	// Render/Railway proksi orqasida: haqiqiy mijoz IP'si X-Forwarded-For dan olinadi
	// (aks holda so'rov limiti barcha tashrifchilar uchun umumiy bo'lib qoladi)
	app.set('trust proxy', 1);

	// Security headers
	app.use(
		helmet({
			contentSecurityPolicy: process.env.NODE_ENV === 'production',
			// /uploads rasmlari boshqa domendagi (Vercel) saytda ko'rinishi uchun
			crossOriginResourcePolicy: { policy: 'cross-origin' },
		}),
	);

	// Validation
	app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
	app.useGlobalInterceptors(new LoggingInterceptor());

	// CORS — origins from env, comma-separated (e.g. "https://example.com,https://www.example.com")
	app.enableCors({
		origin: process.env.ALLOWED_ORIGINS?.split(',').map((o) => o.trim().replace(/\/$/, '')).filter(Boolean) ?? ['http://localhost:3000'],
		credentials: true,
	});

	// Serve uploads folder as static assets with proper absolute path
	app.useStaticAssets(join(__dirname, '..', '..', '..', 'uploads'), {
		prefix: '/uploads',
		setHeaders: (res) => {
			res.setHeader('Access-Control-Allow-Origin', '*');
			res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
		},
	});

	// File uploads
	app.use(graphqlUploadExpress({ maxFileSize: MAX_UPLOAD_BYTES, maxFiles: MAX_UPLOAD_FILES }));

	// WebSocket
	app.useWebSocketAdapter(new WsAdapter(app));

	// Graceful shutdown
	app.enableShutdownHooks();

	// Render/Railway portni PORT orqali beradi; lokalda PORT_API ishlatiladi
	await app.listen(process.env.PORT ?? process.env.PORT_API ?? 3000);
}
bootstrap();
