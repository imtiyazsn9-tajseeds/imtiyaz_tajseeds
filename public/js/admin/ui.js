/** Small DOM helpers shared by the admin modules. */

export const $ = id => document.getElementById(id);

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
  ));
}

/** Image paths may contain spaces or symbols; encode them for use in src attributes. */
export const imgSrc = path => encodeURI(path || '');

export const FALLBACK_IMAGE = 'assets/logo.png';

export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export const openModal = overlay => overlay.classList.add('is-open');
export const closeModal = overlay => overlay.classList.remove('is-open');

/** Shows an inline status message (e.g. upload progress) with a colour per state. */
export function setStatus(el, text, state) {
  const colors = { busy: '#92400E', ok: '#166534', error: '#B91C1C' };
  el.style.display = 'inline';
  el.style.color = colors[state] || colors.busy;
  el.textContent = text;
}
