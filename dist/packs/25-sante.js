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
})(window.FX);
