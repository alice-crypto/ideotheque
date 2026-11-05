/* Pack 20 — Nouvelles entrées */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Les enfants arrivent selon leur position réelle à l'écran
  FX.register('cascade-rows', {
    entrance: true,
    setup: function (el) {
      var tops = [];
      Array.prototype.forEach.call(el.children, function (c) { if (tops.indexOf(c.offsetTop) < 0) tops.push(c.offsetTop); });
      Array.prototype.forEach.call(el.children, function (c) { c.style.setProperty('--fx-rw', tops.indexOf(c.offsetTop)); });
    }
  });

  // Un projecteur balaye l'élément puis l'éclaire en entier
  FX.register('spotlight-in', {
    entrance: true,
    setup: function (el) { el.style.setProperty('--fx-r', '0%'); },
    reset: function (el) { el.style.setProperty('--fx-r', '0%'); },
    enter: function (el) {
      U.tween(el, U.num(el, 'fxDuration', 1400), function (p) {
        var e = U.easeInOut(p);
        el.style.setProperty('--fx-x', (15 + Math.sin(e * 3.14) * 70).toFixed(1) + '%');
        el.style.setProperty('--fx-y', (30 + e * 20).toFixed(1) + '%');
        el.style.setProperty('--fx-r', (10 + e * e * 130).toFixed(1) + '%');
      });
    }
  });

  // Les lignes glissent de chaque côté et se calent sur la marge
  FX.register('typeset-lines', {
    entrance: true,
    setup: function (el) {
      var run = function () { U.splitLines(el); el.querySelectorAll('.fx-line > span').forEach(function (s, i) { s.style.setProperty('--fx-dir', i % 2 ? 1 : -1); }); };
      run();
      U.onResize(run);
    }
  });
})(window.FX);
