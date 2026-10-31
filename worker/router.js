import { isAuthenticated } from './auth.js';
import { HttpError, sendJson, SECURITY_HEADERS } from './http.js';

const routes = [];

/** Registers an API route. Routes are protected by default; pass { public: true } to opt out. */
export function route(method, pathname, handler, { public: isPublic = false } = {}) {
  routes.push({ method, pathname, handler, isPublic });
}

/** Handles the request if it matches an API route. Resolves to null when no route matches. */
export async function dispatch(request, env, ctx) {
  const url = new URL(request.url);
  const candidates = routes.filter(r => r.pathname === url.pathname);
  if (candidates.length === 0) return null;

  const match = candidates.find(r => r.method === request.method);
  let response;
  if (!match) {
    response = sendJson(405, { success: false, error: 'Method not allowed' }, { Allow: candidates.map(r => r.method).join(', ') });
  } else {
    try {
      if (!match.isPublic && !(await isAuthenticated(env, request))) throw new HttpError(401, 'Please log in to continue');
      response = await match.handler({ request, env, ctx, url });
    } catch (err) {
      const status = err instanceof HttpError ? err.status : 500;
      if (status === 500) console.error(JSON.stringify({ msg: 'Request failed', route: `${request.method} ${url.pathname}`, error: String(err && err.stack || err) }));
      response = sendJson(status, { success: false, error: status === 500 ? 'Internal server error' : err.message });
    }
  }

  for (const [k, v] of Object.entries(SECURITY_HEADERS)) response.headers.set(k, v);
  return response;
}
