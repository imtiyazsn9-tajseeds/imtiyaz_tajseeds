'use strict';

const auth = require('./auth');
const { HttpError, sendJson, SECURITY_HEADERS } = require('./http');

const routes = [];

/** Registers an API route. Routes are protected by default; pass { public: true } to opt out. */
function route(method, pathname, handler, { public: isPublic = false } = {}) {
  routes.push({ method, pathname, handler, isPublic });
}

/** Handles the request if it matches an API route. Resolves to false when no route matches. */
async function dispatch(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const candidates = routes.filter(r => r.pathname === url.pathname);
  if (candidates.length === 0) return false;

  for (const [k, v] of Object.entries(SECURITY_HEADERS)) res.setHeader(k, v);

  const match = candidates.find(r => r.method === req.method);
  if (!match) {
    sendJson(res, 405, { success: false, error: 'Method not allowed' }, { Allow: candidates.map(r => r.method).join(', ') });
    return true;
  }

  try {
    if (!match.isPublic && !auth.isAuthenticated(req)) {
      throw new HttpError(401, 'Please log in to continue');
    }
    await match.handler(req, res, url);
  } catch (err) {
    const status = err instanceof HttpError ? err.status : 500;
    if (status === 500) console.error(`${req.method} ${url.pathname} failed:`, err);
    if (!res.headersSent) {
      sendJson(res, status, { success: false, error: status === 500 ? 'Internal server error' : err.message });
    }
  }
  return true;
}

module.exports = { route, dispatch };
