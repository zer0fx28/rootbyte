/**
 * RootByte Local Dev Server
 * Serves static files from src/ AND proxies /api/chat to Groq
 * Usage: node scripts/dev-server.js
 * Then open: http://localhost:3000
 */

const http = require('http');
const fs   = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config();

const PORT    = parseInt(process.env.PORT || '3001', 10);
const SRC_DIR = path.join(__dirname, '..', 'src');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.svg':  'image/svg+xml',
  '.webp': 'image/webp',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.ico':  'image/x-icon',
  '.woff2':'font/woff2',
  '.txt':  'text/plain',
  '.xml':  'application/xml',
};

// Bryte system prompt (same as api/chat.js — keep in sync)
const BRYTE_SYSTEM = `You are Bryte — RootByte's AI research companion. Warm, intellectually curious, deeply knowledgeable about technology history. You connect modern tech to its forgotten historical roots. Be specific: names, dates, places. Find the ROOT in every answer. Surprise the reader with something they didn't expect. Keep responses tight — say the thing, then stop.`;

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  // ── /api/chat proxy ─────────────────────────────────────────────
  if (url.pathname === '/api/chat') {
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      });
      return res.end();
    }

    if (req.method !== 'POST') {
      res.writeHead(405); return res.end('Method Not Allowed');
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey === 'gsk_your_key_here') {
      res.writeHead(503, { 'Content-Type': 'text/event-stream', 'Access-Control-Allow-Origin': '*' });
      res.write('data: {"choices":[{"delta":{"content":"⚠️ Add your GROQ_API_KEY to .env file to activate Bryte. Get a free key at console.groq.com"},"finish_reason":null}]}\n\n');
      res.write('data: [DONE]\n\n');
      return res.end();
    }

    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      let messages;
      try { messages = JSON.parse(body).messages || []; }
      catch { res.writeHead(400); return res.end('Bad JSON'); }

      const payload = JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'system', content: BRYTE_SYSTEM }, ...messages.slice(-12)],
        stream: true,
        max_tokens: 700,
        temperature: 0.72,
      });

      const options = {
        hostname: 'api.groq.com',
        path: '/openai/v1/chat/completions',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      };

      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*',
        'X-Accel-Buffering': 'no',
      });

      const groqReq = https.request(options, groqRes => {
        groqRes.on('data', chunk => res.write(chunk));
        groqRes.on('end', () => res.end());
      });

      groqReq.on('error', err => {
        console.error('Groq error:', err.message);
        res.write('data: {"choices":[{"delta":{"content":"Connection error. Check your API key and network."},"finish_reason":"stop"}]}\n\n');
        res.write('data: [DONE]\n\n');
        res.end();
      });

      groqReq.write(payload);
      groqReq.end();
    });
    return;
  }

  // ── Static file server ──────────────────────────────────────────
  let filePath = path.join(SRC_DIR, url.pathname === '/' ? 'index.html' : url.pathname);

  // Handle extensionless routes
  if (!path.extname(filePath)) filePath += '.html';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // Try index.html fallback
      const fallback = path.join(SRC_DIR, 'index.html');
      fs.readFile(fallback, (e2, d2) => {
        if (e2) { res.writeHead(404); return res.end('Not found'); }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(d2);
      });
      return;
    }
    const ext  = path.extname(filePath);
    const mime = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`\n🌱 ROOT•BYTE dev server running`);
  console.log(`   http://localhost:${PORT}`);
  console.log(`   Bryte API: http://localhost:${PORT}/api/chat`);
  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'gsk_your_key_here') {
    console.log(`\n⚠️  No GROQ_API_KEY found. Add to .env for Bryte to work.`);
    console.log(`   Get free key: https://console.groq.com\n`);
  } else {
    console.log(`\n✅ Bryte is live — Groq API key detected\n`);
  }
});
