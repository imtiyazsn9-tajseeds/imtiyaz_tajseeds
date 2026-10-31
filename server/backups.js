'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const config = require('./config');
const storage = require('./storage');
const { readJson } = require('./jsonfile');

const dir = () => path.join(config.PRIVATE_DIR, 'backups');
const NAME = /^(products|gallery|config)-\d{8}T\d{9}Z\.json$/;

/** Fingerprint of a document, used to detect that someone else saved in the meantime. */
function versionOf(doc) {
  try {
    return crypto.createHash('sha1').update(fs.readFileSync(storage.filePath(doc))).digest('hex').slice(0, 16);
  } catch (err) {
    return 'none';
  }
}

/** Copies the current document into the backups folder, then drops the oldest copies. */
function snapshot(doc) {
  const source = storage.filePath(doc);
  if (!fs.existsSync(source)) return;
  fs.mkdirSync(dir(), { recursive: true });

  const stamp = new Date().toISOString().replace(/[-:.]/g, '');
  fs.copyFileSync(source, path.join(dir(), `${doc}-${stamp}.json`));

  const mine = fs.readdirSync(dir()).filter(f => f.startsWith(`${doc}-`) && NAME.test(f)).sort();
  for (const old of mine.slice(0, Math.max(0, mine.length - config.BACKUPS_TO_KEEP))) {
    fs.unlinkSync(path.join(dir(), old));
  }
}

function describe(doc, data) {
  if (Array.isArray(data)) return `${data.length} ${doc === 'products' ? 'products' : 'photos'}`;
  return 'Contact & settings';
}

function list() {
  if (!fs.existsSync(dir())) return [];
  return fs.readdirSync(dir()).filter(f => NAME.test(f)).sort().reverse().map(file => {
    const doc = file.split('-')[0];
    const m = /-(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/.exec(file);
    return {
      file,
      doc,
      createdAt: `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}Z`,
      summary: describe(doc, readJson(path.join(dir(), file), null))
    };
  });
}

/** Puts a backup back in place. The current version is backed up first, so a restore can be undone. */
function restore(file) {
  if (!NAME.test(file)) return false;
  const source = path.join(dir(), file);
  if (!fs.existsSync(source)) return false;
  const doc = file.split('-')[0];
  snapshot(doc);
  fs.copyFileSync(source, storage.filePath(doc));
  return doc;
}

module.exports = { versionOf, snapshot, list, restore };
