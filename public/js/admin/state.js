/** Shared admin data plus the "unsaved changes" flag. */

import { $ } from './ui.js';

export const state = {
  products: [],
  gallery: [],
  config: {},
  versions: {} // fingerprints of the saved data we loaded, to detect other people's saves
};

let dirty = false;

export function markUnsaved() {
  dirty = true;
  $('unsavedAlert').style.display = 'flex';
}

export function clearUnsaved() {
  dirty = false;
  $('unsavedAlert').style.display = 'none';
}

window.addEventListener('beforeunload', e => {
  if (dirty) {
    e.preventDefault();
    e.returnValue = '';
  }
});
