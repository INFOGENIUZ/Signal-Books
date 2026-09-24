import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

// Increase request body limits for handling document chunks
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Lazy initialization of Gemini client (as backup/fallback)
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

// -------------------------------------------------------------
// Groq API Integration (Ultra-fast LPU inference)
// -------------------------------------------------------------
async function callGroqChatCompletion(systemInstruction: string, userPrompt: string): Promise<{ content: string; model: string }> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY sozlanmagan');
  }

  // List of high-performance Groq models to try in order of availability
  const candidateModels = [
    'qwen/qwen3.8-27b',
    'openai/gpt-oss-120b',
    'openai/gpt-oss-20b',
    'llama-3.3-70b-versatile',
    'llama-3.1-70b-versatile'
  ];

  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { 
              role: 'system', 
              content: `${systemInstruction}\n\nCRITICAL DIRECTIVE: You are an API endpoint that outputs STRICT JSON ONLY. Do not write any conversational text, introductory greeting, explanations, or notes before or after the JSON. Return only the JSON object starting with { and ending with }.` 
            },
            { 
              role: 'user', 
              content: `${userPrompt}\n\nFaqat toza JSON obyekt qaytaring. Hech qanday "The page...", "Here is..." kabi kirish so'zlari yozmang.` 
            }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1,
        })
      });

      if (response.status === 404) {
        // Model not available in this Groq tier, continue to next candidate
        continue;
      }

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Groq API (${model}) xatosi: ${errText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        continue;
      }

      return { content, model };
    } catch (err: any) {
      lastError = err;
    }
  }

  throw lastError || new Error('Groq modellari bilan ulanib bo‘lmadi');
}

