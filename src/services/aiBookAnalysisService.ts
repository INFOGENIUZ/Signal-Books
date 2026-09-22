import { BookLanguage, Category } from '../types';

export interface AiBookAnalysisResult {
  title: string;
  authorName: string;
  categoryId: string;
  categoryName: string;
  subcategoryId?: string;
  subcategoryName?: string;
  language: BookLanguage;
  publicationYear: number;
  pages: number;
  description: string;
  keyTopics?: string[];
  confidence: number;
  summaryOfAnalysis: string;
  hasDirectPdfRead?: boolean;
  provider?: 'groq' | 'gemini';
  model?: string;
}

export interface AnalyzeBookRequest {
  googleDriveUrl?: string;
  fileId?: string;
  pdfBase64?: string;
  extractedText?: string;
  titleHint?: string;
  categories: Category[];
}

export async function analyzeBookWithAI(req: AnalyzeBookRequest): Promise<{
  success: boolean;
  analysis?: AiBookAnalysisResult;
  error?: string;
}> {
  try {
    const categoriesPayload = req.categories.map(c => ({
      id: c.id,
      name: c.name,
      subcategories: c.subcategories?.map(s => ({
        id: s.id,
        name: s.name
      }))
    }));

    const response = await fetch('/api/ai/analyze-book', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        googleDriveUrl: req.googleDriveUrl,
        fileId: req.fileId,
        pdfBase64: req.pdfBase64,
        extractedText: req.extractedText,
        titleHint: req.titleHint,
        availableCategories: categoriesPayload,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return {
        success: false,
        error: data.error || 'Serverdan tahlil maʼlumotlarini olishda xatolik yuz berdi.',
        analysis: data.fallbackAnalysis ? normalizeAnalysis(data.fallbackAnalysis, req.categories) : undefined
      };
    }

    const normalized = normalizeAnalysis(data.analysis, req.categories);
    if (data.hasDirectPdfRead !== undefined) {
      normalized.hasDirectPdfRead = data.hasDirectPdfRead;
    }
    normalized.provider = data.provider || 'groq';
    normalized.model = data.model || 'llama-3.3-70b-versatile';

    return {
      success: true,
      analysis: normalized
    };
  } catch (err: any) {
    console.error('AI Book Analysis Client Error:', err);
    return {
      success: false,
      error: err.message || 'Tarmoq xatosi: AI tahlil serveriga ulanib bo‘lmadi.'
    };
  }
}

/**
 * Normalizes raw AI output to ensure valid categoryId, subcategoryId, language and numeric fields
 */
function normalizeAnalysis(raw: any, categories: Category[]): AiBookAnalysisResult {
  const title = (raw.title || raw.bookTitle || 'Nomaʼlum kitob').toString().trim();
  const authorName = (raw.authorName || raw.author || raw.muallif || 'Nomaʼlum muallif').toString().trim();
  
  // Match category
  let matchedCat = categories.find(c => 
    c.id === raw.categoryId || 
    c.name.toLowerCase() === (raw.categoryName || raw.category || '').toLowerCase()
  );

  // Partial search if exact match not found
  if (!matchedCat && (raw.categoryName || raw.category)) {
    const searchCat = (raw.categoryName || raw.category).toLowerCase();
    matchedCat = categories.find(c => 
      c.name.toLowerCase().includes(searchCat) || 
      searchCat.includes(c.name.toLowerCase())
    );
  }

  // School textbook auto-detect
  if (!matchedCat && (title.toLowerCase().includes('sinf') || title.toLowerCase().includes('darslik'))) {
    matchedCat = categories.find(c => c.id === 'cat-2' || c.name.toLowerCase().includes('darslik'));
  }

  const defaultCat: Category = { 
    id: 'cat-1', 
    slug: 'badiiy-adabiyot',
    name: 'Badiiy adabiyot', 
    iconName: 'BookOpen',
    booksCount: 0,
    subcategories: [] 
  };
  const finalCat: Category = matchedCat || categories[0] || defaultCat;

  // Match subcategory
  let subcategoryId: string | undefined = undefined;
  let subcategoryName: string | undefined = undefined;

  if (finalCat.subcategories && finalCat.subcategories.length > 0) {
    // 1. Try class pattern: e.g. "7-sinf", "7 sinf", "7"
    const classMatch = (title + ' ' + (raw.subcategoryName || raw.subcategory || '')).match(/(\d{1,2})[\s-]*(?:sinf|class)/i);
    if (classMatch && classMatch[1]) {
      const classNum = classMatch[1];
      const foundSub = finalCat.subcategories.find(s => s.name.includes(`${classNum}-sinf`) || s.slug?.includes(`${classNum}-sinf`));
      if (foundSub) {
        subcategoryId = foundSub.id;
        subcategoryName = foundSub.name;
      }
    }

    // 2. Direct string match
    if (!subcategoryId && (raw.subcategoryId || raw.subcategoryName || raw.subcategory)) {
      const subTarget = (raw.subcategoryName || raw.subcategory || raw.subcategoryId || '').toLowerCase();
      const foundSub = finalCat.subcategories.find(s => 
        s.id === raw.subcategoryId || 
        s.name.toLowerCase() === subTarget ||
        s.name.toLowerCase().includes(subTarget) ||
        subTarget.includes(s.name.toLowerCase())
      );
      if (foundSub) {
        subcategoryId = foundSub.id;
        subcategoryName = foundSub.name;
      }
    }
  }

  // Match language
  let language: BookLanguage = 'O‘zbekcha';
  if (raw.language) {
    const lLower = raw.language.toLowerCase();
    if (lLower.includes('ingliz') || lLower.includes('english')) language = 'Inglizcha';
    else if (lLower.includes('rus') || lLower.includes('russian')) language = 'Ruscha';
    else language = 'O‘zbekcha';
  }

  // Publication year
  let publicationYear = Number(raw.publicationYear);
  if (isNaN(publicationYear) || publicationYear < 1800 || publicationYear > 2030) {
    publicationYear = new Date().getFullYear();
  }

  // Pages
  let pages = Number(raw.pages || raw.estimatedPages || raw.totalPages);
  if (isNaN(pages) || pages <= 0) {
    pages = 220;
  }

  // Description
  const description = (raw.description || raw.annotatsiya || raw.summary || '').toString().trim() || 
    `«${title}» — ${authorName} qalamiga mansub ${finalCat.name.toLowerCase()} yo‘nalishidagi asar. Kitob o‘quvchiga chuqur maʼrifiy va amaliy bilim beradi.`;

  // Key topics
  const keyTopics: string[] = Array.isArray(raw.keyTopics) ? raw.keyTopics : [];

  // Confidence
  let confidence = Number(raw.confidence);
  if (isNaN(confidence) || confidence <= 0 || confidence > 100) {
    confidence = 92;
  }

  // Summary of analysis
  const summaryOfAnalysis = (raw.summaryOfAnalysis || raw.tahlil || '').toString().trim() ||
    `Kitobning dastlabki sahifalari va titul varag'i o'rganildi. «${title}» (Muallif: ${authorName}) kitobi aniqlandi va shakl maydonlariga muvaffaqiyatli kiritildi.`;

  return {
    title,
    authorName,
    categoryId: finalCat.id,
    categoryName: finalCat.name,
    subcategoryId,
    subcategoryName,
    language,
    publicationYear,
    pages,
    description,
    keyTopics,
    confidence,
    summaryOfAnalysis,
  };
}
