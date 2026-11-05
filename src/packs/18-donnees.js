/* Pack 18 — Données et présentation */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Des barres rayonnent autour d'un centre
  FX.register('radial-bars', {
    entrance: true,
    setup: function (el) {
      var v = (el.dataset.fxValues || '40,70,55,90,35,65,80,50,75,45,60,85').split(',').map(Number), max = Math.max.apply(null, v);
      el.setAttribute('role', 'img');
      el.setAttribute('aria-label', 'Valeurs : ' + v.join(', '));
      v.forEach(function (n, i) {
        var b = U.make('i', '', el);
        b.style.setProperty('--fx-a', (i / v.length * 360) + 'deg');
        b.style.setProperty('--fx-v', n / max);
        b.style.setProperty('--fx-i', i);
      });
    }
  });
})(window.FX);
