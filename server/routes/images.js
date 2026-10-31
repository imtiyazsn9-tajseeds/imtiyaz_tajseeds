'use strict';

const config = require('../config');
const storage = require('../storage');
const { prepareUpload } = require('../images');
const { route } = require('../router');
const { HttpError, sendJson, readJsonBody } = require('../http');

// Which asset folders each admin picker may browse
const SCOPES = {
  products: ['products'],
  gallery: ['gallery', 'products']
};

route('GET', '/api/images', async (req, res, url) => {
  const folders = SCOPES[url.searchParams.get('scope')] || SCOPES.products;
  const used = storage.usedImagePaths();
  const images = storage.listImages(folders).map(img => ({ ...img, inUse: used.has(img.path) }));
  sendJson(res, 200, { success: true, images });
});

route('POST', '/api/images/delete', async (req, res) => {
  const { path } = await readJsonBody(req, 1024);
  let deleted;
  try {
    deleted = storage.deleteImage(String(path || ''));
  } catch (err) {
    if (err.message === 'IN_USE') throw new HttpError(409, 'Ye photo abhi kisi product ya gallery mein use ho rahi hai.');
    throw err;
  }
  if (!deleted) throw new HttpError(404, 'Photo not found');
  sendJson(res, 200, { success: true });
});

route('POST', '/api/upload-image', async (req, res) => {
  const body = await readJsonBody(req, Math.ceil(config.MAX_UPLOAD_BYTES * 1.4));
  const { filename, buffer } = prepareUpload(body);
  const folder = body.folder === 'gallery' ? 'gallery' : 'products';
  const imagePath = storage.saveImage(folder, filename, buffer);
  console.log(`Image uploaded: ${imagePath} (${buffer.length} bytes)`);
  sendJson(res, 200, { success: true, filename, imagePath, message: 'Image uploaded successfully!' });
});
