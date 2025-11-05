import { Test, TestingModule } from '@nestjs/testing';
import { FbcgroupBatchController } from './fbcgroup-batch.controller';
import { FbcgroupBatchService } from './fbcgroup-batch.service';

describe('FbcgroupBatchController', () => {
  let fbcgroupBatchController: FbcgroupBatchController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [FbcgroupBatchController],
      providers: [FbcgroupBatchService],
    }).compile();

    fbcgroupBatchController = app.get<FbcgroupBatchController>(FbcgroupBatchController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(fbcgroupBatchController.getHello()).toBe('Hello World!');
    });
  });
});
