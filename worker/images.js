import { MAX_UPLOAD_BYTES, MAX_STORED_IMAGES } from './config.js';
import { HttpError } from './http.js';
import { readDocument } from './documents.js';
import staticImages from './static-images.js';

const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml' };
const FOLDERS = ['products', 'gallery'];
const ascii = (bytes, from, to) => String.fromCharCode(...bytes.subarray(from, to));

const SIGNATURES = {
  '.png': b => b.length > 8 && b[0] === 0x89 && ascii(b, 1, 4) === 'PNG',
  '.jpg': b => b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  '.webp': b => b.length > 12 && ascii(b, 0, 4) === 'RIFF' && ascii(b, 8, 12) === 'WEBP',
  '.gif': b => b.length > 6 && ascii(b, 0, 3) === 'GIF',
  // SVG is text and can carry scripts, so it is checked separately below
  '.svg': b => /<svg[\s>]/i.test(new TextDecoder().decode(b.subarray(0, 2048)))
};
SIGNATURES['.jpeg'] = SIGNATURES['.jpg'];

const hasActiveSvgContent = bytes => /<script|<foreignObject|\son\w+\s*=|javascript:/i.test(new TextDecoder().decode(bytes));

function decodeBase64(text) {
  try {
    const binary = atob(text.replace(/^data:[^;,]+;base64,/, ''));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  } catch (e) {
    throw new HttpError(400, 'Image data is not valid');
  }
}

/** Validates an uploaded image (type, size, real file signature) and returns a safe unique filename plus its bytes. */
export function prepareUpload({ filename, data }) {
  if (typeof filename !== 'string' || typeof data !== 'string' || !filename || !data) {
    throw new HttpError(400, 'Filename and image data are required');
  }

  const original = filename.split(/[\\/]/).pop().replace(/[^a-zA-Z0-9.-]/g, '_');
  const dot = original.lastIndexOf('.');
  const ext = dot > 0 ? original.slice(dot).toLowerCase() : '';
  if (!SIGNATURES[ext]) throw new HttpError(400, 'Only PNG, JPG, WEBP, GIF or SVG images are allowed');

  const bytes = decodeBase64(data);
  if (bytes.length === 0) throw new HttpError(400, 'Image is empty');
  if (bytes.length > MAX_UPLOAD_BYTES) throw new HttpError(413, 'Image is larger than 1 MB. Chhoti photo chunein.');
  if (!SIGNATURES[ext](bytes)) throw new HttpError(400, 'File content does not match its image type');
  if (ext === '.svg' && hasActiveSvgContent(bytes)) throw new HttpError(400, 'SVG with scripts is not allowed');

  const base = original.slice(0, dot).replace(/^\.+/, '') || 'image';
  return { filename: `${base}-${Date.now()}${ext}`, bytes, mime: MIME[ext] };
}

/** Photos that shipped with the site (static, cannot be deleted) plus the ones uploaded from the admin panel. */
export async function listImages(env, folders) {
  const shipped = staticImages
    .filter(p => folders.some(f => p.startsWith(`assets/${f}/`)))
    .map(p => ({ filename: p.split('/').pop(), path: p, deletable: false }));
  const marks = folders.map(() => '?').join(',');
  const { results } = await env.DB.prepare(`SELECT path, filename FROM images WHERE folder IN (${marks}) ORDER BY created_at`).bind(...folders).all();
  return [...shipped, ...results.map(r => ({ filename: r.filename, path: r.path, deletable: true }))];
}

export async function saveImage(env, folder, filename, bytes, mime) {
  if (!FOLDERS.includes(folder)) throw new HttpError(400, 'Unknown folder');
  const { n } = await env.DB.prepare('SELECT COUNT(*) AS n FROM images').first();
  if (n >= MAX_STORED_IMAGES) throw new HttpError(409, 'Photo limit poori ho gayi. Pehle kuch unused photos delete karein.');

  const path = `uploads/${folder}/${filename}`;
  await env.DB.prepare(
    'INSERT INTO images (path, folder, filename, mime, size, data, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).bind(path, folder, filename, mime, bytes.length, bytes.buffer, new Date().toISOString()).run();
  return path;
}

/** Image paths currently used by a product or gallery photo. */
export async function usedImagePaths(env, request) {
  const used = new Set();
  for (const doc of ['products', 'gallery']) {
    for (const item of JSON.parse((await readDocument(env, request, doc)).json) || []) used.add(item.image);
  }
  return used;
}

/** Deletes an uploaded image. Returns false if it does not exist; throws IN_USE if it is still shown on the site. */
export async function deleteImage(env, request, path) {
  if (!/^uploads\/(products|gallery)\/[^/\\.][^/\\]*$/.test(path)) return false;
  if ((await usedImagePaths(env, request)).has(path)) throw new Error('IN_USE');
  const res = await env.DB.prepare('DELETE FROM images WHERE path = ?').bind(path).run();
  return res.meta.changes > 0;
}

/** Serves an uploaded photo. File names are unique, so browsers may keep them forever. */
export async function serveImage(env, request, path) {
  const row = await env.DB.prepare('SELECT mime, data FROM images WHERE path = ?').bind(path).first();
  if (!row) return null;
  const bytes = row.data instanceof ArrayBuffer ? new Uint8Array(row.data) : Uint8Array.from(row.data);
  return new Response(request.method === 'HEAD' ? null : bytes, {
    headers: {
      'Content-Type': row.mime,
      'Content-Length': String(bytes.length),
      'Cache-Control': 'public, max-age=31536000, immutable',
      // an SVG opened directly must not be able to run scripts
      'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox"
    }
  });
}
