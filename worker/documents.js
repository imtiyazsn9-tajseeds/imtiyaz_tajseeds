import { BACKUPS_TO_KEEP } from './config.js';
import { sha256Hex } from './crypto.js';

/** The JSON documents the admin panel can edit, and the static file each one starts from. */
export const DOCUMENTS = {
  products: 'products.json',
  gallery: 'gallery.json',
  config: 'site-config.json'
};

const describe = (doc, data) => (Array.isArray(data)
  ? `${data.length} ${doc === 'products' ? 'products' : 'photos'}`
  : 'Contact & settings');

/**
 * Returns { json, version } for a document. Until the admin saves it for the first time there is
 * no database row, so the copy that shipped in public/data is used.
 */
export async function readDocument(env, request, name) {
  if (!DOCUMENTS[name]) throw new Error(`Unknown document: ${name}`);
  const row = await env.DB.prepare('SELECT json, version FROM documents WHERE name = ?').bind(name).first();
  if (row) return { json: row.json, version: row.version };

  const res = await env.ASSETS.fetch(new URL(`/data/${DOCUMENTS[name]}`, request.url));
  if (!res.ok) return { json: 'null', version: 'none' };
  const json = JSON.stringify(await res.json());
  return { json, version: (await sha256Hex(json)).slice(0, 16) };
}

export async function readAll(env, request) {
  const entries = await Promise.all(Object.keys(DOCUMENTS).map(async name => [name, await readDocument(env, request, name)]));
  return Object.fromEntries(entries);
}

export const versionsOf = docs => Object.fromEntries(Object.entries(docs).map(([name, d]) => [name, d.version]));

/** SQL that stores the current copy of a document as a backup and trims the oldest ones. */
function snapshotStatements(env, name, current) {
  const now = new Date().toISOString();
  const summary = describe(name, JSON.parse(current.json));
  return [
    env.DB.prepare('INSERT INTO backups (doc, json, summary, created_at) VALUES (?, ?, ?, ?)').bind(name, current.json, summary, now),
    env.DB.prepare(
      `DELETE FROM backups WHERE doc = ?1 AND id NOT IN (SELECT id FROM backups WHERE doc = ?1 ORDER BY id DESC LIMIT ?2)`
    ).bind(name, BACKUPS_TO_KEEP)
  ];
}

/** Saves new data for the given documents. The previous copy of each is backed up in the same transaction. */
export async function saveDocuments(env, updates, currentDocs) {
  const now = new Date().toISOString();
  const statements = [];
  const versions = {};
  for (const [name, data] of Object.entries(updates)) {
    const json = JSON.stringify(data);
    versions[name] = (await sha256Hex(json)).slice(0, 16);
    statements.push(...snapshotStatements(env, name, currentDocs[name]));
    statements.push(env.DB.prepare(
      `INSERT INTO documents (name, json, version, updated_at) VALUES (?1, ?2, ?3, ?4)
       ON CONFLICT(name) DO UPDATE SET json = ?2, version = ?3, updated_at = ?4`
    ).bind(name, json, versions[name], now));
  }
  await env.DB.batch(statements);
  return versions;
}

export async function listBackups(env) {
  const { results } = await env.DB.prepare('SELECT id, doc, summary, created_at FROM backups ORDER BY id DESC').all();
  return results.map(r => ({ file: String(r.id), doc: r.doc, createdAt: r.created_at, summary: r.summary }));
}

/** Puts a backup back in place. The current version is backed up first, so a restore can be undone. */
export async function restoreBackup(env, request, file) {
  if (!/^\d+$/.test(file)) return null;
  const backup = await env.DB.prepare('SELECT doc, json FROM backups WHERE id = ?').bind(Number(file)).first();
  if (!backup) return null;

  const current = await readDocument(env, request, backup.doc);
  const version = (await sha256Hex(backup.json)).slice(0, 16);
  await env.DB.batch([
    ...snapshotStatements(env, backup.doc, current),
    env.DB.prepare(
      `INSERT INTO documents (name, json, version, updated_at) VALUES (?1, ?2, ?3, ?4)
       ON CONFLICT(name) DO UPDATE SET json = ?2, version = ?3, updated_at = ?4`
    ).bind(backup.doc, backup.json, version, new Date().toISOString())
  ]);
  return { doc: backup.doc, version };
}
