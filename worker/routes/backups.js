import { listBackups, restoreBackup } from '../documents.js';
import { route } from '../router.js';
import { HttpError, sendJson, readJsonBody } from '../http.js';

route('GET', '/api/backups', async ({ env }) => {
  return sendJson(200, { success: true, backups: await listBackups(env) });
});

route('POST', '/api/backups/restore', async ({ request, env }) => {
  const { file } = await readJsonBody(request, 1024);
  const restored = await restoreBackup(env, request, String(file || ''));
  if (!restored) throw new HttpError(404, 'Backup not found');
  return sendJson(200, { success: true, restored: restored.doc, versions: { [restored.doc]: restored.version } });
});
