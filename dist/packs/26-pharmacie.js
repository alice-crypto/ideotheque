/* Pack 26 — Pharmacie */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Une grille des prises par jour et par moment
  FX.register('dose-grid', {
    setup: function (el) {
      var M = (el.dataset.fxMoments || 'Matin,Midi,Soir').split(','), D = (el.dataset.fxDays || 'Lun,Mar,Mer,Jeu').split(','), g = U.make('div', 'fx-dg', el), out = U.make('output', '', el);
      g.style.setProperty('--fx-c', D.length);
      out.setAttribute('aria-live', 'polite');
      U.make('span', '', g);
      D.forEach(function (d) { U.make('b', '', g).textContent = d; });
      M.forEach(function (m) {
        U.make('b', '', g).textContent = m;
        D.forEach(function (d) {
          var c = U.make('input', '', g);
          c.type = 'checkbox'; c.setAttribute('aria-label', m + ', ' + d);
        });
      });
      var go = function () { out.textContent = g.querySelectorAll(':checked').length + ' prises sur ' + D.length * M.length; };
      g.addEventListener('change', go);
      go();
    }
  });

  // Un pilulier de la semaine dont on ouvre les couvercles
  FX.register('pill-organizer', {
    setup: function (el) {
      var L = ['L', 'M', 'M', 'J', 'V', 'S', 'D'], N = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'], today = (new Date().getDay() + 6) % 7, row = U.make('div', 'fx-po', el), out = U.make('output', '', el);
      out.setAttribute('aria-live', 'polite');
      var go = function () { out.textContent = row.querySelectorAll('[aria-pressed=true]').length + ' jours pris cette semaine'; };
      L.forEach(function (d, i) {
        var b = U.make('button', i === today ? 'fx-now' : '', row);
        b.type = 'button'; b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-label', N[i] + (i === today ? ", aujourd'hui" : ''));
        b.innerHTML = '<u aria-hidden="true"></u><i aria-hidden="true"></i><span>' + d + '</span>';
        b.addEventListener('click', function () { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true'); go(); });
      });
      go();
    }
  });
})(window.FX);
