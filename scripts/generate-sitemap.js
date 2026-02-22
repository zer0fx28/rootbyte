#!/usr/bin/env node

/**
 * ROOT•BYTE Sitemap Generator
 * Generates XML sitemap for SEO
 * Usage: node scripts/generate-sitemap.js
 */

const fs = require('fs');
const path = require('path');

console.log('🗺️  ROOT•BYTE Sitemap Generator');

// Configuration
const SITE_URL = process.env.SITE_URL || 'https://rootbyte.vercel.app';
const ARTICLES_DIR = path.join(__dirname, '..', 'src', 'content', 'articles');
const OUTPUT_PATH = path.join(__dirname, '..', 'public', 'sitemap.xml');

// Static pages with priorities
const STATIC_PAGES = [
    { url: '', priority: '1.0', changefreq: 'daily' },       // Homepage
    { url: 'about.html', priority: '0.8', changefreq: 'monthly' },
    { url: 'contact.html', priority: '0.6', changefreq: 'monthly' },
    { url: 'privacy.html', priority: '0.3', changefreq: 'yearly' },
    { url: 'advertise.html', priority: '0.7', changefreq: 'monthly' }
];

// Get article metadata
function getArticles() {
    if (!fs.existsSync(ARTICLES_DIR)) {
        return [];
    }

    const files = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.md'));
    const articles = [];

    files.forEach(file => {
        const content = fs.readFileSync(path.join(ARTICLES_DIR, file), 'utf-8');
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

        if (frontmatterMatch) {
            const frontmatter = frontmatterMatch[1];
            const metadata = {};

            frontmatter.split('\n').forEach(line => {
                const [key, ...valueParts] = line.split(':');
                if (key && valueParts.length) {
                    metadata[key.trim()] = valueParts.join(':').trim().replace(/^["']|["']$/g, '');
                }
            });

            if (metadata.title && metadata.date) {
                articles.push({
                    slug: file.replace('.md', ''),
                    title: metadata.title,
                    date: metadata.date,
                    category: metadata.category || 'tech'
                });
            }
        }
    });

    return articles.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Generate XML sitemap
function generateSitemap() {
    const articles = getArticles();
    const now = new Date().toISOString();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Add static pages
    STATIC_PAGES.forEach(page => {
        const url = page.url ? `${SITE_URL}/${page.url}` : SITE_URL;
        xml += `
  <url>
    <loc>${url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    });

    // Add articles
    articles.forEach(article => {
        const articleDate = new Date(article.date).toISOString();
        xml += `
  <url>
    <loc>${SITE_URL}/articles/${article.slug}.html</loc>
    <lastmod>${articleDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
    });

    xml += `
</urlset>`;

    // Ensure public directory exists
    const publicDir = path.dirname(OUTPUT_PATH);
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_PATH, xml);

    console.log(`✅ Sitemap generated: ${OUTPUT_PATH}`);
    console.log(`📄 ${STATIC_PAGES.length} static pages`);
    console.log(`📰 ${articles.length} articles`);
    console.log(`🔗 Total URLs: ${STATIC_PAGES.length + articles.length}`);
}

// Run sitemap generation
if (require.main === module) {
    try {
        generateSitemap();
        console.log('\n🎉 Sitemap generation complete!');
    } catch (error) {
        console.error('❌ Sitemap generation failed:', error.message);
        process.exit(1);
    }
}

module.exports = { generateSitemap, getArticles };