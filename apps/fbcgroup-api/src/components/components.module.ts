import { Module } from '@nestjs/common';
import { MemberModule } from './member/member.module';
import { AuthModule } from './auth/auth.module';
import { ViewModule } from './view/view.module';
import { ServiceModule } from './service/service.module';
import { ServiceResolver } from './service/service.resolver';

@Module({
	imports: [MemberModule, AuthModule, ViewModule, ServiceModule],
	providers: [ServiceResolver],
})
export class ComponentsModule {}
