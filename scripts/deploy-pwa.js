const fs = require('fs');
const path = require('path');

// Try to find the build output directory
const possibleDirs = ['dist', 'web-build', 'public'];
let buildDir = null;

for (const dir of possibleDirs) {
    const fullPath = path.join(__dirname, '..', dir);
    // We look for index.html to confirm it's a valid build output
    if (fs.existsSync(fullPath) && fs.existsSync(path.join(fullPath, 'index.html'))) {
        buildDir = fullPath;
        console.log(`✅ Detected build directory: ${dir}`);
        break;
    }
}

if (!buildDir) {
    console.error('⚠️ Could not find build directory (dist/web-build). Skipping PWA injection.');
    // Do not fail the build, just skip PWA
    process.exit(0);
}

const PUBLIC_DIR = path.join(__dirname, '../public');
const MANIFEST_FILE = 'manifest.json';
const ICON_FILE = 'icon.png';

console.log('🚀 Starting PWA Post-Build Process...');

// 1. Copy Manifest, Icon, and Service Worker
if (fs.existsSync(PUBLIC_DIR)) {
    // Copy manifest
    try {
        fs.copyFileSync(path.join(PUBLIC_DIR, MANIFEST_FILE), path.join(buildDir, MANIFEST_FILE));
        console.log(`✅ Copied ${MANIFEST_FILE}`);

        // Copy icon
        fs.copyFileSync(path.join(PUBLIC_DIR, ICON_FILE), path.join(buildDir, ICON_FILE));
        console.log(`✅ Copied ${ICON_FILE}`);

        // Copy service worker
        const SW_FILE = 'sw.js';
        if (fs.existsSync(path.join(PUBLIC_DIR, SW_FILE))) {
            fs.copyFileSync(path.join(PUBLIC_DIR, SW_FILE), path.join(buildDir, SW_FILE));
            console.log(`✅ Copied ${SW_FILE}`);
        }
    } catch (e) {
        console.error('Error copying assets:', e);
    }
} else {
    console.log('ℹ️ Public directory missing, skipping asset copy.');
}

// 2. Inject Link into HTML
const htmlPath = path.join(buildDir, 'index.html');
if (fs.existsSync(htmlPath)) {
    try {
        let html = fs.readFileSync(htmlPath, 'utf-8');

        if (!html.includes('manifest.json')) {
            const linkTag = `<link rel="manifest" href="/${MANIFEST_FILE}" />`;
            html = html.replace('</head>', `${linkTag}\n</head>`);
            fs.writeFileSync(htmlPath, html);
            console.log('✅ Injected manifest link into index.html');
        } else {
            console.log('ℹ️ Manifest link already present.');
        }
    } catch (e) {
        console.error('Error injecting HTML:', e);
    }
}

console.log('✨ PWA Setup Complete!');
