# Signal Books AI Knowledge Assistant - Cloudflare Deployment Guide

Ushbu loyiha Cloudflare ekotizimida (Workers, Workers AI, D1 Database, R2 Storage va Secrets) to'liq xavfsiz va tezkor ishlash uchun tayyorlangan.

---

## 1. Cloudflare Tayyorgarlik va CLI O'rnatish

Tizimni deploy qilish uchun kompyuteringizda Node.js va `wrangler` CLI o'rnatilgan bo'lishi kerak:

```bash
npm install -g wrangler
wrangler login
```

---

## 2. Cloudflare D1 Ma'lumotlar Bazasi va R2 Bucket Yaratish

### A) D1 SQL Bazani Yaratish:
```bash
wrangler d1 create signal_books_ai_db
```
*Chiqadigan `database_id` qiymatini nusxalab, `wrangler.toml` faylidagi `database_id` joyiga qo'ying.*

### B) D1 Baza Shemasini (Tables) Indekslash:
```bash
wrangler d1 execute signal_books_ai_db --file=./schema.sql
```

### C) R2 Storage Bucket Yaratish (Katta fayllar va PDFlar uchun):
```bash
wrangler r2 bucket create signal-books-storage
```

---

## 3. Cloudflare Secrets (API Tokenlarni Xavfsiz Saqlash)

> **MUHIM XAVFSIZLIK QOIDASI:**
> API kalitlari va tokenlar hech qachon JavaScript frontend fayliga, HTML ichiga yoki GitHub repositoryga yozilmaydi. Tokenlar faqat Cloudflare Server-Side Secret va `.env` sifatida saqlanadi.

Cloudflare Server Secret saqlash uchun:

```bash
wrangler secret put GROQ_API_KEY
# so'ralganda Groq API kalitini kiriting

wrangler secret put GEMINI_API_KEY
# so'ralganda Gemini API kalitini kiriting
```

---

## 4. Local Development va Deploy Qilish

### Local Development (Sinash):
```bash
npm run dev
```

### Cloudflare Worker'ni Ishga Tushirish va Deploy Qilish:
```bash
wrangler deploy
```

---

## 5. Arxitektura va RAG Ishlash Princlpi

1. **Floating AI Button**: Veb-saytning pastki o'ng burchagida doimiy ko'rinib turadi.
2. **AI Chat UI**: Glassmorphic premium interfeys, tayyor tezkor savollar pillslari, Markdown va tavsiya etilgan kitob kartochkalari.
3. **RAG Knowledge Pipeline**:
   - `Signal Books Official Data`: Rasmiy loyiha ma'lumotlari, Telegram bot (@signal_books_bot) va qoidalar.
   - `External Open Data`: Ochiq va qonuniy manbalar (URL, muallif va litsenziya metadatalari bilan).
   - `Generated / Curated Data`: Qisqacha kitob va darslik mazmunlari.
4. **Admin Dashboard**: Admin panelda `#admin` -> **AI Bilim Bazasi & RAG** bo'limida yangi manbalar qo'shish, real-vaqt rejimida semantik qidiruvni test qilish va statistikani kuzatish imkoniyati mavjud.
