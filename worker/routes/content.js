import { MAX_JSON_BYTES } from '../config.js';
import * as validators from '../validators.js';
import { readAll, versionsOf, saveDocuments } from '../documents.js';
import { route } from '../router.js';
import { HttpError, sendJson, readJsonBody } from '../http.js';

// body key -> validator. The key is also the document name.
const SECTIONS = {
  products: validators.validateProducts,
  gallery: validators.validateGallery,
  config: validators.validateConfig
};

/** What the admin panel loaded, so it can tell whether someone else saved since. */
route('GET', '/api/versions', async ({ request, env }) => {
  return sendJson(200, { success: true, versions: versionsOf(await readAll(env, request)) });
});

/**
 * Saves any of { products, gallery, config }. Everything is validated first, and the previous
 * version of each document is backed up before it is replaced.
 * `base` carries the versions the admin loaded; if one has changed since, nothing is saved (409).
 */
route('PUT', '/api/content', async ({ request, env }) => {
  const body = await readJsonBody(request, MAX_JSON_BYTES);
  const provided = Object.keys(SECTIONS).filter(key => body[key] !== undefined);
  if (provided.length === 0) throw new HttpError(400, 'Nothing to save');

  for (const key of provided) {
    const error = SECTIONS[key](body[key]);
    if (error) throw new HttpError(400, error);
  }

  const current = await readAll(env, request);
  const base = body.base || {};
  const stale = provided.filter(key => base[key] && base[key] !== current[key].version);
  if (stale.length) {
    throw new HttpError(409, 'Kisi aur ne ye data badal diya hai. Apne badlav copy karke page reload karein, phir dobara try karein.');
  }

  await saveDocuments(env, Object.fromEntries(provided.map(key => [key, body[key]])), current);
  const versions = versionsOf(await readAll(env, request));
  console.log(JSON.stringify({ msg: 'Content saved', saved: provided }));
  return sendJson(200, { success: true, saved: provided, versions, message: 'Settings & products saved successfully!' });
});
