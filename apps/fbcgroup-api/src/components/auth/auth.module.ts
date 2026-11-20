import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
	imports: [
		HttpModule,
		JwtModule.registerAsync({
			useFactory: (config: ConfigService) => ({
				secret: config.get<string>('SECRET_TOKEN'),
				signOptions: { expiresIn: '7d' },
			}),
			inject: [ConfigService],
		}),
	],
	providers: [AuthService],
	exports: [AuthService],
})
export class AuthModule {}
