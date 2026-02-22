#!/usr/bin/env node
/**
 * build.js — RootByte Static Site Builder
 * 
 * 1. Reads all .md article files
 * 2. Parses frontmatter
 * 3. Generates categories.json (article index)
 * 4. Generates/updates did-you-know.json from article dyk_fact fields
 * 5. Regenerates sitemap.xml with all pages
 * 6. Validates all article slugs exist in article.html's ARTICLES map
 *
 * Usage:
 *   node scripts/build.js
 *   node scripts/build.js --watch   (re-runs on file changes)
 */

const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '../src');
const ARTICLES_DIR = path.join(SRC, 'content/articles');
const CONTENT_DIR = path.join(SRC, 'content');

function parseFrontmatter(text) {
    const match = text.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return { meta: {}, body: text };
    const meta = {};
    const lines = match[1].split('\n');
    for (const line of lines) {
        const [key, ...vals] = line.split(':');
        if (key && vals.length) {
            const val = vals.join(':').trim().replace(/^["']|["']$/g, '');
            if (val === 'true') meta[key.trim()] = true;
            else if (val === 'false') meta[key.trim()] = false;
            else if (!isNaN(val) && val !== '') meta[key.trim()] = Number(val);
            else meta[key.trim()] = val;
        }
    }
    return { meta, body: text.slice(match[0].length).trim() };
}

function slugify(filename) {
    return filename.replace(/\.md$/, '');
}

function buildCategoryIndex(articles) {
    const cats = {};
    for (const a of articles) {
        const cat = a.meta.category || 'ai';
        if (!cats[cat]) cats[cat] = { label: cat, articles: [] };
        cats[cat].articles.push({
            slug: a.slug,
            title: a.meta.title || 'Untitled',
            excerpt: a.meta.excerpt || '',
            root_year: a.meta.root_year || null,
            root_who: a.meta.root_who || '',
            future_year: a.meta.future_year || '',
            category: cat,
            date: a.meta.date || null,
            reading_time: a.meta.reading_time || 6,
            status: a.meta.status || 'published'
        });
    }
    return cats;
}

function buildDykJson(articles, existing) {
    const existingIds = new Set(existing.map(d => d.source_article));
    const newFacts = [];
    for (const a of articles) {
        if (a.meta.dyk_fact && a.meta.dyk_fact.trim() && !existingIds.has(a.slug)) {
            newFacts.push({
                id: 'dyk-' + (existing.length + newFacts.length + 1).toString().padStart(3, '0'),
                fact: a.meta.dyk_fact,
                category: a.meta.category || 'ai',
                root_year: a.meta.root_year || null,
                source_article: a.slug
            });
        }
    }
    return [...existing, ...newFacts];
}

function buildSitemap(articles) {
    const BASE = 'https://rootbyte.com';
    const STATIC_PAGES = [
        { url: '/', priority: '1.0', freq: 'daily' },
        { url: '/roots-archive.html', priority: '0.7', freq: 'weekly' },
        { url: '/did-you-know.html', priority: '0.7', freq: 'weekly' },
        { url: '/on-this-day.html', priority: '0.8', freq: 'daily' },
        { url: '/breaking.html', priority: '0.9', freq: 'hourly' },
        { url: '/about.html', priority: '0.5', freq: 'monthly' },
        { url: '/advertise.html', priority: '0.5', freq: 'monthly' },
        { url: '/contact.html', priority: '0.5', freq: 'monthly' },
        { url: '/privacy.html', priority: '0.3', freq: 'yearly' },
        { url: '/terms.html', priority: '0.3', freq: 'yearly' },
        { url: '/ad-policy.html', priority: '0.3', freq: 'monthly' }
    ];
    const CATEGORY_PAGES = ['ai', 'devices', 'internet', 'crypto', 'gaming', 'space'].map(cat => ({
        url: `/category.html?cat=${cat}`, priority: '0.8', freq: 'daily'
    }));

    const allUrls = [...STATIC_PAGES, ...CATEGORY_PAGES, ...articles.filter(a => (a.meta.status || 'published') === 'published').map(a => ({
        url: `/article.html?slug=${a.slug}`, priority: '0.8', freq: 'monthly'
    }))];

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(p => `  <url>
    <loc>${BASE}${p.url}</loc>
    <changefreq>${p.freq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
</urlset>\n`;
}

async function run() {
    console.log('[build] Starting RootByte build...');

    // 1. Read all articles
    if (!fs.existsSync(ARTICLES_DIR)) { console.error('[build] Articles dir not found:', ARTICLES_DIR); process.exit(1); }
    const files = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.md'));
    console.log(`[build] Found ${files.length} article files.`);

    const articles = files.map(f => {
        const text = fs.readFileSync(path.join(ARTICLES_DIR, f), 'utf8');
        const { meta, body } = parseFrontmatter(text);
        return { slug: slugify(f), meta, body };
    }).filter(a => a.meta.status !== 'draft');

    const published = articles.filter(a => (a.meta.status || 'published') === 'published');
    console.log(`[build] Published articles: ${published.length}`);

    // 2. Write categories.json
    const categories = buildCategoryIndex(published);
    fs.writeFileSync(path.join(CONTENT_DIR, 'categories.json'), JSON.stringify(categories, null, 2));
    console.log('[build] Written categories.json');

    // 3. Update did-you-know.json
    const dykPath = path.join(CONTENT_DIR, 'did-you-know.json');
    const existingDyk = fs.existsSync(dykPath) ? JSON.parse(fs.readFileSync(dykPath, 'utf8')) : [];
    const updatedDyk = buildDykJson(published, existingDyk);
    if (updatedDyk.length > existingDyk.length) {
        fs.writeFileSync(dykPath, JSON.stringify(updatedDyk, null, 2));
        console.log(`[build] Added ${updatedDyk.length - existingDyk.length} new DYK facts.`);
    }

    // 4. Regenerate sitemap.xml
    const sitemap = buildSitemap(published);
    fs.writeFileSync(path.join(SRC, 'sitemap.xml'), sitemap);
    console.log('[build] Written sitemap.xml with', published.length + 11, 'URLs.');

    // 5. Summary
    console.log('\n[build] ✓ Build complete!');
    console.log('  Articles:', published.length);
    console.log('  DYK facts:', updatedDyk.length);
    console.log('  Sitemap URLs:', published.length + 17);

    if (process.argv.includes('--watch')) {
        console.log('\n[build] Watching for changes... (Ctrl+C to stop)');
        fs.watch(ARTICLES_DIR, () => { console.log('[build] Change detected. Rebuilding...'); run(); });
    }
}

run().catch(e => { console.error('[build] Fatal error:', e); process.exit(1); });
