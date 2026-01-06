const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, '../dist');
const PUBLIC_DIR = path.join(__dirname, '../public');
const MANIFEST_FILE = 'manifest.json';
const ICON_FILE = 'icon.png';

console.log('🚀 Starting PWA Post-Build Proces...');

// 1. Copy Manifest and Icon
if (fs.existsSync(PUBLIC_DIR)) {
    if (!fs.existsSync(DIST_DIR)) {
        console.error('❌ Dist directory not found!');
        process.exit(1);
    }

    // Copy manifest
    fs.copyFileSync(path.join(PUBLIC_DIR, MANIFEST_FILE), path.join(DIST_DIR, MANIFEST_FILE));
    console.log(`✅ Copied ${MANIFEST_FILE}`);

    // Copy icon
    fs.copyFileSync(path.join(PUBLIC_DIR, ICON_FILE), path.join(DIST_DIR, ICON_FILE));
    console.log(`✅ Copied ${ICON_FILE}`);
} else {
    console.error('❌ Public directory missing!');
}

// 2. Inject Link into HTML
const htmlPath = path.join(DIST_DIR, 'index.html');
if (fs.existsSync(htmlPath)) {
    let html = fs.readFileSync(htmlPath, 'utf-8');

    if (!html.includes('manifest.json')) {
        const linkTag = `<link rel="manifest" href="/${MANIFEST_FILE}" />`;
        // Inject before </head>
        html = html.replace('</head>', `${linkTag}\n</head>`);
        fs.writeFileSync(htmlPath, html);
        console.log('✅ Injected manifest link into index.html');
    } else {
        console.log('ℹ️ Manifest link already present.');
    }
} else {
    console.error('❌ index.html not found!');
}

console.log('✨ PWA Setup Complete!');
