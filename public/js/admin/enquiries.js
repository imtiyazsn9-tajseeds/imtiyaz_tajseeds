/** Enquiries tab: the inbox of messages sent through the website's contact form. */

import { api } from './api.js';
import { $, escapeHtml } from './ui.js';

let enquiries = [];

function whatsappLink(e) {
  const digits = e.phone.replace(/[^0-9]/g, '').slice(-10);
  const text = `Namaste ${e.name}, Taj Seeds se baat kar rahe hain. Aapki enquiry ke baare mein.`;
  return `https://wa.me/91${digits}?text=${encodeURIComponent(text)}`;
}

function renderBadge() {
  const fresh = enquiries.filter(e => e.status === 'new').length;
  const badge = $('enquiryBadge');
  badge.textContent = fresh;
  badge.style.display = fresh ? 'inline' : 'none';
}

function render() {
  renderBadge();
  if (enquiries.length === 0) {
    $('enquiryList').innerHTML = '<div class="empty-state">Abhi tak koi enquiry nahi aayi hai.</div>';
    return;
  }

  $('enquiryList').innerHTML = enquiries.map(e => {
    const handled = e.status === 'handled';
    return `
      <div class="enquiry-card ${handled ? 'is-handled' : ''}">
        <div class="enquiry-head">
          <strong style="font-size: 1.05rem;">${escapeHtml(e.name)}</strong>
          <span style="font-size: 0.8rem; color: #6B7280;">${escapeHtml(new Date(e.createdAt).toLocaleString('en-IN'))}
            · <b style="color: ${handled ? '#166534' : '#B91C1C'};">${handled ? 'Handled' : 'New'}</b></span>
        </div>
        <div class="enquiry-meta">
          <span>📞 <a href="tel:${escapeHtml(e.phone)}">${escapeHtml(e.phone)}</a></span>
          ${e.email ? `<span>✉️ <a href="mailto:${escapeHtml(e.email)}">${escapeHtml(e.email)}</a></span>` : ''}
          ${e.location ? `<span>📍 ${escapeHtml(e.location)}</span>` : ''}
          <span>🏷️ ${escapeHtml(e.type)}</span>
        </div>
        <div class="enquiry-message">${escapeHtml(e.message)}</div>
        <div class="enquiry-actions">
          <a class="action-btn action-edit" href="tel:${escapeHtml(e.phone)}" style="text-decoration: none;">Call</a>
          <a class="action-btn action-edit" href="${escapeHtml(whatsappLink(e))}" target="_blank" rel="noopener" style="text-decoration: none;">WhatsApp</a>
          <button type="button" class="action-btn action-edit" data-action="toggle" data-id="${escapeHtml(e.id)}">${handled ? 'Mark as New' : 'Mark as Handled'}</button>
          <button type="button" class="action-btn action-delete" data-action="delete" data-id="${escapeHtml(e.id)}">Delete</button>
        </div>
      </div>`;
  }).join('');
}

async function refresh() {
  try {
    enquiries = await api.listEnquiries();
    render();
  } catch (err) {
    console.error('Could not load enquiries:', err);
  }
}

export function initEnquiries() {
  refresh();
  document.addEventListener('admin:tab', e => { if (e.detail === 'tab-enquiries') refresh(); });

  $('enquiryList').addEventListener('click', async e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const enquiry = enquiries.find(x => x.id === btn.dataset.id);
    try {
      if (btn.dataset.action === 'toggle') {
        await api.setEnquiryStatus(enquiry.id, enquiry.status === 'new' ? 'handled' : 'new');
      } else if (confirm(`"${enquiry.name}" ki enquiry delete karein?`)) {
        await api.deleteEnquiry(enquiry.id);
      } else {
        return;
      }
      await refresh();
    } catch (err) {
      alert(err.message);
    }
  });
}
