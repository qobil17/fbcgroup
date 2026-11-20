/**
 * Avtomatik tarjima: o'zbekcha matnni ruscha va inglizchaga.
 *
 * Xizmat tanlash (.env):
 *  - GOOGLE_TRANSLATE_API_KEY berilgan bo'lsa → Google Cloud Translation (sifatliroq; oyiga 500 000 belgi bepul)
 *  - aks holda → MyMemory (kalitsiz, bepul; kuniga ~5 000 belgi, MYMEMORY_EMAIL berilsa ~50 000)
 *  - AUTO_TRANSLATE=off → avtomatik tarjima o'chiriladi
 *
 * Tarjima muvaffaqiyatsiz bo'lsa xato tashlanmaydi: null qaytadi va sayt o'zbekcha matnni ko'rsatadi.
 */

export type TargetLang = 'ru' | 'en';

const SOURCE = 'uz';
const MYMEMORY_MAX_BYTES = 450; // MyMemory bitta so'rovda ~500 baytgacha qabul qiladi

export const autoTranslateEnabled = () => (process.env.AUTO_TRANSLATE ?? 'on').toLowerCase() !== 'off';

const byteLen = (s: string) => Buffer.byteLength(s, 'utf8');

/** Uzun matnni MyMemory uchun gap va so'z chegarasida bo'laklarga ajratadi (xatboshilar saqlanadi). */
const chunkText = (text: string, maxBytes: number): string[] => {
	const chunks: string[] = [];
	for (const paragraph of text.split(/(\n+)/)) {
		if (/^\n+$/.test(paragraph) || !paragraph) {
			chunks.push(paragraph);
			continue;
		}
		let current = '';
		const pieces = paragraph.match(/[^.!?]+[.!?]*\s*/g) ?? [paragraph];
		for (const sentence of pieces) {
			if (byteLen(current + sentence) <= maxBytes) {
				current += sentence;
				continue;
			}
			if (current) chunks.push(current);
			current = '';
			if (byteLen(sentence) <= maxBytes) {
				current = sentence;
				continue;
			}
			// juda uzun gap: so'zlar bo'yicha bo'lamiz
			for (const word of sentence.split(/(\s+)/)) {
				if (byteLen(current + word) > maxBytes && current) {
					chunks.push(current);
					current = '';
				}
				current += word;
			}
		}
		if (current) chunks.push(current);
	}
	return chunks;
};

const translateGoogle = async (text: string, target: TargetLang, key: string): Promise<string> => {
	const res = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(key)}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ q: [text], source: SOURCE, target, format: 'text' }),
	});
	const json: any = await res.json().catch(() => ({}));
	const out = json?.data?.translations?.[0]?.translatedText;
	if (!res.ok || typeof out !== 'string') throw new Error(json?.error?.message ?? `Google Translate: HTTP ${res.status}`);
	return out;
};

const translateMyMemoryChunk = async (q: string, target: TargetLang): Promise<string> => {
	const params = new URLSearchParams({ q, langpair: `${SOURCE}|${target}` });
	if (process.env.MYMEMORY_EMAIL) params.set('de', process.env.MYMEMORY_EMAIL);
	const res = await fetch(`https://api.mymemory.translated.net/get?${params.toString()}`);
	const json: any = await res.json().catch(() => ({}));
	const out: unknown = json?.responseData?.translatedText;
	const status = Number(json?.responseStatus ?? res.status);
	if (status !== 200 || typeof out !== 'string' || /MYMEMORY WARNING|QUERY LENGTH LIMIT|INVALID/i.test(out)) {
		throw new Error(`MyMemory: ${typeof out === 'string' ? out.slice(0, 120) : `HTTP ${status}`}`);
	}
	return out;
};

const translateMyMemory = async (text: string, target: TargetLang): Promise<string> => {
	const parts: string[] = [];
	for (const chunk of chunkText(text, MYMEMORY_MAX_BYTES)) {
		if (!chunk.trim()) {
			parts.push(chunk);
			continue;
		}
		const lead = chunk.match(/^\s*/)?.[0] ?? '';
		const trail = chunk.match(/\s*$/)?.[0] ?? '';
		parts.push(lead + (await translateMyMemoryChunk(chunk.trim(), target)) + trail);
	}
	return parts.join('');
};

/** O'zbekcha matnni tarjima qiladi. Muvaffaqiyatsiz bo'lsa null qaytaradi (xato tashlamaydi). */
export const translateFromUzbek = async (text: string | undefined | null, target: TargetLang): Promise<string | null> => {
	const source = (text ?? '').trim();
	if (!source || !autoTranslateEnabled()) return null;
	try {
		const key = process.env.GOOGLE_TRANSLATE_API_KEY;
		const out = key ? await translateGoogle(source, target, key) : await translateMyMemory(source, target);
		return out.trim() || null;
	} catch (err) {
		console.warn(`[auto-translate] uz→${target} bajarilmadi: ${err.message}`);
		return null;
	}
};

export const __test = { chunkText };
