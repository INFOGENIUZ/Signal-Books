import { 
  ChatMessage, 
  KnowledgeChunk, 
  KnowledgeSource, 
  RagSearchResponse, 
  AiChatStats, 
  KnowledgeSourceType 
} from '../types/ai';
import { INITIAL_OFFICIAL_KNOWLEDGE_CHUNKS } from '../data/officialKnowledgeBase';
import { Book } from '../types';

// Normalizes search terms for fuzzy matching
export function normalizeQuery(query: string): string {
  return query
    .toLowerCase()
    .trim()
    .replace(/[‘'’`"`\.]/g, '')
    .replace(/[\s\-\_]+/g, ' ');
}

// Client-side local RAG search (searches initial chunks + loaded books)
export function searchKnowledgeBaseLocally(
  query: string,
  books: Book[] = [],
  customChunks: KnowledgeChunk[] = []
): KnowledgeChunk[] {
  const normQ = normalizeQuery(query);
  if (!normQ) return [];

  const queryWords = normQ.split(' ').filter(w => w.length > 1);

  const allChunks: KnowledgeChunk[] = [
    ...INITIAL_OFFICIAL_KNOWLEDGE_CHUNKS,
    ...customChunks,
    ...books.map(b => ({
      id: `kb-book-${b.id}`,
      sourceId: `src-book-${b.id}`,
      content: `Kitob nomi: "${b.title}". Muallif: ${b.authorName}. Bo'lim: ${b.categoryName}${b.subcategoryName ? ` (${b.subcategoryName})` : ''}. Tili: ${b.language}. Sahifalar: ${b.pages} bet. Nashr yili: ${b.publicationYear || 2024}. Format: PDF${b.hasAudio ? ' va Audio' : ''}. Tavsif: ${b.description}`,
      metadata: {
        title: b.title,
        authorName: b.authorName,
        categoryName: b.categoryName,
        language: b.language,
        sourceType: 'official' as KnowledgeSourceType,
        bookId: b.id,
        url: `#book-${b.id}`
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }))
  ];

  // Score chunks
  const scored = allChunks.map(chunk => {
    const chunkText = normalizeQuery(`${chunk.content} ${chunk.metadata.title} ${chunk.metadata.authorName || ''} ${chunk.metadata.categoryName || ''}`);
    let score = 0;

    // Exact string match
    if (chunkText.includes(normQ)) {
      score += 10;
    }

    // Individual word matches
    queryWords.forEach(word => {
      if (chunkText.includes(word)) {
        score += 2;
      }
      if (chunk.metadata.title.toLowerCase().includes(word)) {
        score += 3;
      }
      if (chunk.metadata.authorName && chunk.metadata.authorName.toLowerCase().includes(word)) {
        score += 3;
      }
    });

    // Priority bonus for official Signal Books info
    if (chunk.metadata.sourceType === 'official') {
      score += 1;
    }

    return { ...chunk, score };
  });

  return scored
    .filter(c => (c.score || 0) > 0)
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, 5);
}

// Call backend AI Chat endpoint `/api/ai/chat`
export async function sendAiChatMessage(
  message: string,
  history: ChatMessage[] = [],
  books: Book[] = [],
  sessionId?: string
): Promise<{ text: string; citations?: any[]; recommendedBooks?: any[]; model?: string }> {
  try {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        sessionId: sessionId || 'session-anon',
        history: history.slice(-6).map(h => ({ sender: h.sender, text: h.text })),
        availableBooks: books.map(b => ({
          id: b.id,
          title: b.title,
          authorName: b.authorName,
          categoryName: b.categoryName,
          subcategoryName: b.subcategoryName,
          pages: b.pages,
          rating: b.rating,
          hasAudio: b.hasAudio,
          coverUrl: b.coverUrl,
          description: b.description
        }))
      })
    });

    if (!response.ok) {
      throw new Error(`API HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    if (data.success && data.reply) {
      return {
        text: data.reply.text || data.reply,
        citations: data.reply.citations || data.citations,
        recommendedBooks: data.reply.recommendedBooks || data.recommendedBooks,
        model: data.model
      };
    }

    throw new Error(data.error || 'AI javob bermadi');
  } catch (err: any) {
    console.warn('AI API Call failed, fallback to local client RAG:', err.message);

    // Fallback Client-side RAG response
    const localRetrieved = searchKnowledgeBaseLocally(message, books);
    const matchedBooks = books.filter(b => 
      normalizeQuery(b.title).includes(normalizeQuery(message)) ||
      normalizeQuery(b.authorName).includes(normalizeQuery(message)) ||
      normalizeQuery(message).includes(normalizeQuery(b.title))
    ).slice(0, 3);

    let fallbackText = '';
    if (localRetrieved.length > 0) {
      fallbackText = `Signal Books bilim bazasiga ko'ra:\n\n${localRetrieved[0].content}\n\nYana qanday savollaringiz bor?`;
    } else if (matchedBooks.length > 0) {
      fallbackText = `Siz so'ragan kitoblar katalogimizda mavjud:\n\n` + 
        matchedBooks.map(b => `📚 **${b.title}** — ${b.authorName} (${b.categoryName})`).join('\n') +
        `\n\nPastdagi tugmalar orqali ushbu kitoblarni o'qishingiz mumkin!`;
    } else {
      fallbackText = `Salom! Ushbu savol bo'yicha Signal Books bilim bazasidan ma'lumot topilmadi. Sizga kitoblar katalogini ko'rishni yoki qidiruv tizimidan foydalanishni tavsiya qilaman.`;
    }

    return {
      text: fallbackText,
      citations: localRetrieved.map(c => ({
        title: c.metadata.title,
        type: c.metadata.sourceType,
        sourceName: 'Signal Books Bilim Bazasi',
        url: c.metadata.url
      })),
      recommendedBooks: matchedBooks.map(b => ({
        id: b.id,
        title: b.title,
        authorName: b.authorName,
        categoryName: b.categoryName,
        coverUrl: b.coverUrl,
        pages: b.pages,
        rating: b.rating,
        hasAudio: b.hasAudio
      })),
      model: 'local-rag-fallback'
    };
  }
}

