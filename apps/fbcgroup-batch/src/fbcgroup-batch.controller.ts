import { Controller, Get } from '@nestjs/common';
import { FbcgroupBatchService } from './fbcgroup-batch.service';

@Controller()
export class FbcgroupBatchController {
  constructor(private readonly fbcgroupBatchService: FbcgroupBatchService) {}

  @Get()
  getHello(): string {
    return this.fbcgroupBatchService.getHello();
  }
}
