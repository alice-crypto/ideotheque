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

  // Des bulles se rencontrent et fusionnent comme dans une lampe à lave
  FX.register('metaballs', {
    setup: function (el) {
      U.ensurePositioned(el);
      if (!document.getElementById('fx-meta')) {
        var d = document.createElement('div');
        d.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
        d.innerHTML = '<svg aria-hidden="true"><filter id="fx-meta"><feGaussianBlur stdDeviation="12"/><feColorMatrix values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 30 -12"/></filter></svg>';
        document.body.appendChild(d);
      }
      var box = U.make('div', 'fx-meta-box', el);
      box.setAttribute('aria-hidden', 'true');
      el._fxB = [];
      for (var i = 0; i < U.num(el, 'fxCount', 7); i++) {
        var b = U.make('i', '', box), s = U.rand(36, 90);
        b.style.width = b.style.height = s + 'px';
        el._fxB.push({ el: b, s: s, x: Math.random(), y: Math.random(), vx: U.rand(-.1, .1), vy: U.rand(-.12, .12) });
      }
    },
    tick: function (el, dt) {
      var w = el.offsetWidth, h = el.offsetHeight;
      el._fxB.forEach(function (b) {
        if (!U.reduced) {
          b.x += b.vx * dt; b.y += b.vy * dt;
          if (b.x < 0 || b.x > 1) b.vx *= -1;
          if (b.y < 0 || b.y > 1) b.vy *= -1;
        }
        b.el.style.transform = 'translate(' + (b.x * w - b.s / 2).toFixed(1) + 'px,' + (b.y * h - b.s / 2).toFixed(1) + 'px)';
      });
    }
  });

  // Des cellules vivantes se déforment doucement
  FX.register('voronoi-cells', {
    setup: function (el) {
      U.ensurePositioned(el);
      var cv = U.make('canvas', 'fx-vor', el);
      cv.setAttribute('aria-hidden', 'true');
      cv.width = 64; cv.height = 48;
      var pts = [];
      for (var i = 0; i < U.num(el, 'fxCount', 14); i++) pts.push({ x: Math.random(), y: Math.random(), a: U.rand(0, 6), s: U.rand(.1, .3) });
      el._fxV = { cv: cv, pts: pts, t: 0 };
    },
    tick: function (el, dt, t) {
      var g = el._fxV;
      g.t += dt;
      if (g.t < .05 && g.drawn) return;
      if (U.reduced && g.drawn) return;
      g.t = 0; g.drawn = true;
      var c = g.cv.getContext('2d'), W = 64, H = 48, img = c.createImageData(W, H), d = img.data;
      var a = U.cssVar(el, '--fx-cell', '#ff5b2e'), hex = parseInt(a.replace('#', ''), 16), R = hex >> 16 & 255, G = hex >> 8 & 255, B = hex & 255;
      var px = g.pts.map(function (p) { return [(p.x + Math.sin(t * .0003 * p.s * 4 + p.a) * .1) * W, (p.y + Math.cos(t * .0003 * p.s * 4 + p.a) * .1) * H]; });
      for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) {
        var m1 = 1e9, m2 = 1e9;
        for (var k = 0; k < px.length; k++) {
          var dx = x - px[k][0], dy = y - px[k][1], q = dx * dx + dy * dy;
          if (q < m1) { m2 = m1; m1 = q; } else if (q < m2) m2 = q;
        }
        var e = Math.sqrt(m2) - Math.sqrt(m1), i = (y * W + x) * 4, v = Math.min(1, e / 4);
        d[i] = R; d[i + 1] = G; d[i + 2] = B; d[i + 3] = (1 - v) * 255;
      }
      c.putImageData(img, 0, 0);
    }
  });
})(window.FX);
