'use strict';

const fs = require('fs');
const path = require('path');
const config = require('./config');

/** Names of the JSON documents the admin panel is allowed to write. */
const DOCUMENTS = {
  products: 'products.json',
  gallery: 'gallery.json',
  config: 'site-config.json'
};

function filePath(name) {
  if (!DOCUMENTS[name]) throw new Error(`Unknown document: ${name}`);
  return path.join(config.DATA_DIR, DOCUMENTS[name]);
}

/** Writes via a temp file + rename so a crash can never leave half-written JSON. */
function writeJson(name, data) {
  const target = filePath(name);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const tmp = `${target}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2) + '\n', 'utf8');
  fs.renameSync(tmp, target);
}

function listImages(folders) {
  const images = [];
  for (const folder of folders) {
    const dir = path.join(config.PUBLIC_DIR, 'assets', folder);
    if (!fs.existsSync(dir)) continue;
    for (const filename of fs.readdirSync(dir)) {
      if (/\.(png|jpe?g|webp|gif|svg)$/i.test(filename)) {
        images.push({ filename, path: `assets/${folder}/${filename}` });
      }
    }
  }
  return images;
}

function saveImage(folder, filename, buffer) {
  const dir = path.join(config.PUBLIC_DIR, 'assets', folder);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, filename), buffer);
  return `assets/${folder}/${filename}`;
}

module.exports = { writeJson, listImages, saveImage, DOCUMENTS };
