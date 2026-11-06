/* Pack 25 — Santé */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Une semaine de rendez-vous : on choisit le jour, puis l'heure
  FX.register('appointment-week', {
    setup: function (el) {
      var hours = (el.dataset.fxHours || '9:00,10:30,14:00,16:30').split(','), days = U.make('div', 'fx-aw-d', el), slots = U.make('div', 'fx-aw-s', el), out = U.make('output', '', el);
      out.setAttribute('aria-live', 'polite');
      out.textContent = 'Choisissez un jour';
      for (var i = 1; i <= U.num(el, 'fxDays', 5); i++) (function (i) {
        var d = new Date(Date.now() + i * 86400000), b = U.make('button', '', days);
        b.type = 'button'; b.setAttribute('aria-pressed', 'false');
        b.innerHTML = '<small>' + d.toLocaleDateString('fr-FR', { weekday: 'short' }) + '</small>' + d.getDate();
        b.addEventListener('click', function () {
          days.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
          slots.innerHTML = '';
          hours.forEach(function (h, n) {
            if ((i + n) % 3 === 2) return;
            var s = U.make('button', '', slots);
            s.type = 'button'; s.textContent = h; s.style.setProperty('--fx-i', n);
            s.addEventListener('click', function () {
              slots.querySelectorAll('button').forEach(function (x) { x.classList.toggle('fx-on', x === s); });
              out.textContent = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) + ' à ' + h;
              el.dispatchEvent(new CustomEvent('fx:slot', { bubbles: true, detail: { date: d, hour: h } }));
            });
          });
          out.textContent = 'Choisissez une heure';
        });
      })(i);
    }
  });

  // Une silhouette dont on choisit une zone pour orienter la suite
  FX.register('body-map', {
    setup: function (el) {
      var Z = { Tête: 'M50 4a12 13 0 1 1-.1 0Z', Épaule: 'M28 32h44l6 14H22Z', Dos: 'M34 46h32l-2 34H36Z', Bras: 'M22 46h12l-4 42H14ZM66 46h12l8 42H70Z', Jambes: 'M36 80h13l-2 66H34ZM51 80h13l2 66H53Z' };
      var txt = JSON.parse(el.dataset.fxItems || '{}');
      var s = '<svg viewBox="0 0 100 150" role="group" aria-label="Zones du corps">';
      Object.keys(Z).forEach(function (k) { s += '<path d="' + Z[k] + '" tabindex="0" role="button" aria-label="' + k + '" data-k="' + k + '"/>'; });
      el.innerHTML = s + '</svg><output aria-live="polite">Touchez une zone</output>';
      var out = el.querySelector('output');
      var pick = function (p) {
        el.querySelectorAll('path').forEach(function (x) { x.classList.toggle('fx-on', x === p); });
        out.innerHTML = '<b>' + p.dataset.k + '</b><br>' + (txt[p.dataset.k] || 'Voir les conseils pour cette zone');
        el.dispatchEvent(new CustomEvent('fx:zone', { bubbles: true, detail: { zone: p.dataset.k } }));
      };
      el.addEventListener('click', function (e) { if (e.target.dataset.k) pick(e.target); });
      el.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && e.target.dataset.k) { e.preventDefault(); pick(e.target); } });
    }
  });
})(window.FX);
