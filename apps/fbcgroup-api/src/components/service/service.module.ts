import { Module } from '@nestjs/common';
import { ServiceResolver } from './service.resolver';

@Module({
  providers: [ServiceResolver]
})
export class ServiceModule {}
