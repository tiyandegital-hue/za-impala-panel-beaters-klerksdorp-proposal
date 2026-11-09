/* Impala Panel Beaters — shared interactions. Vanilla JS, no dependencies. */
(function () {
  'use strict';

  /* ---------- mobile nav ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') nav.classList.remove('open');
    });
  }

  /* ---------- entrance reveals (rest state visible if JS fails) ---------- */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
  } else if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- before / after drag slider ---------- */
  document.querySelectorAll('.ba').forEach(function (ba) {
    var clip = ba.querySelector('.ba-clip');
    var handle = ba.querySelector('.ba-handle');
    var pos = 50;
    function setPos(p, announce) {
      pos = Math.max(4, Math.min(96, p));
      clip.style.clipPath = 'inset(0 ' + (100 - pos) + '% 0 0)';
      handle.style.left = pos + '%';
      handle.setAttribute('aria-valuenow', Math.round(pos));
      if (announce) handle.setAttribute('aria-valuetext', Math.round(pos) + ' percent restored view');
    }
    function fromEvent(e) {
      var r = ba.getBoundingClientRect();
      var x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
      setPos((x / r.width) * 100);
    }
    var dragging = false;
    ba.addEventListener('pointerdown', function (e) { dragging = true; ba.setPointerCapture(e.pointerId); fromEvent(e); });
    ba.addEventListener('pointermove', function (e) { if (dragging) fromEvent(e); });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) {
      ba.addEventListener(ev, function () { dragging = false; });
    });
    handle.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { setPos(pos - 5, true); e.preventDefault(); }
      if (e.key === 'ArrowRight') { setPos(pos + 5, true); e.preventDefault(); }
      if (e.key === 'Home') { setPos(4, true); e.preventDefault(); }
      if (e.key === 'End') { setPos(96, true); e.preventDefault(); }
    });
    setPos(50, false);
  });

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-q');
    var a = item.querySelector('.faq-a');
    q.addEventListener('click', function () {
      var open = item.classList.toggle('open');
      q.setAttribute('aria-expanded', open ? 'true' : 'false');
      a.style.maxHeight = open ? a.scrollHeight + 'px' : '0px';
    });
  });

  /* ---------- insurance checklist ---------- */
  var list = document.querySelector('.checklist');
  if (list) {
    var items = Array.prototype.slice.call(list.querySelectorAll('li'));
    var countEl = document.getElementById('checklist-count');
    var fillEl = document.getElementById('checklist-fill');
    var resetBtn = document.getElementById('checklist-reset');
    function update() {
      var done = items.filter(function (li) { return li.classList.contains('done'); }).length;
      if (countEl) countEl.textContent = done + ' / ' + items.length + ' items ready';
      if (fillEl) fillEl.style.width = (done / items.length * 100) + '%';
    }
    items.forEach(function (li) {
      li.setAttribute('tabindex', '0');
      li.setAttribute('role', 'checkbox');
      li.setAttribute('aria-checked', 'false');
      function toggle() {
        li.classList.toggle('done');
        li.setAttribute('aria-checked', li.classList.contains('done') ? 'true' : 'false');
        update();
      }
      li.addEventListener('click', toggle);
      li.addEventListener('keydown', function (e) {
        if (e.key === ' ' || e.key === 'Enter') { toggle(); e.preventDefault(); }
      });
    });
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        items.forEach(function (li) { li.classList.remove('done'); li.setAttribute('aria-checked', 'false'); });
        update();
      });
    }
    update();
  }

  /* ---------- Our Work filter pills ---------- */
  var pills = document.querySelectorAll('.pill[data-filter]');
  if (pills.length) {
    var cards = document.querySelectorAll('.work-card');
    pills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        pills.forEach(function (p) { p.setAttribute('aria-pressed', 'false'); });
        pill.setAttribute('aria-pressed', 'true');
        var f = pill.getAttribute('data-filter');
        cards.forEach(function (card) {
          var show = f === 'all' || card.getAttribute('data-type') === f;
          card.style.display = show ? '' : 'none';
        });
      });
    });
  }

  /* ---------- generic field validation helpers ---------- */
  function setError(input, msg) {
    var field = input.closest('.field');
    if (!field) return false;
    var err = field.querySelector('.field-error');
    if (msg) {
      input.setAttribute('aria-invalid', 'true');
      if (err) { err.textContent = msg; err.classList.add('show'); }
      return false;
    }
    input.removeAttribute('aria-invalid');
    if (err) err.classList.remove('show');
    return true;
  }
  function required(input, label) {
    if (!input.value || !input.value.trim()) return setError(input, label + ' is required.');
    return setError(input, null);
  }
  function validEmail(input) {
    if (!input.value.trim()) return setError(input, 'Email address is required.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim()))
      return setError(input, 'Enter a valid email address, for example name@example.co.za.');
    return setError(input, null);
  }
  function validPhone(input) {
    if (!input.value.trim()) return setError(input, 'Phone number is required.');
    var digits = input.value.replace(/\D/g, '');
    if (digits.length < 9) return setError(input, 'Enter a full phone number, for example 018 462 8864.');
    return setError(input, null);
  }
  function clearOnInput(form) {
    form.querySelectorAll('input,select,textarea').forEach(function (el) {
      el.addEventListener('input', function () { setError(el, null); });
      el.addEventListener('change', function () { setError(el, null); });
    });
  }

  /* ---------- quote wizard ---------- */
  var wizard = document.getElementById('quote-wizard');
  if (wizard) {
    var steps = Array.prototype.slice.call(wizard.querySelectorAll('.wstep'));
    var panels = Array.prototype.slice.call(wizard.querySelectorAll('.wizard-step'));
    var current = 0;
    var damageType = wizard.querySelector('#damage-type');
    var photos = wizard.querySelectorAll('.upload-slot input[type=file]');
    var desc = wizard.querySelector('#damage-description');

    function showStep(n) {
      current = n;
      panels.forEach(function (p, i) { p.hidden = i !== n; });
      steps.forEach(function (s, i) {
        s.classList.toggle('active', i === n);
        s.classList.toggle('done', i < n);
        s.setAttribute('aria-current', i === n ? 'step' : 'false');
      });
      var active = panels[n];
      if (active) {
        var first = active.querySelector('input,select,textarea,button');
        if (first) first.focus({ preventScroll: true });
      }
      wizard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function validateStep(n) {
      var ok = true;
      if (n === 0) {
        var make = wizard.querySelector('#vehicle-make');
        var model = wizard.querySelector('#vehicle-model');
        var year = wizard.querySelector('#vehicle-year');
        var reg = wizard.querySelector('#vehicle-reg');
        if (!make.value) { ok = setError(make, 'Choose your vehicle make.') && ok; }
        if (!required(model, 'Model and derivative')) ok = false;
        if (!year.value) { ok = setError(year, 'Year of manufacture is required.') && ok; }
        else if (+year.value < 1980 || +year.value > 2027) { ok = setError(year, 'Enter a year between 1980 and 2027.') && ok; }
        else setError(year, null);
        if (!required(reg, 'Registration number')) ok = false;
      }
      if (n === 1) {
        if (!damageType.value) { ok = setError(damageType, 'Choose the type of damage.') && ok; }
        if (!required(desc, 'A short description of the damage')) ok = false;
      }
      if (n === 2) {
        var mode = wizard.querySelector('input[name="repair-type"]:checked');
        if (!mode) {
          var grp = wizard.querySelector('#repair-type-error');
          if (grp) { grp.textContent = 'Choose insurance or private.'; grp.classList.add('show'); }
          ok = false;
        } else {
          var grp2 = wizard.querySelector('#repair-type-error');
          if (grp2) grp2.classList.remove('show');
          if (mode.value === 'insurance') {
            var insurer = wizard.querySelector('#insurer-name');
            var claim = wizard.querySelector('#claim-number');
            if (!required(insurer, 'Insurer name')) ok = false;
            if (!required(claim, 'Claim number')) ok = false;
          }
        }
      }
      if (n === 3) {
        var name = wizard.querySelector('#contact-name');
        var phone = wizard.querySelector('#contact-phone');
        var email = wizard.querySelector('#contact-email');
        var consent = wizard.querySelector('#popia-consent');
        if (!required(name, 'Your name')) ok = false;
        if (!validPhone(phone)) ok = false;
        if (!validEmail(email)) ok = false;
        var consentErr = wizard.querySelector('#consent-error');
        if (!consent.checked) {
          if (consentErr) { consentErr.textContent = 'Tick the consent box so we can reply to your quote request.'; consentErr.classList.add('show'); }
          ok = false;
        } else if (consentErr) consentErr.classList.remove('show');
      }
      return ok;
    }

    /* insurance / private conditional fields */
    var repairRadios = wizard.querySelectorAll('input[name="repair-type"]');
    var insuranceFields = wizard.querySelector('#insurance-fields');
    repairRadios.forEach(function (r) {
      r.addEventListener('change', function () {
        if (insuranceFields) insuranceFields.hidden = r.value !== 'insurance';
      });
    });

    /* photo upload slots: label the chosen file, cap at 4 */
    photos.forEach(function (input) {
      input.addEventListener('change', function () {
        var slot = input.closest('.upload-slot');
        var label = slot.querySelector('.slot-name');
        if (input.files && input.files.length) {
          slot.classList.add('has-file');
          label.textContent = input.files[0].name;
        } else {
          slot.classList.remove('has-file');
          label.textContent = 'Add a photo';
        }
      });
    });

    wizard.querySelectorAll('[data-next]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (validateStep(current)) showStep(Math.min(current + 1, panels.length - 1));
      });
    });
    wizard.querySelectorAll('[data-prev]').forEach(function (btn) {
      btn.addEventListener('click', function () { showStep(Math.max(current - 1, 0)); });
    });
    var form = wizard.querySelector('form');
    if (form) {
      clearOnInput(form);
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!validateStep(3)) return;
        /* Demo submit: no live endpoint yet — the success state is the deliverable. */
        wizard.querySelector('#wizard-form-wrap').hidden = true;
        var success = wizard.querySelector('#quote-success');
        success.hidden = false;
        success.scrollIntoView({ behavior: 'smooth', block: 'start' });
        var ref = success.querySelector('#quote-ref');
        if (ref) ref.textContent = 'Quote request received — ' + new Date().toLocaleDateString('en-ZA');
      });
    }
    showStep(0);
  }

  /* ---------- contact form ---------- */
  var contactForm = document.getElementById('contact-form');
  if (contactForm) {
    clearOnInput(contactForm);
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      if (!required(contactForm.querySelector('#cf-name'), 'Your name')) ok = false;
      if (!validPhone(contactForm.querySelector('#cf-phone'))) ok = false;
      if (!validEmail(contactForm.querySelector('#cf-email'))) ok = false;
      var consent = contactForm.querySelector('#cf-consent');
      var consentErr = contactForm.querySelector('#cf-consent-error');
      if (!consent.checked) {
        if (consentErr) { consentErr.textContent = 'Tick the consent box so we can reply to your enquiry.'; consentErr.classList.add('show'); }
        ok = false;
      } else if (consentErr) consentErr.classList.remove('show');
      if (!ok) return;
      contactForm.hidden = true;
      var done = document.getElementById('contact-success');
      if (done) { done.hidden = false; done.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  }

  /* ---------- print button (legal pages) ---------- */
  var printBtn = document.getElementById('print-doc');
  if (printBtn) printBtn.addEventListener('click', function () { window.print(); });
})();
