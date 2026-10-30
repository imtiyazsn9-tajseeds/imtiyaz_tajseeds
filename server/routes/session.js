'use strict';

const config = require('../config');
const auth = require('../auth');
const { route } = require('../router');
const { HttpError, sendJson, readJsonBody } = require('../http');

route('POST', '/api/login', async (req, res) => {
  const wait = auth.loginBlockedFor(req);
  if (wait > 0) {
    const minutes = Math.ceil(wait / 60000);
    throw new HttpError(429, `Bahut zyada galat koshishein. ${minutes} minute baad dobara try karein.`);
  }

  const { id, password } = await readJsonBody(req, 4096);
  if (!auth.verifyCredentials(id, password)) {
    auth.recordFailedLogin(req);
    throw new HttpError(401, 'Galat ID ya Password');
  }

  auth.clearFailedLogins(req);
  const token = auth.createSession();
  sendJson(res, 200, { success: true }, { 'Set-Cookie': auth.sessionCookie(req, token, config.SESSION_TTL_MS) });
}, { public: true });

route('POST', '/api/logout', async (req, res) => {
  auth.destroySession(req);
  sendJson(res, 200, { success: true }, { 'Set-Cookie': auth.sessionCookie(req, '', 0) });
}, { public: true });

route('GET', '/api/session', async (req, res) => {
  sendJson(res, 200, { success: true, authenticated: auth.isAuthenticated(req) });
}, { public: true });
