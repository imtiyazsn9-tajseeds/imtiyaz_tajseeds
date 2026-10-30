const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\mdaqu\\Downloads';
const destDir = path.join(__dirname, '..', 'public', 'assets', 'user_photos');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const files = fs.readdirSync(srcDir);
const matching = files.filter(f => f.startsWith('WhatsApp Image 2026-10-23 at 11.19'));

console.log('Found matching files:', matching);

matching.forEach((file, index) => {
  const src = path.join(srcDir, file);
  const dest = path.join(destDir, `user_photo_${index + 1}.jpeg`);
  fs.copyFileSync(src, dest);
  console.log(`Copied ${file} -> user_photo_${index + 1}.jpeg`);
});
