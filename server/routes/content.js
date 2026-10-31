'use strict';

const config = require('../config');
const storage = require('../storage');
const backups = require('../backups');
const validators = require('../validators');
const { route } = require('../router');
const { HttpError, sendJson, readJsonBody } = require('../http');

// body key -> [storage document, validator]
const SECTIONS = {
  products: ['products', validators.validateProducts],
  gallery: ['gallery', validators.validateGallery],
  config: ['config', validators.validateConfig]
};

const currentVersions = () => Object.fromEntries(Object.keys(SECTIONS).map(key => [key, backups.versionOf(SECTIONS[key][0])]));

/** What the admin panel loaded, so it can tell whether someone else saved since. */
route('GET', '/api/versions', async (req, res) => {
  sendJson(res, 200, { success: true, versions: currentVersions() });
});

/**
 * Saves any of { products, gallery, config }. Everything is validated first, and the previous
 * version of each document is backed up before it is replaced.
 * `base` carries the versions the admin loaded; if one has changed since, nothing is saved (409).
 */
route('PUT', '/api/content', async (req, res) => {
  const body = await readJsonBody(req, config.MAX_JSON_BYTES);
  const provided = Object.keys(SECTIONS).filter(key => body[key] !== undefined);
  if (provided.length === 0) throw new HttpError(400, 'Nothing to save');

  for (const key of provided) {
    const error = SECTIONS[key][1](body[key]);
    if (error) throw new HttpError(400, error);
  }

  const base = body.base || {};
  const versions = currentVersions();
  const stale = provided.filter(key => base[key] && base[key] !== versions[key]);
  if (stale.length) {
    throw new HttpError(409, 'Kisi aur ne ye data badal diya hai. Apne badlav copy karke page reload karein, phir dobara try karein.');
  }

  for (const key of provided) {
    backups.snapshot(SECTIONS[key][0]);
    storage.writeDocument(SECTIONS[key][0], body[key]);
  }

  console.log(`Content saved: ${provided.join(', ')}`);
  sendJson(res, 200, { success: true, saved: provided, versions: currentVersions(), message: 'Settings & products saved successfully!' });
});
