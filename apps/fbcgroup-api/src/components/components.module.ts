import { Module } from '@nestjs/common';
import { MemberModule } from './member/member.module';
import { AuthModule } from './auth/auth.module';
import { ViewModule } from './view/view.module';
import { ServiceModule } from './service/service.module';
import { OrderServiceModule } from './orderservice/orderservice.module';

@Module({
	imports: [MemberModule, AuthModule, ViewModule, ServiceModule, OrderServiceModule],
})
export class ComponentsModule {}
