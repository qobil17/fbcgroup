import { Module } from '@nestjs/common';
import { FbcgroupBatchController } from './fbcgroup-batch.controller';
import { FbcgroupBatchService } from './fbcgroup-batch.service';

@Module({
  imports: [],
  controllers: [FbcgroupBatchController],
  providers: [FbcgroupBatchService],
})
export class FbcgroupBatchModule {}
