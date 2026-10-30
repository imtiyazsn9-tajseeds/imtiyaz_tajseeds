/**
 * TAJ SEEDS AGRI SCIENCES (PVT. LTD.)
 * Fills contact details (phone, email, address, tagline, WhatsApp link) into
 * any element marked with data-bind="...", using data/site-config.json.
 */

document.addEventListener('DOMContentLoaded', async () => {
  let company;
  try {
    company = (await TajData.config()).company;
  } catch (err) {
    console.error(err);
    return; // The static text already in the page is used instead
  }

  document.querySelectorAll('[data-bind="phone1"]').forEach(el => {
    el.textContent = company.phone1;
    if (el.tagName === 'A') el.href = `tel:${company.phone1Raw}`;
  });

  document.querySelectorAll('[data-bind="phone2"]').forEach(el => {
    el.textContent = company.phone2;
    if (el.tagName === 'A') el.href = `tel:${company.phone2Raw}`;
  });

  document.querySelectorAll('[data-bind="email"]').forEach(el => {
    el.textContent = company.email;
    if (el.tagName === 'A') el.href = `mailto:${company.email}`;
  });

  document.querySelectorAll('[data-bind="address"]').forEach(el => {
    el.textContent = company.address.full;
  });

  document.querySelectorAll('[data-bind="tagline"]').forEach(el => {
    el.textContent = `"${company.tagline}"`;
  });

  const floatingWa = document.querySelector('.floating-whatsapp');
  if (floatingWa) {
    floatingWa.href = `https://wa.me/${company.whatsapp}?text=${encodeURIComponent(company.whatsappMessage)}`;
  }
});
