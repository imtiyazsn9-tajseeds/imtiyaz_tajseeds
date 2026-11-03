import { dispatch } from './router.js';
import { DOCUMENTS, readDocument } from './documents.js';
import { serveImage } from './images.js';
import { sendJson, SECURITY_HEADERS } from './http.js';

import './routes/session.js';
import './routes/images.js';
import './routes/content.js';
import './routes/contact.js';
import './routes/backups.js';

const DOCUMENT_BY_FILE = Object.fromEntries(Object.entries(DOCUMENTS).map(([name, file]) => [file, name]));
const withSecurityHeaders = res => {
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) res.headers.set(k, v);
  return res;
};

/** The site's editable content: the saved copy, or the file that shipped with the site. */
async function serveDocument(request, env, name) {
  const doc = await readDocument(env, request, name);
  const etag = `"${doc.version}"`;
  // Always revalidate (a 304 is cheap), so admin changes show up on the next page load
  const headers = { ETag: etag, 'Cache-Control': 'no-cache' };
  if (request.headers.get('if-none-match') === etag) return new Response(null, { status: 304, headers });
  return new Response(request.method === 'HEAD' ? null : doc.json, {
    headers: { 'Content-Type': 'application/json; charset=UTF-8', ...headers }
  });
}

export default {
  async fetch(request, env, ctx) {
    const { pathname } = new URL(request.url);

    if (pathname.startsWith('/api/')) {
      return (await dispatch(request, env, ctx))
        || withSecurityHeaders(sendJson(404, { success: false, error: 'Unknown API endpoint' }));
    }

    const readOnly = request.method === 'GET' || request.method === 'HEAD';

    if (readOnly && pathname.startsWith('/uploads/')) {
      const image = await serveImage(env, request, decodeURIComponent(pathname.slice(1)));
      return withSecurityHeaders(image || new Response('Not found', { status: 404 }));
    }

    if (readOnly && pathname.startsWith('/data/')) {
      const name = DOCUMENT_BY_FILE[pathname.slice('/data/'.length)];
      if (name) return withSecurityHeaders(await serveDocument(request, env, name));
    }

    return env.ASSETS.fetch(request);
  }
};
