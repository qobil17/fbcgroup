import { Module } from '@nestjs/common';
import { MemberResolver } from './member.resolver';
import { MemberService } from './member.service';
import { MongooseModule } from '@nestjs/mongoose';
import MemberSchema from '../../schemas/Member.model';
import { AuthModule } from '../auth/auth.module';
import { ViewModule } from '../view/view.module';
import { ServiceModule } from '../service/service.module';
import { RolesGuard } from '../auth/guards/roles.guard';
import { OrderServiceModule } from '../orderservice/orderservice.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: 'Member',
				schema: MemberSchema,
			},
		]),
		AuthModule,
		OrderServiceModule,
	],
	exports: [MemberService],
	providers: [MemberResolver, MemberService, RolesGuard],
})
export class MemberModule {}
