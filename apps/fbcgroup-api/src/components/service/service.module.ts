import { Module } from '@nestjs/common';
import { ServiceResolver } from './service.resolver';
import { ServiceService } from './service.service';
import { MongooseModule } from '@nestjs/mongoose';
import ServiceSchema from '../../schemas/Service.model';
import { ViewModule } from '../view/view.module';
import { AuthModule } from '../auth/auth.module';
import { MemberModule } from '../member/member.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: 'Service',
				schema: ServiceSchema,
			},
		]),
		AuthModule,
		ViewModule,
		MemberModule,
	],
	exports: [ServiceModule],
	providers: [ServiceResolver, ServiceService, ViewModule],
})
export class ServiceModule {}
