import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { Member } from '../libs/dto/member/member';
import { MemberAuthType, MemberStatus, MemberType } from '../libs/enums/member.enum';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
	private readonly logger = new Logger(SeedService.name);

	constructor(@InjectModel('Member') private readonly memberModel: Model<Member>) {}

	async onApplicationBootstrap(): Promise<void> {
		await this.seedAdmin();
	}

	private async seedAdmin(): Promise<void> {
		const existingAdmin = await this.memberModel.findOne({ memberType: MemberType.ADMIN }).exec();

		if (existingAdmin) {
			this.logger.log('Admin already exists');
			return;
		}

		const salt = await bcrypt.genSalt();
		const hashedPassword = await bcrypt.hash('admin7010', salt);

		await this.memberModel.create({
			memberNick: 'sherzod',
			memberPassword: hashedPassword,
			memberPhone: '+998945587010',
			memberType: MemberType.ADMIN,
			memberStatus: MemberStatus.ACTIVE,
			memberAuthType: MemberAuthType.PHONE,
		});

		this.logger.log('Admin created: nick=admin, password=admin1234');
	}
}
