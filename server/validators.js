'use strict';

/** Input validation. Each validator returns an error message, or null when the input is valid. */

const isObject = v => v !== null && typeof v === 'object' && !Array.isArray(v);
const isText = (v, max = 5000) => typeof v === 'string' && v.length <= max;

function validateProducts(list) {
  if (!Array.isArray(list)) return 'products must be an array';
  if (list.length > 500) return 'too many products';
  const ids = new Set();
  for (const [i, p] of list.entries()) {
    const label = `product #${i + 1}`;
    if (!isObject(p)) return `${label} must be an object`;
    for (const key of ['id', 'name', 'category', 'image']) {
      if (!isText(p[key], 300) || !p[key].trim()) return `${label}: "${key}" is required`;
    }
    if (ids.has(p.id)) return `${label}: duplicate id "${p.id}"`;
    ids.add(p.id);
    for (const key of ['hindiName', 'type', 'categoryLabel', 'badge', 'packaging', 'maturity', 'description', 'tagline', 'security']) {
      if (p[key] !== undefined && !isText(p[key])) return `${label}: "${key}" must be text`;
    }
    if (p.features !== undefined && (!Array.isArray(p.features) || !p.features.every(f => isText(f, 500)))) {
      return `${label}: "features" must be a list of text`;
    }
  }
  return null;
}

function validateGallery(list) {
  if (!Array.isArray(list)) return 'gallery must be an array';
  if (list.length > 1000) return 'too many gallery items';
  for (const [i, item] of list.entries()) {
    if (!isObject(item)) return `gallery item #${i + 1} must be an object`;
    if (!isText(item.title, 300) || !item.title.trim()) return `gallery item #${i + 1}: "title" is required`;
    if (!isText(item.image, 300) || !item.image.trim()) return `gallery item #${i + 1}: "image" is required`;
  }
  return null;
}

function validateConfig(cfg) {
  if (!isObject(cfg) || !isObject(cfg.company)) return 'config.company is required';
  for (const key of ['phone1', 'phone2', 'whatsapp', 'email', 'tagline']) {
    if (cfg.company[key] !== undefined && !isText(cfg.company[key], 300)) return `config.company.${key} must be text`;
  }
  return null;
}

module.exports = { validateProducts, validateGallery, validateConfig };
