-- Editable site content (products, gallery, settings). Falls back to public/data/*.json until first saved.
CREATE TABLE documents (
  name TEXT PRIMARY KEY,
  json TEXT NOT NULL,
  version TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Automatic copy of a document taken before every save or restore
CREATE TABLE backups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  doc TEXT NOT NULL,
  json TEXT NOT NULL,
  summary TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX backups_doc ON backups (doc, id);

CREATE TABLE enquiries (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL,
  message TEXT NOT NULL
);
CREATE INDEX enquiries_created ON enquiries (created_at);

-- Photos uploaded from the admin panel (the ones shipped with the site live in public/assets)
CREATE TABLE images (
  path TEXT PRIMARY KEY,
  folder TEXT NOT NULL,
  filename TEXT NOT NULL,
  mime TEXT NOT NULL,
  size INTEGER NOT NULL,
  data BLOB NOT NULL,
  created_at TEXT NOT NULL
);

-- Login and contact-form attempt counters
CREATE TABLE rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  reset_at INTEGER NOT NULL
);
