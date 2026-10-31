import { MAX_UPLOAD_BYTES } from '../config.js';
import { listImages, usedImagePaths, deleteImage, prepareUpload, saveImage } from '../images.js';
import { route } from '../router.js';
import { HttpError, sendJson, readJsonBody } from '../http.js';

// Which asset folders each admin picker may browse
const SCOPES = {
  products: ['products'],
  gallery: ['gallery', 'products']
};

route('GET', '/api/images', async ({ request, env, url }) => {
  const folders = SCOPES[url.searchParams.get('scope')] || SCOPES.products;
  const used = await usedImagePaths(env, request);
  const images = (await listImages(env, folders)).map(img => ({ ...img, inUse: used.has(img.path) }));
  return sendJson(200, { success: true, images });
});

route('POST', '/api/images/delete', async ({ request, env }) => {
  const { path } = await readJsonBody(request, 1024);
  let deleted;
  try {
    deleted = await deleteImage(env, request, String(path || ''));
  } catch (err) {
    if (err.message === 'IN_USE') throw new HttpError(409, 'Ye photo abhi kisi product ya gallery mein use ho rahi hai.');
    throw err;
  }
  if (!deleted) throw new HttpError(404, 'Photo not found');
  return sendJson(200, { success: true });
});

route('POST', '/api/upload-image', async ({ request, env }) => {
  const body = await readJsonBody(request, Math.ceil(MAX_UPLOAD_BYTES * 1.4) + 1024);
  const { filename, bytes, mime } = prepareUpload(body);
  const folder = body.folder === 'gallery' ? 'gallery' : 'products';
  const imagePath = await saveImage(env, folder, filename, bytes, mime);
  console.log(JSON.stringify({ msg: 'Image uploaded', path: imagePath, bytes: bytes.length }));
  return sendJson(200, { success: true, filename, imagePath, message: 'Image uploaded successfully!' });
});
