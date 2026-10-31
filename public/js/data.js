/**
 * TAJ SEEDS AGRI SCIENCES
 * Data access layer. The JSON files in /data are the single source of truth
 * for products, gallery and site settings; the admin panel writes them.
 */

const TajData = (() => {
  const cache = {};

  function load(name) {
    if (!cache[name]) {
      cache[name] = fetch(`data/${name}.json`)
        .then(res => {
          if (!res.ok) throw new Error(`Could not load ${name} (${res.status})`);
          return res.json();
        })
        .catch(err => {
          delete cache[name];
          throw err;
        });
    }
    return cache[name];
  }

  const api = {
    products: () => load('products'),
    gallery: () => load('gallery'),
    config: () => load('site-config'),

    /** Replaces a grid with a friendly message and a retry button (used when data cannot be loaded). */
    showError(container, what) {
      container.innerHTML = `
        <div class="load-error">
          <p>${what} could not be loaded. Please check your internet connection.</p>
          <button type="button" class="btn btn-primary btn-sm" onclick="location.reload()">Try again</button>
        </div>`;
    }
  };

  // Start downloading this page's data right away, while the rest of the page is still loading
  const page = location.pathname.split('/').pop() || 'index.html';
  api.config().catch(() => {});
  if (page === 'index.html' || page === 'products.html') api.products().catch(() => {});
  if (page === 'gallery.html') api.gallery().catch(() => {});

  return api;
})();
