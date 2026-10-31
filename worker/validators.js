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

const ENQUIRY_TYPES = ['Product Enquiry', 'Dealership', 'Bulk Order', 'Agronomic Advisory', 'Other'];

/** Returns { error } or { value } with the cleaned-up enquiry fields. */
function parseEnquiry(body) {
  if (!isObject(body)) return { error: 'Invalid request' };
  const text = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

  const name = text(body.name, 100);
  const phone = text(body.phone, 20).replace(/[\s\-()]/g, '');
  const email = text(body.email, 150);
  const message = text(body.message, 2000);

  if (name.length < 2) return { error: 'Please enter your full name.' };
  if (!/^(\+91|91|0)?[6-9]\d{9}$/.test(phone)) return { error: 'Please enter a valid 10-digit mobile number.' };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Please enter a valid email address.' };
  if (message.length < 8) return { error: 'Please provide a little more detail (min 8 characters).' };

  return {
    value: {
      name,
      phone,
      email,
      location: text(body.location, 150),
      type: ENQUIRY_TYPES.includes(body.type) ? body.type : 'Other',
      message
    }
  };
}

export { validateProducts, validateGallery, validateConfig, parseEnquiry };
