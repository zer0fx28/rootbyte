#!/usr/bin/env node

/**
 * ROOT•BYTE Trending News Fetcher
 * Fetches latest tech news from NewsAPI and updates trending.json
 * Usage: node scripts/fetch-trending.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const TRENDING_FILE = path.join(__dirname, '..', 'src', 'content', 'trending.json');
const NEWS_API_BASE = 'https://newsapi.org/v2/top-headlines';

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// NewsAPI configuration
const NEWS_API_KEY = process.env.NEWS_API_KEY;
const MAX_ARTICLES = 10;
const CATEGORY = 'technology';
const LANGUAGE = 'en';

// Content filtering
const ALLOWED_SOURCES = [
    'techcrunch',
    'the-verge',
    'ars-technica',
    'wired',
    'engadget',
    'mashable',
    'recode',
    'venturebeat',
    'the-next-web',
    'hacker-news'
];

const FILTER_KEYWORDS = [
    'technology', 'tech', 'computing', 'software', 'hardware',
    'AI', 'artificial intelligence', 'machine learning', 'blockchain',
    'cybersecurity', 'programming', 'developer', 'startup', 'innovation',
    'quantum', 'VR', 'virtual reality', 'AR', 'augmented reality',
    'IoT', 'internet of things', 'cloud computing', 'data science'
];

const EXCLUDE_KEYWORDS = [
    'politics', 'celebrity', 'entertainment', 'sports', 'weather',
    'crime', 'accident', 'death', 'murder', 'suicide', 'violence',
    'gambling', 'adult', 'dating', 'weight loss'
];

// Utility functions
function makeHttpsRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const req = https.get(url, {
            headers: {
                'User-Agent': 'ROOT-BYTE/1.0 (+https://rootbyte.vercel.app)',
                ...options.headers
            }
        }, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve(parsed);
                } catch (error) {
                    reject(new Error(`Failed to parse JSON: ${error.message}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (options.timeout) {
            req.setTimeout(options.timeout, () => {
                req.abort();
                reject(new Error('Request timeout'));
            });
        }
    });
}

function isRelevantArticle(article) {
    const title = (article.title || '').toLowerCase();
    const description = (article.description || '').toLowerCase();
    const content = `${title} ${description}`;

    // Check for excluded keywords
    if (EXCLUDE_KEYWORDS.some(keyword => content.includes(keyword.toLowerCase()))) {
        return false;
    }

    // Check for relevant keywords
    return FILTER_KEYWORDS.some(keyword => content.includes(keyword.toLowerCase()));
}

function categorizeArticle(article) {
    const title = (article.title || '').toLowerCase();
    const description = (article.description || '').toLowerCase();
    const content = `${title} ${description}`;

    if (content.includes('ai') || content.includes('artificial intelligence') || content.includes('machine learning')) {
        return 'artificial-intelligence';
    }
    if (content.includes('quantum')) {
        return 'quantum-computing';
    }
    if (content.includes('chip') || content.includes('processor') || content.includes('hardware')) {
        return 'hardware';
    }
    if (content.includes('vr') || content.includes('virtual reality') || content.includes('ar') || content.includes('augmented reality')) {
        return 'virtual-reality';
    }
    if (content.includes('autonomous') || content.includes('self-driving') || content.includes('tesla')) {
        return 'autonomous-vehicles';
    }
    if (content.includes('security') || content.includes('hack') || content.includes('breach')) {
        return 'cybersecurity';
    }
    if (content.includes('blockchain') || content.includes('crypto') || content.includes('bitcoin')) {
        return 'blockchain';
    }
    if (content.includes('web') || content.includes('development') || content.includes('programming')) {
        return 'web-development';
    }

    return 'general-tech';
}

function cleanArticleData(articles) {
    return articles
        .filter(article => {
            // Filter out articles with missing essential data
            return article.title &&
                   article.url &&
                   article.publishedAt &&
                   !article.title.includes('[Removed]') &&
                   isRelevantArticle(article);
        })
        .map((article, index) => ({
            id: index + 1,
            title: article.title.replace(/\s+/g, ' ').trim(),
            url: article.url,
            source: article.source?.name || 'Unknown',
            publishedAt: article.publishedAt,
            category: categorizeArticle(article)
        }))
        .slice(0, MAX_ARTICLES);
}

async function fetchFromNewsAPI() {
    if (!NEWS_API_KEY) {
        throw new Error('NEWS_API_KEY not found in environment variables');
    }

    const params = new URLSearchParams({
        apiKey: NEWS_API_KEY,
        category: CATEGORY,
        language: LANGUAGE,
        pageSize: 50, // Get more to filter from
        sortBy: 'publishedAt'
    });

    const url = `${NEWS_API_BASE}?${params}`;

    console.log('📡 Fetching news from NewsAPI...');

    try {
        const response = await makeHttpsRequest(url, { timeout: 10000 });

        if (response.status !== 'ok') {
            throw new Error(`NewsAPI error: ${response.message || 'Unknown error'}`);
        }

        return response.articles || [];
    } catch (error) {
        console.error('❌ NewsAPI request failed:', error.message);
        return [];
    }
}

function loadExistingTrending() {
    try {
        if (fs.existsSync(TRENDING_FILE)) {
            const content = fs.readFileSync(TRENDING_FILE, 'utf8');
            return JSON.parse(content);
        }
    } catch (error) {
        console.warn('⚠️  Failed to load existing trending data:', error.message);
    }

    // Return default structure
    return {
        last_updated: null,
        news: [],
        categories: [
            'artificial-intelligence',
            'quantum-computing',
            'hardware',
            'virtual-reality',
            'autonomous-vehicles',
            'cybersecurity',
            'blockchain',
            'web-development'
        ],
        filter_keywords: FILTER_KEYWORDS
    };
}

function saveTrendingData(data) {
    try {
        // Ensure directory exists
        const dir = path.dirname(TRENDING_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // Write with pretty formatting
        const jsonContent = JSON.stringify(data, null, 2);
        fs.writeFileSync(TRENDING_FILE, jsonContent);

        console.log(`✅ Trending data saved to ${TRENDING_FILE}`);
    } catch (error) {
        console.error('❌ Failed to save trending data:', error.message);
        throw error;
    }
}

function generateFallbackNews() {
    console.log('📰 Generating fallback news...');

    const fallbackNews = [
        {
            id: 1,
            title: "AI breakthrough in quantum error correction shows promise for fault-tolerant computing",
            url: "https://example.com/ai-quantum-error-correction",
            source: "Tech Research",
            publishedAt: new Date().toISOString(),
            category: "quantum-computing"
        },
        {
            id: 2,
            title: "New chip architecture promises 10x performance improvement for machine learning workloads",
            url: "https://example.com/new-chip-architecture",
            source: "Hardware Weekly",
            publishedAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
            category: "hardware"
        },
        {
            id: 3,
            title: "Cybersecurity researchers discover new method to detect zero-day exploits",
            url: "https://example.com/zero-day-detection",
            source: "Security Today",
            publishedAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
            category: "cybersecurity"
        }
    ];

    return fallbackNews;
}

async function updateTrendingNews() {
    try {
        console.log('🌱 ROOT•BYTE Trending News Updater\n');

        // Load existing data
        const existingData = loadExistingTrending();

        // Fetch fresh news
        let articles = await fetchFromNewsAPI();

        // If NewsAPI fails, use fallback
        if (articles.length === 0) {
            console.log('⚠️  No articles from NewsAPI, using fallback news');
            articles = generateFallbackNews();
        } else {
            // Clean and filter the articles
            articles = cleanArticleData(articles);
            console.log(`📰 Processed ${articles.length} relevant articles`);
        }

        // Update the trending data
        const updatedData = {
            ...existingData,
            last_updated: new Date().toISOString(),
            news: articles
        };

        // Save to file
        saveTrendingData(updatedData);

        // Print summary
        console.log('\n📊 Summary:');
        console.log(`📰 Articles: ${articles.length}`);
        console.log(`🗓️  Last updated: ${updatedData.last_updated}`);

        if (articles.length > 0) {
            console.log('\n📋 Categories:');
            const categoryCount = {};
            articles.forEach(article => {
                categoryCount[article.category] = (categoryCount[article.category] || 0) + 1;
            });

            Object.entries(categoryCount).forEach(([category, count]) => {
                console.log(`   ${category}: ${count} article${count > 1 ? 's' : ''}`);
            });
        }

    } catch (error) {
        console.error('❌ Error updating trending news:', error.message);
        process.exit(1);
    }
}

// Script execution
if (require.main === module) {
    updateTrendingNews();
}

module.exports = {
    updateTrendingNews,
    fetchFromNewsAPI,
    cleanArticleData,
    categorizeArticle,
    isRelevantArticle
};