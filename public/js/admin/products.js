/** All Seeds Catalog + Home Page Seeds tabs: list, featured selector, add/edit/delete form. */

import { $, escapeHtml, imgSrc, openModal, closeModal, FALLBACK_IMAGE } from './ui.js';
import { state, markUnsaved } from './state.js';
import { createImagePicker } from './image-picker.js';

const CATEGORY_LABELS = {
  maize: 'Hybrid Maize (मक्का)',
  paddy: 'Paddy / Rice (धान)',
  sorghum: 'Sorghum (ज्वार / चरी)',
  vegetables: 'Hybrid Vegetables (सब्जियां)'
};

const ICON_EDIT = '<svg class="icon-svg" style="width: 12px; height: 12px;" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>';
const ICON_DELETE = '<svg class="icon-svg" style="width: 12px; height: 12px; fill: #B91C1C;" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>';

let picker;

/** Mini version of the website's product card, refreshed while the form is edited. */
function updatePreview() {
  const val = id => $(id).value.trim();
  $('productPreview').innerHTML = `
    <img src="${escapeHtml(imgSrc(val('prodImage')) || FALLBACK_IMAGE)}" alt="" data-fallback>
    <div style="min-width: 0;">
      <span class="preview-badge">${escapeHtml(val('prodBadge') || 'Authentic Hybrid')}</span>
      <h4 style="margin: 6px 0 0; color: var(--color-forest-dark);">${escapeHtml(val('prodName') || 'Product name')}</h4>
      <div style="font-size: 0.82rem; color: var(--color-leaf-green); font-weight: 600;">${escapeHtml(val('prodHindiName'))}</div>
      <p style="margin: 4px 0; font-size: 0.8rem; color: #4B5563;">${escapeHtml(val('prodDesc').slice(0, 110))}${val('prodDesc').length > 110 ? '…' : ''}</p>
      <div style="font-size: 0.78rem; color: #374151;">Maturity: ${escapeHtml(val('prodMaturity') || '-')} &nbsp;·&nbsp; Pack: ${escapeHtml(val('prodPackaging') || 'Official Sealed Pack')}</div>
    </div>`;
}

function productImg(p, cls) {
  return `<img src="${escapeHtml(imgSrc(p.image))}" alt="${escapeHtml(p.name)}" class="${cls}" data-fallback>`;
}

function renderFeaturedSelector() {
  const selected = state.products.filter(p => p.featuredOnHome).length;
  $('featuredCounter').textContent = `${selected} Seeds Selected for Home Page`;

  $('homeFeaturedSelectorGrid').innerHTML = state.products.map((p, idx) => `
    <div class="featured-selector-card ${p.featuredOnHome ? 'is-featured' : ''}" data-action="toggle-featured" data-index="${idx}">
      <span class="featured-status-pill ${p.featuredOnHome ? 'active' : 'inactive'}">
        ${p.featuredOnHome ? 'On Home Page' : '+ Add to Home'}
      </span>
      ${productImg(p, 'featured-card-img')}
      <h4 style="margin: 0 0 2px; font-size: 1.05rem; color: var(--color-forest-dark);">${escapeHtml(p.name)}</h4>
      <span style="font-size: 0.8rem; color: var(--color-leaf-green); font-weight: 600; margin-bottom: 6px;">${escapeHtml(p.hindiName)}</span>
      <span style="font-size: 0.75rem; background: #EEF5E7; padding: 2px 8px; border-radius: 4px; color: var(--color-forest-dark);">${escapeHtml(p.categoryLabel || p.category)}</span>
      <button type="button" class="btn btn-sm ${p.featuredOnHome ? 'btn-primary' : 'btn-outline-forest'}" style="margin-top: 14px; width: 100%; pointer-events: none; font-size: 0.8rem; padding: 6px;">
        ${p.featuredOnHome ? 'Showing on Home' : 'Add to Home'}
      </button>
    </div>`).join('');
}

function renderTable() {
  $('productsTableBody').innerHTML = state.products.map((p, idx) => `
    <tr>
      <td>${productImg(p, 'product-row-img')}</td>
      <td>
        <strong>${escapeHtml(p.name)}</strong><br>
        <span style="font-size: 0.8rem; color: var(--color-leaf-green);">${escapeHtml(p.hindiName)}</span>
      </td>
      <td><span style="font-size: 0.85rem; background: #EEF5E7; padding: 4px 8px; border-radius: 4px;">${escapeHtml(p.categoryLabel || p.category)}</span></td>
      <td>
        <button class="action-btn ${p.featuredOnHome ? 'action-edit' : ''}" style="${p.featuredOnHome ? 'background:#DCFCE7;color:#166534;' : 'background:#F3F4F6;color:#6B7280;'}" data-action="toggle-featured" data-index="${idx}">
          ${p.featuredOnHome ? 'Home Page' : 'Not on Home'}
        </button>
      </td>
      <td style="font-size: 0.85rem;">${escapeHtml(p.maturity || '-')}</td>
      <td style="font-size: 0.85rem;">${escapeHtml(p.packaging || '-')}</td>
      <td>
        <div style="display: flex; gap: 6px;">
          <button class="action-btn action-edit" data-action="edit-product" data-index="${idx}">${ICON_EDIT} Edit</button>
          <button class="action-btn action-delete" data-action="delete-product" data-index="${idx}">${ICON_DELETE} Delete</button>
        </div>
      </td>
    </tr>`).join('');
}

function render() {
  renderTable();
  renderFeaturedSelector();
}

