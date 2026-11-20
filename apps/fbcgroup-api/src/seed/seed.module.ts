import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SeedService } from './seed.service';
import MemberSchema from '../schemas/Member.model';

@Module({
	imports: [MongooseModule.forFeature([{ name: 'Member', schema: MemberSchema }])],
	providers: [SeedService],
})
export class SeedModule {}
