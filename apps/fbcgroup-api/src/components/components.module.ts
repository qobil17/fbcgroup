import { Module } from '@nestjs/common';
import { MemberModule } from './member/member.module';
import { AuthModule } from './auth/auth.module';
import { ViewModule } from './view/view.module';
import { ServiceModule } from './service/service.module';
import { OrderServiceModule } from './orderservice/orderservice.module';
import { PartnerModule } from './partner/partner.module';

@Module({
	imports: [MemberModule, AuthModule, ViewModule, ServiceModule, OrderServiceModule, PartnerModule],
})
export class ComponentsModule {}
