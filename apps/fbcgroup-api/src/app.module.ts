import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppResolver } from './app.resolver';
import { ComponentsModule } from './components/components.module';
import { DatabaseModule } from './database/database.module';
import { T } from './libs/types/common';
import { SocketModule } from './socket/socket.module';
import { envValidationSchema } from './libs/env.validation';
import { GqlThrottlerGuard } from './components/auth/guards/gql-throttler.guard';
import { SeedModule } from './seed/seed.module';
import { ChatbotModule } from './components/chatbot/chatbot.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			validationSchema: envValidationSchema,
			validationOptions: { abortEarly: true },
		}),
		ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
		GraphQLModule.forRoot({
			driver: ApolloDriver,
			playground: process.env.NODE_ENV === 'development',
			uploads: false,
			autoSchemaFile: true,
			context: ({ req, res }) => ({ req, res }),
			formatError: (error: T) => {
				const graphQLFormattedError = {
					code: error?.extensions.code,
					message:
						error?.extensions.exception?.response?.message || error?.extensions?.response?.message || error?.message,
				};
				return graphQLFormattedError;
			},
		}),
		ComponentsModule,
		DatabaseModule,
		SocketModule,
		SeedModule,
		ChatbotModule,
	],
	controllers: [AppController],
	providers: [
		AppService,
		AppResolver,
		{ provide: APP_GUARD, useClass: GqlThrottlerGuard },
	],
})
export class AppModule {}
