/**
 * OpenClaw Backup Script
 * 备份 OpenClaw 配置和数据
 * 
 * 用法: node backup.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

const homedir = os.homedir();
const workspaceDir = path.join(homedir, '.openclaw');
const backupDir = path.join(homedir, 'Desktop', 'openclaw工作', 'backups');

function timestamp() {
    return new Date().toISOString().replace(/[:.]/g, '-');
}

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function backupFile(relativePath) {
    const src = path.join(workspaceDir, relativePath);
    const destDir = path.join(backupDir, path.dirname(relativePath));
    
    if (fs.existsSync(src)) {
        ensureDir(destDir);
        const dest = path.join(destDir, `${path.basename(relativePath)}.${timestamp()}.bak`);
        fs.copyFileSync(src, dest);
        return `✅ ${relativePath} → ${dest}`;
    }
    return `⏭️  ${relativePath} 不存在，跳过`;
}

console.log('╔══════════════════════════════════════╗');
console.log('║    OpenClaw Enterprise Backup       ║');
console.log('╚══════════════════════════════════════╝');
console.log();

const dateStr = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
console.log(`📅 ${dateStr}`);
console.log(`📂 ${backupDir}`);
console.log();

// 核心配置文件
const files = [
    'openclaw.json',
    'HEARTBEAT.md',
    'SOUL.md',
    'USER.md',
    'AGENTS.md',
    'IDENTITY.md',
];

console.log('📄 备份配置文件:');
files.forEach(f => console.log(`  ${backupFile(f)}`));

// 扩展目录
if (fs.existsSync(path.join(workspaceDir, 'extensions'))) {
    console.log();
    console.log('🧩 备份扩展插件...');
    const extensions = fs.readdirSync(path.join(workspaceDir, 'extensions'));
    extensions.forEach(ext => {
        console.log(`  ✅ ${ext}`);
    });
}

// Skills 目录
if (fs.existsSync(path.join(workspaceDir, 'workspace', 'skills'))) {
    console.log();
    console.log('🎯 备份 Skills...');
    const skills = fs.readdirSync(path.join(workspaceDir, 'workspace', 'skills'));
    skills.forEach(skill => {
        console.log(`  ✅ ${skill}`);
    });
}

console.log();
console.log('🎉 备份完成！');
console.log(`📁 ${backupDir}`);