// ----- Modal -----

const overlay = () => $('productModalOverlay');
const form = () => $('productForm');

function openProductModal(index = null) {
  const isEdit = index !== null;
  $('modalTitle').textContent = isEdit ? 'Edit Seed Product' : 'Add New Seed Product';
  $('prodEditId').value = isEdit ? index : '';
  picker.resetStatus();

  if (isEdit) {
    const p = state.products[index];
    $('prodName').value = p.name;
    $('prodHindiName').value = p.hindiName || '';

    const select = $('prodCategory');
    select.value = p.category;
    if (select.value !== p.category) {
      // Unknown category: keep it selectable so saving does not silently change it
      select.add(new Option(p.categoryLabel || p.category, p.category));
      select.value = p.category;
    }

    $('prodBadge').value = p.badge || '';
    $('prodMaturity').value = p.maturity || '';
    $('prodPackaging').value = p.packaging || '';
    $('prodDesc').value = p.description || '';
    $('prodTagline').value = p.tagline || '';
    $('prodSecurity').value = p.security || '';
    $('prodFeatures').value = (p.features || []).join('\n');
    $('prodFeaturedOnHome').checked = Boolean(p.featuredOnHome);
    picker.setPath(p.image);
  } else {
    form().reset();
    $('prodFeaturedOnHome').checked = true;
    picker.setPath('');
    $('modalImgPreview').src = FALLBACK_IMAGE;
  }
  updatePreview();
  openModal(overlay());
}

function uniqueId(base) {
  let id = base || 'product';
  let n = 2;
  while (state.products.some(p => p.id === id)) id = `${base}-${n++}`;
  return id;
}

function submitProduct(e) {
  e.preventDefault();
  if (picker.isUploading()) {
    alert('Photo abhi upload ho rahi hai, kripya 1-2 second ruk kar dobara "Save Product" dabayein.');
    return;
  }

  const editIdx = $('prodEditId').value;
  const isEdit = editIdx !== '';
  const existing = isEdit ? state.products[Number(editIdx)] : null;
  const category = $('prodCategory').value;
  const name = $('prodName').value.trim();
  const keepsLabel = existing && existing.category === category;

  // Start from the existing product so fields without a form input (accent, grainType, ...) survive an edit
  const product = {
    ...existing,
    id: existing && existing.id ? existing.id : name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    name,
    hindiName: $('prodHindiName').value.trim(),
    type: (keepsLabel && existing.type) || CATEGORY_LABELS[category] || 'Hybrid Seeds',
    category,
    categoryLabel: (keepsLabel && existing.categoryLabel) || CATEGORY_LABELS[category] || 'Hybrid Seeds',
    badge: $('prodBadge').value.trim() || 'Authentic Hybrid',
    image: $('prodImage').value.trim(),
    packaging: $('prodPackaging').value.trim() || 'Official Sealed Pack',
    maturity: $('prodMaturity').value.trim(),
    description: $('prodDesc').value.trim(),
    featuredOnHome: $('prodFeaturedOnHome').checked
  };

  // Optional fields: stored only when filled in, removed when cleared
  const optional = {
    tagline: $('prodTagline').value.trim(),
    security: $('prodSecurity').value.trim(),
    features: $('prodFeatures').value.split('\n').map(s => s.trim()).filter(Boolean)
  };
  for (const [key, value] of Object.entries(optional)) {
    if (value.length) product[key] = value; else delete product[key];
  }

  if (isEdit) {
    state.products[Number(editIdx)] = product;
  } else {
    product.id = uniqueId(product.id); // Quick View finds products by id
    state.products.push(product);
  }

  render();
  closeModal(overlay());
  markUnsaved();
}

export function initProducts() {
  picker = createImagePicker({
    scope: 'products',
    folder: 'products',
    ids: {
      path: 'prodImage',
      preview: 'modalImgPreview',
      strip: 'existingThumbsStrip',
      file: 'prodImageFileInput',
      upload: 'triggerUploadBtn',
      badge: 'uploadStatusBadge'
    }
  });
  picker.refresh();
  render();

  // Broken product photos fall back to the logo (error events do not bubble, so capture them)
  document.addEventListener('error', e => {
    if (e.target.matches && e.target.matches('img[data-fallback]') && !e.target.src.endsWith(FALLBACK_IMAGE)) {
      e.target.src = FALLBACK_IMAGE;
    }
  }, true);

  const actions = {
    'toggle-featured': index => {
      state.products[index].featuredOnHome = !state.products[index].featuredOnHome;
      render();
      markUnsaved();
    },
    'edit-product': index => openProductModal(index),
    'delete-product': index => {
      if (!confirm(`Kya aap "${state.products[index].name}" ko delete karna chahte hain?`)) return;
      state.products.splice(index, 1);
      render();
      markUnsaved();
    }
  };

  for (const container of [$('homeFeaturedSelectorGrid'), $('productsTableBody')]) {
    container.addEventListener('click', e => {
      const el = e.target.closest('[data-action]');
      if (el && actions[el.dataset.action]) actions[el.dataset.action](Number(el.dataset.index));
    });
  }

  $('addNewProductBtn').addEventListener('click', () => openProductModal());
  $('closeModalBtn').addEventListener('click', () => closeModal(overlay()));
  $('cancelModalBtn').addEventListener('click', () => closeModal(overlay()));
  form().addEventListener('submit', submitProduct);
  form().addEventListener('input', updatePreview);
  form().addEventListener('picker:change', updatePreview);
}
