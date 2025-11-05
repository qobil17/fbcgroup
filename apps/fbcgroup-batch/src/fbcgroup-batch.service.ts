import { Injectable } from '@nestjs/common';

@Injectable()
export class FbcgroupBatchService {
  getHello(): string {
    return 'Welcome to FBCGroup BATCH Server';
  }
}
