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

const MAX_SIDE = 1200;

/**
 * Shrinks a photo in the browser before upload: phone photos are often 4000px / 5 MB, far larger
 * than the site ever shows. Returns { filename, data } ready for the server. SVG and GIF are sent as they are.
 */
export async function prepareImage(file) {
  if (!/^image\/(png|jpe?g|webp)$/.test(file.type)) {
    return { filename: file.name, data: await readFileAsDataUrl(file) };
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#FFFFFF'; // photos with transparency get a white background, like the product cards
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/webp', 0.82));
  if (!blob || blob.type !== 'image/webp') {
    return { filename: file.name, data: await readFileAsDataUrl(file) }; // browser cannot encode WebP
  }
  return {
    filename: file.name.replace(/\.[^.]+$/, '') + '.webp',
    data: await readFileAsDataUrl(blob)
  };
}
