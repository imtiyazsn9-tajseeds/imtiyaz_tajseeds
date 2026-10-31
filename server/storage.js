'use strict';

const fs = require('fs');
const path = require('path');
const config = require('./config');
const { readJson, writeJson } = require('./jsonfile');

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

function writeDocument(name, data) {
  writeJson(filePath(name), data);
}

function readDocument(name) {
  return readJson(filePath(name), null);
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

/** Image paths currently used by a product or gallery photo. */
function usedImagePaths() {
  const used = new Set();
  for (const doc of ['products', 'gallery']) {
    for (const item of readDocument(doc) || []) used.add(item.image);
  }
  return used;
}

/** Deletes an uploaded image. Returns false if it does not exist; throws if it is still in use. */
function deleteImage(imagePath) {
  const match = /^assets\/(products|gallery)\/([^/\\]+)$/.exec(imagePath);
  if (!match || match[2].startsWith('.')) return false;
  if (usedImagePaths().has(imagePath)) throw new Error('IN_USE');
  const file = path.join(config.PUBLIC_DIR, imagePath);
  if (!fs.existsSync(file)) return false;
  fs.unlinkSync(file);
  return true;
}

module.exports = { usedImagePaths, deleteImage, writeDocument, readDocument, filePath, listImages, saveImage, DOCUMENTS };