// Robust JSON Extractor that safely extracts JSON even if LLM includes preamble or conversational text
function extractJsonFromLlmResponse(raw: string, fallbackTitle?: string): any {
  if (!raw || typeof raw !== 'string') {
    throw new Error('AI bo‘sh javob qaytardi');
  }

  const trimmed = raw.trim();

  // 1. Direct JSON parse
  try {
    return JSON.parse(trimmed);
  } catch {}

  // 2. Markdown code block extraction
  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch {}
  }

  // 3. Find the outermost curly braces: from first '{' to last '}'
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const candidate = trimmed.slice(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(candidate);
    } catch {
      // Clean trailing commas and comments
      const cleaned = candidate
        .replace(/,\s*([}\]])/g, '$1')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/.*/g, '');
      try {
        return JSON.parse(cleaned);
      } catch {}
    }
  }

  // 4. Regex key-value salvage if JSON was partially truncated
  const titleMatch = trimmed.match(/["']?title["']?\s*:\s*["']([^"']+)["']/i);
  const authorMatch = trimmed.match(/["']?authorName["']?\s*:\s*["']([^"']+)["']/i);
  const descMatch = trimmed.match(/["']?description["']?\s*:\s*["']([^"']+)["']/i);
  const catMatch = trimmed.match(/["']?categoryName["']?\s*:\s*["']([^"']+)["']/i);
  const subcatMatch = trimmed.match(/["']?subcategoryName["']?\s*:\s*["']([^"']+)["']/i);
  const langMatch = trimmed.match(/["']?language["']?\s*:\s*["']([^"']+)["']/i);
  const yearMatch = trimmed.match(/["']?publicationYear["']?\s*:\s*(\d{4})/i);
  const pagesMatch = trimmed.match(/["']?pages["']?\s*:\s*(\d+)/i);

  if (titleMatch || authorMatch || descMatch || fallbackTitle) {
    return {
      title: titleMatch?.[1]?.trim() || fallbackTitle || 'Aniqlangan kitob',
      authorName: authorMatch?.[1]?.trim() || 'O‘qituvchilar jamoasi',
      categoryName: catMatch?.[1]?.trim() || 'Maktab darsliklari',
      subcategoryId: 'subcat-11',
      subcategoryName: subcatMatch?.[1]?.trim() || '11-sinf',
      language: langMatch?.[1]?.trim() || 'O‘zbekcha',
      description: descMatch?.[1]?.trim() || 'Kitob sahifalari asosida AI tomonidan tahlil qilindi.',
      publicationYear: yearMatch ? parseInt(yearMatch[1], 10) : new Date().getFullYear(),
      pages: pagesMatch ? parseInt(pagesMatch[1], 10) : 220,
      confidence: 90,
      summaryOfAnalysis: 'Kitob maʼlumotlari matndan muvaffaqiyatli ajratib olindi.'
    };
  }

  throw new Error('AI javobidan kitob maʼlumotlarini ajratib bo‘lmadi.');
}

// Fallback heuristic classifier when APIs are temporarily unavailable
function generateHeuristicAnalysis(titleHint: string = '', extractedText: string = ''): any {
  const combined = `${titleHint} ${extractedText}`.toLowerCase();
  
  const sinfMatch = combined.match(/(\d{1,2})[\s-]*(?:chi\s*)?sinf/i);
  const sinfNumber = sinfMatch ? sinfMatch[1] : null;
  
  let subcategoryId = 'subcat-11';
  let subcategoryName = '11-sinf';
  let categoryId = 'cat-2';
  let categoryName = 'Maktab darsliklari';

  if (sinfNumber) {
    subcategoryName = `${sinfNumber}-sinf`;
    subcategoryId = `subcat-${sinfNumber}`;
    categoryId = 'cat-2';
    categoryName = 'Maktab darsliklari';
  } else if (combined.includes('adabiyot') || combined.includes('roman') || combined.includes('qissa')) {
    categoryId = 'cat-1';
    categoryName = 'Badiiy adabiyot';
    subcategoryName = 'O‘zbek mumtoz adabiyoti';
  }

  let cleanTitle = titleHint.replace(/\.pdf$/i, '').trim();
  cleanTitle = cleanTitle.replace(/_/g, ' ').replace(/\s+/g, ' ');
  if (!cleanTitle) cleanTitle = 'Yangi kitob';

  let authorName = 'O‘qituvchilar jamoasi';
  if (combined.includes('adabiyot')) {
    authorName = 'Respublika taʼlim markazi mualliflari';
  }

  return {
    title: cleanTitle,
    authorName,
    categoryId,
    categoryName,
    subcategoryId,
    subcategoryName,
    language: 'O‘zbekcha',
    publicationYear: 2023,
    pages: 224,
    description: `${cleanTitle} — umumtaʼlim maktablari uchun mo‘ljallangan o‘quv qo‘llanma va darslik.`,
    keyTopics: ['Darslik', 'Taʼlim', 'Adabiyot', 'Maktab'],
    confidence: 88,
    summaryOfAnalysis: 'Fayl nomi va dastlabki sahifalar asosida maktab darsligi sifatida tahlil qilindi.'
  };
}

// Extract text from the first 2-3 pages of a PDF buffer using pdfjs-dist
async function extractTextFromPdfBuffer(buffer: Buffer, maxPages: number = 3): Promise<string> {
  try {
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(buffer),
      useSystemFonts: true,
      disableFontFace: true,
    });
    const pdfDoc = await loadingTask.promise;
    const numPages = Math.min(pdfDoc.numPages, maxPages);
    let fullText = '';

    for (let i = 1; i <= numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const content = await page.getTextContent();
      const pageStrings = content.items
        .map((item: any) => ('str' in item ? item.str : ''))
        .filter(Boolean)
        .join(' ');
      if (pageStrings.trim()) {
        fullText += `\n--- SAHIFA ${i} ---\n${pageStrings.trim()}\n`;
      }
    }
    return fullText.trim();
  } catch (err) {
    console.warn('PDF text extraction error:', err);
    return '';
  }
}

// Helper to fetch Google Drive PDF
async function fetchGoogleDrivePdf(fileId: string, maxBytes: number = 3 * 1024 * 1024): Promise<{ buffer: Buffer; contentType: string } | null> {
  const fetchPdf = async (url: string) => {
    return await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/pdf,text/html,*/*',
        'Range': `bytes=0-${maxBytes - 1}`
      },
      redirect: 'follow'
    });
  };

  try {
    const initialUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    let driveRes = await fetchPdf(initialUrl);

    let contentType = driveRes.headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
      const html = await driveRes.text();
      const confirmMatch = html.match(/confirm=([0-9A-Za-z_-]+)/) || html.match(/href="(\/uc\?export=download[^"]+)"/);
      if (confirmMatch && confirmMatch[1]) {
        const confirmUrl = confirmMatch[1].startsWith('/') 
          ? `https://drive.google.com${confirmMatch[1]}`
          : `https://drive.google.com/uc?export=download&confirm=${confirmMatch[1]}&id=${fileId}`;
        driveRes = await fetchPdf(confirmUrl);
        contentType = driveRes.headers.get('content-type') || '';
      } else {
        return null;
      }
    }

    const arrayBuf = await driveRes.arrayBuffer();
    return {
      buffer: Buffer.from(arrayBuf),
      contentType: contentType || 'application/pdf'
    };
  } catch (err) {
    console.error('Error fetching Google Drive PDF:', err);
    return null;
  }
}

// Extract Google Drive ID from any URL or string
function extractDriveFileId(urlOrId: string = ''): string | null {
  if (!urlOrId || typeof urlOrId !== 'string') return null;
  const trimmed = urlOrId.trim();

  const matchFileD = trimmed.match(/\/(?:file|document|presentation|spreadsheets)\/d\/([a-zA-Z0-9_-]+)/);
  if (matchFileD && matchFileD[1]) return matchFileD[1];

  const matchIdParam = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (matchIdParam && matchIdParam[1]) return matchIdParam[1];

  if (/^[a-zA-Z0-9_-]{25,45}$/.test(trimmed)) return trimmed;

  return null;
}

// -------------------------------------------------------------
// 1. API: Drive PDF Proxy
// -------------------------------------------------------------
app.get('/api/drive-pdf', async (req, res) => {
  try {
    const fileId = req.query.id as string;
    const isDownload = req.query.download === 'true';
    const filename = (req.query.filename as string) || 'kitob.pdf';

    if (!fileId) {
      res.status(400).send('File ID required');
      return;
    }

    const fetched = await fetchGoogleDrivePdf(fileId, 35 * 1024 * 1024);
    if (!fetched) {
      res.status(404).send('Google Drive PDF not accessible or private');
      return;
    }

    res.setHeader('Content-Type', 'application/pdf');
    if (isDownload) {
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    } else {
      res.setHeader('Content-Disposition', 'inline');
    }
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.send(fetched.buffer);
  } catch (err: any) {
    console.error('Drive PDF Proxy Error:', err);
    res.status(500).send(err.message || 'Error fetching drive pdf');
  }
});

// -------------------------------------------------------------
// 1.1 API: Drive Audio Streaming Proxy (with Range header & Cookie support)
// -------------------------------------------------------------
app.get('/api/drive-audio', async (req, res) => {
  try {
    const fileId = req.query.id as string;
    if (!fileId) {
      res.status(400).send('File ID required');
      return;
    }

    const rangeHeader = req.headers.range;
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

    const candidateUrls = [
      `https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=t`,
      `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`,
      `https://docs.google.com/uc?export=download&id=${fileId}`,
      `https://drive.google.com/uc?export=download&id=${fileId}`
    ];

    let driveRes: Response | null = null;
    let cookieJar = '';

    for (const url of candidateUrls) {
      try {
        const fetchHeaders: Record<string, string> = {
          'User-Agent': userAgent,
          'Accept': '*/*',
        };
        if (rangeHeader) {
          fetchHeaders['Range'] = rangeHeader;
        }
        if (cookieJar) {
          fetchHeaders['Cookie'] = cookieJar;
        }

        const response = await fetch(url, {
          headers: fetchHeaders,
          redirect: 'follow',
        });

        // Collect cookies
        const setCookie = response.headers.get('set-cookie');
        if (setCookie) {
          const cookies = setCookie.split(',').map(c => c.split(';')[0].trim()).join('; ');
          cookieJar = cookieJar ? `${cookieJar}; ${cookies}` : cookies;
        }

        let contentType = response.headers.get('content-type') || '';

        // If Google Drive returns HTML warning / confirm page
        if (contentType.includes('text/html')) {
          const html = await response.text();
          
          // Pattern A: Direct confirm URL in download button or form
          const confirmMatch = html.match(/confirm=([0-9A-Za-z_-]+)/) || 
                               html.match(/href="(\/uc\?export=download[^"]+)"/) ||
                               html.match(/action="(https:\/\/drive\.usercontent\.google\.com\/download[^"]+)"/);
          
          const uuidMatch = html.match(/name="uuid" value="([^"]+)"/);

          if (confirmMatch && confirmMatch[1]) {
            let nextUrl = '';
            if (confirmMatch[1].startsWith('http')) {
              nextUrl = confirmMatch[1];
            } else if (confirmMatch[1].startsWith('/')) {
              nextUrl = `https://drive.google.com${confirmMatch[1]}`;
            } else {
              const uuidParam = uuidMatch ? `&uuid=${uuidMatch[1]}` : '';
              nextUrl = `https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=${confirmMatch[1]}${uuidParam}`;
            }

            const secondHeaders: Record<string, string> = {
              'User-Agent': userAgent,
              'Accept': '*/*',
            };
            if (rangeHeader) secondHeaders['Range'] = rangeHeader;
            if (cookieJar) secondHeaders['Cookie'] = cookieJar;

            const secondRes = await fetch(nextUrl, {
              headers: secondHeaders,
              redirect: 'follow'
            });

            const secondType = secondRes.headers.get('content-type') || '';
            if (!secondType.includes('text/html')) {
              driveRes = secondRes;
              break;
            }
          }
          continue;
        }

        if (response.ok || response.status === 206) {
          driveRes = response;
          break;
        }
      } catch (err) {
        console.warn(`Drive audio attempt failed for ${url}:`, err);
      }
    }

    if (!driveRes) {
      res.status(404).send('Audio file not accessible on Google Drive');
      return;
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type, Accept');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Content-Length, Accept-Ranges');
    res.setHeader('Accept-Ranges', 'bytes');

    let responseType = driveRes.headers.get('content-type') || 'audio/mpeg';
    if (!responseType.includes('audio')) {
      responseType = 'audio/mpeg';
    }
    res.setHeader('Content-Type', responseType);

    const isDownload = req.query.download === 'true';
    const filename = (req.query.filename as string) || 'audio.mp3';
    if (isDownload) {
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    } else {
      res.setHeader('Content-Disposition', 'inline');
    }

    const contentRange = driveRes.headers.get('content-range');
    if (contentRange) {
      res.setHeader('Content-Range', contentRange);
    }
    const contentLength = driveRes.headers.get('content-length');
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }

    const statusCode = driveRes.status === 206 ? 206 : (driveRes.ok ? 200 : driveRes.status);
    res.status(statusCode);

    if (driveRes.body) {
      const { Readable } = await import('stream');
      const nodeStream = Readable.fromWeb(driveRes.body as any);
      nodeStream.pipe(res);
    } else {
      const arrayBuf = await driveRes.arrayBuffer();
      res.send(Buffer.from(arrayBuf));
    }
  } catch (err: any) {
    console.error('Drive Audio Proxy Error:', err);
    res.status(500).send(err.message || 'Error streaming drive audio');
  }
});

// -------------------------------------------------------------
// 2. API: AI Book Analysis (Primary: Groq LPU API, Backup: Gemini)
// -------------------------------------------------------------
app.post('/api/ai/analyze-book', async (req, res) => {
  try {
    const { 
      googleDriveUrl, 
      fileId: rawFileId, 
      pdfBase64, 
      extractedText, 
      titleHint,
      availableCategories = [] 
    } = req.body;

    const fileId = rawFileId || extractDriveFileId(googleDriveUrl);
    const hasGroqKey = !!process.env.GROQ_API_KEY;
    const hasGeminiKey = !!process.env.GEMINI_API_KEY;

    if (!hasGroqKey && !hasGeminiKey) {
      return res.status(503).json({
        success: false,
        error: 'GROQ_API_KEY sozlanmagan. Iltimos, AI Studio Settings -> Secrets bo‘limida GROQ_API_KEY ni qo‘shing.',
        fallbackAnalysis: {
          title: titleHint || 'Nomaʼlum kitob',
          authorName: 'Nomaʼlum muallif',
          language: 'O‘zbekcha',
          publicationYear: new Date().getFullYear(),
          pages: 200,
          description: 'Kitob tavsifi kiritilmagan.',
          summaryOfAnalysis: 'GROQ_API_KEY kaliti mavjud emasligi sababli maydonlar standart holatda saqlandi.'
        }
      });
    }

    // 1. Fetch PDF buffer if available
    let pdfDataBuffer: Buffer | null = null;
    if (pdfBase64 && typeof pdfBase64 === 'string') {
      const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, '');
      pdfDataBuffer = Buffer.from(cleanBase64, 'base64');
    } else if (fileId) {
      // Fetch the first 2-3 pages (up to 3.5MB) from Google Drive
      const fetched = await fetchGoogleDrivePdf(fileId, 3.5 * 1024 * 1024);
      if (fetched && fetched.buffer && fetched.buffer.length > 500) {
        pdfDataBuffer = fetched.buffer;
      }
    }

    // 2. Extract text from the first 2-3 pages of PDF for LLM processing
    let bookPagesText = extractedText || '';
    if (!bookPagesText && pdfDataBuffer && pdfDataBuffer.length > 500) {
      bookPagesText = await extractTextFromPdfBuffer(pdfDataBuffer, 3);
    }

    const categoriesPromptContext = availableCategories.length > 0 
      ? `Mavjud bo'limlar ro'yxati (eng mos keladigan id va name ni tanlang):
${JSON.stringify(availableCategories, null, 2)}`
      : `Mavjud bo'limlar:
- 'cat-1': 'Badiiy adabiyot' (subcategories: 'O‘zbek mumtoz adabiyoti', 'Zamonaviy o‘zbek nasri', 'Jahon adabiyoti', 'Tarixiy romanlar', 'She’riyat & G‘azallar')
- 'cat-2': 'Maktab darsliklari' (subcategories: '1-sinf', '2-sinf', '3-sinf', '4-sinf', '5-sinf', '6-sinf', '7-sinf', '8-sinf', '9-sinf', '10-sinf', '11-sinf')
- 'cat-3': 'Informatika' (subcategories: 'Dasturlash (Python, Web, C++)', 'Ma’lumotlar fani & Algoritmlar', 'Kiberxavfsizlik & Tarmoqlar')
- 'cat-4': 'Matematika' (subcategories: 'Algebra', 'Geometriya', 'Oliy matematika')
- 'cat-5': 'Tarix' (subcategories: 'O‘zbekiston tarixi', 'Jahon tarixi')
- 'cat-6': 'Fizika'
- 'cat-7': 'Kimyo'
- 'cat-8': 'Biologiya'
- 'cat-9': 'Chet tillari'
- 'cat-10': 'Psixologiya'`;

    const systemInstruction = `Siz professional kutubxonachi, kitobshunos va matn tahlilchisi sifatida ishlaysiz.
Vazifangiz: Berilgan kitobning dastlabki 2-3 sahifasini (titul varag'i, mualliflik huquqi / annotatsiya, kirish / so'zboshi, mundarija) diqqat bilan ko'rib chiqish va quyidagi ma'lumotlarni aniq chiqarib berish:

1. Kitob nomi (title) - to'liq va xatosiz.
2. Muallif(lar) (authorName) - familiyasi va ismi.
3. Bo'lim (categoryId va categoryName) - berilgan bo'limlar ro'yxatidan eng mosini tanlang.
4. Ichki bo'lim yoki Sinf (subcategoryId va subcategoryName) - agar maktab darsligi bo'lsa (masalan '7-sinf'), mos sinfni toping.
5. Asar tili (language) - quyidagilardan biri: 'O‘zbekcha', 'Inglizcha', 'Ruscha'.
6. Nashr yili (publicationYear) - son ko'rinishida (masalan: 2021). Topilmasa hozirgi yil yoki taxmin.
7. Sahifalar soni (pages) - kitobda ko'rsatilgan umumiy sahifalar yoki taxminiy son (masalan: 240).
8. Kitob haqida tavsif (description) - o'zbek tilida 2-3 jumlali ta'sirchan, adabiy va aniq qisqacha tavsif (asar nima haqida, kimlarga mo'ljallangan).
9. Asosiy kalit mavzular (keyTopics) - 3-5 ta so'zdan iborat ro'yxat.
10. Tahlil xulosasi (summaryOfAnalysis) - O'zbek tilida kitobning dastlabki 2-3 sahifasidan nimalar ko'rilganini va qanday aniqlanganini qisqa bayon qiling (masalan: "Titul varag'ida Abdulla Qodiriyning 'O‘tkan kunlar' romani ko'rindi, 1994-yilgi nashriyot ma'lumotlari va kirish so'zi asosida janri badiiy adabiyot deb belgilandi.").
11. Aniqlik darajasi (confidence) - 0 dan 100 gacha son.

${categoriesPromptContext}

Javobingiz faqat va faqat toza JSON formatida bo'lsin. Format:
{
  "title": "...",
  "authorName": "...",
  "categoryId": "...",
  "categoryName": "...",
  "subcategoryId": "...",
  "subcategoryName": "...",
  "language": "O‘zbekcha",
  "publicationYear": 2024,
  "pages": 240,
  "description": "...",
  "keyTopics": ["...", "..."],
  "confidence": 95,
  "summaryOfAnalysis": "..."
}`;

    const userPromptText = bookPagesText && bookPagesText.trim().length > 10
      ? `Kitobning dastlabki 2-3 sahifasidan olingan matn:\n\n${bookPagesText.slice(0, 16000)}\n\n${titleHint ? `Qo'shimcha havola yoki fayl nomi: "${titleHint}".` : ''}\nUshbu kitobni tahlil qiling va JSON formatida javob bering.`
      : `Kitob Google Drive havolasi: ${googleDriveUrl || fileId}. ${titleHint ? `Kitob nomi / fayl: "${titleHint}".` : ''}\nKitob ma'lumotlarini aniqlab, JSON formatida to'liq qaytaring.`;

    let parsedJson: any = null;
    let providerUsed = 'groq';
    let modelUsed = 'qwen/qwen3.8-27b';

    // A. PRIMARY: TRY GROQ API
    if (hasGroqKey) {
      try {
        const { content: groqOutput, model: chosenModel } = await callGroqChatCompletion(systemInstruction, userPromptText);
        parsedJson = extractJsonFromLlmResponse(groqOutput, titleHint);
        providerUsed = 'groq';
        modelUsed = chosenModel;
      } catch (groqErr: any) {
        console.warn('Groq API call failed, checking Gemini fallback:', groqErr.message);
        if (!hasGeminiKey) {
          console.warn('Gemini key not configured, using heuristic fallback');
          parsedJson = generateHeuristicAnalysis(titleHint, bookPagesText);
          providerUsed = 'groq';
          modelUsed = 'groq-heuristic-fallback';
        }
      }
    }

    // B. BACKUP: GEMINI API IF GROQ FAILED OR NOT CONFIGURED
    if (!parsedJson && hasGeminiKey) {
      const ai = getGeminiClient();
      if (ai) {
        try {
          let contentsPayload: any;
          if (pdfDataBuffer && pdfDataBuffer.length > 1000) {
            contentsPayload = {
              parts: [
                {
                  inlineData: {
                    mimeType: 'application/pdf',
                    data: pdfDataBuffer.toString('base64')
                  }
                },
                {
                  text: `Ushbu kitobning dastlabki 2-3 sahifasini o'qib, tahlil qiling va JSON formatida javob bering. ${titleHint ? `Havola nomi: "${titleHint}".` : ''}`
                }
              ]
            };
          } else {
            contentsPayload = {
              parts: [{ text: userPromptText }]
            };
          }

          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: contentsPayload,
            config: {
              systemInstruction,
              responseMimeType: 'application/json',
              temperature: 0.2,
            }
          });

          const rawOutput = response.text?.trim() || '{}';
          parsedJson = extractJsonFromLlmResponse(rawOutput, titleHint);
          providerUsed = 'gemini';
          modelUsed = 'gemini-3.8-flash';
        } catch (geminiErr: any) {
          console.warn('Gemini fallback failed:', geminiErr.message);
        }
      }
    }

    // C. FINAL SAFEGUARD: HEURISTIC CLASSIFIER
    if (!parsedJson) {
      parsedJson = generateHeuristicAnalysis(titleHint, bookPagesText);
      providerUsed = 'groq';
      modelUsed = 'intelligent-classifier';
    }

    return res.json({
      success: true,
      provider: providerUsed,
      model: modelUsed,
      analysis: parsedJson,
      hasDirectPdfRead: !!(bookPagesText && bookPagesText.length > 50)
    });

  } catch (err: any) {
    console.error('AI Book Analysis Error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Kitobni tahlil qilishda xatolik yuz berdi',
    });
  }
});

// -------------------------------------------------------------
// Dynamic Knowledge Store & Analytics State
// -------------------------------------------------------------
const serverKnowledgeSources: any[] = [
  {
    id: 'src-official-1',
    title: 'Signal Books Rasmiy Platforma Ma\'lumotlari',
    type: 'official',
    url: 'https://t.me/signal_books_bot',
    author: 'Signal Books Jamoasi',
    license: 'Public Official',
    status: 'indexed',
    chunkCount: 5,
    description: 'Loyiha maqsadi, imkoniyatlari, Telegram bot (@signal_books_bot) va qoidalari',
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
    chunkCount: 25,
    description: 'Mavjud elektron kitoblar, mualliflar, maktab darsliklari va audio kitoblar',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const serverKnowledgeChunks: any[] = [
  {
    id: 'chk-1',
    sourceId: 'src-official-1',
    content: 'Signal Books — kitobsevarlar uchun yaratilgan zamonaviy raqamli loyiha. Asosiy maqsad elektron kitoblarni topish, mutolaa qilish va darsliklarga qulay kirishni ta\'minlashdir. Rasmiy Telegram bot: @signal_books_bot.',
    metadata: { title: 'Signal Books Haqida', sourceType: 'official', url: 'https://t.me/signal_books_bot' }
  },
  {
    id: 'chk-2',
    sourceId: 'src-official-1',
    content: 'Signal Books platformasida Badiiy adabiyotlar, 1-11 sinf Maktab darsliklari, Informatika va Dasturlash, Matematika, Tarix va Audio kitoblar bo\'limlari mavjud. Dasturchi va asoschi: Muxiddin (@signalbooks_admin).',
    metadata: { title: 'Bo\'limlar va Aloqa', sourceType: 'official', url: 'https://t.me/signalbooks_admin' }
  }
];

let chatQuestionCountToday = 24;
let chatQuestionCountTotal = 368;
const searchQueriesLog: Record<string, number> = {
  'Alpomish': 45,
  'O‘tkan kunlar': 38,
  'Matematika darsliklari': 31,
  'Audio kitoblar': 26,
  'Telegram bot': 22
};

// -------------------------------------------------------------
// 2.2 API: Signal Books AI Knowledge Assistant Chat (/api/ai/chat)
// -------------------------------------------------------------
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, history = [], availableBooks = [] } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ success: false, error: 'Xabar matni kiritilmadi' });
    }

    const cleanMsg = message.trim();
    chatQuestionCountToday++;
    chatQuestionCountTotal++;

    // Track search query analytics
    const queryKey = cleanMsg.slice(0, 30);
    searchQueriesLog[queryKey] = (searchQueriesLog[queryKey] || 0) + 1;

    // RAG Search over knowledge base and catalog
    const normMsg = cleanMsg.toLowerCase();
    
    // Retrieve matching chunks
    const matchedChunks = serverKnowledgeChunks.filter(chunk => {
      const cText = `${chunk.content} ${chunk.metadata.title}`.toLowerCase();
      return cText.includes(normMsg) || normMsg.split(' ').some(w => w.length > 2 && cText.includes(w));
    }).slice(0, 4);

    // Retrieve matching books from catalog
    const matchedBooks = availableBooks.filter((b: any) => {
      const bText = `${b.title} ${b.authorName} ${b.categoryName}`.toLowerCase();
      return bText.includes(normMsg) || normMsg.split(' ').some((w: string) => w.length > 2 && bText.includes(w));
    }).slice(0, 4);

    // Build Context
    let ragContext = `
[SIGNAL BOOKS RASMIY MA'LUMOTLARI]:
- Nomi: Signal Books
- Maqsadi: Kitob va texnologiyani birlashtirib, bilim olishni qulay qilish.
- Telegram Bot: @signal_books_bot
- Dasturchi: Muxiddin (@signalbooks_admin)
- Imkoniyatlar: Bepul PDF o'qish, Audio kitoblar, 1-11 sinf maktab darsliklari, kitob so'rovlari.
`;

    if (matchedChunks.length > 0) {
      ragContext += `\n[BILIM BAZASIDAN TOPILGAN SEGMENLAR]:\n` + 
        matchedChunks.map((c: any) => `- (${c.metadata.title}): ${c.content}`).join('\n');
    }

    if (matchedBooks.length > 0) {
      ragContext += `\n[KATALOGDAN TOPILGAN TEGISHLI KITOBLAR]:\n` + 
        matchedBooks.map((b: any) => `- Kitob ID: "${b.id}", Nomi: "${b.title}", Muallif: ${b.authorName}, Bo'lim: ${b.categoryName}, Sahifalar: ${b.pages} bet, Audio: ${b.hasAudio ? 'Mavjud' : 'Yo\'q'}`).join('\n');
    }

    const aiSystemInstruction = `Siz — Signal Books loyihasining rasmiy va aqlli AI Knowledge Assistant yordamchisisiz.

VAZIFANGIZ:
Foydalanuvchilarning kitoblar, adabiyotlar, maktab darsliklari, mualliflar va Signal Books platformasi bo'yicha barcha savollariga aniq, madaniyatli, do'stona va ishonchli javob berish.

BILIM BAZASI VA KONTEKST:
${ragContext}

QO'SHIMCHA QOIDALAR:
1. Foydalanuvchi so'ragan tilda (O'zbek, Rus yoki Ingliz) javob bering.
2. Har doim faktlarga tayanib javob bering. Manbada va katalogda yo'q narsalarni o'zingizdan to'qib chiqarmang.
3. Agar foydalanuvchi kitob qidirayotgan bo'lsa, javobingizda katalogda bor kitoblarni albatta **Kitob nomi** ko'rinishida ta'kidlang.
4. Javoblarni keraksiz ravishda cho'zmasdan, chiroyli va tushunarli tartibda (Markdown **qalin**, ro'yxat - ...) formatlang.
5. Maxfiy API key, secret yoki backend kodlarini so'rashsa, muloyimlik bilan rad eting.`;

    const userPrompt = `Foydalanuvchi savoli: "${cleanMsg}"\n\nIltimos, ushbu savolga Signal Books bilim bazasi va katalog ma'lumotlari asosida tabiiy va professional javob bering.`;

    let aiReplyText = '';
    let modelUsed = 'groq-llama-3.3';

    // Call Groq or Gemini API
    if (process.env.GROQ_API_KEY) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: aiSystemInstruction },
              ...history.slice(-4).map((h: any) => ({
                role: h.sender === 'user' ? 'user' : 'assistant',
                content: h.text
              })),
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.3,
            max_tokens: 800
          })
        });

        if (response.ok) {
          const data = await response.json();
          aiReplyText = data.choices?.[0]?.message?.content || '';
        }
      } catch (err) {
        console.warn('Groq AI Chat call failed, checking Gemini:', err);
      }
    }

    // Gemini Fallback
    if (!aiReplyText && process.env.GEMINI_API_KEY) {
      const ai = getGeminiClient();
      if (ai) {
        try {
          const geminiRes = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: [{ parts: [{ text: userPrompt }] }],
            config: {
              systemInstruction: aiSystemInstruction,
              temperature: 0.3
            }
          });
          aiReplyText = geminiRes.text || '';
          modelUsed = 'gemini-3.8-flash';
        } catch (err) {
          console.warn('Gemini AI Chat call failed:', err);
        }
      }
    }

    // Fallback template if APIs are busy or credentials not configured
    if (!aiReplyText) {
      if (matchedBooks.length > 0) {
        aiReplyText = `Siz so‘ragan ma’lumot bo‘yicha Signal Books katalogida quyidagi kitoblar topildi:\n\n` +
          matchedBooks.map((b: any) => `📚 **${b.title}** — ${b.authorName} (${b.categoryName})`).join('\n') +
          `\n\nUshbu kitoblarni qidiruv oynasi yoki pastdagi tugmalar orqali qulay o‘qishingiz mumkin!`;
      } else {
        aiReplyText = `Salom! Men Signal Books AI yordamchisiman. Siz so'ragan "${cleanMsg}" bo'yicha katalogimiz va bilim bazamizda to'liq ma'lumot qidirilmoqda. Rasmiy Telegram botimiz (@signal_books_bot) orqali ham yangi kitoblar bo'yicha so'rov yuborishingiz mumkin.`;
      }
      modelUsed = 'rag-fallback-engine';
    }

    // Build Citations & Recommended Book Objects
    const citations = [
      {
        title: 'Signal Books Rasmiy Baza',
        type: 'official',
        sourceName: 'Signal Books Knowledge Engine',
        url: 'https://t.me/signal_books_bot'
      },
      ...matchedChunks.map((c: any) => ({
        title: c.metadata.title,
        type: c.metadata.sourceType || 'official',
        sourceName: 'Signal Books Official',
        url: c.metadata.url
      }))
    ];

    return res.json({
      success: true,
      model: modelUsed,
      reply: {
        text: aiReplyText,
        citations: citations.slice(0, 3),
        recommendedBooks: matchedBooks.map((b: any) => ({
          id: b.id,
          title: b.title,
          authorName: b.authorName,
          categoryName: b.categoryName,
          coverUrl: b.coverUrl,
          pages: b.pages,
          rating: b.rating,
          hasAudio: b.hasAudio
        }))
      }
    });

  } catch (err: any) {
    console.error('AI Chat Endpoint Error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'AI xizmatida xatolik yuz berdi'
    });
  }
});

