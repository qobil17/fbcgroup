import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

// ---------------------------------------------------------------------------
// Phone detection
// ---------------------------------------------------------------------------
// Matches:  +998XXXXXXXXX  |  998XXXXXXXXX  |  8XXXXXXXXX  |  0XXXXXXXXX
const PHONE_RE = /(?:\+998|998|8|0)[0-9]{9}/;

function extractPhone(text: string): string | null {
	// Strip spaces/dashes/parens so "99 865 23 45" still matches
	const cleaned = text.replace(/[\s\-().]/g, '');
	const m = cleaned.match(PHONE_RE);
	return m ? m[0] : null;
}

// ---------------------------------------------------------------------------
// Rule-based response table
// ---------------------------------------------------------------------------
interface BotRule {
	patterns: RegExp[];
	response: string;
}

@Injectable()
export class ChatbotService {
	constructor(
		@InjectModel('ChatbotLead') private readonly leadModel: Model<any>,
	) {}

	private readonly rules: BotRule[] = [
		// Greetings
		{
			patterns: [/\b(salom|assalom|salomla|hi|hello|hey|privyet|zdravstvuy)\b/i],
			response: `Assalomu alaykum! FBC GROUP xizmatiga xush kelibsiz. Men sizga qanday yordam bera olaman?`,
		},
		{
			patterns: [/\b(xayr|korishguncha|bye|goodbye|poka)\b/i],
			response: `Xayr! Yana murojaat qilishingizni kutamiz. Yaxshi kun tilaymiz!`,
		},
		{
			patterns: [/\b(rahmat|tashakkur|spasibo|thank)/i],
			response: `Iltimos! Yana savollaringiz bo'lsa, biz doim shu yerdamiz.`,
		},

		// About FBC GROUP
		{
			patterns: [/\b(kimlar|nima|haqida|about|kompaniya|siz kim)\b/i],
			response: `FBC GROUP — yoritish tizimlari va pardozlash materiallari bo'yicha ixtisoslashgan kompaniya. Biz ALIF (LED yoritish) va HPLINE (pardozlash materiallari) yo'nalishlarida xizmat ko'rsatamiz.`,
		},

		// ALIF collection
		{
			patterns: [/\balif\b/i],
			response: `ALIF yo'nalishi — zamonaviy yoritish yechimlari:\n- LED — energiya tejamkor LED chiroqlar\n- DECORATIVE — dekorativ yoritish\n- EMERGENCY_LIGHT — favqulodda yoritish tizimlari\n\nQayta aloqa uchun bizga yozing yoki buyurtma bering!`,
		},
		{
			patterns: [/\bLED\b/i],
			response: `LED chiroqlar — energiya tejamkor, uzoq umrli va ekologik toza yoritish yechimlari. Ichki va tashqi foydalanish uchun mavjud. Narx va o'rnatish haqida ma'lumot uchun buyurtma bering.`,
		},
		{
			patterns: [/\b(dekorat|decorative|bezak)\b/i],
			response: `Dekorativ yoritish — interyer va eksteryer dizaynini ta'kidlaydigan estetik chiroqlar. Uylar, ofislar va savdo markazlari uchun ideal.`,
		},
		{
			patterns: [/\b(emergency|favqulodda|avariya)\b/i],
			response: `Favqulodda yoritish tizimlari — elektr uzilganda avtomat ishga tushadigan xavfsizlik yechimlari. Ofislar, binolar va ommaviy joylar uchun majburiy.`,
		},

		// HPLINE collection
		{
			patterns: [/\bhpline\b/i],
			response: `HPLINE yo'nalishi — yuqori sifatli pardozlash materiallari:\n- HPL — High Pressure Laminate panellar\n- ALIKAFON — devoriy pardozlash\n- GRANITE — granit plitalar\n- SERANIT — seranit keramika\n\nIchki va tashqi ishlar uchun!`,
		},
		{
			patterns: [/\bhpl\b/i],
			response: `HPL (High Pressure Laminate) — yuqori bosim ostida ishlab chiqarilgan kompozit panel. Chidamli, namlikka bardoshli va estetik ko'rinishli. Ofis, maktab, kasalxona va uy interyerlari uchun ideal.`,
		},
		{
			patterns: [/\balikafon\b/i],
			response: `ALIKAFON — silliq va chiroyli devoriy pardozlash materiali. Toza ko'rinish, tozalash qulayligi va uzoq xizmat muddati bilan ajralib turadi.`,
		},
		{
			patterns: [/\b(granit|granite)\b/i],
			response: `Granit plitalar — tabiiy tosh mustahkamligida bo'lib, pollar, devorlar va fasadlar uchun keng qo'llaniladi. Namlik va mexanik ta'sirlarga chidamli.`,
		},
		{
			patterns: [/\bseranit\b/i],
			response: `SERANIT — yuqori sifatli keramika kolleksiyasi. Zamonaviy dizayn va pishiqligi bilan oshxona, hammom va mehmonxona ichki pardozlash uchun mukammal.`,
		},

		// Service Types
		{
			patterns: [/\b(yetkazib|yetkazish|dostavka|delivery)\b/i],
			response: `Yetkazib berish xizmati — buyurtma qilingan mahsulotlarni sizning manzilingizga xavfsiz va o'z vaqtida yetkazib beramiz. Narx va muddatlar buyurtma paytida aniqlanadi.`,
		},
		{
			patterns: [/\b(ornatish|montaj|install|ustanovka)\b/i],
			response: `O'rnatish xizmati — professional ustalar tomonidan mahsulotni to'g'ri va sifatli o'rnatish. Barcha ishlarga kafolat beriladi.`,
		},
		{
			patterns: [/\b(full.?project|turnkey)\b/i],
			response: `To'liq loyiha (Full Project) — dizayn, material tanlash, yetkazib berish va o'rnatishni o'z ichiga olgan kompleks xizmat. Ob'ektingizni kalit topshirish asosida tayyorlaymiz.`,
		},

		// Service Areas
		{
			patterns: [/\b(interior|ichki|inside|interyer)\b/i],
			response: `Interior (ichki) ishlar — xona, ofis va binolarning ichki pardozlash va yoritish ishlari. Sifatli materiallar va professional montaj kafolatlangan.`,
		},
		{
			patterns: [/\b(exterior|tashqi|outside|fasad)\b/i],
			response: `Exterior (tashqi) ishlar — bino fasadlari, tashqi devorlar va ochiq maydonlarni pardozlash. Ob-havo ta'sirlariga chidamli materiallar ishlatiladi.`,
		},

		// Orders & Pricing
		{
			patterns: [/\b(buyurtma|zakaz|order)\b/i],
			response: `Buyurtma berish uchun:\n1. Saytdagi "Buyurtma" bo'limiga o'ting\n2. Kerakli xizmatni tanlang\n3. Ma'lumotlaringizni kiriting\n\nMenejerlarimiz 24 soat ichida siz bilan bog'lanadi!`,
		},
		{
			patterns: [/\b(narx|qiymat|price|stoimost|tsena)\b/i],
			response: `Narxlar xizmat turi, maydon va material miqdoriga qarab farqlanadi. Aniq narx olish uchun buyurtma bering yoki biz bilan bog'laning — mutaxassisimiz hisoblaydi.`,
		},
		{
			patterns: [/\b(chegirma|skidka|discount)\b/i],
			response: `Hozirda maxsus takliflar va chegirmalar mavjud bo'lishi mumkin. Dolzarb aksiyalar haqida menejerimizdan so'rang yoki saytimizni kuzatib boring!`,
		},

		// Contact & Support
		{
			patterns: [/\b(aloqa|contact|boglanish|telefon|phone)\b/i],
			response: `Biz bilan bog'lanish:\nManzil: Toshkent, O'zbekiston\nSayt orqali buyurtma bering yoki ushbu chat orqali yozing.\n\nIsh vaqti: Dushanba–Shanba, 09:00–18:00`,
		},
		{
			patterns: [/\b(location|joylashuv|manzil|qayerda)\b/i],
			response: `FBC GROUP Toshkentda joylashgan. Aniq manzil va yo'nalish uchun biz bilan bog'laning yoki buyurtma formida manzilni kiriting.`,
		},
		{
			patterns: [/\b(kafolat|garantiya|guarantee|warranty)\b/i],
			response: `Barcha o'rnatish ishlariga va materiallarga kafolat beriladi. Kafolat muddatlari mahsulot turiga qarab belgilanadi. Batafsil ma'lumot uchun menejerimiz bilan maslahatlashing.`,
		},

		// My Orders
		{
			patterns: [/\b(buyurtmam|mening buyurtma|my order)\b/i],
			response: `Buyurtmangiz holatini tekshirish uchun saytga kiring va "Mening buyurtmalarim" bo'limini oching. Kirish uchun telefon raqamingiz kerak bo'ladi.`,
		},
	];

