/** Admin panel entry point: decides between login and dashboard, then wires the feature modules. */

import { api, onUnauthorized } from './api.js';
import { $ } from './ui.js';
import { state, clearUnsaved } from './state.js';
import { initAuth, showLogin, showDashboard } from './auth.js';
import { initTabs } from './tabs.js';
import { initProducts } from './products.js';
import { initGallery } from './gallery.js';
import { initSettings, collectConfig } from './settings.js';
import { initEnquiries } from './enquiries.js';
import { initBackups } from './backups.js';

let dashboardReady = false;

async function startDashboard() {
  if (!dashboardReady) {
    // Versions first: if someone saves in between, our save is refused instead of overwriting theirs
    state.versions = await api.versions();
    Object.assign(state, await api.loadContent());
    initTabs();
    initProducts();
    initGallery();
    initSettings();
    initEnquiries();
    initBackups();
    $('saveAllBtn').addEventListener('click', saveAll);
    document.querySelectorAll('.save-trigger-btn').forEach(btn => btn.addEventListener('click', saveAll));
    dashboardReady = true;
  }
  showDashboard();
}

async function saveAll() {
  try {
    const config = collectConfig();
    const result = await api.saveContent({ products: state.products, gallery: state.gallery, config, base: state.versions });
    state.versions = result.versions;
    state.config = config;
    clearUnsaved();

    const banner = $('saveAlert');
    banner.style.display = 'flex';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => { banner.style.display = 'none'; }, 6000);
  } catch (err) {
    alert(`Error saving data: ${err.message}`);
  }
}

async function boot() {
  onUnauthorized(() => showLogin('Session khatam ho gaya hai, kripya dobara login karein.'));
  initAuth({ onLogin: startDashboard });

  if (await api.hasSession()) {
    try {
      await startDashboard();
      return;
    } catch (err) {
      console.error(err);
    }
  }
  showLogin();
}

boot();
