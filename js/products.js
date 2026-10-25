/**
 * TAJ SEEDS AGRI SCIENCES
 * Products Page Logic & Live Filter Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  const productsGrid = document.getElementById('productsGrid');
  const filterTabs = document.querySelectorAll('.filter-tab-btn');
  const searchInput = document.getElementById('productSearch');
  const modal = document.getElementById('productModal');
  const modalContent = document.getElementById('productModalBody');
  const modalCloseBtn = document.getElementById('modalCloseBtn');

  let activeCategory = 'all';
  let searchQuery = '';

  // Function to render products
  function renderProducts() {
    if (!productsGrid) return;

    const filtered = TAJ_PRODUCTS.filter(product => {
      const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        product.name.toLowerCase().includes(q) ||
        (product.hindiName && product.hindiName.toLowerCase().includes(q)) ||
        product.description.toLowerCase().includes(q) ||
        product.type.toLowerCase().includes(q) ||
        product.categoryLabel.toLowerCase().includes(q);
      
      return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
      productsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: #fff; border-radius: 16px; border: 1px solid var(--color-border); box-shadow: var(--shadow-sm);">
          <svg style="width: 56px; height: 56px; fill: var(--color-leaf-green); margin-bottom: 16px;" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <h3 style="font-size: 1.5rem; margin-bottom: 8px;">No Seeds Found</h3>
          <p style="color: var(--color-text-muted); max-width: 450px; margin: 0 auto 20px;">
            We couldn't find any seeds matching your search criteria. Try clearing your search query or selecting "All Seeds".
          </p>
          <button class="btn btn-primary btn-sm" id="resetFilterBtn">View All Products</button>
        </div>
      `;

      const resetBtn = document.getElementById('resetFilterBtn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          activeCategory = 'all';
          searchQuery = '';
          if (searchInput) searchInput.value = '';
          filterTabs.forEach(t => t.classList.toggle('is-active', t.dataset.category === 'all'));
          renderProducts();
        });
      }
      return;
    }

    productsGrid.innerHTML = filtered.map(item => `
      <article class="product-card reveal reveal-scale" data-id="${item.id}">
        <div class="product-card-topbar">
          <span class="product-badge">${item.badge}</span>
          <span class="product-category-tag">${item.categoryLabel}</span>
        </div>
        <div class="product-thumb-wrapper">
          <img src="${item.image}" alt="${item.name}" loading="lazy" onerror="this.src='assets/logo.svg'">
        </div>
        <div class="product-body">
          <div style="margin-bottom: 6px;">
            <h3 class="product-title" style="margin-bottom: 2px;">${item.name}</h3>
            <span style="font-size: 0.85rem; color: var(--color-leaf-green); font-weight: 600;">${item.hindiName || ''}</span>
          </div>
          <p class="product-botanical" style="color: var(--color-text-muted); font-size: 0.85rem; font-style: normal; font-weight: 500; margin-bottom: 10px;">
            ${item.type}
          </p>
          <p class="product-desc" style="font-size: 0.875rem; line-height: 1.6; color: var(--color-text-muted); margin-bottom: 16px;">
            ${item.description}
          </p>
          
          <div class="product-specs-list" style="background: #F9FAF5; border-radius: 8px; padding: 10px 12px; margin-bottom: 20px;">
            <div class="spec-row" style="padding: 4px 0; border-bottom: 1px dashed var(--color-border);">
              <span class="spec-key" style="font-size: 0.8rem; color: var(--color-text-muted);">Maturity:</span>
              <span class="spec-val" style="font-size: 0.8rem; font-weight: 600; color: var(--color-forest-dark);">${item.maturity}</span>
            </div>
            <div class="spec-row" style="padding: 4px 0; border-bottom: 1px dashed var(--color-border);">
              <span class="spec-key" style="font-size: 0.8rem; color: var(--color-text-muted);">Packaging:</span>
              <span class="spec-val" style="font-size: 0.8rem; font-weight: 600; color: var(--color-forest-dark);">${item.packaging}</span>
            </div>
            ${item.tagline ? `
            <div class="spec-row" style="padding: 4px 0;">
              <span class="spec-key" style="font-size: 0.8rem; color: var(--color-leaf-green); font-weight: 600;">Motto:</span>
              <span class="spec-val" style="font-size: 0.8rem; font-weight: 600; color: var(--color-leaf-green); font-style: italic;">${item.tagline}</span>
            </div>
            ` : (item.security ? `
            <div class="spec-row" style="padding: 4px 0;">
              <span class="spec-key" style="font-size: 0.8rem; color: #D7262E; font-weight: 600;">Security:</span>
              <span class="spec-val" style="font-size: 0.8rem; font-weight: 600; color: #D7262E;">${item.security}</span>
            </div>
            ` : '')}
          </div>

          <div class="product-footer" style="display: flex; gap: 10px;">
            <a href="contact.html?product=${encodeURIComponent(item.name)}" class="btn btn-primary" style="flex: 1; padding: 10px 14px; font-size: 0.85rem;">
              Enquire Now
              <svg style="width: 14px; height: 14px; fill: currentColor;" viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </a>
            <button class="btn btn-outline-forest quick-view-btn" data-id="${item.id}" title="Quick Specs" style="padding: 10px 14px; font-size: 0.85rem;">
              Quick View
            </button>
          </div>
        </div>
      </article>
    `).join('');

    // Attach quick view listeners
    document.querySelectorAll('.quick-view-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const prodId = e.currentTarget.dataset.id;
        openQuickViewModal(prodId);
      });
    });

    // Trigger scroll reveal update if function exists
    if (window.refreshScrollReveal) {
      window.refreshScrollReveal();
    }
  }

  // Quick View Modal
  function openQuickViewModal(id) {
    const product = TAJ_PRODUCTS.find(p => p.id === id);
    if (!product || !modal || !modalContent) return;

    modalContent.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1.25fr; gap: 28px; padding: 32px 30px;">
        <div style="background: linear-gradient(180deg, #FFFFFF 0%, #F5F9F2 100%); border-radius: var(--radius-md); padding: 24px; display: flex; align-items: center; justify-content: center; border: 1px solid var(--color-border);">
          <img src="${product.image}" alt="${product.name}" style="max-height: 280px; width: auto; object-fit: contain; filter: drop-shadow(0 10px 20px rgba(0,0,0,0.15));">
        </div>
        <div>
          <span style="display: inline-block; background: var(--color-leaf-green); color: #fff; font-size: 0.75rem; font-weight: 700; padding: 3px 10px; border-radius: 99px; margin-bottom: 8px;">
            ${product.badge}
          </span>
          <h2 style="font-size: 1.6rem; color: var(--color-forest-dark); margin-bottom: 2px;">${product.name}</h2>
          <p style="font-size: 0.95rem; font-weight: 600; color: var(--color-leaf-green); margin-bottom: 8px;">${product.hindiName || ''}</p>
          <p style="font-size: 0.85rem; font-weight: 600; color: var(--color-forest-green); margin-bottom: 14px;">${product.type}</p>
          <p style="font-size: 0.9rem; color: var(--color-text-muted); line-height: 1.6; margin-bottom: 18px;">${product.description}</p>
          
          <div style="background: var(--color-cream); border-radius: 8px; padding: 14px; margin-bottom: 20px; font-size: 0.85rem; border: 1px solid var(--color-border);">
            <p style="margin-bottom: 6px;"><strong>Category:</strong> ${product.categoryLabel}</p>
            <p style="margin-bottom: 6px;"><strong>Days to Maturity:</strong> ${product.maturity}</p>
            <p style="margin-bottom: 6px;"><strong>Packaging:</strong> ${product.packaging}</p>
            ${product.grainType ? `<p style="margin-bottom: 6px;"><strong>Grain Profile:</strong> ${product.grainType}</p>` : ''}
            ${product.security ? `<p style="color: #D7262E;"><strong>Security:</strong> ${product.security}</p>` : ''}
            ${product.tagline ? `<p style="color: var(--color-leaf-green); font-style: italic; font-weight: 600;">"${product.tagline}"</p>` : ''}
          </div>

          ${product.features && product.features.length ? `
          <ul style="margin: 0 0 20px 18px; font-size: 0.825rem; color: var(--color-text-muted); line-height: 1.6;">
            ${product.features.map(f => `<li>${f}</li>`).join('')}
          </ul>
          ` : ''}

          <div style="display: flex; gap: 12px;">
            <a href="contact.html?product=${encodeURIComponent(product.name)}" class="btn btn-primary" style="flex: 1;">
              Book / Dealership Enquiry
            </a>
            <a href="https://wa.me/919949003498?text=Hello%20Taj%20Seeds,%20I%20am%20interested%20in%20${encodeURIComponent(product.name)}" target="_blank" class="btn btn-forest" style="background-color: #25D366; border-color: #25D366; display: inline-flex; align-items: center; gap: 6px;">
              <svg style="width: 16px; height: 16px; fill: #fff;" viewBox="0 0 24 24"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.67 12.05 3.67Z"/></svg>
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    `;

    modal.classList.add('is-active');
  }

  // Modal Close
  if (modalCloseBtn && modal) {
    modalCloseBtn.addEventListener('click', () => modal.classList.remove('is-active'));
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('is-active');
    });
  }

  // Category Tab Clicks
  filterTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      filterTabs.forEach(t => t.classList.remove('is-active'));
      e.currentTarget.classList.add('is-active');
      activeCategory = e.currentTarget.dataset.category || 'all';
      renderProducts();
    });
  });

  // Search Input with Debounce
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        searchQuery = e.target.value.trim();
        renderProducts();
      }, 250);
    });
  }

  // Initial Render
  renderProducts();
});
