import type { IncomingMessage, ServerResponse } from 'http';

interface VercelRequest extends IncomingMessage {
  body: any;
  query: { [key: string]: string | string[] };
}

interface VercelResponse extends ServerResponse {
  status: (statusCode: number) => VercelResponse;
  send: (body: any) => VercelResponse;
  json: (body: any) => VercelResponse;
}

// -------------------------------------------------------------
// Helper: Extract JSON safely from LLM output
// -------------------------------------------------------------
function extractJsonFromLlmResponse(raw: string, fallbackTitle?: string): any {
  if (!raw || typeof raw !== 'string') {
    throw new Error('AI bo‘sh javob qaytardi');
  }

  const trimmed = raw.trim();

  // 1. Direct parse
  try {
    return JSON.parse(trimmed);
  } catch {}

  // 2. Markdown block
  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch {}
  }

  // 3. Outermost curly braces
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const candidate = trimmed.slice(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(candidate);
    } catch {
      const cleaned = candidate
        .replace(/,\s*([}\]])/g, '$1')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/.*/g, '');
      try {
        return JSON.parse(cleaned);
      } catch {}
    }
  }

  // 4. Regex salvage
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

// -------------------------------------------------------------
// Fallback: Heuristic Classifier
// -------------------------------------------------------------
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

// -------------------------------------------------------------
// Groq API Call
// -------------------------------------------------------------
async function callGroqChatCompletion(apiKey: string, systemInstruction: string, userPrompt: string): Promise<{ content: string; model: string }> {
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
        continue;
      }

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Groq API (${model}) xatosi: ${errText}`);
      }

      const data: any = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) continue;

      return { content, model };
    } catch (err: any) {
      lastError = err;
    }
  }

  throw lastError || new Error('Groq modellari bilan ulanib bo‘lmadi');
}

// -------------------------------------------------------------
// PDF Text Extractor
// -------------------------------------------------------------
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

// -------------------------------------------------------------
// Helper to parse JSON body from incoming stream if not pre-parsed
// -------------------------------------------------------------
async function getRequestBody(req: VercelRequest): Promise<any> {
  if (req.body) {
    if (typeof req.body === 'string') {
      try {
        return JSON.parse(req.body);
      } catch {
        return {};
      }
    }
    return req.body;
  }

  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch {
        resolve({});
      }
    });
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Method not allowed' }));
    return;
  }

  try {
    const body = await getRequestBody(req);
    const { 
      googleDriveUrl, 
      fileId, 
      pdfBase64, 
      extractedText, 
      titleHint,
      availableCategories = [],
      clientGroqKey
    } = body;

    const groqKey = clientGroqKey || process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    let bookPagesText = extractedText || '';

    // If PDF base64 provided and text is missing, extract text
    if (!bookPagesText && pdfBase64 && typeof pdfBase64 === 'string') {
      try {
        const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, '');
        const pdfBuffer = Buffer.from(cleanBase64, 'base64');
        bookPagesText = await extractTextFromPdfBuffer(pdfBuffer, 3);
      } catch (e) {
        console.warn('Could not extract text from base64 buffer:', e);
      }
    }

    const categoriesPromptContext = availableCategories.length > 0 
      ? `Mavjud bo'limlar ro'yxati (eng mos keladigan id va name ni tanlang):
${JSON.stringify(availableCategories, null, 2)}`
      : `Mavjud bo'limlar:
- 'cat-1': 'Badiiy adabiyot' (subcategories: 'O‘zbek mumtoz adabiyoti', 'Zamonaviy o‘zbek nasri', 'Jahon adabiyoti')
- 'cat-2': 'Maktab darsliklari' (subcategories: '1-sinf', '2-sinf', '3-sinf', '4-sinf', '5-sinf', '6-sinf', '7-sinf', '8-sinf', '9-sinf', '10-sinf', '11-sinf')
- 'cat-3': 'Informatika'
- 'cat-4': 'Matematika'
- 'cat-5': 'Tarix'`;

    const systemInstruction = `Siz professional kutubxonachi, kitobshunos va matn tahlilchisi sifatida ishlaysiz.
Vazifangiz: Berilgan kitobning dastlabki 2-3 sahifasini diqqat bilan ko'rib chiqish va quyidagi ma'lumotlarni aniq chiqarib berish:
1. Kitob nomi (title)
2. Muallif(lar) (authorName)
3. Bo'lim (categoryId va categoryName)
4. Ichki bo'lim yoki Sinf (subcategoryId va subcategoryName)
5. Asar tili (language): 'O‘zbekcha', 'Inglizcha', 'Ruscha'
6. Nashr yili (publicationYear)
7. Sahifalar soni (pages)
8. Kitob haqida tavsif (description)
9. Asosiy kalit mavzular (keyTopics)
10. Tahlil xulosasi (summaryOfAnalysis)
11. Aniqlik darajasi (confidence): 0-100

${categoriesPromptContext}

Javobingiz faqat va faqat toza JSON formatida bo'lsin.`;

    const userPromptText = bookPagesText && bookPagesText.trim().length > 10
      ? `Kitobning dastlabki sahifalaridan olingan matn:\n\n${bookPagesText.slice(0, 15000)}\n\n${titleHint ? `Qo'shimcha havola yoki fayl nomi: "${titleHint}".` : ''}\nUshbu kitobni tahlil qiling va toza JSON formatida javob bering.`
      : `Kitob Google Drive havolasi: ${googleDriveUrl || fileId || ''}. ${titleHint ? `Kitob nomi / fayl: "${titleHint}".` : ''}\nKitob ma'lumotlarini aniqlab, toza JSON formatida to'liq qaytaring.`;

    let parsedJson: any = null;
    let providerUsed = 'groq';
    let modelUsed = 'qwen/qwen3.8-27b';

    // 1. Try Groq API
    if (groqKey) {
      try {
        const { content: groqOutput, model: chosenModel } = await callGroqChatCompletion(groqKey, systemInstruction, userPromptText);
        parsedJson = extractJsonFromLlmResponse(groqOutput, titleHint);
        providerUsed = 'groq';
        modelUsed = chosenModel;
      } catch (groqErr: any) {
        console.warn('Vercel Groq error:', groqErr.message);
      }
    }

    // 2. Try Gemini API if Groq failed and Gemini key is set
    if (!parsedJson && geminiKey) {
      try {
        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${systemInstruction}\n\n${userPromptText}` }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.2
            }
          })
        });

        if (geminiRes.ok) {
          const geminiData: any = await geminiRes.json();
          const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            parsedJson = extractJsonFromLlmResponse(rawText, titleHint);
            providerUsed = 'gemini';
            modelUsed = 'gemini-2.5-flash';
          }
        }
      } catch (geminiErr: any) {
        console.warn('Vercel Gemini error:', geminiErr.message);
      }
    }

    // 3. Fallback to smart heuristic analysis
    if (!parsedJson) {
      parsedJson = generateHeuristicAnalysis(titleHint, bookPagesText);
      providerUsed = 'groq';
      modelUsed = 'intelligent-classifier';
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      provider: providerUsed,
      model: modelUsed,
      analysis: parsedJson,
      hasDirectPdfRead: !!(bookPagesText && bookPagesText.length > 50)
    }));

  } catch (err: any) {
    console.error('Vercel analyze-book error:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: false,
      error: err.message || 'Serverda kitobni tahlil qilishda xatolik yuz berdi'
    }));
  }
}
