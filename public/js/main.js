/**
 * TAJ SEEDS AGRI SCIENCES (PVT. LTD.)
 * Main Application Script
 * Tagline: "Every Step with Farmer"
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Sticky Header Effect
  const siteHeader = document.querySelector('.site-header');
  const scrollTopBtn = document.getElementById('scrollTopBtn');

  function handleScroll() {
    const scrollPos = window.scrollY;

    if (siteHeader) {
      if (scrollPos > 30) {
        siteHeader.classList.add('is-scrolled');
      } else {
        siteHeader.classList.remove('is-scrolled');
      }
    }

    if (scrollTopBtn) {
      if (scrollPos > 400) {
        scrollTopBtn.classList.add('is-visible');
      } else {
        scrollTopBtn.classList.remove('is-visible');
      }
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // Scroll to Top action
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // 2. Mobile Drawer Navigation
  const mobileToggle = document.getElementById('mobileNavToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileOverlay = document.getElementById('mobileDrawerOverlay');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  function toggleMobileMenu(isOpen) {
    if (!mobileToggle || !mobileDrawer || !mobileOverlay) return;

    if (isOpen) {
      mobileToggle.classList.add('is-open');
      mobileDrawer.classList.add('is-open');
      mobileOverlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    } else {
      mobileToggle.classList.remove('is-open');
      mobileDrawer.classList.remove('is-open');
      mobileOverlay.classList.remove('is-open');
      document.body.style.overflow = '';
    }
  }

  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.contains('is-open');
      toggleMobileMenu(!isOpen);
    });
  }

  if (mobileOverlay) {
    mobileOverlay.addEventListener('click', () => toggleMobileMenu(false));
  }

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => toggleMobileMenu(false));
  });

  // 3. Highlight Current Page in Navigation
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('is-active');
    } else {
      link.classList.remove('is-active');
    }
  });

  // 4. Scroll Reveal Animations (IntersectionObserver)
  function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

    if ('IntersectionObserver' in window) {
      const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      }, {
        root: null,
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
      });

      revealElements.forEach(el => revealObserver.observe(el));
    } else {
      // Fallback for older browsers
      revealElements.forEach(el => el.classList.add('is-revealed'));
    }
  }

  window.refreshScrollReveal = initScrollReveal;
  initScrollReveal();

  // 5. Animated Number Counters
  function initCounters() {
    const counters = document.querySelectorAll('[data-counter]');

    if ('IntersectionObserver' in window) {
      const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const counter = entry.target;
            const targetVal = parseFloat(counter.getAttribute('data-counter'));
            const duration = 2000;
            const prefix = counter.getAttribute('data-prefix') || '';
            const suffix = counter.getAttribute('data-suffix') || '';
            const decimals = parseInt(counter.getAttribute('data-decimals') || '0', 10);

            let startTime = null;

            function animateCount(timestamp) {
              if (!startTime) startTime = timestamp;
              const progress = Math.min((timestamp - startTime) / duration, 1);
              // EaseOutQuad
              const easeProgress = progress * (2 - progress);
              const currentVal = (easeProgress * targetVal).toFixed(decimals);

              counter.textContent = `${prefix}${currentVal}${suffix}`;

              if (progress < 1) {
                requestAnimationFrame(animateCount);
              } else {
                counter.textContent = `${prefix}${targetVal}${suffix}`;
              }
            }

            requestAnimationFrame(animateCount);
            observer.unobserve(counter);
          }
        });
      }, { threshold: 0.3 });

      counters.forEach(c => counterObserver.observe(c));
    }
  }

  initCounters();
});
