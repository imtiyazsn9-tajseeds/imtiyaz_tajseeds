/**
 * TAJ SEEDS AGRI SCIENCES
 * 3D Interactive Gallery & Lightbox Controller
 * 100% Authentic Company Photos & Media
 */

document.addEventListener('DOMContentLoaded', async () => {
  const galleryGrid = document.getElementById('galleryGrid');
  const filterBtns = document.querySelectorAll('.gallery-filter-btn');
  const lightbox = document.getElementById('galleryLightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxDesc = document.getElementById('lightboxDesc');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  const lightboxClose = document.getElementById('lightboxClose');

  let activeCategory = 'all';
  let galleryItems = [];
  try {
    galleryItems = await TajData.gallery();
  } catch (err) {
    console.error(err);
  }
  let currentFilteredList = [...galleryItems];
  let currentLightboxIndex = 0;

  // Touch device detection to disable heavy 3D effect on mobile
  const isTouchDevice = () => {
    return ('ontouchstart' in window) ||
      (navigator.maxTouchPoints > 0) ||
      window.matchMedia('(hover: none)').matches;
  };

  // Render Gallery Items
  function renderGallery() {
    if (!galleryGrid) return;

    currentFilteredList = galleryItems.filter(item => {
      return activeCategory === 'all' || item.category === activeCategory;
    });

    if (currentFilteredList.length === 0) {
      galleryGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; background: #fff; border-radius: 12px; border: 1px dashed var(--color-border);">
          <svg style="width: 44px; height: 44px; fill: var(--color-leaf-green); margin-bottom: 12px;" viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
          <h3 style="margin: 0 0 8px; color: var(--color-forest-dark);">No Photos in this Section</h3>
          <p style="color: var(--color-text-muted); margin: 0;">Is category mein filhal koi photo uplabdh nahi hai.</p>
        </div>
      `;
      return;
    }

    galleryGrid.innerHTML = currentFilteredList.map((item, index) => `
      <div class="tilt-card reveal reveal-scale" data-index="${index}" data-id="${item.id}">
        <div class="tilt-card-image-box">
          <img src="${item.image}" alt="${item.title}" loading="lazy" onerror="this.src='assets/logo.png'">
          <div class="card-glare"></div>
        </div>
        <div class="tilt-card-info">
          <span class="tilt-card-tag">${item.categoryLabel || item.category}</span>
          <h3 class="tilt-card-title">${item.title}</h3>
          <p class="tilt-card-desc">${item.desc || ''}</p>
        </div>
      </div>
    `).join('');

    // Re-init 3D tilt effects on cards
    init3DTilt();

    // Re-bind click events for lightbox
    document.querySelectorAll('.tilt-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const index = parseInt(card.dataset.index, 10);
        openLightbox(index);
      });
    });

    if (window.refreshScrollReveal) {
      window.refreshScrollReveal();
    }
  }

  // 3D Tilt Effect Controller
  function init3DTilt() {
    if (isTouchDevice()) return; // Skip heavy 3D calculations on mobile touch

    const cards = document.querySelectorAll('.tilt-card');
    cards.forEach(card => {
      const glare = card.querySelector('.card-glare');

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const cardWidth = rect.width;
        const cardHeight = rect.height;

        const centerX = rect.left + cardWidth / 2;
        const centerY = rect.top + cardHeight / 2;

        const mouseX = e.clientX - centerX;
        const mouseY = e.clientY - centerY;

        // Calculate rotation angles (max 14 degrees)
        const rotateX = (-mouseY / (cardHeight / 2)) * 10;
        const rotateY = (mouseX / (cardWidth / 2)) * 10;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.03, 1.03, 1.03)`;

        // Dynamic glare position
        if (glare) {
          const glareX = ((e.clientX - rect.left) / cardWidth) * 100;
          const glareY = ((e.clientY - rect.top) / cardHeight) * 100;
          glare.style.opacity = '1';
          glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0) 75%)`;
        }
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        card.style.transition = 'transform 0.45s ease-out';
        if (glare) {
          glare.style.opacity = '0';
          glare.style.transition = 'opacity 0.45s ease-out';
        }
      });

      card.addEventListener('mouseenter', () => {
        card.style.transition = 'transform 0.12s ease-out';
        if (glare) {
          glare.style.transition = 'none';
        }
      });
    });
  }

  // Lightbox Modal Functions
  function openLightbox(index) {
    if (!lightbox || !currentFilteredList[index]) return;
    currentLightboxIndex = index;
    updateLightboxContent();
    lightbox.classList.add('is-active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('is-active');
    document.body.style.overflow = '';
  }

  function updateLightboxContent() {
    const item = currentFilteredList[currentLightboxIndex];
    if (!item) return;

    if (lightboxImg) {
      lightboxImg.src = item.image;
      lightboxImg.alt = item.title;
    }
    if (lightboxTitle) lightboxTitle.textContent = item.title;
    if (lightboxDesc) lightboxDesc.textContent = item.desc;
  }

  function prevImage() {
    currentLightboxIndex = (currentLightboxIndex - 1 + currentFilteredList.length) % currentFilteredList.length;
    updateLightboxContent();
  }

  function nextImage() {
    currentLightboxIndex = (currentLightboxIndex + 1) % currentFilteredList.length;
    updateLightboxContent();
  }

  // Lightbox Listeners
  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener('click', prevImage);
  if (lightboxNext) lightboxNext.addEventListener('click', nextImage);

  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  // Keyboard navigation for Lightbox
  document.addEventListener('keydown', (e) => {
    if (!lightbox || !lightbox.classList.contains('is-active')) return;

    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'ArrowRight') nextImage();
  });

  // Filter Buttons
  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterBtns.forEach(b => b.classList.remove('is-active'));
      e.currentTarget.classList.add('is-active');
      activeCategory = e.currentTarget.dataset.category || 'all';
      renderGallery();
    });
  });

  // Initial render
  renderGallery();
});
