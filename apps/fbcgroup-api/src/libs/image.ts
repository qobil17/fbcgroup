import { mkdirSync, writeFileSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import sharp = require('sharp');
import { Readable } from 'stream';
import { v2 as cloudinary } from 'cloudinary';

/**
 * Rasm yuklash qoidalari — frontend (lib/uploadImage.ts) bilan bir xil bo'lishi kerak.
 *  - bitta fayl: 15 MB gacha
 *  - formatlar: JPG, JPEG, PNG, WEBP
 *  - saqlashdan oldin: telefon aylanishi (EXIF) to'g'rilanadi, uzun tomoni cheklanadi,
 *    WebP formatida yuqori sifat bilan siqiladi (ko'zga farq sezilmaydi, hajm 5–10 barobar kichrayadi)
 *
 * Saqlash joyi:
 *  - CLOUDINARY_URL berilgan bo'lsa → Cloudinary (bepul bulut). Qaytariladigan qiymat to'liq https manzil.
 *  - berilmagan bo'lsa → server diskidagi uploads/ papkasi. Qaytariladigan qiymat "uploads/..." yo'li.
 *  Frontend ikkalasini ham to'g'ri ko'rsatadi (getImageUrl https manzilni o'zgartirmaydi).
 */
export const useCloudStorage = () => !!process.env.CLOUDINARY_URL;
const CLOUD_FOLDER = process.env.CLOUDINARY_FOLDER || 'fbcgroup';
export const MAX_UPLOAD_MB = 15;
export const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;
export const MAX_UPLOAD_FILES = 12;
export const validMimeTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'];

// Faqat shu papkalarga yozishga ruxsat (yo'l orqali boshqa joyga yozishning oldini oladi)
const TARGETS: Record<string, { maxSide: number; quality: number }> = {
	members: { maxSide: 800, quality: 85 },
	services: { maxSide: 2400, quality: 85 },
	partners: { maxSide: 800, quality: 92 }, // logotiplar: aniq chiziqlar uchun yuqoriroq sifat
};

export class ImageUploadError extends Error {}

const readStream = (stream: Readable): Promise<Buffer> =>
	new Promise((resolve, reject) => {
		const chunks: Buffer[] = [];
		let size = 0;
		stream.on('data', (chunk: Buffer) => {
			size += chunk.length;
			if (size > MAX_UPLOAD_BYTES) {
				stream.destroy();
				reject(new ImageUploadError(`Rasm hajmi ${MAX_UPLOAD_MB} MB dan oshmasligi kerak`));
				return;
			}
			chunks.push(chunk);
		});
		stream.on('end', () => resolve(Buffer.concat(chunks)));
		stream.on('error', (err: any) => {
			// graphql-upload hajm chegarasidan oshganda shu xatoni beradi
			if (err?.code === 'ERR_FILE_TOO_LARGE' || /exceed/i.test(err?.message ?? '')) {
				reject(new ImageUploadError(`Rasm hajmi ${MAX_UPLOAD_MB} MB dan oshmasligi kerak`));
			} else reject(err);
		});
	});

export const saveImage = async (
	createReadStream: () => Readable,
	mimetype: string,
	target: string,
): Promise<string> => {
	const rule = TARGETS[String(target)];
	if (!rule) throw new ImageUploadError('Noto‘g‘ri yuklash manzili');
	if (!validMimeTypes.includes(mimetype)) {
		throw new ImageUploadError('Faqat JPG, PNG yoki WEBP rasm yuklang');
	}

	const input = await readStream(createReadStream());

	let output: Buffer;
	try {
		output = await sharp(input, { failOn: 'error' })
			.rotate() // EXIF bo'yicha to'g'ri yo'nalish
			.resize({ width: rule.maxSide, height: rule.maxSide, fit: 'inside', withoutEnlargement: true })
			.webp({ quality: rule.quality, effort: 4, smartSubsample: true })
			.toBuffer();
	} catch {
		throw new ImageUploadError('Rasmni o‘qib bo‘lmadi — fayl buzilgan yoki rasm emas');
	}

	return storeImage(output, target);
};

/** Tayyor (siqilgan) rasmni bulutga yoki diskka yozadi va manzilini qaytaradi. */
export const storeImage = async (output: Buffer, target: string): Promise<string> => {
	const id = uuidv4();

	if (useCloudStorage()) {
		return new Promise<string>((resolve, reject) => {
			cloudinary.uploader
				.upload_stream(
					{ folder: `${CLOUD_FOLDER}/${target}`, public_id: id, resource_type: 'image', format: 'webp', overwrite: false },
					(err, result) => {
						if (err || !result?.secure_url) reject(new ImageUploadError(`Bulutga yuklab bo'lmadi: ${err?.message ?? 'javob yo‘q'}`));
						else resolve(result.secure_url);
					},
				)
				.end(output);
		});
	}

	const dir = `uploads/${target}`;
	mkdirSync(dir, { recursive: true });
	const url = `${dir}/${id}.webp`;
	writeFileSync(url, output);
	return url;
};

/** Diskdagi eski rasmni siqib, bulutga ko'chirish uchun (migratsiya skripti ishlatadi). */
export const compressForTarget = async (input: Buffer, target: string): Promise<Buffer> => {
	const rule = TARGETS[target] ?? TARGETS.services;
	return sharp(input, { failOn: 'error' })
		.rotate()
		.resize({ width: rule.maxSide, height: rule.maxSide, fit: 'inside', withoutEnlargement: true })
		.webp({ quality: rule.quality, effort: 4, smartSubsample: true })
		.toBuffer();
};
