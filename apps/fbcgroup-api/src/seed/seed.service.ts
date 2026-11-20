import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { Member } from '../libs/dto/member/member';
import { MemberAuthType, MemberStatus, MemberType } from '../libs/enums/member.enum';

/**
 * Admin hisobi .env dan boshqariladi — kodda hech qanday parol saqlanmaydi.
 *
 *   ADMIN_NICK=...            admin logini (3–15 belgi)
 *   ADMIN_PASSWORD=...        admin paroli (8–12 belgi — login formasi 12 belgidan uzunini qabul qilmaydi)
 *   ADMIN_PHONE=+998...       admin telefoni (yangi admin yaratilganda)
 *   ADMIN_RESET_PASSWORD=true mavjud admin parolini ADMIN_PASSWORD ga almashtiradi.
 *                             Bir marta ishlating, keyin o'chirib qo'ying.
 *
 * Shu login bilan admin bo'lmasa — yaratiladi. ADMIN_PASSWORD berilmasa hech narsa yaratilmaydi.
 */

// Ilgari kodda ochiq yozilgan parollar: hali ishlatilayotgan bo'lsa ogohlantiramiz
const LEAKED_PASSWORDS = ['admin7010', 'admin1234'];

@Injectable()
export class SeedService implements OnApplicationBootstrap {
	private readonly logger = new Logger(SeedService.name);

	constructor(@InjectModel('Member') private readonly memberModel: Model<Member>) {}

	async onApplicationBootstrap(): Promise<void> {
		try {
			await this.seedAdmin();
			await this.warnAboutLeakedPasswords();
		} catch (err) {
			this.logger.error(`Admin sozlashda xato: ${err.message}`);
		}
	}

	private async seedAdmin(): Promise<void> {
		const nick = process.env.ADMIN_NICK?.trim();
		const password = process.env.ADMIN_PASSWORD ?? '';
		const phone = process.env.ADMIN_PHONE?.trim();
		const reset = (process.env.ADMIN_RESET_PASSWORD ?? '').toLowerCase() === 'true';

		if (!nick || !password) {
			const anyAdmin = await this.memberModel.exists({ memberType: MemberType.ADMIN });
			if (!anyAdmin) this.logger.warn('Admin yo‘q va ADMIN_NICK / ADMIN_PASSWORD berilmagan — admin yaratilmadi.');
			return;
		}
		if (password.length < 8 || password.length > 12) {
			this.logger.error('ADMIN_PASSWORD 8–12 belgi bo‘lishi kerak — admin o‘zgartirilmadi.');
			return;
		}
		if (nick.length < 3 || nick.length > 15) {
			this.logger.error('ADMIN_NICK 3–15 belgi bo‘lishi kerak — admin o‘zgartirilmadi.');
			return;
		}

		const hashed = await bcrypt.hash(password, await bcrypt.genSalt());
		const existing = await this.memberModel.findOne({ memberNick: nick }).exec();

		if (existing) {
			if (existing.memberType !== MemberType.ADMIN) {
				this.logger.error(`"${nick}" logini oddiy foydalanuvchiga tegishli — boshqa ADMIN_NICK tanlang.`);
				return;
			}
			if (reset) {
				await this.memberModel.updateOne({ _id: existing._id }, { memberPassword: hashed }).exec();
				this.logger.warn(`"${nick}" admin paroli yangilandi. Endi ADMIN_RESET_PASSWORD ni o‘chirib qo‘ying.`);
			} else {
				this.logger.log(`Admin mavjud: ${nick}`);
			}
			return;
		}

		if (!phone) {
			this.logger.error('Yangi admin uchun ADMIN_PHONE kerak — admin yaratilmadi.');
			return;
		}
		await this.memberModel.create({
			memberNick: nick,
			memberPassword: hashed,
			memberPhone: phone,
			memberType: MemberType.ADMIN,
			memberStatus: MemberStatus.ACTIVE,
			memberAuthType: MemberAuthType.PHONE,
		});
		this.logger.log(`Admin yaratildi: ${nick}`);
	}

	private async warnAboutLeakedPasswords(): Promise<void> {
		const admins = await this.memberModel
			.find({ memberType: MemberType.ADMIN })
			.select('+memberPassword memberNick')
			.lean()
			.exec();
		for (const admin of admins as any[]) {
			if (!admin.memberPassword) continue;
			for (const leaked of LEAKED_PASSWORDS) {
				if (await bcrypt.compare(leaked, admin.memberPassword)) {
					this.logger.warn(
						`DIQQAT: "${admin.memberNick}" admini GitHub'da ochiq bo‘lgan paroldan foydalanmoqda. ` +
							`ADMIN_NICK=${admin.memberNick}, yangi ADMIN_PASSWORD va ADMIN_RESET_PASSWORD=true bilan almashtiring.`,
					);
				}
			}
		}
	}
}
