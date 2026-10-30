'use strict';

const path = require('path');
const config = require('./config');
const { HttpError } = require('./http');

const ALLOWED = {
  '.png': buf => buf.length > 8 && buf.slice(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47])),
  '.jpg': buf => buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff,
  '.webp': buf => buf.length > 12 && buf.slice(0, 4).toString() === 'RIFF' && buf.slice(8, 12).toString() === 'WEBP',
  '.gif': buf => buf.length > 6 && buf.slice(0, 3).toString() === 'GIF',
  // SVG is text and can carry scripts, so it is checked separately below
  '.svg': buf => /<svg[\s>]/i.test(buf.slice(0, 2048).toString('utf8'))
};
ALLOWED['.jpeg'] = ALLOWED['.jpg'];

function hasActiveSvgContent(buf) {
  const text = buf.toString('utf8');
  return /<script|<foreignObject|\son\w+\s*=|javascript:/i.test(text);
}

/**
 * Validates an uploaded image (type, size, real file signature) and returns a
 * safe unique filename plus the decoded bytes.
 */
function prepareUpload({ filename, data }) {
  if (typeof filename !== 'string' || typeof data !== 'string' || !filename || !data) {
    throw new HttpError(400, 'Filename and image data are required');
  }

  const original = path.basename(filename).replace(/[^a-zA-Z0-9.-]/g, '_');
  const ext = path.extname(original).toLowerCase();
  if (!ALLOWED[ext]) throw new HttpError(400, 'Only PNG, JPG, WEBP, GIF or SVG images are allowed');

  const buffer = Buffer.from(data.replace(/^data:[^;,]+;base64,/, ''), 'base64');
  if (buffer.length === 0) throw new HttpError(400, 'Image is empty');
  if (buffer.length > config.MAX_UPLOAD_BYTES) throw new HttpError(413, 'Image is larger than 10 MB');
  if (!ALLOWED[ext](buffer)) throw new HttpError(400, 'File content does not match its image type');
  if (ext === '.svg' && hasActiveSvgContent(buffer)) throw new HttpError(400, 'SVG with scripts is not allowed');

  const base = path.basename(original, path.extname(original)) || 'image';
  return { filename: `${base}-${Date.now()}${ext}`, buffer };
}

module.exports = { prepareUpload };
