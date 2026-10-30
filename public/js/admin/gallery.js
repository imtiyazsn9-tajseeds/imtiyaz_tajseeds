/** Gallery Photos tab: filter, add/edit/delete photos. */

import { $, escapeHtml, imgSrc, openModal, closeModal, FALLBACK_IMAGE } from './ui.js';
import { state, markUnsaved } from './state.js';
import { createImagePicker } from './image-picker.js';

const STANDARD_LABELS = {
  farm: 'Farm & Trials',
  plant: 'Processing Plant',
  warehouse: 'Warehouse',
  packaging: 'Packaging & Security'
};

let picker;
let activeCategory = 'all';

const overlay = () => $('galleryModalOverlay');

function render() {
  const grid = $('galleryAdminGrid');
  const visible = state.gallery.filter(item => activeCategory === 'all' || item.category === activeCategory);
  $('galleryCountBadge').textContent = `Showing ${visible.length} of ${state.gallery.length} Photos`;

  if (visible.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; background: #fff; border-radius: 12px; border: 1px dashed var(--admin-border);">
        <h4 style="margin: 0 0 6px; color: var(--color-forest-dark); font-size: 1.1rem;">No Photos in this Category</h4>
        <p style="margin: 0 0 16px; color: #6B7280; font-size: 0.85rem;">Is section mein filhal koi photo nahi hai. Aap nayi photo jod sakte hain.</p>
        <button type="button" class="btn btn-primary btn-sm" data-action="add-photo">Add Photo to this Section</button>
      </div>`;
    return;
  }

  grid.innerHTML = visible.map(item => {
    const index = state.gallery.indexOf(item);
    return `
      <div class="gallery-admin-card">
        <div class="gallery-admin-thumb-wrap">
          <img src="${escapeHtml(imgSrc(item.image))}" alt="${escapeHtml(item.title)}" class="gallery-admin-thumb" data-fallback>
          <span class="gallery-admin-badge">${escapeHtml(item.categoryLabel || item.category)}</span>
        </div>
        <div class="gallery-admin-body">
          <h4 class="gallery-admin-title">${escapeHtml(item.title)}</h4>
          <p class="gallery-admin-desc">${escapeHtml(item.desc)}</p>
          <div class="gallery-admin-actions">
            <button type="button" class="action-btn action-edit" data-action="edit-photo" data-index="${index}" style="flex: 1; justify-content: center;">Edit / Change Photo</button>
            <button type="button" class="action-btn action-delete" data-action="delete-photo" data-index="${index}" title="Delete Photo">Delete</button>
          </div>
        </div>
      </div>`;
  }).join('');
}

function syncCustomCategory() {
  const isCustom = $('galleryCategory').value === 'custom';
  $('galleryCustomCategoryGroup').style.display = isCustom ? 'block' : 'none';
  $('galleryCustomCategoryInput').required = isCustom;
}

function openGalleryModal(index = null) {
  const isEdit = index !== null;
  $('galleryModalTitle').textContent = isEdit ? 'Edit Gallery Photo & Details' : 'Add New Gallery Photo';
  $('galleryEditId').value = isEdit ? index : '';
  picker.resetStatus();

  const select = $('galleryCategory');
  if (isEdit) {
    const item = state.gallery[index];
    $('galleryTitle').value = item.title;
    $('galleryDesc').value = item.desc || '';
    picker.setPath(item.image);
    if (STANDARD_LABELS[item.category]) {
      select.value = item.category;
      $('galleryCustomCategoryInput').value = '';
    } else {
      select.value = 'custom';
      $('galleryCustomCategoryInput').value = item.categoryLabel || item.category;
    }
  } else {
    $('galleryForm').reset();
    picker.setPath('');
    $('galleryModalImgPreview').src = FALLBACK_IMAGE;
    if (activeCategory !== 'all') select.value = activeCategory;
  }
  syncCustomCategory();
  openModal(overlay());
}

function submitPhoto(e) {
  e.preventDefault();
  if (picker.isUploading()) {
    alert('Photo abhi upload ho rahi hai, kripya 1-2 second ruk kar dobara "Save Gallery Photo" dabayein.');
    return;
  }

  const editIdx = $('galleryEditId').value;
  const isEdit = editIdx !== '';
  let category = $('galleryCategory').value;
  let categoryLabel = STANDARD_LABELS[category] || 'Facility & Operations';

  if (category === 'custom') {
    const custom = $('galleryCustomCategoryInput').value.trim() || 'Facility';
    category = custom.toLowerCase().replace(/[^a-z0-9]/g, '-');
    categoryLabel = custom;
  }

  const item = {
    id: isEdit ? state.gallery[Number(editIdx)].id : Date.now(),
    title: $('galleryTitle').value.trim(),
    category,
    categoryLabel,
    desc: $('galleryDesc').value.trim(),
    image: $('galleryImage').value.trim()
  };

  if (isEdit) state.gallery[Number(editIdx)] = item; else state.gallery.unshift(item);

  render();
  closeModal(overlay());
  markUnsaved();
}

export function initGallery() {
  picker = createImagePicker({
    scope: 'gallery',
    folder: 'gallery',
    ids: {
      path: 'galleryImage',
      preview: 'galleryModalImgPreview',
      strip: 'existingGalleryThumbsStrip',
      file: 'galleryImageFileInput',
      upload: 'triggerGalleryUploadBtn',
      badge: 'galleryUploadStatusBadge'
    }
  });
  picker.refresh();
  render();

  const pills = document.querySelectorAll('#galleryAdminFilterPills .gallery-filter-pill');
  pills.forEach(pill => pill.addEventListener('click', () => {
    pills.forEach(p => p.classList.remove('is-active'));
    pill.classList.add('is-active');
    activeCategory = pill.dataset.cat;
    render();
  }));

  $('galleryAdminGrid').addEventListener('click', e => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const index = Number(el.dataset.index);
    if (el.dataset.action === 'add-photo') openGalleryModal();
    if (el.dataset.action === 'edit-photo') openGalleryModal(index);
    if (el.dataset.action === 'delete-photo') {
      if (!confirm(`Kya aap "${state.gallery[index].title}" photo ko gallery se hatana chahte hain?`)) return;
      state.gallery.splice(index, 1);
      render();
      markUnsaved();
    }
  });

  $('galleryCategory').addEventListener('change', syncCustomCategory);
  $('addNewGalleryBtn').addEventListener('click', () => openGalleryModal());
  $('closeGalleryModalBtn').addEventListener('click', () => closeModal(overlay()));
  $('cancelGalleryModalBtn').addEventListener('click', () => closeModal(overlay()));
  $('galleryForm').addEventListener('submit', submitPhoto);
}
