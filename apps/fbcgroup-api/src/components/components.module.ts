import { Module } from '@nestjs/common';
import { MemberModule } from './member/member.module';
import { ProductServiceModule } from './productService/productService.module';

@Module({
	imports: [MemberModule, ProductServiceModule],
})
export class ComponentsModule {}
