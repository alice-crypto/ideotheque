/* Pack 12 — Typographie cinétique */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Une vague de graisse parcourt le mot, lettre après lettre
  FX.register('weight-wave', {
    setup: function (el) { U.splitChars(el); el._fxChars = el.querySelectorAll('.fx-char'); },
    tick: function (el, dt, t) {
      if (U.reduced) return;
      var speed = U.num(el, 'fxSpeed', 1);
      el._fxChars.forEach(function (c, i) {
        c.style.setProperty('--fx-w', ((Math.sin(t * .003 * speed - i * .55) + 1) / 2).toFixed(3));
      });
    }
  });

  // Les lettres tombent du haut et rebondissent sur la ligne de base
  FX.register('letter-rain', {
    entrance: true,
    setup: function (el) { U.splitChars(el); el._fxChars = Array.prototype.slice.call(el.querySelectorAll('.fx-char')); },
    reset: function (el) { el._fxRun = (el._fxRun || 0) + 1; el._fxChars.forEach(function (c) { c.style.transform = ''; c.style.opacity = 0; }); },
    enter: function (el) {
      if (U.reduced) { el._fxChars.forEach(function (c) { c.style.opacity = 1; }); return; }
      var run = el._fxRun = (el._fxRun || 0) + 1;
      var g = U.num(el, 'fxGravity', 2600);
      var bits = el._fxChars.map(function () { return { y: -U.rand(120, 260), v: 0, wait: U.rand(0, .5), n: 0 }; });
      var last = 0;
      (function frame(t) {
        if (run !== el._fxRun) return;
        var dt = last ? Math.min((t - last) / 1000, .04) : 0;
        last = t;
        var moving = false;
        bits.forEach(function (b, i) {
          var c = el._fxChars[i];
          if (b.wait > 0) { b.wait -= dt; moving = true; return; }
          c.style.opacity = 1;
          if (b.n > 3) return;
          moving = true;
          b.v += g * dt;
          b.y += b.v * dt;
          if (b.y > 0) { b.y = 0; b.v *= -.42; b.n++; }
          c.style.transform = 'translateY(' + b.y.toFixed(1) + 'px)';
        });
        if (moving) U.raf(frame);
      })(0);
    }
  });

  // Le titre se resserre pendant qu'on défile vers lui
  FX.register('headline-collapse', {
    scroll: true,
    setup: function (el) { el.style.setProperty('--fx-gap', U.num(el, 'fxGap', .6) + 'em'); }
  });
})(window.FX);
