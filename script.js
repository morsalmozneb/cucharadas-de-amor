/* =============================================
   Cucharadas de Amor — Shared JavaScript
   ============================================= */

// ---- Navigation Mobile Toggle ----
document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.getElementById('navToggle');
  var mobile = document.getElementById('navMobile');

  if (toggle && mobile) {
    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      mobile.classList.toggle('open');
    });
    // Close mobile nav when a link is clicked
    mobile.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        mobile.classList.remove('open');
      });
    });
  }

  // Bug #8 Fix: Close mobile nav when tapping outside
  document.addEventListener('click', function (e) {
    if (!mobile || !toggle) return;
    if (mobile.classList.contains('open')) {
      var nav = document.querySelector('nav');
      if (nav && !nav.contains(e.target)) {
        mobile.classList.remove('open');
      }
    }
  });

  // Close modals on overlay click
  document.querySelectorAll('.modal-overlay').forEach(function (overlay) {
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) {
        var modalId = overlay.id;
        closeModal(modalId);
      }
    });
  });

  // Escape key closes modals
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.open').forEach(function (m) {
        closeModal(m.id);
      });
    }
  });

  // Initialize PayPal if SDK is loaded
  if (typeof paypal !== 'undefined') {
    initPayPalButtons();
  }

  // Initialize testimonial carousel
  initCarousel();
});

// ---- Testimonial Peek Carousel ----
var carouselIndex = 0;
var carouselTotal = 0;
var carouselInterval = null;

function initCarousel() {
  var track = document.getElementById('testimonialTrack');
  if (!track) return;

  var slides = track.querySelectorAll('.peek-slide');
  carouselTotal = slides.length;

  // Set slide widths via JS (60% of viewport for peek effect)
  setSlideWidths();
  updateCarousel();
  startCarousel();

  // Re-center on window resize
  window.addEventListener('resize', function () {
    setSlideWidths();
    updateCarousel();
  });
}

function setSlideWidths() {
  var viewport = document.querySelector('.peek-carousel-viewport');
  var track    = document.getElementById('testimonialTrack');
  if (!viewport || !track) return;

  var vw = viewport.offsetWidth;
  // On mobile show 85% width; on desktop 60%
  var pct = vw < 600 ? 0.85 : 0.60;
  var slideW = Math.round(vw * pct);

  track.querySelectorAll('.peek-slide').forEach(function (s) {
    s.style.width = slideW + 'px';
  });
}

function updateCarousel() {
  var viewport = document.querySelector('.peek-carousel-viewport');
  var track    = document.getElementById('testimonialTrack');
  if (!viewport || !track) return;

  var slides = track.querySelectorAll('.peek-slide');
  if (!slides.length) return;

  var vw        = viewport.offsetWidth;
  var slideW    = slides[0].offsetWidth;
  var gap       = 24;

  // Translate so the active slide is perfectly centered in the viewport
  var offset = -(carouselIndex * (slideW + gap)) + (vw / 2 - slideW / 2);
  track.style.transform = 'translateX(' + offset + 'px)';

  // Update dots
  document.querySelectorAll('.carousel-dot').forEach(function (dot, i) {
    dot.classList.toggle('active', i === carouselIndex);
  });
}

function goToSlide(index) {
  carouselIndex = (index + carouselTotal) % carouselTotal;
  updateCarousel();
  stopCarousel();
  startCarousel();
}

function startCarousel() {
  if (carouselTotal <= 1) return;
  carouselInterval = setInterval(function () {
    carouselIndex = (carouselIndex + 1) % carouselTotal;
    updateCarousel();
  }, 4000);
}

function stopCarousel() {
  clearInterval(carouselInterval);
}

// ---- Modal Helpers ----
function openModal(id) {
  var el = document.getElementById(id);
  if (el) {
    el.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Bug #7 Fix: Move focus to modal heading for screen reader announcement
    setTimeout(function () {
      var heading = el.querySelector('h2');
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus();
      }
    }, 50);
  }
}

function closeModal(id) {
  var el = document.getElementById(id);
  if (el) {
    el.classList.remove('open');
    document.body.style.overflow = '';
    // Bug #5 Fix: Reset all error-highlighted fields when modal closes
    resetModalErrors(el);
  }
}

