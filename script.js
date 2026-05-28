/* ============================================================
   ERREETTE AUTORIMESSE – script.js
   ============================================================ */
'use strict';

/* ---- Navbar: scroll effect ---- */
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });
}

/* ---- Hamburger menu ---- */
const hamburger = document.getElementById('hamburger');
const navLinksEl = document.getElementById('nav-links');

if (hamburger && navLinksEl) {
  hamburger.addEventListener('click', () => {
    const isOpen = navLinksEl.classList.toggle('open');
    hamburger.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    hamburger.setAttribute('aria-label', isOpen ? 'Chiudi menu' : 'Apri menu');
  });

  // Close menu when a link is clicked
  navLinksEl.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinksEl.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.setAttribute('aria-label', 'Apri menu');
    });
  });

  // Close menu on outside click
  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target)) {
      navLinksEl.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ---- Active nav link highlight on scroll ---- */
const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.nav-links a[href^="#"]');

if (sections.length && navItems.length) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navItems.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-50% 0px -50% 0px', threshold: 0 });

  sections.forEach(s => sectionObserver.observe(s));
}

/* ---- Scroll-in animations ---- */
const animItems = document.querySelectorAll(
  '.service-card, .review-card, .location-card, .pricing-table, .phone-card'
);

if (animItems.length && 'IntersectionObserver' in window) {
  animItems.forEach(el => el.classList.add('anim-item'));

  const animObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger delay based on sibling index
        const siblings = Array.from(entry.target.parentElement?.children ?? []);
        const idx = siblings.indexOf(entry.target);
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, idx * 80);
        animObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  animItems.forEach(el => animObserver.observe(el));
}

/* ---- Smooth scroll for anchor links (fallback for older browsers) ---- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    const offset = 80; // navbar height
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ---- Contact Form – Netlify Forms ---- */
const form           = document.getElementById('contact-form');
const formSuccess    = document.getElementById('form-success');
const formSuccessMsg = document.getElementById('form-success-msg');

if (form && formSuccess) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome     = form.querySelector('#nome')?.value.trim() ?? '';
    const telefono = form.querySelector('#telefono')?.value.trim() ?? '';

    if (!nome) {
      showFieldError(form.querySelector('#nome'), 'Inserisci il tuo nome.');
      return;
    }
    if (!telefono) {
      showFieldError(form.querySelector('#telefono'), 'Inserisci un numero di telefono.');
      return;
    }

    const submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px;animation:spin 1s linear infinite"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> Invio in corso…';
    }

    try {
      const data = new FormData(form);
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(data).toString(),
      });

      if (response.ok) {
        if (formSuccessMsg) {
          formSuccessMsg.textContent =
            `Grazie ${nome}! Ti risponderemo al più presto al numero ${telefono}.`;
        }
        form.style.display = 'none';
        formSuccess.classList.add('visible');
        formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        throw new Error('Risposta non ok: ' + response.status);
      }
    } catch (err) {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px"><path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg> Invia Richiesta';
      }
      alert('Si è verificato un errore. Prova a chiamarci direttamente oppure riprova tra qualche istante.');
    }
  });
}

function showFieldError(field, msg) {
  if (!field) return;
  field.focus();
  field.style.borderColor = 'var(--red)';
  field.style.boxShadow   = '0 0 0 3px rgba(227,6,19,0.2)';
  field.addEventListener('input', () => {
    field.style.borderColor = '';
    field.style.boxShadow   = '';
  }, { once: true });
  field.setCustomValidity(msg);
  field.reportValidity();
  field.setCustomValidity('');
}
