/**
 * TAJ SEEDS AGRI SCIENCES
 * Shared page layout: top bar, header, mobile drawer, footer, WhatsApp button.
 * Edit the header/footer once here and every page picks it up.
 *
 * Usage (synchronous, so the page never flashes without navigation):
 *   <script src="js/layout.js" data-part="header"></script>   right after <body>
 *   <script src="js/layout.js" data-part="footer"></script>   where the footer belongs
 */

(function () {
  const HEADER = `
<div class="top-bar">
    <div class="container top-bar-inner">
      <div class="top-bar-left">
        <div class="top-bar-item">
          <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
          <span data-bind="address">Plot 57 & 58, Kurish Homes, Medchal, Hyderabad, Telangana - 501401</span>
        </div>
      </div>
      <div class="top-bar-right">
        <div class="top-bar-item">
          <svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
          <a href="mailto:tajseeds15@gmail.com" data-bind="email">tajseeds15@gmail.com</a>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="top-bar-badge">ISO & Seed Certification Compliant</span>
          <a href="admin.html" class="top-bar-admin-link" title="Taj Seeds Admin Portal">
            <svg viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
            Admin Portal
          </a>
        </div>
      </div>
    </div>
  </div>
  <header class="site-header">
    <div class="container header-inner">
      <a href="index.html" class="header-brand" aria-label="Taj Seeds Home">
        <img src="assets/logo.png" alt="Taj Seeds - Every Step with Farmer" class="brand-logo-img">
      </a>
      <nav class="nav-menu" aria-label="Main Navigation">
        <a href="index.html" class="nav-link">Home</a>
        <a href="products.html" class="nav-link">Products</a>
        <a href="quality.html" class="nav-link">Quality & Infrastructure</a>
        <a href="gallery.html" class="nav-link">Gallery</a>
        <a href="about.html" class="nav-link">About Us</a>
        <a href="contact.html" class="nav-link">Contact</a>
      </nav>
      <div class="header-actions">
        <button class="mobile-nav-toggle" id="mobileNavToggle" aria-label="Toggle navigation menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </div>
  </header>
  <div class="mobile-drawer-overlay" id="mobileDrawerOverlay"></div>
  <aside class="mobile-drawer" id="mobileDrawer">
    <div style="margin-bottom: 24px;">
      <img src="assets/logo.png" alt="Taj Seeds" style="height: 52px;">
    </div>
    <nav class="mobile-nav-links">
      <a href="index.html" class="mobile-nav-link">Home <span>&rarr;</span></a>
      <a href="products.html" class="mobile-nav-link">Products <span>&rarr;</span></a>
      <a href="quality.html" class="mobile-nav-link">Quality & Infrastructure <span>&rarr;</span></a>
      <a href="gallery.html" class="mobile-nav-link">Gallery <span>&rarr;</span></a>
      <a href="about.html" class="mobile-nav-link">About Us <span>&rarr;</span></a>
      <a href="contact.html" class="mobile-nav-link">Contact <span>&rarr;</span></a>
    </nav>
    <div class="mobile-contact-card">
      <h4 style="font-size: 0.95rem; margin-bottom: 6px; color: var(--color-forest-dark);">Head Office & Warehouse</h4>
      <p style="font-size: 0.8rem; color: var(--color-text-muted); margin-bottom: 12px; line-height: 1.5;">
        Plot 57 & 58, Kurish Homes, Medchal, Hyderabad - 501401
      </p>
      <a href="tel:+919949003498" class="btn btn-primary btn-sm" style="width: 100%;">Call +91 9949003498</a>
    </div>
    <div class="mobile-drawer-admin-box">
      <a href="admin.html" class="mobile-drawer-admin-btn">
        <svg viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
        Admin Portal Login
      </a>
    </div>
  </aside>
`;

  const FOOTER = `
<footer class="site-footer">
    <div class="container footer-top">
      <div class="footer-col">
        <a href="index.html" class="footer-brand">
          <img src="assets/logo.png" alt="Taj Seeds" class="footer-brand-logo" style="background: #fff; padding: 6px; border-radius: 8px;">
        </a>
        <p class="footer-tagline" data-bind="tagline">"Every Step with Farmer"</p>
        <p class="footer-desc">
          Taj Seeds Agri Sciences Pvt. Ltd. delivers advanced, high-yielding hybrid seeds backed by 45+ years of agronomic trust, modern conditioning technology, and nationwide farmer dedication.
        </p>
        <div class="footer-social-links">
          <a href="https://wa.me/919949003498" target="_blank" class="footer-social-btn" aria-label="WhatsApp">
            <svg viewBox="0 0 24 24"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.67 12.05 3.67Z"/></svg>
          </a>
          <a href="mailto:tajseeds15@gmail.com" class="footer-social-btn" aria-label="Email">
            <svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
          </a>
        </div>
      </div>
      <div class="footer-col">
        <h3 class="footer-col-title">Quick Links</h3>
        <ul class="footer-links-list">
          <li><a href="index.html"><svg viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>Home</a></li>
          <li><a href="products.html"><svg viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>Products Catalog</a></li>
          <li><a href="quality.html"><svg viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>Quality & Infrastructure</a></li>
          <li><a href="gallery.html"><svg viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>Gallery</a></li>
          <li><a href="about.html"><svg viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>About Us</a></li>
          <li><a href="contact.html"><svg viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>Contact</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h3 class="footer-col-title">Seeds Portfolio</h3>
        <ul class="footer-links-list">
          <li><a href="products.html?category=maize"><svg viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>Hybrid Maize (Taj 9555)</a></li>
          <li><a href="products.html?category=maize"><svg viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>Research Corn (Taj 9055 Gold)</a></li>
          <li><a href="products.html?category=sorghum"><svg viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>Sorghum & Chari Plus</a></li>
          <li><a href="products.html?category=vegetables"><svg viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>Hybrid Vegetables (Tomato, Chili)</a></li>
          <li><a href="products.html?category=vegetables"><svg viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>Okra / Bhindi (Samrat)</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h3 class="footer-col-title">Corporate Office</h3>
        <div class="footer-contact-items">
          <div class="footer-contact-item">
            <div class="footer-contact-icon">
              <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            </div>
            <div>
              <strong>Taj Seeds Agri Sciences</strong><br>
              <span data-bind="address">Plot No. 57 & 58, Flat No. 03, Kurish Homes, Uma Nagar, MRR Colony,
              Medchal Village, Medchal Mandal, Medchal-Malkajgiri Dist., Pin 501401, Telangana, India.</span>
            </div>
          </div>
          <div class="footer-contact-item">
            <div class="footer-contact-icon">
              <svg viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
            </div>
            <div>
              <a href="tel:+919949003498" data-bind="phone1">+91 9949003498</a><br>
              <a href="tel:+919113409962" data-bind="phone2">+91 9113409962</a>
            </div>
          </div>
          <div class="footer-contact-item">
            <div class="footer-contact-icon">
              <svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
            </div>
            <div>
              <a href="mailto:tajseeds15@gmail.com" data-bind="email">tajseeds15@gmail.com</a>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="container footer-bottom">
      <div class="footer-bottom-inner">
        <div>
          &copy; 2026 Taj Seeds Agri Sciences Pvt. Ltd. All Rights Reserved.
        </div>
        <div class="footer-bottom-links">
          <a href="#">Privacy Policy</a>
          <span>|</span>
          <a href="#">Terms & Conditions</a>
          <span>|</span>
          <a href="admin.html" class="footer-admin-link">
            <svg viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
            Admin Portal
          </a>
          <span>|</span>
          <button class="back-to-top-btn" id="scrollTopBtn" aria-label="Back to top">
            Back to Top
            <svg viewBox="0 0 24 24"><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/></svg>
          </button>
        </div>
      </div>
    </div>
  </footer>
  <a href="https://wa.me/919949003498?text=Hello%20Taj%20Seeds,%20I%20would%20like%20to%20enquire%20about%20your%20hybrid%20seeds." target="_blank" class="floating-whatsapp" aria-label="Chat on WhatsApp with Taj Seeds">
    <span class="floating-whatsapp-tooltip">Chat with Taj Seeds &rarr;</span>
    <svg viewBox="0 0 24 24"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.67 12.05 3.67Z"/></svg>
  </a>
  <div class="toast-container" id="toastContainer"></div>
`;

  const script = document.currentScript;
  if (!script) return;

  const part = script.dataset.part;
  script.insertAdjacentHTML('beforebegin', part === 'header' ? HEADER : FOOTER);

  if (part === 'header') {
    // Highlight the link of the page being viewed
    const current = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
      if (link.getAttribute('href') === current) link.classList.add('is-active');
    });
  }
})();
