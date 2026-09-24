import { KnowledgeChunk } from '../types/ai';

export const INITIAL_OFFICIAL_KNOWLEDGE_CHUNKS: KnowledgeChunk[] = [
  {
    id: 'kb-off-1',
    sourceId: 'src-official-1',
    content: `Signal Books — kitobsevarlar uchun yaratilgan zamonaviy raqamli loyiha. Loyihaning asosiy maqsadi — elektron kitoblarni topish, ulardan foydalanish va kerakli adabiyotlarga murojaat qilish jarayonini foydalanuvchilar uchun yanada qulay qilish. Kitob va texnologiyani birlashtirib, bilim olishni yanada qulay va zamonaviy qilish asosiy g'oyamizdir.`,
    metadata: {
      title: 'Signal Books Haqida',
      sourceType: 'official',
      url: 'https://t.me/signal_books_bot',
      license: 'Official Signal Books Public Info',
      collectedDate: '2026-09-24'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'kb-off-2',
    sourceId: 'src-official-1',
    content: `Signal Books platformasida foydalanuvchilar quyidagi imkoniyatlardan foydalanishlari mumkin: 1) Elektron kitoblarni oson izlash va PDF formatida o'qish; 2) Barcha mavjud kitoblardan bepul foydalanish; 3) Kerakli kitoblar bo'yicha so'rov yuborish; 4) Yangi nashrlar va darsliklardan xabardor bo'lish; 5) Telegram bot (@signal_books_bot) va rasmiy veb-sayt orqali tezkor va qulay mutolaa qilish; 6) Audio kitoblarni onlayn tinglash.`,
    metadata: {
      title: 'Platforma Imkoniyatlari va Bot',
      sourceType: 'official',
      url: 'https://t.me/signal_books_bot',
      license: 'Official Signal Books Public Info',
      collectedDate: '2026-09-24'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'kb-off-3',
    sourceId: 'src-official-1',
    content: `Signal Books Nega Muhim? 1. Kitobga qulay kirish: Kerakli kitoblarni izlash va ulardan foydalanish jarayonini soddalashtiramiz. 2. Zamonaviy yondashuv: Kitobxonlikni zamonaviy raqamli imkoniyatlar va AI texnologiyalari bilan birlashtiramiz. 3. Telegram orqali qulaylik: Telegram bot (@signal_books_bot) va veb-kutubxona orqali istalgan qurilmada foydalanish mumkin. 4. Doimiy rivojlanish: Loyiha yangi kitoblar va imkoniyatlar bilan muntazam boyitib boriladi.`,
    metadata: {
      title: 'Nega Signal Books?',
      sourceType: 'official',
      url: 'https://t.me/signal_books_bot',
      license: 'Official Signal Books Public Info',
      collectedDate: '2026-09-24'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'kb-off-4',
    sourceId: 'src-official-2',
    content: `Bog'lanish va Murojaatlar: Savollaringiz, kitob bo'yicha so'rovlaringiz, takliflaringiz yoki hamkorlik bo'yicha murojaatlaringiz bo'lsa, rasmiy Telegram botimiz (@signal_books_bot) yoki administratorimiz (@signalbooks_admin) orqali bog'lanishingiz mumkin. Murojaat yo'nalishlari: Kitob so'rovlari, Takliflar, Hamkorlik, Texnik yordam va Umumiy savollar. Dasturchi va asoschi: Muxiddin (@signalbooks_admin).`,
    metadata: {
      title: 'Bog\'lanish va Hamkorlik',
      sourceType: 'official',
      url: 'https://t.me/signalbooks_admin',
      license: 'Official Signal Books Public Info',
      collectedDate: '2026-09-24'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'kb-off-5',
    sourceId: 'src-official-3',
    content: `Signal Books Kutubxonasida Mavjud Bo'limlar:
    1) Badiiy adabiyot (O'zbek mumtoz adabiyoti, Zamonaviy nasr, Jahon adabiyoti, Tarixiy romanlar, She'riyat)
    2) Maktab darsliklari (1-sinfdan 11-sinfgacha bo'lgan Respublika darsliklari va o'quv qo'llanmalari)
    3) Informatika va Dasturlash (Python, Web-dasturlash, C++, Algoritmlar, Kiberxavfsizlik)
    4) Matematika (Algebra, Geometriya, Oliy matematika)
    5) Tarix (O'zbekiston tarixi, Jahon tarixi)
    6) Fizika, Kimyo, Biologiya va Chet tillari (Inglizcha, Ruscha, Nemischa)
    7) Psixologiya va Shaxsiy rivojlanish.`,
    metadata: {
      title: 'Kutubxona Bo\'limlari va Janrlar',
      sourceType: 'official',
      license: 'Official Signal Books Public Info',
      collectedDate: '2026-09-24'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];
