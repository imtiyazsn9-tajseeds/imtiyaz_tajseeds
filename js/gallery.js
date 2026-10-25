/**
 * TAJ SEEDS AGRI SCIENCES
 * 3D Interactive Gallery & Lightbox Controller
 * 100% Authentic Company Photos & Media
 */

const GALLERY_DATA = [
  {
    "id": 1,
    "title": "Farmer Field Demonstration & King-7820 Trials",
    "category": "farm",
    "categoryLabel": "Farm & Trials",
    "desc": "Farmers in rural maize demonstration trials showcasing bumper harvest cobs with Taj Seeds King-7820 hybrid maize. Banner: 'ताज मक्का मिट्टी में शेर, बल्वाई में सवा शेर!!'",
    "image": "assets/gallery/field-demo-king-7820.jpg"
  },
  {
    "id": 2,
    "title": "Medchal Processing Plant & Factory Floor",
    "category": "plant",
    "categoryLabel": "Processing Plant",
    "desc": "Our high-capacity seed conditioning and processing floor at Medchal, Hyderabad, equipped with mechanical grading lines, grain elevators, and inventory staging.",
    "image": "assets/gallery/factory-main.jpeg"
  },
  {
    "id": 3,
    "title": "Seed Cleaning & Gravity Separation Machinery",
    "category": "plant",
    "categoryLabel": "Processing Plant",
    "desc": "Industrial-grade AgriSep seed cleaner and air-screen sorting machinery ensuring 99.8% mechanical purity and removal of immature kernels.",
    "image": "assets/gallery/processing-machinery.jpeg"
  },
  {
    "id": 4,
    "title": "Medchal Central Warehouse & Logistics Hub",
    "category": "warehouse",
    "categoryLabel": "Warehouse",
    "desc": "Exterior view of our state-of-the-art climate-monitored central seed warehouse in Medchal, Hyderabad with active loading docks and logistics fleet.",
    "image": "assets/gallery/warehouse-exterior.jpeg"
  },
  {
    "id": 5,
    "title": "Warehouse Dispatch Platform & Loading Bays",
    "category": "warehouse",
    "categoryLabel": "Warehouse",
    "desc": "Automated warehouse dispatch bay facilitating fast turnarounds for full-truckload (FTL) seed consignments reaching dealers across India.",
    "image": "assets/gallery/warehouse-dispatch.jpeg"
  },
  {
    "id": 6,
    "title": "Corporate Headquarters Signboard",
    "category": "warehouse",
    "categoryLabel": "Warehouse",
    "desc": "Official Taj Seeds Agri Sciences registered facility board at Plot 57 & 58, Kurish Homes, Uma Nagar, Medchal, Telangana (Pin 501401).",
    "image": "assets/gallery/facility-signboard.jpeg"
  },
  {
    "id": 7,
    "title": "Certified Maize Varieties Demonstration",
    "category": "farm",
    "categoryLabel": "Farm & Trials",
    "desc": "High-yield hybrid maize demonstration records including Taj 9055 Gold, Taj 7244, Taj 3452, Taj 7820, and Heera 35.",
    "image": "assets/gallery/farm-field-brochure.jpeg"
  },
  {
    "id": 8,
    "title": "Original Power Seal & 3D Hologram Security",
    "category": "packaging",
    "categoryLabel": "Packaging & Security",
    "desc": "Official anti-counterfeiting security packaging featuring Original Power Seal, tamper-evident 3D Hologram, and authentic farmer mark to protect farmers from duplicates.",
    "image": "assets/products/KING-7244-security.png"
  },
  {
    "id": 9,
    "title": "Official Taj Seeds Brand Emblem",
    "category": "packaging",
    "categoryLabel": "Packaging & Brand",
    "desc": "The authentic circular emblem of Taj Seeds featuring the sprout of agricultural trust and our defining motto: 'Every Step with Farmer'.",
    "image": "assets/gallery/brand-emblem.jpeg"
  }
];

document.addEventListener('DOMContentLoaded', () => {
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
  let galleryItems = (typeof GALLERY_DATA !== 'undefined') ? [...GALLERY_DATA] : [];
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
          <img src="${item.image}" alt="${item.title}" loading="lazy" onerror="this.src='assets/logo.svg'">
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

  // Load latest gallery.json to ensure immediate updates without cache delays
  fetch('gallery.json?t=' + Date.now())
    .then(r => r.ok ? r.json() : null)
    .then(data => {
      if (Array.isArray(data) && data.length > 0) {
        galleryItems = data;
        renderGallery();
      }
    })
    .catch(() => {});

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
