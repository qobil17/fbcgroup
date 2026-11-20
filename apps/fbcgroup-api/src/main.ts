import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { LoggingInterceptor } from './libs/interceptor/Logging.interceptor';
import { graphqlUploadExpress } from 'graphql-upload';
import { WsAdapter } from '@nestjs/platform-ws';
import helmet from 'helmet';
import { join } from 'path';
import * as dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule);

	// Security headers
	app.use(helmet({ contentSecurityPolicy: process.env.NODE_ENV === 'production' }));

	// Validation
	app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
	app.useGlobalInterceptors(new LoggingInterceptor());

	// CORS — origins from env, comma-separated (e.g. "https://example.com,https://www.example.com")
	app.enableCors({
		origin: process.env.ALLOWED_ORIGINS?.split(',') ?? ['http://localhost:3000'],
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
	app.use(graphqlUploadExpress({ maxFileSize: 5 * 1024 * 1024, maxFiles: 5 }));

	// WebSocket
	app.useWebSocketAdapter(new WsAdapter(app));

	// Graceful shutdown
	app.enableShutdownHooks();

	await app.listen(process.env.PORT_API ?? 3000);
}
bootstrap();
