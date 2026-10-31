/**
 * TAJ SEEDS AGRI SCIENCES (PVT. LTD.)
 * Fills contact details into the page from data/site-config.json (edited in the admin panel),
 * so every phone number, WhatsApp link, email and address on the site always agrees.
 *
 * Mark elements with data-bind:
 *   phone1 / phone2            text + tel: link (a <span>/<strong> only gets the text)
 *   phone1-link / phone2-link  tel: link only, keeps the element's own label
 *   whatsapp                   wa.me link; optional data-wa-text="pre-filled message"
 *   email, address, tagline    text (and mailto: for links)
 *   data-prefix="Call "        text placed before the bound text
 */

const SiteConfig = {
  /** 10-digit Indian numbers get the +91 country code; anything else is used as typed. */
  displayPhone(value) {
    const v = String(value || '').trim();
    return /^\d{10}$/.test(v) ? `+91 ${v}` : v;
  },
  telHref(value) {
    const digits = String(value || '').replace(/[^0-9+]/g, '');
    return `tel:${/^\d{10}$/.test(digits) ? '+91' + digits : digits}`;
  },
  whatsappUrl(number, text) {
    const digits = String(number || '').replace(/[^0-9]/g, '');
    const full = digits.length === 10 ? `91${digits}` : digits;
    return `https://wa.me/${full}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  let company;
  try {
    company = (await TajData.config()).company;
  } catch (err) {
    console.error(err);
    return; // The static text already in the page is used instead
  }

  const bind = (name, apply) => document.querySelectorAll(`[data-bind="${name}"]`).forEach(apply);
  const withPrefix = (el, text) => (el.dataset.prefix || '') + text;

  for (const key of ['phone1', 'phone2']) {
    const number = company[key];
    bind(key, el => {
      el.textContent = withPrefix(el, SiteConfig.displayPhone(number));
      if (el.tagName === 'A') el.href = SiteConfig.telHref(number);
    });
    bind(`${key}-link`, el => { el.href = SiteConfig.telHref(number); });
  }

  bind('whatsapp', el => {
    el.href = SiteConfig.whatsappUrl(company.whatsapp, el.dataset.waText || company.whatsappMessage);
  });

  bind('email', el => {
    el.textContent = company.email;
    if (el.tagName === 'A') el.href = `mailto:${company.email}`;
  });

  bind('address', el => { el.textContent = company.address.full; });
  bind('tagline', el => { el.textContent = `"${company.tagline}"`; });
});
