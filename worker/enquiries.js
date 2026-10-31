import { ENQUIRIES_TO_KEEP } from './config.js';

const toEnquiry = r => ({
  id: r.id, createdAt: r.created_at, status: r.status, name: r.name, phone: r.phone,
  email: r.email, location: r.location, type: r.type, message: r.message
});

export async function list(db) {
  const { results } = await db.prepare('SELECT * FROM enquiries ORDER BY created_at DESC LIMIT ?').bind(ENQUIRIES_TO_KEEP).all();
  return results.map(toEnquiry);
}

export async function add(db, fields) {
  const enquiry = {
    id: crypto.randomUUID().replace(/-/g, '').slice(0, 12),
    createdAt: new Date().toISOString(),
    status: 'new',
    ...fields
  };
  await db.batch([
    db.prepare(
      `INSERT INTO enquiries (id, created_at, status, name, phone, email, location, type, message)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(enquiry.id, enquiry.createdAt, enquiry.status, enquiry.name, enquiry.phone, enquiry.email, enquiry.location, enquiry.type, enquiry.message),
    // keep the inbox bounded so the free database never fills up
    db.prepare(
      'DELETE FROM enquiries WHERE id NOT IN (SELECT id FROM enquiries ORDER BY created_at DESC LIMIT ?)'
    ).bind(ENQUIRIES_TO_KEEP)
  ]);
  return enquiry;
}

export async function setStatus(db, id, status) {
  const res = await db.prepare('UPDATE enquiries SET status = ? WHERE id = ?').bind(status, id).run();
  return res.meta.changes > 0;
}

export async function remove(db, id) {
  const res = await db.prepare('DELETE FROM enquiries WHERE id = ?').bind(id).run();
  return res.meta.changes > 0;
}

/** Forwards the enquiry to the optional webhook. Never throws: the enquiry is already saved. */
export async function notify(env, enquiry) {
  if (!env.NOTIFY_WEBHOOK_URL) return;
  try {
    const res = await fetch(env.NOTIFY_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(enquiry),
      signal: AbortSignal.timeout(8000)
    });
    if (!res.ok) console.error(JSON.stringify({ msg: 'Enquiry webhook failed', status: res.status }));
  } catch (err) {
    console.error(JSON.stringify({ msg: 'Enquiry webhook failed', error: err.message }));
  }
}
