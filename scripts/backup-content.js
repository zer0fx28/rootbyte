#!/usr/bin/env node

/**
 * ROOT•BYTE Content Backup
 * Creates timestamped backups of all content
 * Usage: node scripts/backup-content.js
 */

const fs = require('fs');
const path = require('path');

console.log('💾 ROOT•BYTE Content Backup');

// Configuration
const CONTENT_DIR = path.join(__dirname, '..', 'src', 'content');
const BACKUP_DIR = path.join(__dirname, '..', 'backups');
const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');

// Create backup directory
function createBackupDir() {
    const backupPath = path.join(BACKUP_DIR, `content-${timestamp}`);
    if (!fs.existsSync(backupPath)) {
        fs.mkdirSync(backupPath, { recursive: true });
    }
    return backupPath;
}

// Copy directory recursively
function copyDirectory(src, dest) {
    if (!fs.existsSync(src)) {
        return;
    }

    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    const files = fs.readdirSync(src);
    let fileCount = 0;

    files.forEach(file => {
        const srcPath = path.join(src, file);
        const destPath = path.join(dest, file);

        if (fs.statSync(srcPath).isDirectory()) {
            copyDirectory(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
            fileCount++;
        }
    });

    return fileCount;
}

// Create backup manifest
function createManifest(backupPath, fileCount) {
    const manifest = {
        timestamp: new Date().toISOString(),
        backup_type: 'content',
        files_backed_up: fileCount,
        source_directory: CONTENT_DIR,
        backup_directory: backupPath,
        created_by: 'ROOT•BYTE backup script'
    };

    const manifestPath = path.join(backupPath, 'backup-manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

    console.log('📋 Backup manifest created');
}

// Main backup function
function backup() {
    console.log(`📂 Backing up: ${CONTENT_DIR}`);

    const backupPath = createBackupDir();
    const fileCount = copyDirectory(CONTENT_DIR, backupPath);

    createManifest(backupPath, fileCount);

    console.log(`✅ Backup complete!`);
    console.log(`📁 Location: ${backupPath}`);
    console.log(`📄 Files backed up: ${fileCount}`);

    // Cleanup old backups (keep last 10)
    const backups = fs.readdirSync(BACKUP_DIR)
        .filter(f => f.startsWith('content-'))
        .sort()
        .reverse();

    if (backups.length > 10) {
        const toDelete = backups.slice(10);
        console.log(`🧹 Cleaning up ${toDelete.length} old backups...`);

        toDelete.forEach(backup => {
            const oldPath = path.join(BACKUP_DIR, backup);
            fs.rmSync(oldPath, { recursive: true });
        });
    }

    return backupPath;
}

// Run backup
if (require.main === module) {
    try {
        backup();
        console.log('\n🎉 Content backup successful!');
    } catch (error) {
        console.error('❌ Backup failed:', error.message);
        process.exit(1);
    }
}

module.exports = { backup, copyDirectory };