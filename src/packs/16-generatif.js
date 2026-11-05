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

  // Des courbes de niveau glissent comme sur une carte
  FX.register('contour-lines', {
    setup: function (el) { U.ensurePositioned(el); el._fxCv = U.make('canvas', 'fx-gen', el); el._fxCv.setAttribute('aria-hidden', 'true'); el._fxT = 0; },
    tick: function (el, dt, t) {
      var cv = el._fxCv, w = cv.clientWidth, h = cv.clientHeight;
      if (!w) return;
      el._fxT += dt;
      if (el._fxT < .08 && cv.width === w) return;
      if (U.reduced && cv.width === w) return;
      el._fxT = 0;
      cv.width = w; cv.height = h;
      var c = cv.getContext('2d'), S = 14, ph = t * .00012;
      var f = function (x, y) { return Math.sin(x * .011 + ph) + Math.cos(y * .014 - ph) + Math.sin((x + y) * .007 + ph * 2); };
      c.strokeStyle = getComputedStyle(cv).color;
      c.globalAlpha = .65;
      c.beginPath();
      for (var lv = -2.4; lv < 2.6; lv += .4) {
        for (var y = 0; y < h; y += S) for (var x = 0; x < w; x += S) {
          var a = f(x, y) - lv, b = f(x + S, y) - lv, d = f(x, y + S) - lv, e = f(x + S, y + S) - lv, P = [];
          if (a * b < 0) P.push([x + S * a / (a - b), y]);
          if (b * e < 0) P.push([x + S, y + S * b / (b - e)]);
          if (d * e < 0) P.push([x + S * d / (d - e), y + S]);
          if (a * d < 0) P.push([x, y + S * a / (a - d)]);
          if (P.length >= 2) { c.moveTo(P[0][0], P[0][1]); c.lineTo(P[1][0], P[1][1]); }
        }
      }
      c.stroke();
    }
  });

  // Un petit automate cellulaire vit en fond
  FX.register('game-of-life', {
    setup: function (el) {
      U.ensurePositioned(el);
      var cv = el._fxCv = U.make('canvas', 'fx-gen', el);
      cv.setAttribute('aria-hidden', 'true');
      el._fxG = null; el._fxT = 0;
    },
    tick: function (el, dt) {
      var cv = el._fxCv, S = U.num(el, 'fxCell', 8), w = Math.ceil(cv.clientWidth / S), h = Math.ceil(cv.clientHeight / S);
      if (!w) return;
      if (!el._fxG || el._fxW !== w) {
        el._fxW = w; el._fxH = h; cv.width = w * S; cv.height = h * S;
        el._fxG = new Uint8Array(w * h);
        for (var i = 0; i < w * h; i++) el._fxG[i] = Math.random() < .28 ? 1 : 0;
      }
      el._fxT += dt;
      var first = !el._fxDrawn;
      if (!first && (U.reduced || el._fxT < U.num(el, 'fxStep', 180) / 1000)) return;
      el._fxT = 0; el._fxDrawn = true;
      var g = el._fxG, n = new Uint8Array(w * h), H = el._fxH, alive = 0;
      for (var y = 0; y < H; y++) for (var x = 0; x < w; x++) {
        var k = 0;
        for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) if (dx || dy) k += g[((y + dy + H) % H) * w + (x + dx + w) % w];
        var v = g[y * w + x] ? (k === 2 || k === 3) : k === 3;
        n[y * w + x] = v ? 1 : 0;
        alive += v ? 1 : 0;
      }
      if (alive < w * h * .04) for (var r = 0; r < w * h * .1; r++) n[Math.floor(Math.random() * w * h)] = 1;
      el._fxG = n;
      var c = cv.getContext('2d');
      c.clearRect(0, 0, cv.width, cv.height);
      c.fillStyle = getComputedStyle(cv).color;
      for (y = 0; y < H; y++) for (x = 0; x < w; x++) if (n[y * w + x]) c.fillRect(x * S + 1, y * S + 1, S - 2, S - 2);
    }
  });

  // Un ruban de lignes ondule comme un tissu dans le vent
  FX.register('ribbon-sine', {
    setup: function (el) { U.ensurePositioned(el); el._fxCv = U.make('canvas', 'fx-gen', el); el._fxCv.setAttribute('aria-hidden', 'true'); },
    tick: function (el, dt, t) {
      var cv = el._fxCv, w = cv.clientWidth, h = cv.clientHeight;
      if (!w) return;
      if (U.reduced && el._fxDone) return;
      el._fxDone = true;
      if (cv.width !== w) { cv.width = w; cv.height = h; }
      var c = cv.getContext('2d'), n = U.num(el, 'fxLines', 34), T = t * .0005;
      c.clearRect(0, 0, w, h);
      c.strokeStyle = getComputedStyle(cv).color;
      for (var i = 0; i < n; i++) {
        var q = i / n;
        c.globalAlpha = .15 + Math.sin(q * 3.14) * .55;
        c.beginPath();
        for (var x = 0; x <= w; x += 8) {
          var y = h / 2 + Math.sin(x * .012 + T + q * 1.7) * h * .24 * (1 + Math.sin(T * .7 + q * 3)) * .6 + (q - .5) * h * .3 * Math.cos(x * .007 + T);
          if (x) c.lineTo(x, y); else c.moveTo(x, y);
        }
        c.stroke();
      }
    }
  });

  // Des particules forment un mot et s'écartent du curseur
  FX.register('particle-text', {
    setup: function (el) {
      var txt = el.textContent.trim(), cs = getComputedStyle(el), fs = parseFloat(cs.fontSize) || 48;
      el.setAttribute('aria-label', txt); el.setAttribute('role', 'img');
      el.textContent = '';
      var cv = U.make('canvas', '', el), font = (cs.fontWeight || 700) + ' ' + fs + 'px ' + cs.fontFamily;
      var g = el._fxG = { cv: cv, p: [], mx: -999, my: -999, col: cs.color };
      var scan = function () {
        var m = document.createElement('canvas').getContext('2d');
        m.font = font;
        var w = Math.ceil(m.measureText(txt).width) + 8, h = Math.ceil(fs * 1.3);
        m.canvas.width = w; m.canvas.height = h;
        m.font = font; m.textBaseline = 'middle'; m.fillText(txt, 4, h / 2);
        var d = m.getImageData(0, 0, w, h).data, step = U.num(el, 'fxStep', 3);
        g.p = [];
        for (var y = 0; y < h; y += step) for (var x = 0; x < w; x += step) if (d[(y * w + x) * 4 + 3] > 128)
          g.p.push({ tx: x, ty: y, x: U.reduced ? x : Math.random() * w, y: U.reduced ? y : Math.random() * h, vx: 0, vy: 0 });
        cv.width = w; cv.height = h;
      };
      scan();
      if (document.fonts) document.fonts.load(font).then(scan);
      el.addEventListener('pointermove', function (e) { var r = cv.getBoundingClientRect(); g.mx = e.clientX - r.left; g.my = e.clientY - r.top; });
      el.addEventListener('pointerleave', function () { g.mx = g.my = -999; });
    },
    tick: function (el) {
      var g = el._fxG, c = g.cv.getContext('2d');
      c.clearRect(0, 0, g.cv.width, g.cv.height);
      c.fillStyle = g.col;
      g.p.forEach(function (p) {
        var dx = p.x - g.mx, dy = p.y - g.my, d = dx * dx + dy * dy;
        if (d < 1600 && !U.reduced) { var f = (1600 - d) / 1600 * 2.4; d = Math.sqrt(d) || 1; p.vx += dx / d * f; p.vy += dy / d * f; }
        p.vx += (p.tx - p.x) * .05; p.vy += (p.ty - p.y) * .05;
        p.vx *= .82; p.vy *= .82;
        p.x += p.vx; p.y += p.vy;
        c.fillRect(p.x, p.y, 2, 2);
      });
    }
  });

  // Des gouttes glissent sur une vitre
  FX.register('rain-glass', {
    setup: function (el) {
      U.ensurePositioned(el);
      el._fxCv = U.make('canvas', 'fx-gen', el);
      el._fxCv.setAttribute('aria-hidden', 'true');
      el._fxD = [];
      for (var i = 0; i < U.num(el, 'fxDrops', 28); i++) el._fxD.push({ x: Math.random(), y: Math.random(), r: U.rand(1.2, 3.4), v: 0, w: U.rand(0, 2) });
    },
    tick: function (el, dt) {
      var cv = el._fxCv, w = cv.clientWidth, h = cv.clientHeight;
      if (!w) return;
      if (cv.width !== w) { cv.width = w; cv.height = h; }
      if (U.reduced && el._fxDone) return;
      el._fxDone = true;
      var c = cv.getContext('2d');
      c.globalCompositeOperation = 'destination-out';
      c.fillStyle = 'rgba(0,0,0,.05)';
      c.fillRect(0, 0, w, h);
      c.globalCompositeOperation = 'source-over';
      c.fillStyle = getComputedStyle(cv).color;
      el._fxD.forEach(function (d) {
        d.w -= dt;
        if (d.w <= 0) { d.v = U.rand(.06, .4); d.w = U.rand(.2, 1.8); }
        d.y += d.v * dt;
        d.v *= .985;
        if (d.y > 1.05) { d.y = -.05; d.x = Math.random(); }
        c.beginPath();
        c.ellipse(d.x * w, d.y * h, d.r, d.r * 1.3, 0, 0, 7);
        c.fill();
      });
    }
  });
})(window.FX);