// Bug #5 Fix: Clear red border error states from all inputs in a modal
function resetModalErrors(modalEl) {
  if (!modalEl) return;
  modalEl.querySelectorAll('input, textarea, select').forEach(function (field) {
    field.style.borderColor = '';
  });
}

function openDonateModal(e) {
  if (e && e.preventDefault) e.preventDefault();
  // Bug #9 Fix: Full reset before opening
  resetDonateModal();
  openModal('donateModal');
}

function openSponsorModal(e) {
  if (e && e.preventDefault) e.preventDefault();
  // Bug #9 Fix: Reset sponsor modal before opening
  resetSponsorModal();
  openModal('sponsorModal');
}

// Bug #9 Fix: Reset donate modal to default state
function resetDonateModal() {
  setDonationType('monthly');
  selectAmount(25, null);
  // Clear all field values
  var modal = document.getElementById('donateModal');
  if (modal) {
    modal.querySelectorAll('input').forEach(function (input) {
      input.value = '';
      input.style.borderColor = '';
    });
    // Re-highlight the $25 recommended button
    var amt25 = document.getElementById('amt25');
    if (amt25) {
      document.querySelectorAll('.amount-btn').forEach(function(b){ b.classList.remove('active'); });
      amt25.classList.add('active');
    }
  }
}

// Bug #9 Fix: Reset sponsor modal to default state
function resetSponsorModal() {
  var modal = document.getElementById('sponsorModal');
  if (modal) {
    modal.querySelectorAll('input').forEach(function (input) {
      input.value = '';
      input.style.borderColor = '';
    });
  }
}

// ---- Donation State ----
var donationType    = 'monthly';   // 'monthly' | 'onetime'
var selectedAmount  = 25;

function setDonationType(type) {
  donationType = type;

  var btnMonthly = document.getElementById('toggleMonthly');
  var btnOnetime = document.getElementById('toggleOnetime');

  if (btnMonthly && btnOnetime) {
    btnMonthly.classList.toggle('active', type === 'monthly');
    btnOnetime.classList.toggle('active', type === 'onetime');
  }
}

function selectAmount(amount, clickedBtn) {
  selectedAmount = amount;

  // Update button states
  var amountBtns = document.querySelectorAll('.amount-btn');
  amountBtns.forEach(function (btn) {
    btn.classList.remove('active');
  });

  // Find and activate the correct button by ID
  var amountMap = { 25: 'amt25', 50: 'amt50', 100: 'amt100' };
  var targetId  = amountMap[amount];
  if (targetId) {
    var target = document.getElementById(targetId);
    if (target) target.classList.add('active');
  } else if (clickedBtn) {
    clickedBtn.classList.add('active');
  }

  // Clear custom amount
  var customInput = document.getElementById('customAmount');
  if (customInput) customInput.value = '';
}

function clearAmountButtons() {
  document.querySelectorAll('.amount-btn').forEach(function (btn) {
    btn.classList.remove('active');
  });
  selectedAmount = null;
}

function getSelectedAmount() {
  var customInput = document.getElementById('customAmount');
  if (customInput && customInput.value) {
    var val = parseFloat(customInput.value);
    // Bug #3 Fix: Reject zero and negative values
    if (!isNaN(val) && val > 0) return val;
    return null; // Signal invalid custom amount
  }
  return selectedAmount || 25;
}

// ---- Form Validation ----
function validateDonationForm(prefix) {
  prefix = prefix || '';
  var nameField  = document.getElementById(prefix + 'donorName') || document.getElementById(prefix + 'Name');
  var emailField = document.getElementById(prefix + 'donorEmail') || document.getElementById(prefix + 'Email');

  if (nameField && !nameField.value.trim()) {
    nameField.style.borderColor = 'var(--red)';
    nameField.focus();
    return false;
  }
  if (emailField) {
    var emailVal = emailField.value.trim();
    if (!emailVal || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
      emailField.style.borderColor = 'var(--red)';
      emailField.focus();
      return false;
    }
  }
  return true;
}

