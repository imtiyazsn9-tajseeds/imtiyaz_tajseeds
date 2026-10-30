'use strict';

const fs = require('fs');
const path = require('path');
const config = require('./config');
const { SECURITY_HEADERS } = require('./http');

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.txt': 'text/plain; charset=UTF-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

const NOT_FOUND_PAGE = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><title>404 - Taj Seeds</title></head>
<body style="font-family: sans-serif; text-align: center; padding: 60px;">
  <h1 style="color: #1F5733;">404 - Page Not Found</h1>
  <p>The page you requested could not be found.</p>
  <a href="/index.html" style="color: #2E9E44; font-weight: bold;">Back to Taj Seeds Home</a>
</body></html>`;

/** Maps a request URL to a file inside PUBLIC_DIR, or null if it would escape it or is hidden. */
function resolveFile(urlPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath);
  } catch (e) {
    return null;
  }
  if (decoded.includes('\0')) return null;

  const target = path.resolve(config.PUBLIC_DIR, '.' + path.posix.normalize('/' + decoded));
  const root = config.PUBLIC_DIR + path.sep;
  if (target !== config.PUBLIC_DIR && !target.startsWith(root)) return null;
  if (target.split(path.sep).some(part => part.startsWith('.'))) return null;
  return target;
}

function sendNotFound(res, headOnly) {
  res.writeHead(404, { 'Content-Type': 'text/html; charset=UTF-8', ...SECURITY_HEADERS });
  res.end(headOnly ? undefined : NOT_FOUND_PAGE);
}

function serveStatic(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD', ...SECURITY_HEADERS });
    res.end();
    return;
  }
  const headOnly = req.method === 'HEAD';

  const urlPath = (req.url || '/').split('?')[0].split('#')[0];
  let filePath = resolveFile(urlPath === '/' ? '/index.html' : urlPath);
  if (!filePath) return sendNotFound(res, headOnly);

  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
      return fs.stat(filePath, (err2, stats2) => send(err2, stats2));
    }
    send(err, stats);
  });

  function send(err, stats) {
    if (err || !stats.isFile()) return sendNotFound(res, headOnly);

    const type = MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
    const etag = `W/"${stats.size}-${Math.floor(stats.mtimeMs)}"`;
    const headers = {
      'Content-Type': type,
      'Cache-Control': 'no-cache',
      ETag: etag,
      'Last-Modified': stats.mtime.toUTCString(),
      'Accept-Ranges': 'bytes',
      ...SECURITY_HEADERS
    };

    if (req.headers['if-none-match'] === etag) {
      res.writeHead(304, headers);
      res.end();
      return;
    }

    // Byte ranges are required for seeking in <video> (notably Safari)
    const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
    if (range && (range[1] || range[2])) {
      let start = range[1] === '' ? stats.size - Number(range[2]) : Number(range[1]);
      let end = range[1] === '' || range[2] === '' ? stats.size - 1 : Number(range[2]);
      start = Math.max(start, 0);
      end = Math.min(end, stats.size - 1);
      if (start > end) {
        res.writeHead(416, { 'Content-Range': `bytes */${stats.size}` });
        res.end();
        return;
      }
      res.writeHead(206, {
        ...headers,
        'Content-Range': `bytes ${start}-${end}/${stats.size}`,
        'Content-Length': end - start + 1
      });
      if (headOnly) return res.end();
      fs.createReadStream(filePath, { start, end }).pipe(res);
      return;
    }

    res.writeHead(200, { ...headers, 'Content-Length': stats.size });
    if (headOnly) return res.end();
    fs.createReadStream(filePath).pipe(res);
  }
}

module.exports = { serveStatic, resolveFile };
