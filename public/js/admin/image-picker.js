/**
 * Photo field used by both the product and gallery forms: preview, upload from
 * computer, pick from existing photos, or type a path.
 */

import { api } from './api.js';
import { state } from './state.js';
import { $, escapeHtml, imgSrc, prepareImage, setStatus, FALLBACK_IMAGE } from './ui.js';

export function createImagePicker({ scope, folder, ids }) {
  const pathInput = $(ids.path);
  const preview = $(ids.preview);
  const strip = $(ids.strip);
  const fileInput = $(ids.file);
  const badge = $(ids.badge);

  let images = [];
  let uploading = false;

  // A photo is "in use" if the saved site, or an edit that is not saved yet, still points at it
  const isInUse = img => img.inUse || pathInput.value === img.path ||
    state.products.some(p => p.image === img.path) || state.gallery.some(g => g.image === img.path);

  function renderStrip() {
    strip.innerHTML = images.map((img, i) => `
      <div class="thumb-wrap">
        <button type="button" class="existing-thumb-btn ${img.path === pathInput.value ? 'is-selected' : ''}" data-index="${i}" title="${escapeHtml(img.filename)}">
          <img src="${escapeHtml(imgSrc(img.path))}" alt="${escapeHtml(img.filename)}" loading="lazy">
        </button>
        ${(img.deletable && !isInUse(img)) ? `<button type="button" class="thumb-delete" data-delete="${i}" title="Ye photo kahin use nahi ho rahi - delete karein" aria-label="Delete unused photo">&times;</button>` : ''}
      </div>`).join('');
  }

  function setPath(path) {
    pathInput.value = path;
    preview.src = imgSrc(path);
    renderStrip();
    pathInput.dispatchEvent(new CustomEvent('picker:change', { bubbles: true }));
  }

  async function refresh() {
    try {
      images = await api.listImages(scope);
    } catch (err) {
      console.error('Could not load images:', err);
    }
    renderStrip();
  }

  strip.addEventListener('click', async e => {
    const del = e.target.closest('[data-delete]');
    if (del) {
      const img = images[Number(del.dataset.delete)];
      if (!confirm(`"${img.filename}" photo hamesha ke liye delete karein?`)) return;
      try {
        await api.deleteImage(img.path);
        if (pathInput.value === img.path) setPath('');
        await refresh();
      } catch (err) {
        alert(err.message);
      }
      return;
    }
    const btn = e.target.closest('.existing-thumb-btn');
    if (btn) setPath(images[Number(btn.dataset.index)].path);
  });

  pathInput.addEventListener('input', () => {
    preview.src = imgSrc(pathInput.value);
    renderStrip();
    pathInput.dispatchEvent(new CustomEvent('picker:change', { bubbles: true }));
  });

  preview.addEventListener('error', () => {
    if (!preview.src.endsWith(FALLBACK_IMAGE)) preview.src = FALLBACK_IMAGE;
  });

  $(ids.upload).addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', async () => {
    const file = fileInput.files[0];
    if (!file) return;

    uploading = true;
    setStatus(badge, 'Uploading...', 'busy');
    try {
      const { filename, data } = await prepareImage(file);
      preview.src = data;
      const result = await api.uploadImage({ filename, data, folder });
      setPath(result.imagePath);
      setStatus(badge, 'Uploaded successfully!', 'ok');
      await refresh();
    } catch (err) {
      setStatus(badge, `Upload failed: ${err.message}`, 'error');
    } finally {
      uploading = false;
      fileInput.value = '';
    }
  });

  return {
    refresh,
    setPath,
    isUploading: () => uploading,
    resetStatus: () => { badge.style.display = 'none'; }
  };
}
