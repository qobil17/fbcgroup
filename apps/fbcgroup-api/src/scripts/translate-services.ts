/**
 * Mavjud xizmatlarning bo'sh RU/EN nom va tavsiflarini o'zbekchadan avtomatik to'ldirish.
 * Qo'lda yozilgan tarjimalarga tegilmaydi.
 *
 *   npm run translate:services -- --dry    → nima tarjima qilinishini ko'rsatadi
 *   npm run translate:services             → tarjima qilib, bazaga yozadi
 *   npm run translate:services -- --prod   → MONGO_PROD bazasi bilan
 */
import 'dotenv/config';
import * as dns from 'dns';
import * as mongoose from 'mongoose';
import { ServiceService } from '../components/service/service.service';

dns.setServers(['8.8.8.8', '1.1.1.1']);

const DRY = process.argv.includes('--dry');
const PROD = process.argv.includes('--prod');
const FIELDS = ['serviceTitleRu', 'serviceTitleEn', 'serviceDescRu', 'serviceDescEn'];

(async () => {
	const uri = PROD ? process.env.MONGO_PROD : process.env.MONGO_DEV;
	if (!uri) {
		console.error(`${PROD ? 'MONGO_PROD' : 'MONGO_DEV'} .env faylida yo'q.`);
		process.exit(1);
	}
	console.log(`Tarjima xizmati: ${process.env.GOOGLE_TRANSLATE_API_KEY ? 'Google Translate' : 'MyMemory (bepul)'}`);
	await mongoose.connect(uri);
	const col = mongoose.connection.db!.collection('services');
	const helper: any = new (ServiceService as any)(null, null);
	let updated = 0;
	let pending = 0;

	for await (const doc of col.find({})) {
		const missing = FIELDS.filter((f) => !String(doc[f] ?? '').trim() && String(doc[f.startsWith('serviceTitle') ? 'serviceTitle' : 'serviceDesc'] ?? '').trim());
		if (!missing.length) continue;
		if (DRY) {
			pending++;
			console.log(`  → ${doc.serviceTitle}: ${missing.join(', ')}`);
			continue;
		}
		const patch = await helper.autoTranslate({}, doc);
		const got = FIELDS.filter((f) => patch[f]);
		if (got.length) {
			await col.updateOne({ _id: doc._id }, { $set: patch });
			updated++;
		}
		console.log(`  ${got.length ? '✓' : '⚠'} ${doc.serviceTitle}: ${got.length ? `RU: "${patch.serviceTitleRu ?? doc.serviceTitleRu ?? '—'}"` : "tarjima olinmadi (limit yoki tarmoq) — keyinroq qayta ishga tushiring"}`);
	}

	console.log(DRY ? `\nSinov: ${pending} ta xizmat tarjima qilinadi.` : `\nTayyor: ${updated} ta xizmat tarjima qilindi.`);
	await mongoose.disconnect();
})().catch(async (err) => {
	console.error('Xato:', err.message);
	await mongoose.disconnect();
	process.exit(1);
});
