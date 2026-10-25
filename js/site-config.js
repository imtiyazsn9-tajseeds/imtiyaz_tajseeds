/**
 * TAJ SEEDS AGRI SCIENCES (PVT. LTD.)
 * MASTER SITE CONFIGURATION
 * Auto-saved from Admin Panel on 2026-10-25T15:23:09.811Z
 */

const SITE_CONFIG = {
  "company": {
    "brandName": "Taj Seeds Agri Sciences",
    "legalName": "Taj Seeds Agri Sciences Pvt. Ltd.",
    "tagline": "Every Step with Farmer",
    "taglineHindi": "",
    "foundedYear": 1980,
    "corporateYear": 2015,
    "logoPath": "assets/logo.svg",
    "phone1": "9263714728",
    "phone1Raw": "9263714728",
    "phone2": "+91 9113409962",
    "phone2Raw": "+919113409962",
    "whatsapp": "9263714728",
    "whatsappMessage": "Hello Taj Seeds Agri Sciences, I would like to inquire about your hybrid seed products.",
    "email": "tajseeds15@gmail.com",
    "address": {
      "full": "Plot No. 57 & 58, Flat No. 03, Kurish Homes, Medchal, Hyderabad - 501401"
    },
    "googleMapUrl": "https://maps.google.com/maps?q=Medchal,%20Hyderabad,%20Telangana%20501401&t=&z=13&ie=UTF8&iwloc=&output=embed"
  },
  "social": {
    "whatsapp": "https://wa.me/9263714728",
    "email": "mailto:tajseeds15@gmail.com",
    "phone": "tel:9263714728"
  }
};

// Auto-sync function to update elements across any page automatically
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-bind="phone1"]').forEach(el => {
    el.textContent = SITE_CONFIG.company.phone1;
    if (el.tagName === 'A') el.href = `tel:${SITE_CONFIG.company.phone1Raw}`;
  });

  document.querySelectorAll('[data-bind="phone2"]').forEach(el => {
    el.textContent = SITE_CONFIG.company.phone2;
    if (el.tagName === 'A') el.href = `tel:${SITE_CONFIG.company.phone2Raw}`;
  });

  document.querySelectorAll('[data-bind="email"]').forEach(el => {
    el.textContent = SITE_CONFIG.company.email;
    if (el.tagName === 'A') el.href = `mailto:${SITE_CONFIG.company.email}`;
  });

  document.querySelectorAll('[data-bind="address"]').forEach(el => {
    el.textContent = SITE_CONFIG.company.address.full;
  });

  document.querySelectorAll('[data-bind="tagline"]').forEach(el => {
    el.textContent = `"${SITE_CONFIG.company.tagline}"`;
  });

  const floatingWa = document.querySelector('.floating-whatsapp');
  if (floatingWa) {
    floatingWa.href = `https://wa.me/${SITE_CONFIG.company.whatsapp}?text=${encodeURIComponent(SITE_CONFIG.company.whatsappMessage)}`;
  }
});
