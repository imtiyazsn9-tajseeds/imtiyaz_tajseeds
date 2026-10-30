/**
 * TAJ SEEDS AGRI SCIENCES
 * Dynamic Home Page Featured Products Controller
 * Renders the products marked as 'featuredOnHome' (or first 4)
 */

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('homeFeaturedProductsGrid');
  if (!container) return;

  let TAJ_PRODUCTS;
  try {
    TAJ_PRODUCTS = await TajData.products();
  } catch (err) {
    console.error(err);
    container.innerHTML = '<p style="text-align:center;grid-column:1/-1;">Products could not be loaded. Please refresh the page.</p>';
    return;
  }

  const featured = TAJ_PRODUCTS.filter(p => p.featuredOnHome);
  const productsToDisplay = featured.length > 0 ? featured : TAJ_PRODUCTS.slice(0, 4);

  container.innerHTML = productsToDisplay.map((p, idx) => {
    const badgeColor = p.accent === 'Red' ? '#D7262E' : 
                       (p.accent === 'Green' ? 'var(--color-leaf-green)' : 
                       (p.accent === 'Blue' ? '#1F4E9C' : 'var(--color-forest-deep)'));
    
    return `
      <article class="product-card reveal reveal-scale delay-${(idx % 4) + 1}">
        <div class="product-card-topbar">
          <span class="product-badge" style="background: ${badgeColor};">${p.badge || 'Top Class Quality'}</span>
          <span class="product-category-tag">${p.categoryLabel || p.category}</span>
        </div>
        <div class="product-thumb-wrapper">
          <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.src='assets/logo.png'">
        </div>
        <div class="product-body">
          <h3 class="product-title" style="margin-bottom: 2px;">${p.name}</h3>
          <span style="font-size: 0.85rem; color: var(--color-leaf-green); font-weight: 600;">${p.hindiName || ''}</span>
          <p class="product-botanical" style="color: var(--color-text-muted); font-size: 0.85rem; margin-top: 4px;">${p.type || ''}</p>
          <p class="product-desc">${p.description || ''}</p>
          <div class="product-specs-list" style="background: #F9FAF5; border-radius: 8px; padding: 8px 12px; margin-bottom: 16px;">
            <div class="spec-row"><span class="spec-key">Maturity:</span><span class="spec-val">${p.maturity || '-'}</span></div>
            <div class="spec-row"><span class="spec-key">Pack Size:</span><span class="spec-val">${p.packaging || '-'}</span></div>
            ${p.security ? `<div class="spec-row"><span class="spec-key">Security:</span><span class="spec-val" style="color: #D7262E;">${p.security}</span></div>` : ''}
          </div>
          <div class="product-footer">
            <a href="contact.html?product=${encodeURIComponent(p.name)}" class="btn btn-primary">Enquire Now</a>
            <a href="products.html" class="btn btn-outline-forest">All Seeds</a>
          </div>
        </div>
      </article>
    `;
  }).join('\n');

  if (window.refreshScrollReveal) {
    window.refreshScrollReveal();
  }
});
