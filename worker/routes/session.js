import { SESSION_TTL_MS, LOGIN_MAX_ATTEMPTS, LOGIN_WINDOW_MS } from '../config.js';
import * as auth from '../auth.js';
import { createLimiter } from '../ratelimit.js';
import { route } from '../router.js';
import { HttpError, sendJson, readJsonBody, clientIp } from '../http.js';

const loginLimiter = db => createLimiter(db, { prefix: 'login', max: LOGIN_MAX_ATTEMPTS, windowMs: LOGIN_WINDOW_MS });

route('POST', '/api/login', async ({ request, env }) => {
  const limiter = loginLimiter(env.DB);
  const ip = clientIp(request);

  const wait = await limiter.check(ip);
  if (wait > 0) {
    throw new HttpError(429, `Bahut zyada galat koshishein. ${Math.ceil(wait / 60000)} minute baad dobara try karein.`);
  }

  const { id, password } = await readJsonBody(request, 4096);
  if (!(await auth.verifyCredentials(env, id, password))) {
    await limiter.hit(ip);
    throw new HttpError(401, 'Galat ID ya Password');
  }

  await limiter.reset(ip);
  const token = await auth.createSession(env);
  return sendJson(200, { success: true }, { 'Set-Cookie': auth.sessionCookie(request, token, SESSION_TTL_MS) });
}, { public: true });

route('POST', '/api/logout', async ({ request }) => {
  return sendJson(200, { success: true }, { 'Set-Cookie': auth.sessionCookie(request, '', 0) });
}, { public: true });

route('GET', '/api/session', async ({ request, env }) => {
  return sendJson(200, { success: true, authenticated: await auth.isAuthenticated(env, request) });
}, { public: true });
