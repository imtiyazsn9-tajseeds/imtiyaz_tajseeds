const fs = require('fs');
const path = require('path');

const userPhotosDir = path.join(__dirname, '..', 'assets', 'user_photos');
const galleryDir = path.join(__dirname, '..', 'assets', 'gallery');

// Ensure destination directories exist
if (!fs.existsSync(galleryDir)) {
  fs.mkdirSync(galleryDir, { recursive: true });
}

// Map user photos to gallery
// 1. Factory Main: user_photo_5.jpeg -> gallery/factory-main.jpeg & hero-bg.jpeg
// 2. Processing Machinery: user_photo_4.jpeg -> gallery/processing-machinery.jpeg
// 3. Warehouse Exterior: user_photo_7.jpeg -> gallery/warehouse-exterior.jpeg
// 4. Warehouse Dispatch: user_photo_8.jpeg -> gallery/warehouse-dispatch.jpeg
// 5. Facility Signboard: user_photo_6.jpeg -> gallery/facility-signboard.jpeg
// 6. Field & Records: user_photo_1.jpeg -> gallery/farm-field-brochure.jpeg
// 7. Official Brand Emblem: user_photo_2.jpeg -> gallery/brand-emblem.jpeg
// 8. Quality Brand Seal: user_photo_3.jpeg -> gallery/brand-seal.jpeg

const copies = [
  { src: 'user_photo_5.jpeg', dest: 'factory-main.jpeg' },
  { src: 'user_photo_4.jpeg', dest: 'processing-machinery.jpeg' },
  { src: 'user_photo_7.jpeg', dest: 'warehouse-exterior.jpeg' },
  { src: 'user_photo_8.jpeg', dest: 'warehouse-dispatch.jpeg' },
  { src: 'user_photo_6.jpeg', dest: 'facility-signboard.jpeg' },
  { src: 'user_photo_1.jpeg', dest: 'farm-field-brochure.jpeg' },
  { src: 'user_photo_2.jpeg', dest: 'brand-emblem.jpeg' },
  { src: 'user_photo_3.jpeg', dest: 'brand-seal.jpeg' },
];

copies.forEach(item => {
  const srcPath = path.join(userPhotosDir, item.src);
  const destPath = path.join(galleryDir, item.dest);
  fs.copyFileSync(srcPath, destPath);
  console.log(`Copied ${item.src} -> gallery/${item.dest}`);
});

// Also copy user_photo_5.jpeg as hero-field.jpg
const heroDest = path.join(__dirname, '..', 'assets', 'hero-field.jpg');
fs.copyFileSync(path.join(userPhotosDir, 'user_photo_5.jpeg'), heroDest);
console.log('Updated hero-field.jpg with user_photo_5.jpeg (factory image)');

// Also set logo.png to user_photo_2.jpeg
const logoDest = path.join(__dirname, '..', 'assets', 'logo.png');
fs.copyFileSync(path.join(userPhotosDir, 'user_photo_2.jpeg'), logoDest);
console.log('Updated logo.png with user_photo_2.jpeg (official brand logo)');
