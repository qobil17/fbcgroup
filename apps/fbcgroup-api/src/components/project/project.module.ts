import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import ProjectSchema from '../../schemas/Project.model';
import PartnerSchema from '../../schemas/Partner.model';
import { AuthModule } from '../auth/auth.module';
import { ProjectResolver } from './project.resolver';
import { ProjectService } from './project.service';

// Qilingan ishlar (loyihalar) va Hamkorlar
@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'Project', schema: ProjectSchema },
			{ name: 'Partner', schema: PartnerSchema },
		]),
		AuthModule,
	],
	providers: [ProjectResolver, ProjectService],
	exports: [ProjectService],
})
export class ProjectModule {}
