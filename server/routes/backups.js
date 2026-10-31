'use strict';

const backups = require('../backups');
const { route } = require('../router');
const { HttpError, sendJson, readJsonBody } = require('../http');

route('GET', '/api/backups', async (req, res) => {
  sendJson(res, 200, { success: true, backups: backups.list() });
});

route('POST', '/api/backups/restore', async (req, res) => {
  const { file } = await readJsonBody(req, 1024);
  const doc = backups.restore(String(file || ''));
  if (!doc) throw new HttpError(404, 'Backup not found');
  sendJson(res, 200, { success: true, restored: doc, versions: { [doc]: backups.versionOf(doc) } });
});
