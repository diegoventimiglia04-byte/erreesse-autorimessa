/* ============================================================
   ERREESSE PARCHEGGI – cms-loader.js
   Legge i file JSON in /data/ e aggiorna il DOM.
   I testi hardcoded nell'HTML fungono da fallback se il fetch
   fallisce (es. sviluppo locale senza server).
   ============================================================ */
(async function () {
  'use strict';

  // ── Fetch tutti e 3 i file JSON in parallelo ──────────────────────────────
  let prezzi, recensioni, servizi;
  try {
    [prezzi, recensioni, servizi] = await Promise.all([
      fetch('/data/prezzi.json').then(r => { if (!r.ok) throw r; return r.json(); }),
      fetch('/data/recensioni.json').then(r => { if (!r.ok) throw r; return r.json(); }),
      fetch('/data/servizi.json').then(r => { if (!r.ok) throw r; return r.json(); }),
    ]);
  } catch {
    // Fetch fallito (es. file:// locale): lascia i valori hardcoded nel HTML
    return;
  }

  // ── PREZZI PARCHEGGIO ─────────────────────────────────────────────────────
  const parcheggioTbody = document.querySelector('#prezzi .pricing-grid .pricing-table:nth-child(1) tbody');
  if (parcheggioTbody) {
    const r = parcheggioTbody.querySelectorAll('tr');
    if (r[0]) { r[0].cells[1].textContent = prezzi.parcheggio.auto_oraria;    r[0].cells[2].textContent = prezzi.parcheggio.auto_std_24h; }
    if (r[1]) { r[1].cells[1].textContent = prezzi.parcheggio.auto_oraria;    r[1].cells[2].textContent = prezzi.parcheggio.auto_bel_24h; }
    if (r[2]) { r[2].cells[1].textContent = prezzi.parcheggio.furgone_oraria; r[2].cells[2].textContent = prezzi.parcheggio.furgone_24h; }
  }

  // ── PREZZI LAVAGGIO ───────────────────────────────────────────────────────
  const lavaggioTbody = document.querySelector('#prezzi .pricing-grid .pricing-table:nth-child(2) tbody');
  if (lavaggioTbody) {
    const r = lavaggioTbody.querySelectorAll('tr');
    if (r[0]) r[0].cells[1].innerHTML = `<strong>${prezzi.lavaggio.piccola}</strong>`;
    if (r[1]) r[1].cells[1].innerHTML = `<strong>${prezzi.lavaggio.media}</strong>`;
    if (r[2]) r[2].cells[1].innerHTML = `<strong>${prezzi.lavaggio.grande}</strong>`;
    if (r[3]) r[3].cells[1].innerHTML = `<strong>${prezzi.lavaggio.suv}</strong>`;
    if (r[4]) r[4].cells[1].innerHTML = `<strong>${prezzi.lavaggio.aspirazione}</strong>`;
  }

  // ── PREZZI GOMMISTA ───────────────────────────────────────────────────────
  const gommistaGTbody = document.querySelector('#prezzi .pricing-grid .pricing-table:nth-child(3) tbody');
  if (gommistaGTbody) {
    const r = gommistaGTbody.querySelectorAll('tr');
    if (r[0]) r[0].cells[1].innerHTML = `<strong>${prezzi.gommista.cambio_cerchio}</strong>`;
    if (r[2]) r[2].cells[1].innerHTML = `<strong>${prezzi.gommista.sanificazione_ac}</strong>`;
  }

  // ── SERVIZI – testo, titolo, foto ─────────────────────────────────────────
  document.querySelectorAll('[data-service]').forEach(card => {
    const key = card.dataset.service;
    const svc = servizi[key];
    if (!svc) return;

    const h3  = card.querySelector('h3');
    const p   = card.querySelector('p');
    const img = card.querySelector('.service-card-img img');

    if (h3)  h3.textContent = svc.titolo;
    if (p)   p.textContent  = svc.testo;
    if (img && svc.immagine) {
      // Gestisce sia percorsi relativi che assoluti (/uploads/...)
      img.src = svc.immagine;
      img.alt = svc.titolo;
    }
  });

  // ── RECENSIONI – re-render completo dalla lista JSON ─────────────────────
  const grid = document.getElementById('reviews-grid');
  if (grid && Array.isArray(recensioni.lista) && recensioni.lista.length) {
    grid.innerHTML = recensioni.lista.map(r => {
      const initials = r.nome.trim().split(/\s+/).map(w => w[0].toUpperCase()).slice(0, 2).join('');
      // Escaping base per sicurezza
      const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
      return `
        <article class="review-card">
          <div class="review-stars" aria-label="5 stelle su 5">★★★★★</div>
          <blockquote>"${esc(r.testo)}"</blockquote>
          <div class="reviewer">
            <div class="reviewer-avatar" aria-hidden="true">${esc(initials)}</div>
            <div>
              <strong>${esc(r.nome)}</strong>
              <span>${esc(r.zona)}</span>
            </div>
          </div>
        </article>`;
    }).join('');
  }

  // ── Netlify Identity: redirect al login dopo l'autenticazione ─────────────
  if (window.netlifyIdentity) {
    window.netlifyIdentity.on('init', user => {
      if (!user) {
        window.netlifyIdentity.on('login', () => {
          document.location.href = '/admin/';
        });
      }
    });
  }

})();
