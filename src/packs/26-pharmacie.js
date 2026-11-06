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
})(window.FX);
