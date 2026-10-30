// Create placeholder images for logo.png and hero-field.jpg
const fs = require('fs');
const path = require('path');

// 1x1 transparent PNG buffer
const tinyPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
const tinyPng = Buffer.from(tinyPngBase64, 'base64');

// Copy logo.svg content into an HTML/data format or keep svg
const assetsDir = path.join(__dirname, '..', 'public', 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// We write logo.png as an image
fs.writeFileSync(path.join(assetsDir, 'logo.png'), tinyPng);
fs.writeFileSync(path.join(assetsDir, 'hero-field.jpg'), tinyPng);
console.log('Placeholders created successfully');
