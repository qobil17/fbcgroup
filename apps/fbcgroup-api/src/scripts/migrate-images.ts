/**
 * Eski rasmlarni (uploads/ papkasi) Cloudinary bulutiga ko'chirish va bazadagi manzillarni yangilash.
 *
 * Ishga tushirish (loyiha ildizida, .env da MONGO_DEV va CLOUDINARY_URL bo'lishi kerak):
 *   npm run migrate:images -- --dry     → faqat nima o'zgarishini ko'rsatadi, hech narsa yozmaydi
 *   npm run migrate:images              → haqiqatda ko'chiradi
 *   npm run migrate:images -- --prod    → MONGO_DEV o'rniga MONGO_PROD bazasi bilan
 *
 * Xavfsiz: rasm diskda topilmasa, eski manzil o'zgarishsiz qoladi; skriptni qayta ishga tushirish mumkin
 * (bulutga o'tib bo'lgan https manzillar qayta ishlanmaydi).
 */
import 'dotenv/config';
import * as dns from 'dns';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import * as mongoose from 'mongoose';
import { compressForTarget, storeImage, useCloudStorage } from '../libs/image';

// Ba'zi Windows tarmoqlarida mongodb+srv manzili topilmaydi (querySrv ECONNREFUSED) — main.ts dagi kabi ochiq DNS ishlatamiz
dns.setServers(['8.8.8.8', '1.1.1.1']);

const DRY = process.argv.includes('--dry');
const PROD = process.argv.includes('--prod');

const FIELDS: { collection: string; field: string; target: string; isArray: boolean }[] = [
	{ collection: 'services', field: 'serviceImages', target: 'services', isArray: true },
	{ collection: 'members', field: 'memberImage', target: 'members', isArray: false },
	{ collection: 'partners', field: 'partnerLogo', target: 'partners', isArray: false },
];

const cache = new Map<string, string>();
const stats = { moved: 0, missing: 0, skipped: 0, docs: 0 };

const migrateOne = async (path: string, target: string): Promise<string> => {
	if (!path || !path.startsWith('uploads/')) {
		stats.skipped++;
		return path;
	}
	if (cache.has(path)) return cache.get(path)!;
	const file = join(process.cwd(), path);
	if (!existsSync(file)) {
		stats.missing++;
		console.log(`  ⚠ topilmadi, o'zgarishsiz qoldi: ${path}`);
		return path;
	}
	if (DRY) {
		stats.moved++;
		console.log(`  → ko'chiriladi: ${path}`);
		return path;
	}
	const url = await storeImage(await compressForTarget(readFileSync(file), target), target);
	cache.set(path, url);
	stats.moved++;
	console.log(`  ✓ ${path} → ${url}`);
	return url;
};

(async () => {
	if (!useCloudStorage()) {
		console.error("CLOUDINARY_URL topilmadi. Uni .env fayliga qo'shing (Cloudinary → Dashboard → API environment variable).");
		process.exit(1);
	}
	const uri = PROD ? process.env.MONGO_PROD : process.env.MONGO_DEV;
	if (!uri) {
		console.error(`${PROD ? 'MONGO_PROD' : 'MONGO_DEV'} .env faylida yo'q.`);
		process.exit(1);
	}

	await mongoose.connect(uri);
	const db = mongoose.connection.db!;
	console.log(`${DRY ? '[SINOV REJIMI] ' : ''}Baza: ${db.databaseName}\n`);

	for (const { collection, field, target, isArray } of FIELDS) {
		console.log(`■ ${collection}.${field}`);
		const col = db.collection(collection);
		const cursor = col.find({ [field]: isArray ? { $elemMatch: { $regex: '^uploads/' } } : { $regex: '^uploads/' } });
		for await (const doc of cursor) {
			const value = doc[field];
			const next = isArray
				? await Promise.all((value as string[]).map((p) => migrateOne(p, target)))
				: await migrateOne(value as string, target);
			const changed = JSON.stringify(next) !== JSON.stringify(value);
			if (changed && !DRY) await col.updateOne({ _id: doc._id }, { $set: { [field]: next } });
			if (changed || DRY) stats.docs++;
		}
	}

	console.log(
		`\nTayyor${DRY ? ' (sinov — hech narsa yozilmadi)' : ''}: ${stats.moved} ta rasm ${DRY ? 'ko‘chiriladi' : 'ko‘chirildi'}, ` +
			`${stats.missing} ta diskda topilmadi, ${stats.docs} ta yozuv ${DRY ? 'yangilanadi' : 'yangilandi'}.`,
	);
	await mongoose.disconnect();
})().catch(async (err) => {
	console.error('Xato:', err.message);
	await mongoose.disconnect();
	process.exit(1);
});