// ---- Submit Donation (card flow) ----
function submitDonation() {
  var nameField  = document.getElementById('donorName');
  var emailField = document.getElementById('donorEmail');
  var cardField  = document.getElementById('cardNumber');
  var customInput = document.getElementById('customAmount');

  // Bug #3 Fix: Validate custom amount is positive if entered
  if (customInput && customInput.value !== '') {
    var customVal = parseFloat(customInput.value);
    if (isNaN(customVal) || customVal <= 0) {
      customInput.style.borderColor = 'var(--red)';
      customInput.focus();
      showFieldError(customInput, 'Please enter a valid donation amount greater than $0.');
      return;
    }
  }

  // Validate preset amount is selected if no custom amount
  if ((!customInput || !customInput.value) && !selectedAmount) {
    var amtGrid = document.querySelector('.amount-grid');
    if (amtGrid) amtGrid.style.outline = '2px solid var(--red)';
    return;
  }

  if (nameField && !nameField.value.trim()) {
    shakeField(nameField);
    return;
  }
  if (emailField && (!emailField.value.trim() || !emailField.value.includes('@'))) {
    shakeField(emailField);
    return;
  }

  // Bug #2 Fix: Require exactly 16 digits (standard Visa/Mastercard)
  if (cardField && cardField.value.replace(/\s/g, '').length < 16) {
    shakeField(cardField);
    showFieldError(cardField, 'Please enter a valid 16-digit card number.');
    return;
  }

  // Simulate sandbox processing
  closeModal('donateModal');
  setTimeout(function () { openModal('thankYouModal'); }, 200);
}

function submitSponsor() {
  var nameField  = document.getElementById('sponsorName');
  var emailField = document.getElementById('sponsorEmail');
  var cardField  = document.getElementById('sponsorCard');

  if (nameField && !nameField.value.trim()) {
    shakeField(nameField);
    return;
  }
  if (emailField && (!emailField.value.trim() || !emailField.value.includes('@'))) {
    shakeField(emailField);
    return;
  }

  // Bug #2 Fix: Require 16 digits in sponsor modal too
  if (cardField && cardField.value.replace(/\s/g, '').length < 16) {
    shakeField(cardField);
    showFieldError(cardField, 'Please enter a valid 16-digit card number.');
    return;
  }

  closeModal('sponsorModal');
  setTimeout(function () { openModal('thankYouModal'); }, 200);
}

function shakeField(el) {
  el.style.borderColor = 'var(--red)';
  el.focus();
  // Reset error state after interaction
  el.addEventListener('input', function () {
    el.style.borderColor = '';
    var err = el.parentElement && el.parentElement.querySelector('.field-error');
    if (err) err.remove();
  }, { once: true });
}

// Show persistent error message below a field
function showFieldError(field, message) {
  // Remove any existing error for this field
  var existing = field.parentElement && field.parentElement.querySelector('.field-error');
  if (existing) existing.remove();

  var err = document.createElement('p');
  err.className = 'field-error';
  err.style.cssText = 'color:var(--red);font-size:0.8rem;margin-top:4px;margin-bottom:8px;';
  err.textContent = message;

  if (field.parentElement) {
    field.parentElement.insertBefore(err, field.nextSibling);
  }

  // Auto-remove on next input
  field.addEventListener('input', function () {
    err.remove();
  }, { once: true });
}

// ---- Input Formatting ----
function formatCardNumber(input) {
  var v = input.value.replace(/\D/g, '').substring(0, 16);
  var formatted = v.match(/.{1,4}/g);
  input.value = formatted ? formatted.join(' ') : v;
}

// Bug #4 Fix: Deletion-aware expiry formatter
function formatExpiry(input) {
  var raw    = input.value;
  var digits = raw.replace(/\D/g, '').substring(0, 4);

  var formatted;
  if (digits.length > 2) {
    formatted = digits.substring(0, 2) + ' / ' + digits.substring(2);
  } else {
    formatted = digits;
  }

  if (raw !== formatted) {
    input.value = formatted;
  }
}

// Bug #4 Fix: Handle backspace/delete to skip past the ' / ' separator
function handleExpiryKeydown(input, event) {
  if (event.key === 'Backspace' || event.key === 'Delete') {
    var pos = input.selectionStart;
    var val = input.value;

    // If cursor is right after the separator space (position 4 in "12 / 3")
    // jumping back over ' / ' to position 2
    if (event.key === 'Backspace' && pos <= 5 && val.indexOf(' / ') !== -1) {
      var sepIdx = val.indexOf(' / ');
      if (pos === sepIdx + 1 || pos === sepIdx + 2 || pos === sepIdx + 3) {
        event.preventDefault();
        // Strip the separator and keep only month digits
        var monthDigits = val.substring(0, 2);
        input.value = monthDigits;
        input.setSelectionRange(monthDigits.length, monthDigits.length);
      }
    }
  }
}

