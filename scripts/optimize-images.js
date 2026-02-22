#!/usr/bin/env node

/**
 * ROOT•BYTE Image Optimization
 * Converts and optimizes images for web performance
 * Converts to WebP, resizes to optimal dimensions
 * Usage: node scripts/optimize-images.js
 */

const fs = require('fs');
const path = require('path');

console.log('🖼️  ROOT•BYTE Image Optimizer');

// Configuration
const IMAGE_DIRS = [
    'public/images/articles',
    'public/images/heroes',
    'public/images/misc'
];

const MAX_SIZES = {
    hero: { width: 1200, height: 630 },
    article: { width: 800, height: 450 },
    thumbnail: { width: 400, height: 225 }
};

// Check if sharp is available (optional dependency)
let sharp;
try {
    sharp = require('sharp');
    console.log('📦 Using Sharp for image optimization');
} catch {
    console.log('⚠️  Sharp not installed - install with: npm install sharp');
    console.log('📝 For now, just organizing image structure...');
}

// Ensure image directories exist
function createDirectories() {
    IMAGE_DIRS.forEach(dir => {
        const fullPath = path.join(__dirname, '..', dir);
        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath, { recursive: true });
            console.log(`📁 Created: ${dir}`);
        }
    });
}

// Optimize single image
async function optimizeImage(inputPath, outputPath, maxWidth = 1200, quality = 85) {
    if (!sharp) {
        console.log(`⏭️  Skipping ${path.basename(inputPath)} (Sharp not available)`);
        return;
    }

    try {
        const info = await sharp(inputPath)
            .resize(maxWidth, null, { withoutEnlargement: true })
            .webp({ quality })
            .toFile(outputPath);

        const inputStats = fs.statSync(inputPath);
        const outputStats = fs.statSync(outputPath);
        const savings = Math.round((1 - outputStats.size / inputStats.size) * 100);

        console.log(`✅ ${path.basename(inputPath)} → ${path.basename(outputPath)} (${savings}% smaller)`);
    } catch (error) {
        console.error(`❌ Failed to optimize ${inputPath}:`, error.message);
    }
}

// Process all images in a directory
async function processDirectory(dirPath) {
    const fullPath = path.join(__dirname, '..', dirPath);

    if (!fs.existsSync(fullPath)) {
        return;
    }

    const files = fs.readdirSync(fullPath);
    const imageFiles = files.filter(f => /\.(jpg|jpeg|png)$/i.test(f));

    console.log(`\n📂 Processing ${dirPath} (${imageFiles.length} images)`);

    for (const file of imageFiles) {
        const inputPath = path.join(fullPath, file);
        const outputPath = path.join(fullPath, file.replace(/\.(jpg|jpeg|png)$/i, '.webp'));

        // Skip if WebP version already exists and is newer
        if (fs.existsSync(outputPath)) {
            const inputStats = fs.statSync(inputPath);
            const outputStats = fs.statSync(outputPath);
            if (outputStats.mtime > inputStats.mtime) {
                console.log(`⏭️  ${file} already optimized`);
                continue;
            }
        }

        await optimizeImage(inputPath, outputPath);
    }
}

// Generate placeholder images for development
function generatePlaceholders() {
    const placeholders = [
        { name: 'hero-touchscreen-1965.webp', width: 1200, height: 630, text: 'E.A. Johnson 1965\nFirst Touchscreen' },
        { name: 'hero-neural-networks-1943.webp', width: 1200, height: 630, text: 'McCulloch-Pitts 1943\nNeural Networks' },
        { name: 'thumbnail-emoji-1999.webp', width: 400, height: 225, text: '1999 Emoji\nShigetaka Kurita' }
    ];

    console.log('\n🎨 Generating development placeholders...');

    placeholders.forEach(placeholder => {
        const outputPath = path.join(__dirname, '..', 'public', 'images', 'articles', placeholder.name);

        if (!fs.existsSync(outputPath)) {
            // Create a simple SVG placeholder
            const svg = `<svg width="${placeholder.width}" height="${placeholder.height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#e4ddd0"/>
    <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="monospace" font-size="24" fill="#7a7060">${placeholder.text}</text>
</svg>`;

            fs.writeFileSync(outputPath.replace('.webp', '.svg'), svg);
            console.log(`📄 Created placeholder: ${placeholder.name.replace('.webp', '.svg')}`);
        }
    });
}

// Main optimization process
async function optimize() {
    createDirectories();

    if (sharp) {
        for (const dir of IMAGE_DIRS) {
            await processDirectory(dir);
        }
        console.log('\n✅ Image optimization complete');
    } else {
        generatePlaceholders();
        console.log('\n💡 Install sharp for image optimization: npm install sharp');
    }

    console.log('\n📋 Image optimization summary:');
    console.log('   • All images should be WebP format for best performance');
    console.log('   • Max file size: 200KB per image');
    console.log('   • Hero images: 1200×630px for social sharing');
    console.log('   • Article images: 800×450px for content');
    console.log('   • Thumbnails: 400×225px for cards');
}

// Run optimization
if (require.main === module) {
    optimize().catch(err => {
        console.error('❌ Optimization failed:', err.message);
        process.exit(1);
    });
}

module.exports = { optimize, optimizeImage };