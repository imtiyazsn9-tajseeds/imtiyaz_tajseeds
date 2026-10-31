'use strict';

const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.resolve(process.env.PUBLIC_DIR || path.join(ROOT, 'public'));

const DEFAULT_ADMIN_PASSWORD = '0099';

module.exports = {
  PORT: Number(process.env.PORT) || 8080,
  HOST: process.env.HOST || '0.0.0.0',
  PUBLIC_DIR,
  DATA_DIR: path.resolve(process.env.DATA_DIR || path.join(PUBLIC_DIR, 'data')),
  // Never served to browsers: enquiries and backups of the site data
  PRIVATE_DIR: path.resolve(process.env.PRIVATE_DIR || path.join(ROOT, 'storage')),

  ADMIN_ID: process.env.ADMIN_ID || 'tajseeds',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD,
  USING_DEFAULT_PASSWORD: !process.env.ADMIN_PASSWORD,

  SESSION_TTL_MS: 8 * 60 * 60 * 1000,
  LOGIN_MAX_ATTEMPTS: 5,
  LOGIN_WINDOW_MS: 15 * 60 * 1000,
  TRUST_PROXY: process.env.TRUST_PROXY === '1',

  // Optional: every new enquiry is also POSTed here as JSON (Formspree, Zapier, Make, ...)
  NOTIFY_WEBHOOK_URL: process.env.NOTIFY_WEBHOOK_URL || '',
  CONTACT_MAX_PER_HOUR: 5,
  BACKUPS_TO_KEEP: 40,

  MAX_JSON_BYTES: 2 * 1024 * 1024,
  MAX_UPLOAD_BYTES: 10 * 1024 * 1024
};
