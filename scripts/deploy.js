#!/usr/bin/env node

/**
 * ROOT•BYTE Deployment Helper
 * Handles content updates and deployment to Vercel
 * Usage: node scripts/deploy.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 ROOT•BYTE Deploy Process');

// Check if we're in a git repository
function checkGitRepo() {
    try {
        execSync('git rev-parse --git-dir', { stdio: 'ignore' });
        return true;
    } catch {
        console.error('❌ Not in a git repository');
        return false;
    }
}

// Update trending content before deploy
function updateContent() {
    console.log('📰 Updating trending content...');
    try {
        const trendingScript = path.join(__dirname, 'fetch-trending.js');
        execSync(`node "${trendingScript}"`, { stdio: 'inherit' });
        console.log('✅ Content updated');
    } catch (error) {
        console.log('⚠️  Content update failed - continuing with deploy');
    }
}

// Build the site
function buildSite() {
    console.log('🏗️  Building site...');
    try {
        const buildScript = path.join(__dirname, 'build.js');
        execSync(`node "${buildScript}"`, { stdio: 'inherit' });
        console.log('✅ Build complete');
    } catch (error) {
        console.error('❌ Build failed:', error.message);
        process.exit(1);
    }
}

// Check for changes
function hasChanges() {
    try {
        const status = execSync('git status --porcelain', { encoding: 'utf-8' });
        return status.trim().length > 0;
    } catch {
        return false;
    }
}

// Commit and push changes
function deployChanges() {
    if (!hasChanges()) {
        console.log('📝 No changes to deploy');
        return;
    }

    console.log('📝 Committing changes...');
    const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');

    try {
        execSync('git add .', { stdio: 'inherit' });
        execSync(`git commit -m "Content update - ${timestamp}

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"`, { stdio: 'inherit' });

        console.log('⬆️  Pushing to repository...');
        execSync('git push', { stdio: 'inherit' });
        console.log('✅ Deployment complete!');

    } catch (error) {
        console.error('❌ Deploy failed:', error.message);
        process.exit(1);
    }
}

// Main deploy function
async function deploy() {
    if (!checkGitRepo()) {
        process.exit(1);
    }

    updateContent();
    buildSite();
    deployChanges();

    console.log('\n🎉 ROOT•BYTE deployed successfully!');
    console.log('🌐 Site will be available at your Vercel URL');
}

// Run deploy
if (require.main === module) {
    deploy().catch(err => {
        console.error('❌ Deploy failed:', err.message);
        process.exit(1);
    });
}

module.exports = { deploy, updateContent, buildSite };