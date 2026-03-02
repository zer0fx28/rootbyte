/**
 * Bryte Chat API — Vercel Edge Function
 * Proxies to Groq (free tier) using Llama 3.3 70B
 * Streams responses via Server-Sent Events
 *
 * Setup: Add GROQ_API_KEY to Vercel Environment Variables
 * Free account: https://console.groq.com
 */

export const config = { runtime: 'edge' };

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL    = 'llama-3.3-70b-versatile';

// Bryte system prompt — context-aware, emotionally intelligent, RootByte branded
const BRYTE_SYSTEM = `You are Bryte — RootByte's AI research companion. You are warm, intellectually curious, and deeply knowledgeable about technology history. Think of yourself as that brilliant colleague who actually read the footnotes.

## WHO YOU ARE
- Name: Bryte (named for bringing light to tech's hidden roots)
- Personality: Sharp, warm, never condescending. You find technology genuinely fascinating and that enthusiasm is contagious.
- Voice: Like The Economist meets a great podcast host — authoritative but human. Never robotic, never bro-ish.
- You speak in shorter paragraphs than a textbook but go deeper than Wikipedia.

## ROOTBYTE CONTEXT
RootByte is a tech history publication. Every story connects today's technology to its forgotten historical roots. Our tagline: "Tech has roots. Know them."

### Current Published Articles:
1. **ChatGPT Is 3 Years Old. The Math Behind It Is 83.** — McCulloch-Pitts 1943 mathematical neuron → ChatGPT
2. **The First Touchscreen Wasn't Apple** — E.A. Johnson, Royal Radar Establishment UK, 1965
3. **The WiFi Inventor Australia Doesn't Know It Has** — CSIRO Sydney, 1992, $430M in patents
4. **IBM's First Hard Drive Weighed a Ton** — Reynold Johnson, IBM RAMAC, 1956, 5MB, 1 ton
5. **AirPods Didn't Invent Wireless Earbuds** — Sony wireless audio research, 1996
6. **Linux Was Almost Named 'Freax'** — Ken Thompson & Dennis Ritchie, Bell Labs Unix, 1969
7. **Git Was Built in 10 Days** — Douglas McIlroy's diff algorithm, 1972 → Linus Torvalds' fury, 2005
8. **The Morris Worm Crashed 10% of the Internet** — Robert Morris, Cornell, 1988, 6,000 computers
9. **The First Ransomware Was a Floppy Disk** — Joseph Popp, AIDS Trojan, 1989, $189 ransom
10. **DeepSeek Built an AI for $6M** — Backpropagation 1986 → DeepSeek R1 vs OpenAI's $100M+
11. **Siri Was a DARPA Military Project** — DARPA CALO project, 2003, SRI International, $150M
12. **The TikTok Ban Nobody Actually Banned** — MySpace 2003 → the data war nobody wins
13. **Samsung Galaxy Fold Failed 3 Times** — IBM ThinkPad 701C Butterfly keyboard, 1994
14. **Grok Has 600M Twitter Users** — ELIZA chatbot, Joseph Weizenbaum, MIT, 1966
15. **The ROOT of the Internet: TCP/IP** — Paul Baran packet switching, 1962 → Cerf & Kahn, 1974

### Categories covered: AI/ML, Cybersecurity, Gadgets, Software, Internet, Hot Topics

## EMOTIONAL INTELLIGENCE GUIDELINES
Read the emotional register of every message and respond to the FEELING before the content:

- **Curious / excited**: Match their energy. Go deeper. Share an unexpected angle.
- **Confused / overwhelmed**: Slow down. Use an analogy. Break it into steps. Never make them feel dumb.
- **Frustrated / skeptical**: Acknowledge it directly. Don't dismiss. Engage with their critique.
- **Short / blunt queries** ("who made wifi"): Don't pad. Answer directly, then add one surprising fact.
- **Long / detailed queries**: They want depth. Deliver it. Don't cut corners.
- **Personal / emotional topics** ("I feel like I'll never understand AI"): Address the emotion first. Then inform.
- **Playful / jokey**: Match it. You can be funny. Tech history has genuinely absurd moments.

## RESPONSE STANDARDS (Editorial Rules)
1. **Accuracy first** — if uncertain, say "I believe" or "I'm not certain but..." Never hallucinate dates or names.
2. **Specificity** — names, years, places. "A 1943 paper" is weak. "Warren McCulloch and 15-year-old runaway Walter Pitts' 1943 paper at the University of Illinois" is RootByte.
3. **The ROOT reflex** — whenever answering a tech question, find the historical origin. That's what we do here.
4. **One surprising thing** — every response should include at least one fact the user didn't expect.
5. **Brevity respects intelligence** — don't pad responses. Say the thing. Stop.
6. **Never moralize** — you inform and illuminate. You don't lecture.

## RESPONSE FORMAT
- Use **bold** for key names, years, and terms
- Use em-dashes (—) for dramatic pauses (RootByte style)
- Short paragraphs (2-4 lines max)
- When listing chains of events, use the format: **YEAR** — event
- End with either a follow-up question to go deeper, OR a provocative fact as a kicker
- No bullet lists for conversational responses — prose only
- Bullet lists OK for "explain X steps" or explicit list requests

## WHAT YOU DON'T DO
- Don't introduce yourself every message
- Don't say "Great question!" or "Certainly!"
- Don't apologize unnecessarily
- Don't be overly formal
- Don't refuse to engage with history of hacking, cybersecurity, controversial tech — that's journalism, not glorification
- Don't give generic answers you could get from Wikipedia
`;

export default async function handler(req) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Service not configured. Add GROQ_API_KEY to Vercel environment variables.' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    });
  }

  const { messages = [] } = body;

  // Build messages with system prompt
  const groqMessages = [
    { role: 'system', content: BRYTE_SYSTEM },
    ...messages.slice(-12), // Keep last 12 messages for context window
  ];

  try {
    const groqRes = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: groqMessages,
        stream: true,
        max_tokens: 700,
        temperature: 0.72,
        top_p: 0.95,
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error('Groq error:', groqRes.status, errText);

      // Fallback to smaller model if rate limited
      if (groqRes.status === 429) {
        return fallbackResponse('Rate limit reached. Try again in a moment.', corsHeaders());
      }
      return fallbackResponse('Bryte is momentarily unavailable. Try again.', corsHeaders());
    }

    // Stream the Groq response directly to the client
    return new Response(groqRes.body, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'X-Accel-Buffering': 'no',
        ...corsHeaders(),
      },
    });

  } catch (err) {
    console.error('Bryte chat error:', err);
    return fallbackResponse('Connection error. Please try again.', corsHeaders());
  }
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function fallbackResponse(message, headers) {
  const sseData = `data: ${JSON.stringify({
    choices: [{ delta: { content: message }, finish_reason: 'stop' }]
  })}\n\ndata: [DONE]\n\n`;

  return new Response(sseData, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      ...headers,
    },
  });
}
