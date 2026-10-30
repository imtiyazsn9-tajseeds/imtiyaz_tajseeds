/**
 * Photo field used by both the product and gallery forms: preview, upload from
 * computer, pick from existing photos, or type a path.
 */

import { api } from './api.js';
import { $, escapeHtml, imgSrc, readFileAsDataUrl, setStatus, FALLBACK_IMAGE } from './ui.js';

export function createImagePicker({ scope, folder, ids }) {
  const pathInput = $(ids.path);
  const preview = $(ids.preview);
  const strip = $(ids.strip);
  const fileInput = $(ids.file);
  const badge = $(ids.badge);

  let images = [];
  let uploading = false;

  function renderStrip() {
    strip.innerHTML = images.map((img, i) => `
      <button type="button" class="existing-thumb-btn ${img.path === pathInput.value ? 'is-selected' : ''}" data-index="${i}" title="${escapeHtml(img.filename)}">
        <img src="${escapeHtml(imgSrc(img.path))}" alt="${escapeHtml(img.filename)}">
      </button>`).join('');
  }

  function setPath(path) {
    pathInput.value = path;
    preview.src = imgSrc(path);
    renderStrip();
  }

  async function refresh() {
    try {
      images = await api.listImages(scope);
    } catch (err) {
      console.error('Could not load images:', err);
    }
    renderStrip();
  }

  strip.addEventListener('click', e => {
    const btn = e.target.closest('.existing-thumb-btn');
    if (btn) setPath(images[Number(btn.dataset.index)].path);
  });

  pathInput.addEventListener('input', () => { preview.src = imgSrc(pathInput.value); });

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
      const data = await readFileAsDataUrl(file);
      preview.src = data;
      const result = await api.uploadImage({ filename: file.name, data, folder });
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
