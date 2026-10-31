/**
 * TAJ SEEDS AGRI SCIENCES
 * Contact Form Controller & Client-Side Validation
 * Enquiries are sent to the server (POST /api/contact) and shown in the admin panel.
 */

document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contactForm');
  const toastContainer = document.getElementById('toastContainer');
  const formSuccessBox = document.getElementById('formSuccessBox');

  // Pre-fill from URL Query Params (e.g. from Products "Enquire Now")
  const urlParams = new URLSearchParams(window.location.search);
  const requestedProduct = urlParams.get('product');

  if (requestedProduct) {
    const enquiryTypeSelect = document.getElementById('enquiryType');
    const messageField = document.getElementById('formMessage');

    if (enquiryTypeSelect) {
      enquiryTypeSelect.value = 'Product Enquiry';
    }
    if (messageField) {
      messageField.value = `Hello Taj Seeds Agri Sciences,\nI am interested in placing an inquiry for: ${requestedProduct}.\nPlease provide pricing, dealer availability, and technical catalog details.`;
    }
  }

  // Toast Helper
  function showToast(message, type = 'success') {
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <svg style="width: 20px; height: 20px; fill: ${type === 'success' ? 'var(--color-leaf-green)' : 'var(--color-taj-red)'}; min-width: 20px;" viewBox="0 0 24 24">
        ${type === 'success' 
          ? '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>'
          : '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>'
        }
      </svg>
      <div>${message}</div>
    `;

    toastContainer.appendChild(toast);
    setTimeout(() => toast.classList.add('is-show'), 50);

    setTimeout(() => {
      toast.classList.remove('is-show');
      setTimeout(() => toast.remove(), 400);
    }, 4500);
  }

  // Input Validation Rules
  function validateField(input) {
    const value = input.value.trim();
    let isValid = true;
    let errorMessage = '';

    if (input.hasAttribute('required') && !value) {
      isValid = false;
      errorMessage = 'This field is required.';
    } else if (input.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid email address.';
      }
    } else if (input.id === 'formPhone' && value) {
      // Indian mobile phone check (10 digits, optional +91 or 0 prefix)
      const phoneClean = value.replace(/[\s\-\(\)]/g, '');
      const phoneRegex = /^(\+91|91|0)?[6-9]\d{9}$/;
      if (!phoneRegex.test(phoneClean)) {
        isValid = false;
        errorMessage = 'Please enter a valid 10-digit mobile number.';
      }
    } else if (input.tagName.toLowerCase() === 'textarea' && value && value.length < 8) {
      isValid = false;
      errorMessage = 'Please provide a little more detail (min 8 characters).';
    }

    const errorElement = input.parentElement.querySelector('.field-error-msg');
    if (!isValid) {
      input.classList.add('is-invalid');
      if (errorElement) errorElement.textContent = errorMessage;
    } else {
      input.classList.remove('is-invalid');
      if (errorElement) errorElement.textContent = '';
    }

    return isValid;
  }

  if (contactForm) {
    const formInputs = contactForm.querySelectorAll('input, select, textarea');

    // Realtime error clearing
    formInputs.forEach(input => {
      input.addEventListener('input', () => {
        if (input.classList.contains('is-invalid')) {
          validateField(input);
        }
      });
      input.addEventListener('blur', () => {
        validateField(input);
      });
    });

    // Form submission
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      let isFormValid = true;
      formInputs.forEach(input => {
        if (!validateField(input)) {
          isFormValid = false;
        }
      });

      if (!isFormValid) {
        showToast('Please correct the highlighted fields before submitting.', 'error');
        return;
      }

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg style="width: 18px; height: 18px; animation: spin 1s linear infinite;" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="31.4 31.4"/>
        </svg>
        Sending Inquiry...
      `;

      const data = new FormData(contactForm);
      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: data.get('name'),
            phone: data.get('phone'),
            email: data.get('email'),
            location: data.get('state_district'),
            type: data.get('enquiry_type'),
            message: data.get('message'),
            website: data.get('website')
          })
        });
        const result = await res.json().catch(() => ({}));
        if (!res.ok || !result.success) throw new Error(result.error || 'Server error');

        contactForm.reset();
        if (formSuccessBox) {
          formSuccessBox.style.display = 'block';
          formSuccessBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        showToast('Thank you! Your enquiry has been received. Our team will call you shortly.', 'success');
      } catch (err) {
        // Keep what the visitor typed, and give them another way to reach us
        showToast(`${err.message} You can also call or WhatsApp us directly.`, 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    });
  }
});

// Inline keyframe for button spinner
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);
