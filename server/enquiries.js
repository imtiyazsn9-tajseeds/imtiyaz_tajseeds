'use strict';

const crypto = require('crypto');
const path = require('path');
const config = require('./config');
const { readJson, writeJson } = require('./jsonfile');

const MAX_KEPT = 5000;
const file = () => path.join(config.PRIVATE_DIR, 'enquiries.json');

function list() {
  return readJson(file(), []);
}

function add(fields) {
  const enquiry = {
    id: crypto.randomBytes(6).toString('hex'),
    createdAt: new Date().toISOString(),
    status: 'new',
    ...fields
  };
  writeJson(file(), [enquiry, ...list()].slice(0, MAX_KEPT));
  return enquiry;
}

function setStatus(id, status) {
  const all = list();
  const found = all.find(e => e.id === id);
  if (!found) return false;
  found.status = status;
  writeJson(file(), all);
  return true;
}

function remove(id) {
  const all = list();
  const rest = all.filter(e => e.id !== id);
  if (rest.length === all.length) return false;
  writeJson(file(), rest);
  return true;
}

/** Forwards the enquiry to the optional webhook. Never throws: the enquiry is already saved. */
async function notify(enquiry) {
  if (!config.NOTIFY_WEBHOOK_URL) return;
  try {
    const res = await fetch(config.NOTIFY_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(enquiry),
      signal: AbortSignal.timeout(8000)
    });
    if (!res.ok) console.error(`Enquiry webhook answered ${res.status}`);
  } catch (err) {
    console.error('Enquiry webhook failed:', err.message);
  }
}

module.exports = { list, add, setStatus, remove, notify };