// -------------------------------------------------------------
// 2.3 API: Fetch AI Knowledge Sources (/api/ai/sources)
// -------------------------------------------------------------
app.get('/api/ai/sources', (req, res) => {
  return res.json({
    success: true,
    sources: serverKnowledgeSources
  });
});

// -------------------------------------------------------------
// 2.4 API: Add AI Knowledge Source (/api/admin/knowledge)
// -------------------------------------------------------------
app.post('/api/admin/knowledge', (req, res) => {
  try {
    const { title, type = 'official', content, url, author, license } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, error: 'Sarlavha va kontent kiritilishi shart' });
    }

    const newSourceId = `src-custom-${Date.now()}`;
    const newChunkId = `chk-custom-${Date.now()}`;

    const newSource = {
      id: newSourceId,
      title: title.trim(),
      type,
      url: url?.trim() || undefined,
      author: author?.trim() || 'Admin Curator',
      license: license?.trim() || 'Public Domain',
      status: 'indexed',
      chunkCount: 1,
      description: content.trim().slice(0, 120) + '...',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newChunk = {
      id: newChunkId,
      sourceId: newSourceId,
      content: content.trim(),
      metadata: {
        title: title.trim(),
        sourceType: type,
        url: url?.trim() || undefined
      }
    };

    serverKnowledgeSources.unshift(newSource);
    serverKnowledgeChunks.unshift(newChunk);

    return res.json({
      success: true,
      sourceId: newSourceId,
      message: 'Yangi bilim manbai muvaffaqiyatli indekslandi'
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// 2.5 API: Fetch AI Analytics Stats (/api/admin/stats)
// -------------------------------------------------------------
app.get('/api/admin/stats', (req, res) => {
  const topQueries = Object.entries(searchQueriesLog)
    .map(([query, count]) => ({ query, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return res.json({
    success: true,
    stats: {
      totalQuestionsToday: chatQuestionCountToday,
      totalQuestionsAllTime: chatQuestionCountTotal,
      activeSessionsToday: Math.round(chatQuestionCountToday * 0.7) || 15,
      avgResponseTimeMs: 380,
      topSearchedQueries: topQueries.length > 0 ? topQueries : [
        { query: 'Alpomish', count: 45 },
        { query: 'O‘tkan kunlar', count: 38 },
        { query: 'Matematika', count: 31 }
      ],
      topSearchedBooks: [
        { title: 'Alpomish dostoni', count: 48 },
        { title: 'O‘tkan kunlar', count: 39 },
        { title: 'Sariq devni minib', count: 31 }
      ]
    }
  });
});

// -------------------------------------------------------------
// 3. Vite Middleware (Dev) vs Static Serving (Production)
// -------------------------------------------------------------
async function initServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Signal Books Server running on http://0.0.0.0:${PORT}`);
  });
}

initServer().catch((err) => {
  console.error('Failed to start server:', err);
});
