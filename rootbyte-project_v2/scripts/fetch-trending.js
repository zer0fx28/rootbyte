#!/usr/bin/env node
/**
 * fetch-trending.js
 * Fetches top tech stories from NewsAPI, matches to known ROOT articles,
 * optionally uses Gemini AI to generate connection text.
 * Outputs: src/content/daily-update.json
 *
 * Usage:
 *   node scripts/fetch-trending.js
 *   node scripts/fetch-trending.js --dry-run   (shows output without writing)
 *
 * Environment:
 *   NEWS_API_KEY   (required)  - newsapi.org free tier
 *   GEMINI_API_KEY (optional)  - AI-generated ROOT connection summaries
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const https = require('https');

const DRY_RUN = process.argv.includes('--dry-run');
const NEWS_API_KEY = process.env.NEWS_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OUT_PATH = path.join(__dirname, '../src/content/daily-update.json');

// Known articles in our archive
const KNOWN_ARTICLES = [
  { slug: 'chatgpt-neural-network-history', keywords: ['ai', 'chatgpt', 'openai', 'gpt', 'llm', 'neural', 'machine learning', 'artificial intelligence', 'gemini', 'claude', 'anthropic'], category: 'ai' },
  { slug: 'wifi-hidden-inventor', keywords: ['wifi', 'wi-fi', '6ghz', 'wireless', 'csiro', 'broadband', '5g', '6g'], category: 'internet' },
  { slug: 'first-touchscreen-1965', keywords: ['touchscreen', 'touch', 'ipad', 'iphone', 'apple', 'samsung display', 'haptic'], category: 'devices' },
  { slug: 'first-hard-drive-ibm', keywords: ['hard drive', 'ssd', 'storage', 'data center', 'nvme', 'cloud storage', 'dna storage', 'flash memory'], category: 'devices' }
];

// Default ticker items for when API is unavailable
const DEFAULT_TICKER = [
  'ChatGPT turns 3 — what 80 years of AI history built it',
  'Samsung foldable traces to 1994 IBM patent nobody used',
  'The WiFi inventor Australia doesn\'t know it has — CSIRO 1992',
  'XRP history: RipplePay 2004 Vancouver roots',
  'First hard drive weighed a ton — IBM RAMAC 1956',
  'QWERTY was designed to slow typists down — 1873',
  'The first computer bug was a real moth — Harvard 1947',
  'Apollo 11\'s computer had less power than your calculator'
];

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('JSON parse error: ' + e.message)); }
      });
    }).on('error', reject);
  });
}

function findRootMatch(title, description) {
  const text = ((title || '') + ' ' + (description || '')).toLowerCase();
  for (const article of KNOWN_ARTICLES) {
    for (const keyword of article.keywords) {
      if (text.includes(keyword)) return article;
    }
  }
  return null;
}

async function generateRootConnection(headline, rootSlug) {
  if (!GEMINI_API_KEY) return null;
  try {
    const prompt = `You are writing a 1-sentence "root connection" for a tech history website. 
The breaking news headline is: "${headline}"
The historical root article slug is: "${rootSlug}"
Write one sentence (under 50 words) explaining the historical connection between this news and the root article. Be specific and factual.`;

    const body = JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] });
    const result = await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { reject(e); } });
      });
      req.on('error', reject);
      req.write(body);
      req.end();
    });
    return result?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
  } catch (e) {
    console.warn('Gemini API error (non-fatal):', e.message);
    return null;
  }
}

async function run() {
  console.log(`[fetch-trending] Starting${DRY_RUN ? ' (DRY RUN)' : ''}...`);

  const now = new Date();
  let articles = [];
  let ticker = [...DEFAULT_TICKER];

  if (!NEWS_API_KEY) {
    console.warn('[fetch-trending] NEWS_API_KEY not set. Using dummy data.');
  } else {
    try {
      const url = `https://newsapi.org/v2/top-headlines?category=technology&language=en&pageSize=20&apiKey=${NEWS_API_KEY}`;
      const data = await httpsGet(url);

      if (data.status !== 'ok') throw new Error('NewsAPI error: ' + data.message);

      console.log(`[fetch-trending] Fetched ${data.articles.length} articles from NewsAPI.`);

      // Build ticker from top headlines
      ticker = data.articles.slice(0, 8).map(a => a.title.replace(/\s*-\s*.*$/, '').trim()).filter(Boolean);

      // Match to known root articles
      for (const item of data.articles) {
        const match = findRootMatch(item.title, item.description);
        if (match) {
          console.log(`  Matched: "${item.title.substring(0, 60)}" → ${match.slug}`);
          let rootConnection = null;
          if (GEMINI_API_KEY) {
            rootConnection = await generateRootConnection(item.title, match.slug);
          }
          articles.push({
            slug: match.slug,
            headline: item.title,
            category: match.category,
            root_year: null,
            is_hero: articles.length === 0,
            root_connection: rootConnection,
            news_source: item.source?.name || null,
            published_at: item.publishedAt
          });
        }
      }
      console.log(`[fetch-trending] Found ${articles.length} ROOT matches.`);
    } catch (e) {
      console.error('[fetch-trending] NewsAPI failed:', e.message, '— using previous data.');
    }
  }

  // If no matches, fall back to default articles
  if (articles.length === 0) {
    articles = [
      { slug: 'chatgpt-neural-network-history', headline: "ChatGPT Is 3 Years Old. The Math Behind It Is 83.", category: 'ai', is_hero: true },
      { slug: 'first-touchscreen-1965', headline: "The First Touchscreen Wasn't Apple — It Was Made in 1965", category: 'devices', is_hero: false },
      { slug: 'wifi-hidden-inventor', headline: "The WiFi Inventor Australia Doesn't Know It Has", category: 'internet', is_hero: false },
      { slug: 'first-hard-drive-ibm', headline: "IBM's First Hard Drive Weighed a Ton. Its Inventor Was Almost Erased.", category: 'devices', is_hero: false }
    ];
  }

  const output = {
    generated: now.toISOString(),
    top_stories: articles.slice(0, 4),
    ticker: ticker.slice(0, 8),
    tomorrow_teaser: {
      headline: "The Forgotten Inventor of the First Hard Drive — Erased From History",
      preview: "IBM's RAMAC 350 weighed a full ton and stored 5 megabytes. We dig up Reynold Johnson.",
      topics: ["Storage History", "IBM RAMAC 1956", "Reynold Johnson", "DNA Storage Future"]
    }
  };

  if (DRY_RUN) {
    console.log('\n[DRY RUN] Would write to:', OUT_PATH);
    console.log(JSON.stringify(output, null, 2));
  } else {
    fs.writeFileSync(OUT_PATH, JSON.stringify(output, null, 2));
    console.log('[fetch-trending] Written to', OUT_PATH);
  }
}

run().catch(e => { console.error('[fetch-trending] Fatal error:', e); process.exit(1); });
