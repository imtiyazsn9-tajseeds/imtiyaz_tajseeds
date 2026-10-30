'use strict';

const config = require('../config');
const storage = require('../storage');
const validators = require('../validators');
const { route } = require('../router');
const { HttpError, sendJson, readJsonBody } = require('../http');

// body key -> [storage document, validator]
const SECTIONS = {
  products: ['products', validators.validateProducts],
  gallery: ['gallery', validators.validateGallery],
  config: ['config', validators.validateConfig]
};

/** Saves any of { products, gallery, config }. Everything is validated before anything is written. */
route('PUT', '/api/content', async (req, res) => {
  const body = await readJsonBody(req, config.MAX_JSON_BYTES);
  const provided = Object.keys(SECTIONS).filter(key => body[key] !== undefined);
  if (provided.length === 0) throw new HttpError(400, 'Nothing to save');

  for (const key of provided) {
    const error = SECTIONS[key][1](body[key]);
    if (error) throw new HttpError(400, error);
  }
  for (const key of provided) storage.writeJson(SECTIONS[key][0], body[key]);

  console.log(`Content saved: ${provided.join(', ')}`);
  sendJson(res, 200, { success: true, saved: provided, message: 'Settings & products saved successfully!' });
});
