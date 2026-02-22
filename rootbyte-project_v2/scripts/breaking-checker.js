#!/usr/bin/env node
/**
 * breaking-checker.js
 * Monitors NewsAPI for trending spikes (same topic in 5+ articles within 1 hour).
 * When a spike is detected, writes to src/content/breaking.json.
 * When no spike: ensures breaking.json is set to active:false.
 *
 * Usage:
 *   node scripts/breaking-checker.js
 *   node scripts/breaking-checker.js --dry-run
 *   node scripts/breaking-checker.js --clear      (force deactivate breaking news)
 *   node scripts/breaking-checker.js --set "BREAKING: ..." (manually set breaking news)
 *
 * Environment:
 *   NEWS_API_KEY   (required)
 *   GEMINI_API_KEY (optional) - AI-generated breaking news body text
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const https = require('https');

const DRY_RUN = process.argv.includes('--dry-run');
const FORCE_CLEAR = process.argv.includes('--clear');
const MANUAL_IDX = process.argv.indexOf('--set');
const MANUAL_HEADLINE = MANUAL_IDX !== -1 ? process.argv[MANUAL_IDX + 1] : null;

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const BREAKING_PATH = path.join(__dirname, '../src/content/breaking.json');
const SPIKE_THRESHOLD = 4; // number of articles about same topic to trigger
const EXPIRES_HOURS = 12;  // breaking news expires after 12 hours

const TECH_SPIKE_KEYWORDS = [
    'chatgpt', 'openai', 'google', 'apple', 'microsoft', 'nvidia', 'tesla',
    'meta', 'x twitter', 'spacex', 'elon musk', 'sam altman', 'anthropic',
    'samsung', 'qualcomm', 'arm', 'tiktok', 'bytedance', 'security breach',
    'hack', 'data leak', 'cyberattack', 'ai model', 'regulation', 'ban',
    'acquisition', 'bankruptcy', 'layoff', 'shutdown'
];

function httpsGet(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => { try { resolve(JSON.parse(data)); } catch (e) { reject(e); } });
        }).on('error', reject);
    });
}

function writeBreaking(data) {
    if (DRY_RUN) {
        console.log('[DRY RUN] Would write breaking.json:', JSON.stringify(data, null, 2));
        return;
    }
    fs.writeFileSync(BREAKING_PATH, JSON.stringify(data, null, 2));
    console.log('[breaking-checker] Wrote breaking.json');
}

function deactivate() {
    const current = JSON.parse(fs.readFileSync(BREAKING_PATH, 'utf8'));
    if (!current.active && !FORCE_CLEAR) return; // already inactive, skip
    writeBreaking({ active: false, headline: '', short: '', category: 'tech', timestamp: '', link: 'breaking.html', expires: '' });
    console.log('[breaking-checker] Breaking news deactivated.');
}

function detectSpike(articles) {
    const counts = {};
    for (const a of articles) {
        const text = ((a.title || '') + ' ' + (a.description || '')).toLowerCase();
        for (const kw of TECH_SPIKE_KEYWORDS) {
            if (text.includes(kw)) {
                counts[kw] = (counts[kw] || []);
                counts[kw].push(a);
            }
        }
    }
    let topKw = null, topCount = 0;
    for (const [kw, list] of Object.entries(counts)) {
        if (list.length >= SPIKE_THRESHOLD && list.length > topCount) {
            topKw = kw; topCount = list.length;
        }
    }
    return topKw ? { keyword: topKw, articles: counts[topKw] } : null;
}

async function generateBody(headline, articles) {
    if (!GEMINI_API_KEY) return `<p>${articles[0]?.description || headline}</p>`;
    try {
        const sources = articles.map(a => `- ${a.title} (${a.source?.name})`).join('\n').substring(0, 600);
        const prompt = `You are a tech journalist. Write a 2-paragraph breaking news brief (under 150 words total) for this trending story.
Headline: "${headline}"
Sources covering it:\n${sources}
Write in present tense. Be factual. No clickbait. Format as plain HTML <p> tags.`;

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
                res.on('end', () => { try { resolve(JSON.parse(data)); } catch (e) { reject(e); } });
            });
            req.on('error', reject);
            req.write(body);
            req.end();
        });
        return result?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || `<p>${articles[0]?.description || headline}</p>`;
    } catch (e) {
        console.warn('[breaking-checker] Gemini error (non-fatal):', e.message);
        return `<p>${articles[0]?.description || headline}</p>`;
    }
}

async function run() {
    console.log(`[breaking-checker] Starting${DRY_RUN ? ' (DRY RUN)' : ''}...`);

    if (FORCE_CLEAR) { deactivate(); return; }

    if (MANUAL_HEADLINE) {
        const expires = new Date(Date.now() + EXPIRES_HOURS * 3600000).toISOString();
        writeBreaking({
            active: true,
            headline: MANUAL_HEADLINE,
            short: MANUAL_HEADLINE.substring(0, 100),
            category: 'tech',
            timestamp: new Date().toISOString(),
            link: 'breaking.html',
            expires,
            body: `<p>${MANUAL_HEADLINE}</p><p>This story is being monitored. Check back for updates.</p>`,
            root_connection: null
        });
        console.log('[breaking-checker] Manual breaking news set. Expires:', expires);
        return;
    }

    // Check if current breaking news is expired
    try {
        const current = JSON.parse(fs.readFileSync(BREAKING_PATH, 'utf8'));
        if (current.active && current.expires && new Date() > new Date(current.expires)) {
            console.log('[breaking-checker] Current breaking news expired. Deactivating.');
            deactivate();
            return;
        }
        if (current.active) {
            console.log('[breaking-checker] Breaking news currently active. Checking for stronger story...');
        }
    } catch (e) { /* file doesn't exist yet, continue */ }

    if (!NEWS_API_KEY) { console.warn('[breaking-checker] NEWS_API_KEY not set. Skipping API check.'); return; }

    try {
        const url = `https://newsapi.org/v2/top-headlines?category=technology&language=en&pageSize=30&apiKey=${NEWS_API_KEY}`;
        const data = await httpsGet(url);
        if (data.status !== 'ok') throw new Error(data.message);

        console.log(`[breaking-checker] Fetched ${data.articles.length} articles.`);
        const spike = detectSpike(data.articles);

        if (!spike) {
            console.log(`[breaking-checker] No spike detected (threshold: ${SPIKE_THRESHOLD} articles). Deactivating.`);
            deactivate();
            return;
        }

        const { keyword, articles: spikeArticles } = spike;
        console.log(`[breaking-checker] SPIKE DETECTED: "${keyword}" in ${spikeArticles.length} articles!`);

        const headline = 'BREAKING: ' + spikeArticles[0].title.replace(/\s*-\s*.*$/, '').trim();
        const short = spikeArticles[0].description?.substring(0, 120) || headline;
        const body = await generateBody(headline, spikeArticles);
        const expires = new Date(Date.now() + EXPIRES_HOURS * 3600000).toISOString();

        writeBreaking({
            active: true,
            headline,
            short,
            category: 'tech',
            timestamp: new Date().toISOString(),
            link: 'breaking.html',
            expires,
            body,
            root_connection: null,
            spike_keyword: keyword,
            spike_count: spikeArticles.length
        });
    } catch (e) {
        console.error('[breaking-checker] Error:', e.message);
        process.exit(1);
    }
}

run().catch(e => { console.error('[breaking-checker] Fatal:', e); process.exit(1); });
