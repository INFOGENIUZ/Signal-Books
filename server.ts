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
// Groq API Integration (Llama 3.3 70B Versatile)
// -------------------------------------------------------------
async function callGroqChatCompletion(systemInstruction: string, userPrompt: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY sozlanmagan');
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq API xatosi (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Groq bo‘sh javob qaytardi');
  }
  return content;
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
    let modelUsed = 'llama-3.3-70b-versatile';

    // A. PRIMARY: TRY GROQ API
    if (hasGroqKey) {
      try {
        const groqOutput = await callGroqChatCompletion(systemInstruction, userPromptText);
        try {
          parsedJson = JSON.parse(groqOutput);
        } catch {
          const cleaned = groqOutput.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
          parsedJson = JSON.parse(cleaned);
        }
        providerUsed = 'groq';
        modelUsed = 'llama-3.3-70b-versatile';
      } catch (groqErr: any) {
        console.warn('Groq API call failed, checking Gemini fallback:', groqErr.message);
        if (!hasGeminiKey) {
          throw groqErr;
        }
      }
    }

    // B. BACKUP: GEMINI API IF GROQ FAILED OR NOT CONFIGURED
    if (!parsedJson && hasGeminiKey) {
      const ai = getGeminiClient();
      if (ai) {
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
        try {
          parsedJson = JSON.parse(rawOutput);
        } catch {
          const cleaned = rawOutput.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
          parsedJson = JSON.parse(cleaned);
        }
        providerUsed = 'gemini';
        modelUsed = 'gemini-3.8-flash';
      }
    }

    if (!parsedJson) {
      throw new Error('AI tahlil modelidan javob olib bo‘lmadi.');
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
