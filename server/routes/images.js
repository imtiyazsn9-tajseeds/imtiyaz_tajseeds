'use strict';

const config = require('../config');
const storage = require('../storage');
const { prepareUpload } = require('../images');
const { route } = require('../router');
const { sendJson, readJsonBody } = require('../http');

// Which asset folders each admin picker may browse
const SCOPES = {
  products: ['products'],
  gallery: ['gallery', 'products']
};

route('GET', '/api/images', async (req, res, url) => {
  const folders = SCOPES[url.searchParams.get('scope')] || SCOPES.products;
  sendJson(res, 200, { success: true, images: storage.listImages(folders) });
});

route('POST', '/api/upload-image', async (req, res) => {
  const body = await readJsonBody(req, Math.ceil(config.MAX_UPLOAD_BYTES * 1.4));
  const { filename, buffer } = prepareUpload(body);
  const folder = body.folder === 'gallery' ? 'gallery' : 'products';
  const imagePath = storage.saveImage(folder, filename, buffer);
  console.log(`Image uploaded: ${imagePath} (${buffer.length} bytes)`);
  sendJson(res, 200, { success: true, filename, imagePath, message: 'Image uploaded successfully!' });
});
