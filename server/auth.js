'use strict';

const crypto = require('crypto');
const config = require('./config');
const { parseCookies, isHttps, clientIp } = require('./http');
const { createLimiter } = require('./ratelimit');

const COOKIE_NAME = 'taj_admin';
const sessions = new Map(); // token -> expiry timestamp
const loginLimiter = createLimiter({ max: config.LOGIN_MAX_ATTEMPTS, windowMs: config.LOGIN_WINDOW_MS });

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

/** Returns how many ms the caller must wait, or 0 if another attempt is allowed. */
const loginBlockedFor = req => loginLimiter.check(clientIp(req));
const recordFailedLogin = req => loginLimiter.hit(clientIp(req));
const clearFailedLogins = req => loginLimiter.reset(clientIp(req));

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
