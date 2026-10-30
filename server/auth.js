'use strict';

const crypto = require('crypto');
const config = require('./config');
const { parseCookies, isHttps } = require('./http');

const COOKIE_NAME = 'taj_admin';
const sessions = new Map(); // token -> expiry timestamp
const attempts = new Map(); // ip -> { count, resetAt }

/** Compares two strings without leaking their length or content through timing. */
function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

// "Taj Seeds", "taj_seeds" and "tajseeds" all identify the same admin
const normalizeId = id => String(id || '').toLowerCase().replace(/[\s_-]+/g, '');

function verifyCredentials(id, password) {
  const idOk = safeEqual(normalizeId(id), normalizeId(config.ADMIN_ID));
  const passOk = safeEqual(String(password || '').trim(), config.ADMIN_PASSWORD);
  return idOk && passOk;
}

function clientIp(req) {
  if (config.TRUST_PROXY) {
    const forwarded = (req.headers['x-forwarded-for'] || '').split(',')[0].trim();
    if (forwarded) return forwarded;
  }
  return req.socket.remoteAddress || 'unknown';
}

/** Returns how many ms the caller must wait, or 0 if another attempt is allowed. */
function loginBlockedFor(req) {
  const entry = attempts.get(clientIp(req));
  if (!entry || entry.resetAt <= Date.now()) return 0;
  return entry.count >= config.LOGIN_MAX_ATTEMPTS ? entry.resetAt - Date.now() : 0;
}

function recordFailedLogin(req) {
  const ip = clientIp(req);
  const entry = attempts.get(ip);
  if (!entry || entry.resetAt <= Date.now()) {
    attempts.set(ip, { count: 1, resetAt: Date.now() + config.LOGIN_WINDOW_MS });
  } else {
    entry.count += 1;
  }
}

function clearFailedLogins(req) {
  attempts.delete(clientIp(req));
}

function createSession() {
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, Date.now() + config.SESSION_TTL_MS);
  return token;
}

function isAuthenticated(req) {
  const token = parseCookies(req)[COOKIE_NAME];
  if (!token || !sessions.has(token)) return false;
  if (sessions.get(token) <= Date.now()) {
    sessions.delete(token);
    return false;
  }
  return true;
}

function destroySession(req) {
  const token = parseCookies(req)[COOKIE_NAME];
  if (token) sessions.delete(token);
}

function sessionCookie(req, token, maxAgeMs) {
  const parts = [
    `${COOKIE_NAME}=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    `Max-Age=${Math.floor(maxAgeMs / 1000)}`
  ];
  if (isHttps(req)) parts.push('Secure');
  return parts.join('; ');
}

module.exports = {
  verifyCredentials,
  loginBlockedFor,
  recordFailedLogin,
  clearFailedLogins,
  createSession,
  isAuthenticated,
  destroySession,
  sessionCookie
};
