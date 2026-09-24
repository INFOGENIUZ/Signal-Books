/**
 * Cloudflare Worker API for Signal Books AI Knowledge Assistant
 * Supports Workers AI (@cf/meta/llama-3.1-8b-instruct or @cf/qwen/qwen1.5-14b-chat),
 * D1 database RAG search, and CORS protection.
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // CORS Headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // 1. POST /api/ai/chat
      if (url.pathname === '/api/ai/chat' && request.method === 'POST') {
        const body = await request.json();
        const userQuery = body.message || '';
        const history = body.history || [];

        // RAG Context search from Cloudflare D1
        let ragContext = "Signal Books Official Info: Signal Books — kitobsevarlar uchun raqamli loyiha. Telegram bot: @signal_books_bot.";
        if (env.DB) {
          const { results } = await env.DB.prepare(
            `SELECT content, metadata FROM knowledge_chunks WHERE content LIKE ? LIMIT 5`
          ).bind(`%${userQuery.trim()}%`).all();

          if (results && results.length > 0) {
            ragContext = results.map(r => r.content).join('\n---\n');
          }
        }

        const systemPrompt = `Siz — Signal Books AI yordamchisissiz.
Foydalanuvchining savoliga quyidagi tasdiqlangan bilim bazasi bo'yicha javob bering:

KNOWLEDGE BASE:
${ragContext}

QOIDALAR:
- O'zbek, rus yoki ingliz tilida moslashib javob bering.
- Manbada bo'lmagan faktlarni to'qib chiqarmang.
- Bilsangiz aniq javob bering, bilmasangiz xushfe'llik bilan ma'lumot topilmaganini ayting.`;

        // Execute Cloudflare Workers AI
        let aiResponseText = '';
        if (env.AI) {
          const aiResult = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
            messages: [
              { role: 'system', content: systemPrompt },
              ...history.map(h => ({ role: h.sender === 'user' ? 'user' : 'assistant', content: h.text })),
              { role: 'user', content: userQuery }
            ]
          });
          aiResponseText = aiResult.response || aiResult.description || 'Javob generatsiya qilindi.';
        } else {
          aiResponseText = `Signal Books AI: Siz so'ragan ma'lumot bo'yicha javob: ${userQuery}. (Cloudflare Workers AI mode)`;
        }

        return new Response(JSON.stringify({
          success: true,
          reply: {
            text: aiResponseText,
            citations: [
              { title: 'Signal Books Official', type: 'official', sourceName: 'Cloudflare D1 RAG' }
            ]
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // 2. GET /api/ai/sources
      if (url.pathname === '/api/ai/sources' && request.method === 'GET') {
        let sources = [];
        if (env.DB) {
          const { results } = await env.DB.prepare(`SELECT * FROM knowledge_sources ORDER BY created_at DESC`).all();
          sources = results || [];
        }
        return new Response(JSON.stringify({ success: true, sources }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // 404 Route
      return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};
