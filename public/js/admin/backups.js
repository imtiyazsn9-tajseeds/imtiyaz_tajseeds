/** Backups tab: every save keeps the previous version, which can be restored from here. */

import { api } from './api.js';
import { $, escapeHtml } from './ui.js';

const LABELS = { products: 'Products (बीज)', gallery: 'Gallery (फोटो)', config: 'Contact & Settings' };

async function refresh() {
  let backups = [];
  try {
    backups = await api.listBackups();
  } catch (err) {
    console.error('Could not load backups:', err);
  }

  if (backups.length === 0) {
    $('backupList').innerHTML = '<div class="empty-state">Abhi koi backup nahi hai. Pehli baar "Save Changes" dabane ke baad yahan dikhne lagenge.</div>';
    return;
  }

  $('backupList').innerHTML = `
    <div class="admin-table-container" style="margin-top: 0;">
      <table class="products-table">
        <thead><tr><th>Kab</th><th>Kya</th><th>Andar kya tha</th><th></th></tr></thead>
        <tbody>${backups.map(b => `
          <tr>
            <td>${escapeHtml(new Date(b.createdAt).toLocaleString('en-IN'))}</td>
            <td>${escapeHtml(LABELS[b.doc] || b.doc)}</td>
            <td>${escapeHtml(b.summary)}</td>
            <td><button type="button" class="action-btn action-edit" data-file="${escapeHtml(b.file)}">Restore</button></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

export function initBackups() {
  refresh();
  document.addEventListener('admin:tab', e => { if (e.detail === 'tab-backups') refresh(); });

  $('backupList').addEventListener('click', async e => {
    const btn = e.target.closest('[data-file]');
    if (!btn) return;
    if (!confirm('Is version ko wapas laayein? Abhi ka data bhi backup mein save ho jayega, isliye ise undo kiya ja sakta hai.')) return;
    try {
      await api.restoreBackup(btn.dataset.file);
      alert('Restore ho gaya. Page reload ho raha hai.');
      location.reload();
    } catch (err) {
      alert(err.message);
    }
  });
}
