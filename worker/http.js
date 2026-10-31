/** Small helpers shared by routes: responses, body parsing, cookies. */

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};

export function sendJson(status, body, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=UTF-8', 'Cache-Control': 'no-store', ...headers }
  });
}

/** Reads and parses a JSON body, enforcing a size limit and a JSON content type. */
export async function readJsonBody(request, maxBytes) {
  const type = (request.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
  if (type !== 'application/json') throw new HttpError(415, 'Content-Type must be application/json');

  const declared = Number(request.headers.get('content-length'));
  if (declared > maxBytes) throw new HttpError(413, 'Request body too large');

  const text = await request.text();
  if (text.length > maxBytes) throw new HttpError(413, 'Request body too large');
  try {
    return JSON.parse(text || '{}');
  } catch (e) {
    throw new HttpError(400, 'Invalid JSON');
  }
}

export function parseCookies(request) {
  const out = {};
  for (const part of (request.headers.get('cookie') || '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = part.slice(i + 1).trim();
  }
  return out;
}

export const isHttps = request => new URL(request.url).protocol === 'https:';

/** Cloudflare puts the visitor's address in this header. */
export const clientIp = request => request.headers.get('cf-connecting-ip') || 'local';
