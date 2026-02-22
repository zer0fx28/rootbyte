#!/usr/bin/env node

/**
 * ROOT•BYTE Content Validator
 * Validates article structure, metadata, and content quality
 * Usage: node scripts/validate-content.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 ROOT•BYTE Content Validation');

// Paths
const ARTICLES_DIR = path.join(__dirname, '..', 'src', 'content', 'articles');

// Required frontmatter fields
const REQUIRED_FIELDS = [
    'title', 'date', 'category', 'tags', 'root_year',
    'root_who', 'root_where', 'root_connection', 'dyk_fact'
];

// Required content sections
const REQUIRED_SECTIONS = [
    '## The Modern Story',
    '## ROOT: Going Back to',
    '## Did You Know',
    '## Why It Matters Today'
];

// Validate single article
function validateArticle(filePath) {
    const fileName = path.basename(filePath);
    const content = fs.readFileSync(filePath, 'utf-8');
    const errors = [];

    // Check frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) {
        errors.push('Missing frontmatter');
        return { fileName, errors, valid: false };
    }

    const frontmatter = frontmatterMatch[1];
    const body = content.slice(frontmatterMatch[0].length).trim();

    // Parse frontmatter
    const metadata = {};
    frontmatter.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split(':');
        if (key && valueParts.length) {
            metadata[key.trim()] = valueParts.join(':').trim().replace(/^["']|["']$/g, '');
        }
    });

    // Check required fields
    REQUIRED_FIELDS.forEach(field => {
        if (!metadata[field]) {
            errors.push(`Missing required field: ${field}`);
        }
    });

    // Check required sections
    REQUIRED_SECTIONS.forEach(section => {
        if (!body.includes(section)) {
            errors.push(`Missing required section: ${section}`);
        }
    });

    // Content quality checks
    const wordCount = body.split(/\s+/).length;
    if (wordCount < 300) {
        errors.push(`Article too short: ${wordCount} words (minimum 300)`);
    }

    // Check if ROOT year makes sense
    if (metadata.root_year) {
        const year = parseInt(metadata.root_year);
        const currentYear = new Date().getFullYear();
        if (year > currentYear || year < 1800) {
            errors.push(`Invalid root_year: ${metadata.root_year}`);
        }
    }

    // Check reading time estimation
    const estimatedTime = Math.ceil(wordCount / 200);
    const declaredTime = parseInt(metadata.reading_time);
    if (declaredTime && Math.abs(declaredTime - estimatedTime) > 2) {
        errors.push(`Reading time mismatch: declared ${declaredTime}min, estimated ${estimatedTime}min`);
    }

    return {
        fileName,
        errors,
        valid: errors.length === 0,
        metadata,
        wordCount,
        estimatedTime
    };
}

// Validate all articles
function validateAll() {
    if (!fs.existsSync(ARTICLES_DIR)) {
        console.error('❌ Articles directory not found');
        process.exit(1);
    }

    const files = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.md'));
    console.log(`📰 Validating ${files.length} articles\n`);

    const results = files.map(file => {
        const filePath = path.join(ARTICLES_DIR, file);
        return validateArticle(filePath);
    });

    // Report results
    let validCount = 0;
    let errorCount = 0;

    results.forEach(result => {
        if (result.valid) {
            console.log(`✅ ${result.fileName} (${result.wordCount} words, ~${result.estimatedTime}min)`);
            validCount++;
        } else {
            console.log(`❌ ${result.fileName}`);
            result.errors.forEach(error => {
                console.log(`   • ${error}`);
            });
            errorCount += result.errors.length;
        }
    });

    console.log(`\n📊 Validation Summary:`);
    console.log(`   ✅ ${validCount} articles valid`);
    console.log(`   ❌ ${results.length - validCount} articles with errors`);
    console.log(`   🐛 ${errorCount} total errors`);

    if (errorCount > 0) {
        console.log('\n💡 Fix errors before deploying for best user experience');
        process.exit(1);
    }

    console.log('\n🎉 All content valid!');
}

// Run validation
if (require.main === module) {
    validateAll();
}

module.exports = { validateArticle, validateAll };