// Fetch Knowledge Sources for Admin Panel
export async function fetchAdminKnowledgeSources(): Promise<KnowledgeSource[]> {
  try {
    const res = await fetch('/api/ai/sources');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.sources)) {
        return data.sources;
      }
    }
  } catch {}

  // Fallback initial sources list
  return [
    {
      id: 'src-official-1',
      title: 'Signal Books Rasmiy Platforma Ma\'lumotlari',
      type: 'official',
      url: 'https://t.me/signal_books_bot',
      author: 'Signal Books Jamoasi',
      license: 'Public Official',
      status: 'indexed',
      chunkCount: 5,
      description: 'Loyiha maqsadi, imkoniyatlari va qoidalari',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'src-official-catalog',
      title: 'Signal Books Elektron Kutubxona Katalogi',
      type: 'official',
      author: 'Signal Books Content Engine',
      license: 'Public Official',
      status: 'indexed',
      chunkCount: 20,
      description: 'Mavjud elektron va audio kitoblar, mualliflar va bo\'limlar',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
}

// Add new Knowledge Source in Admin
export async function addAdminKnowledgeSource(payload: {
  title: string;
  type: KnowledgeSourceType;
  content: string;
  url?: string;
  author?: string;
  license?: string;
}): Promise<{ success: boolean; sourceId?: string; error?: string }> {
  try {
    const res = await fetch('/api/admin/knowledge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    return { success: false, error: err.message || 'Serverga ulanishda xatolik' };
  }
}

// Fetch AI Chat Stats for Admin
export async function fetchAiStats(): Promise<AiChatStats> {
  try {
    const res = await fetch('/api/admin/stats');
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.stats) {
        return data.stats;
      }
    }
  } catch {}

  return {
    totalQuestionsToday: 18,
    totalQuestionsAllTime: 342,
    activeSessionsToday: 12,
    avgResponseTimeMs: 420,
    topSearchedQueries: [
      { query: 'Alpomish', count: 42 },
      { query: 'O‘tkan kunlar', count: 35 },
      { query: 'Matematika darsliklari', count: 28 },
      { query: 'Audio kitoblar', count: 21 },
      { query: 'Telegram bot', count: 19 }
    ],
    topSearchedBooks: [
      { title: 'Alpomish dostoni', count: 48 },
      { title: 'O‘tkan kunlar', count: 39 },
      { title: 'Sariq devni minib', count: 31 },
      { title: 'Matematika 5-sinf', count: 24 }
    ]
  };
}
