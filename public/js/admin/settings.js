/** Contact & Info tab: loads company details into the form and reads them back for saving. */

import { $ } from './ui.js';
import { state } from './state.js';

const FIELDS = {
  phone1: 'cfgPhone1',
  phone2: 'cfgPhone2',
  whatsapp: 'cfgWhatsapp',
  email: 'cfgEmail',
  tagline: 'cfgTagline',
  taglineHindi: 'cfgTaglineHindi'
};

export function initSettings() {
  const company = state.config.company || {};
  for (const [key, id] of Object.entries(FIELDS)) $(id).value = company[key] || '';
  $('cfgAddressFull').value = (company.address && company.address.full) || '';
}

/** Builds the config to save: form values layered over whatever else the file already holds. */
export function collectConfig() {
  const digits = value => value.replace(/[^0-9]/g, '');
  const phone1 = $('cfgPhone1').value;
  const phone2 = $('cfgPhone2').value;
  const whatsapp = digits($('cfgWhatsapp').value);
  const email = $('cfgEmail').value;

  return {
    ...state.config,
    company: {
      ...state.config.company,
      tagline: $('cfgTagline').value,
      taglineHindi: $('cfgTaglineHindi').value,
      phone1,
      phone1Raw: phone1.replace(/[^0-9+]/g, ''),
      phone2,
      phone2Raw: phone2.replace(/[^0-9+]/g, ''),
      whatsapp,
      email,
      address: { ...(state.config.company || {}).address, full: $('cfgAddressFull').value }
    },
    social: {
      whatsapp: `https://wa.me/${whatsapp}`,
      email: `mailto:${email}`,
      phone: `tel:${phone1.replace(/[^0-9+]/g, '')}`
    }
  };
}
