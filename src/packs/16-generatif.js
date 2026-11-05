/* Pack 16 — Fonds génératifs */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Des lignes suivent un courant invisible et dessinent des veines
  FX.register('flow-field', {
    setup: function (el) {
      U.ensurePositioned(el);
      var cv = U.make('canvas', 'fx-gen', el);
      cv.setAttribute('aria-hidden', 'true');
      el._fxG = { cv: cv, p: [], w: 0, h: 0 };
    },
    tick: function (el, dt, t) {
      var g = el._fxG, cv = g.cv, w = cv.clientWidth, h = cv.clientHeight, c = cv.getContext('2d');
      if (!w) return;
      if (w !== g.w || h !== g.h) {
        g.w = cv.width = w; g.h = cv.height = h; g.p = [];
        for (var i = 0; i < U.num(el, 'fxCount', 140); i++) g.p.push({ x: Math.random() * w, y: Math.random() * h, l: U.rand(40, 160) });
        c.fillStyle = getComputedStyle(el).backgroundColor;
      }
      if (U.reduced && g.done) return;
      c.globalCompositeOperation = 'destination-out';
      c.fillStyle = 'rgba(0,0,0,.035)';
      c.fillRect(0, 0, w, h);
      c.globalCompositeOperation = 'source-over';
      c.strokeStyle = getComputedStyle(cv).color;
      c.lineWidth = 1;
      c.beginPath();
      var scale = U.num(el, 'fxScale', .006), steps = U.reduced ? 80 : 1;
      for (var s = 0; s < steps; s++) g.p.forEach(function (p) {
        var a = (Math.sin(p.x * scale + t * .0001) + Math.cos(p.y * scale * 1.3)) * 2.4;
        c.moveTo(p.x, p.y);
        p.x += Math.cos(a) * 1.3; p.y += Math.sin(a) * 1.3;
        c.lineTo(p.x, p.y);
        if (--p.l < 0 || p.x < 0 || p.y < 0 || p.x > w || p.y > h) { p.x = Math.random() * w; p.y = Math.random() * h; p.l = U.rand(40, 160); }
      });
      c.stroke();
      g.done = true;
    }
  });
})(window.FX);
