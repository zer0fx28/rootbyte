#!/usr/bin/env node

/**
 * ROOT•BYTE Article Creation Script
 * Creates a new article with proper frontmatter and structure
 * Usage: node scripts/new-article.js "Article Title" [category]
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configuration
const ARTICLES_DIR = path.join(__dirname, '..', 'src', 'content', 'articles');
const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images');

// Article categories
const CATEGORIES = [
    'Foundations',
    'History',
    'Explained',
    'Deep Dive'
];

// Create readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Utility functions
function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

function getCurrentDate() {
    const now = new Date();
    return now.toISOString().split('T')[0]; // YYYY-MM-DD format
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function estimateReadingTime(content) {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
}

function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, resolve);
    });
}

async function getArticleDetails() {
    console.log('🌱 ROOT•BYTE Article Creator\n');

    // Get title
    let title = process.argv[2];
    if (!title) {
        title = await askQuestion('Article title: ');
    }

    if (!title) {
        console.error('❌ Article title is required');
        process.exit(1);
    }

    // Get category
    let category = process.argv[3];
    if (!category) {
        console.log('\nAvailable categories:');
        CATEGORIES.forEach((cat, index) => {
            console.log(`${index + 1}. ${cat}`);
        });

        const categoryChoice = await askQuestion('\nChoose category (1-4): ');
        const categoryIndex = parseInt(categoryChoice) - 1;

        if (categoryIndex >= 0 && categoryIndex < CATEGORIES.length) {
            category = CATEGORIES[categoryIndex];
        } else {
            console.error('❌ Invalid category choice');
            process.exit(1);
        }
    }

    // Get tags
    const tagsInput = await askQuestion('Tags (comma-separated): ');
    const tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag);

    // Get description
    const description = await askQuestion('SEO description (brief): ');

    // Get ROOT connection
    const rootConnection = await askQuestion('ROOT connection (how it relates to foundations): ');

    return {
        title,
        category,
        tags,
        description: description || `Explore ${title.toLowerCase()} and understand the fundamental concepts behind this technology.`,
        rootConnection: rootConnection || `Understanding ${title.toLowerCase()} helps us grasp fundamental technology concepts.`
    };
}

function generateArticleContent(details) {
    const slug = slugify(details.title);
    const date = getCurrentDate();
    const formattedDate = formatDate(date);

    const frontmatter = `---
title: "${details.title}"
slug: "${slug}"
date: "${date}"
author: "ROOT•BYTE Team"
category: "${details.category}"
tags: [${details.tags.map(tag => `"${tag}"`).join(', ')}]
description: "${details.description}"
featured_image: "/images/${slug}-hero.webp"
reading_time: "6 min read"
root_connection: "${details.rootConnection}"
---`;

    const content = `# ${details.title}

*${formattedDate}*

## Introduction

[Write an engaging opening that hooks the reader and introduces the topic]

## The ROOT Connection

${details.rootConnection}

[Explain how this topic connects to fundamental technology concepts]

## Main Content

### Section 1: [Your First Main Point]

[Content here]

### Section 2: [Your Second Main Point]

[Content here]

### Section 3: [Your Third Main Point]

[Content here]

## Real-World Applications

[How this technology is used in practice]

## Key Takeaways

🌱 **ROOT Understanding**: [Main foundational concept]

📚 **Technical Insight**: [Key technical learning]

🔍 **Practical Application**: [How it's used today]

🚀 **Future Impact**: [Where this is heading]

## What's Next

[Tease the next related article or concept]

---

*Want to dive deeper into the foundations of technology? Subscribe to our newsletter for weekly ROOT concept explanations that make complex tech simple.*`;

    return `${frontmatter}\n\n${content}`;
}

async function createArticle() {
    try {
        // Ensure directories exist
        if (!fs.existsSync(ARTICLES_DIR)) {
            fs.mkdirSync(ARTICLES_DIR, { recursive: true });
            console.log(`📁 Created articles directory: ${ARTICLES_DIR}`);
        }

        if (!fs.existsSync(IMAGES_DIR)) {
            fs.mkdirSync(IMAGES_DIR, { recursive: true });
            console.log(`📁 Created images directory: ${IMAGES_DIR}`);
        }

        // Get article details
        const details = await getArticleDetails();

        // Generate content
        const content = generateArticleContent(details);

        // Create filename
        const slug = slugify(details.title);
        const date = getCurrentDate();
        const filename = `${date}-${slug}.md`;
        const filepath = path.join(ARTICLES_DIR, filename);

        // Check if file already exists
        if (fs.existsSync(filepath)) {
            const overwrite = await askQuestion(`File ${filename} already exists. Overwrite? (y/N): `);
            if (overwrite.toLowerCase() !== 'y') {
                console.log('❌ Article creation cancelled');
                rl.close();
                return;
            }
        }

        // Write file
        fs.writeFileSync(filepath, content);

        console.log('\n✅ Article created successfully!');
        console.log(`📄 File: ${filepath}`);
        console.log(`🏷️  Slug: ${slug}`);
        console.log(`📂 Category: ${details.category}`);
        console.log(`🏷️  Tags: ${details.tags.join(', ')}`);

        console.log('\n📝 Next steps:');
        console.log('1. Edit the article content in your preferred editor');
        console.log(`2. Add a hero image: /images/${slug}-hero.webp`);
        console.log('3. Replace placeholder sections with actual content');
        console.log('4. Review and publish when ready');

        // Create image placeholder reminder
        const imagePath = path.join(IMAGES_DIR, `${slug}-hero.webp`);
        if (!fs.existsSync(imagePath)) {
            console.log(`\n🖼️  Don't forget to add the hero image: ${imagePath}`);
        }

    } catch (error) {
        console.error('❌ Error creating article:', error.message);
        process.exit(1);
    } finally {
        rl.close();
    }
}

// Run the script
if (require.main === module) {
    createArticle();
}

module.exports = {
    createArticle,
    generateArticleContent,
    slugify,
    CATEGORIES
};