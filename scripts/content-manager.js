#!/usr/bin/env node

/**
 * ROOT•BYTE Content Management System
 * Interactive CLI for managing articles, DYK facts, and ROOT snippets
 * Usage: node scripts/content-manager.js [command] [args]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Paths
const ARTICLES_DIR = path.join(__dirname, '..', 'src', 'content', 'articles');
const DYK_DIR = path.join(__dirname, '..', 'src', 'content', 'did-you-know');
const ROOT_DIR = path.join(__dirname, '..', 'src', 'content', 'root-snippets');

// Available commands
const COMMANDS = {
    'list': 'List all articles with status',
    'create': 'Create new article (interactive)',
    'edit': 'Edit existing article',
    'publish': 'Mark article as published',
    'draft': 'Mark article as draft',
    'stats': 'Show content statistics',
    'dyk': 'Manage Did You Know facts',
    'root': 'Manage ROOT snippets',
    'trending': 'Update trending content'
};

// Get all articles with metadata
function getArticles() {
    if (!fs.existsSync(ARTICLES_DIR)) {
        return [];
    }

    const files = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.md'));
    return files.map(file => {
        const content = fs.readFileSync(path.join(ARTICLES_DIR, file), 'utf-8');
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

        if (frontmatterMatch) {
            const metadata = {};
            frontmatterMatch[1].split('\n').forEach(line => {
                const [key, ...valueParts] = line.split(':');
                if (key && valueParts.length) {
                    metadata[key.trim()] = valueParts.join(':').trim().replace(/^["']|["']$/g, '');
                }
            });

            return {
                file,
                slug: file.replace('.md', ''),
                title: metadata.title || 'Untitled',
                date: metadata.date || 'No date',
                category: metadata.category || 'uncategorized',
                status: metadata.status || 'draft',
                root_year: metadata.root_year
            };
        }

        return null;
    }).filter(Boolean);
}

// List all articles
function listArticles() {
    const articles = getArticles();

    if (articles.length === 0) {
        console.log('📰 No articles found');
        return;
    }

    console.log('📰 ROOT•BYTE Articles\n');
    console.log('Status | Date       | Category | Title');
    console.log('-------|------------|----------|--------------------------------------------------');

    articles.forEach(article => {
        const status = article.status === 'published' ? '✅ PUB' : '📝 DRAFT';
        const date = article.date.slice(0, 10);
        const category = article.category.toUpperCase().padEnd(8);
        const title = article.title.slice(0, 45) + (article.title.length > 45 ? '...' : '');

        console.log(`${status}  | ${date} | ${category} | ${title}`);
    });

    console.log(`\n📊 Total: ${articles.length} articles`);
    const published = articles.filter(a => a.status === 'published').length;
    console.log(`   ✅ Published: ${published}`);
    console.log(`   📝 Drafts: ${articles.length - published}`);
}

// Show content statistics
function showStats() {
    const articles = getArticles();
    const dykFiles = fs.existsSync(DYK_DIR) ? fs.readdirSync(DYK_DIR).filter(f => f.endsWith('.json')).length : 0;
    const rootFiles = fs.existsSync(ROOT_DIR) ? fs.readdirSync(ROOT_DIR).filter(f => f.endsWith('.json')).length : 0;

    console.log('📊 ROOT•BYTE Content Statistics\n');
    console.log(`📰 Articles: ${articles.length}`);
    console.log(`💡 Did You Know facts: ${dykFiles}`);
    console.log(`🌱 ROOT snippets: ${rootFiles}`);

    if (articles.length > 0) {
        console.log('\n📈 Article Breakdown:');
        const categories = {};
        const years = {};

        articles.forEach(article => {
            categories[article.category] = (categories[article.category] || 0) + 1;
            if (article.root_year) {
                const decade = Math.floor(parseInt(article.root_year) / 10) * 10 + 's';
                years[decade] = (years[decade] || 0) + 1;
            }
        });

        console.log('\n   By Category:');
        Object.entries(categories).forEach(([cat, count]) => {
            console.log(`     ${cat}: ${count}`);
        });

        console.log('\n   By ROOT Era:');
        Object.entries(years).forEach(([era, count]) => {
            console.log(`     ${era}: ${count}`);
        });
    }
}

// Publish/unpublish article
function setArticleStatus(slug, status) {
    const filePath = path.join(ARTICLES_DIR, `${slug}.md`);

    if (!fs.existsSync(filePath)) {
        console.error(`❌ Article not found: ${slug}`);
        return;
    }

    let content = fs.readFileSync(filePath, 'utf-8');

    // Update or add status field
    if (content.includes('status:')) {
        content = content.replace(/status:\s*\w+/, `status: ${status}`);
    } else {
        content = content.replace(/^---\n/, `---\nstatus: ${status}\n`);
    }

    fs.writeFileSync(filePath, content);
    console.log(`✅ ${slug} marked as ${status}`);
}

// Main CLI
function main() {
    const [,, command, ...args] = process.argv;

    if (!command || command === 'help') {
        console.log('📚 ROOT•BYTE Content Manager\n');
        console.log('Available commands:');
        Object.entries(COMMANDS).forEach(([cmd, desc]) => {
            console.log(`  ${cmd.padEnd(10)} ${desc}`);
        });
        console.log('\nExamples:');
        console.log('  npm run content list');
        console.log('  npm run content stats');
        console.log('  npm run content publish article-slug');
        return;
    }

    switch (command) {
        case 'list':
            listArticles();
            break;
        case 'stats':
            showStats();
            break;
        case 'publish':
            if (!args[0]) {
                console.error('❌ Usage: npm run content publish <article-slug>');
                return;
            }
            setArticleStatus(args[0], 'published');
            break;
        case 'draft':
            if (!args[0]) {
                console.error('❌ Usage: npm run content draft <article-slug>');
                return;
            }
            setArticleStatus(args[0], 'draft');
            break;
        case 'trending':
            try {
                const trendingScript = path.join(__dirname, 'fetch-trending.js');
                execSync(`node "${trendingScript}"`, { stdio: 'inherit' });
            } catch (error) {
                console.error('❌ Failed to update trending content');
            }
            break;
        default:
            console.error(`❌ Unknown command: ${command}`);
            console.log('Run "npm run content help" for available commands');
    }
}

// Run CLI
if (require.main === module) {
    main();
}

module.exports = { getArticles, listArticles, showStats, setArticleStatus };