import { NestFactory } from '@nestjs/core';
import { FbcgroupBatchModule } from './fbcgroup-batch.module';

async function bootstrap() {
  const app = await NestFactory.create(FbcgroupBatchModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
