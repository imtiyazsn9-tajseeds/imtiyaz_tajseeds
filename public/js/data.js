/**
 * TAJ SEEDS AGRI SCIENCES
 * Data access layer. The JSON files in /data are the single source of truth
 * for products, gallery and site settings; the admin panel writes them.
 */

const TajData = (() => {
  const cache = {};

  function load(name) {
    if (!cache[name]) {
      cache[name] = fetch(`data/${name}.json`, { cache: 'no-cache' })
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

  return {
    products: () => load('products'),
    gallery: () => load('gallery'),
    config: () => load('site-config')
  };
})();
