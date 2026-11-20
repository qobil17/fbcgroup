import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import PartnerSchema from '../../schemas/Partner.model';
import { AuthModule } from '../auth/auth.module';
import { PartnerResolver } from './partner.resolver';
import { PartnerService } from './partner.service';

// Hamkorlar
@Module({
	imports: [MongooseModule.forFeature([{ name: 'Partner', schema: PartnerSchema }]), AuthModule],
	providers: [PartnerResolver, PartnerService],
	exports: [PartnerService],
})
export class PartnerModule {}