	private readonly fallbacks = [
		`Kechirasiz, savolingizni to'liq tushunmadim. Aniqroq yozib ko'ring yoki quyidagilar haqida so'rang: ALIF, HPLINE, buyurtma, narxlar, xizmatlar.`,
		`Bu haqida ko'proq ma'lumot uchun menejerimiz bilan bog'laning. Yordam bera oladigan mavzular: xizmatlar, materiallar, buyurtma berish, narxlar.`,
		`Savolingizni to'g'ri tushunsam, aniqroq javob bera olaman. ALIF yoki HPLINE mahsulotlari, yetkazib berish, o'rnatish yoki narxlar haqida so'rang.`,
	];

	// ---------------------------------------------------------------------------
	// Public API called by the gateway
	// ---------------------------------------------------------------------------
	async getResponse(userMessage: string): Promise<string> {
		const text = userMessage.trim();
		if (!text) return `Iltimos, savolingizni kiriting.`;

		// ── Phone number detected → save lead and confirm ──────────────────────
		const phone = extractPhone(text);
		if (phone) {
			await this.saveLead(phone);
			return `📞 Raqamingiz qabul qilindi! Tez orada siz bilan bog'lanamiz! ✅`;
		}

		// ── Keyword matching ───────────────────────────────────────────────────
		for (const rule of this.rules) {
			if (rule.patterns.some((p) => p.test(text))) {
				return rule.response;
			}
		}

		return this.fallbacks[Math.floor(Math.random() * this.fallbacks.length)];
	}

	// ---------------------------------------------------------------------------
	// Persist phone lead to MongoDB (skip duplicates silently)
	// ---------------------------------------------------------------------------
	private async saveLead(phone: string): Promise<void> {
		try {
			await this.leadModel.create({ phone, source: 'chatbot', isRead: false });
		} catch {
			// Ignore duplicate or validation errors — don't crash the chat
		}
	}
}
