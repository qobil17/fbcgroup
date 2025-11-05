import { Module } from '@nestjs/common';
import { FbcgroupBatchController } from './fbcgroup-batch.controller';
import { FbcgroupBatchService } from './fbcgroup-batch.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [FbcgroupBatchController],
  providers: [FbcgroupBatchService],
})
export class FbcgroupBatchModule {}