// ---- Newsletter Subscribe ----
// Bug #10 Fix: Validate email before showing success
function handleSubscribe(e) {
  e.preventDefault();
  var form  = e.target;
  var email = form.querySelector('input[type="email"]');

  if (!email) return;

  var emailVal = email.value.trim();
  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Remove any previous error
  var prevErr = form.querySelector('.subscribe-error');
  if (prevErr) prevErr.remove();

  if (!emailVal || !emailRegex.test(emailVal)) {
    // Show persistent error below the input
    email.style.borderColor = 'var(--red)';
    var err = document.createElement('p');
    err.className = 'subscribe-error';
    err.style.cssText = 'color:var(--red);font-size:0.82rem;margin-top:6px;font-weight:600;';
    err.textContent = 'Please enter a valid email address.';
    email.insertAdjacentElement('afterend', err);

    // Clear error on next input
    email.addEventListener('input', function () {
      email.style.borderColor = '';
      var e2 = form.querySelector('.subscribe-error');
      if (e2) e2.remove();
    }, { once: true });

    return;
  }

  // Success state
  form.innerHTML = '<p style="color:var(--blue);font-weight:700;font-size:0.95rem;">✓ You\'re subscribed! Thanks for staying close to the mission.</p>';
}

// ---- PayPal Sandbox Integration ----
/*
  SETUP INSTRUCTIONS:
  1. Go to https://developer.paypal.com/
  2. Log in and create a "Sandbox" app under "My Apps & Credentials"
  3. Copy the Sandbox Client ID
  4. In the <head> of each page, replace:
       client-id=YOUR_SANDBOX_CLIENT_ID
     with your actual Sandbox Client ID
  5. Create sandbox buyer and seller accounts at developer.paypal.com for testing
*/

function initPayPalButtons() {
  if (typeof paypal === 'undefined') return;

  // Donation modal PayPal button
  var donateContainer = document.getElementById('paypal-button-container');
  if (donateContainer && donateContainer.children.length === 0) {
    paypal.Buttons({
      style: {
        layout: 'horizontal',
        color:  'blue',
        shape:  'pill',
        label:  'paypal',
        height: 40
      },

      createOrder: function (data, actions) {
        var amount = getSelectedAmount() || 25;
        return actions.order.create({
          purchase_units: [{
            description: 'Cucharadas de Amor Donation (' + (donationType === 'monthly' ? 'Monthly' : 'One-time') + ')',
            amount: {
              value: amount.toFixed(2),
              currency_code: 'USD'
            }
          }]
        });
      },

      onApprove: function (data, actions) {
        return actions.order.capture().then(function (details) {
          closeModal('donateModal');
          setTimeout(function () { openModal('thankYouModal'); }, 200);
        });
      },

      onError: function (err) {
        console.error('PayPal error:', err);
        alert('There was an issue processing your PayPal payment. Please try again or use a card.');
      }
    }).render('#paypal-button-container');
  }

  // Sponsor modal PayPal button
  var sponsorContainer = document.getElementById('paypal-button-container-sponsor');
  if (sponsorContainer && sponsorContainer.children.length === 0) {
    paypal.Buttons({
      style: {
        layout: 'horizontal',
        color:  'gold',
        shape:  'pill',
        label:  'paypal',
        height: 40
      },

      createOrder: function (data, actions) {
        return actions.order.create({
          purchase_units: [{
            description: 'Cucharadas de Amor — Sponsor a Child ($25/month)',
            amount: {
              value: '25.00',
              currency_code: 'USD'
            }
          }]
        });
      },

      onApprove: function (data, actions) {
        return actions.order.capture().then(function (details) {
          closeModal('sponsorModal');
          setTimeout(function () { openModal('thankYouModal'); }, 200);
        });
      },

      onError: function (err) {
        console.error('PayPal error:', err);
        alert('There was an issue processing your PayPal payment. Please try again or use a card.');
      }
    }).render('#paypal-button-container-sponsor');
  }
}
