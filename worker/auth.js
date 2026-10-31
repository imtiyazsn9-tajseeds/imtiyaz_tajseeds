import { SESSION_TTL_MS } from './config.js';
import { HttpError, parseCookies, isHttps } from './http.js';
import { hmacHex, safeEqual } from './crypto.js';

const COOKIE_NAME = 'taj_admin';

// "Taj Seeds", "taj_seeds" and "tajseeds" all identify the same admin
const normalizeId = id => String(id || '').toLowerCase().replace(/[\s_-]+/g, '');

/** Sessions are signed cookies ("<expiry>.<signature>"), so nothing is stored on the server. */
const secretOf = env => env.SESSION_SECRET || env.ADMIN_PASSWORD;

export async function verifyCredentials(env, id, password) {
  if (!env.ADMIN_PASSWORD) {
    throw new HttpError(503, 'Admin password set nahi hai. Deploy karte waqt ADMIN_PASSWORD secret set karein.');
  }
  const idOk = await safeEqual(normalizeId(id), normalizeId(env.ADMIN_ID || 'tajseeds'));
  const passOk = await safeEqual(String(password || '').trim(), env.ADMIN_PASSWORD);
  return idOk && passOk;
}

export async function createSession(env) {
  const expires = String(Date.now() + SESSION_TTL_MS);
  return `${expires}.${await hmacHex(secretOf(env), `taj-admin.${expires}`)}`;
}

export async function isAuthenticated(env, request) {
  const token = parseCookies(request)[COOKIE_NAME];
  if (!token || !secretOf(env)) return false;
  const [expires, signature] = token.split('.');
  if (!expires || !signature || Number(expires) <= Date.now()) return false;
  return safeEqual(signature, await hmacHex(secretOf(env), `taj-admin.${expires}`));
}

export function sessionCookie(request, token, maxAgeMs) {
  const parts = [`${COOKIE_NAME}=${token}`, 'Path=/', 'HttpOnly', 'SameSite=Strict', `Max-Age=${Math.floor(maxAgeMs / 1000)}`];
  if (isHttps(request)) parts.push('Secure');
  return parts.join('; ');
}
