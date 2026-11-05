/* Pack 15 — Passages et images */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Des tuiles couvrent l'écran en une vague diagonale
  FX.register('diagonal-tiles', { transition: { pieces: 70, cover: 900, uncover: 950, build: function (o) {
    Array.prototype.forEach.call(o.children, function (p, i) {
      var c = i % 10, r = Math.floor(i / 10);
      p.style.left = c * 10 + '%'; p.style.top = r * 100 / 7 + '%';
      p.style.setProperty('--fx-d', (c + r) * 28 + 'ms');
    });
  } } });

  // Des tuiles se posent en spirale vers le centre
  FX.register('spiral-tiles', { transition: { pieces: 48, cover: 1050, uncover: 1050, build: function (o) {
    var C = 8, R = 6, t = 0, l = 0, b = R - 1, r = C - 1, n = 0, kids = o.children;
    var place = function (x, y) {
      var p = kids[y * C + x];
      p.style.left = x * 100 / C + '%'; p.style.top = y * 100 / R + '%';
      p.style.setProperty('--fx-d', n++ * 12 + 'ms');
    };
    while (t <= b && l <= r) {
      for (var x = l; x <= r; x++) place(x, t); t++;
      for (var y = t; y <= b; y++) place(r, y); r--;
      if (t <= b) { for (x = r; x >= l; x--) place(x, b); b--; }
      if (l <= r) { for (y = b; y >= t; y--) place(l, y); l++; }
    }
  } } });

  // Une aiguille balaye l'écran comme un cadran
  FX.register('clock-wipe', { transition: { pieces: 1, cover: 800, uncover: 850, build: function (o) {
    var p = o.firstChild, start = null, outStart = null;
    (function run(t) {
      if (!o.isConnected) return;
      if (start === null) start = t;
      if (o.classList.contains('fx-uncover') && outStart === null) outStart = t;
      p.style.setProperty('--fx-ang', (o._fxArrive ? 360 : U.easeInOut(Math.min(1, (t - start) / 760)) * 360).toFixed(1) + 'deg');
      p.style.setProperty('--fx-from', (outStart === null ? 0 : U.easeInOut(Math.min(1, (t - outStart) / 800)) * 360).toFixed(1) + 'deg');
      U.raf(run);
    })(0);
  } } });

  // Des gouttes d'encre grandissent jusqu'à couvrir l'écran
  FX.register('ink-drops', { transition: { pieces: 12, cover: 950, uncover: 900, build: function (o) {
    Array.prototype.forEach.call(o.children, function (p, i) {
      p.style.left = (i % 4 + U.rand(.1, .9)) * 25 + '%';
      p.style.top = (Math.floor(i / 4) + U.rand(.1, .9)) * 33 + '%';
      p.style.setProperty('--fx-d', U.rand(0, 280).toFixed(0) + 'ms');
    });
  } } });

  // Des colonnes montent en escalier
  FX.register('stair-bars', { transition: { pieces: 9, cover: 880, uncover: 920, build: function (o) {
    var flip = Math.random() < .5, n = o.children.length;
    Array.prototype.forEach.call(o.children, function (p, i) {
      p.style.left = i * 100 / n + '%';
      p.style.setProperty('--fx-d', (flip ? n - 1 - i : i) * 45 + 'ms');
    });
  } } });
})(window.FX);
