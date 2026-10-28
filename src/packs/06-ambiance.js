/* Pack 06 — Ambiances */
(function (FX) {
  'use strict';
  var U = FX.util;

  ['grain', 'aurora', 'gradient-drift', 'grid-floor', 'blob-bg', 'halftone', 'light-beams'].forEach(function (n) {
    FX.register(n, {});
  });

  // --- Calque canvas commun -------------------------------------------------

  function layer(el) {
    var c = U.make('canvas', 'fx-layer');
    c.setAttribute('aria-hidden', 'true');
    el.insertBefore(c, el.firstChild);
    var L = { c: c, ctx: c.getContext('2d'), w: 0, h: 0, drawn: false };
    L.fit = function () {
      var w = el.clientWidth;
      var h = el.clientHeight;
      if (w === L.w && h === L.h) return false;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      L.w = w;
      L.h = h;
      c.width = Math.max(1, w * dpr);
      c.height = Math.max(1, h * dpr);
      L.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      L.drawn = false;
      return true;
    };
    L.fit();
    if ('ResizeObserver' in window) new ResizeObserver(function () { L.fit(); }).observe(el);
    return L;
  }

  // Avec le mouvement réduit, on dessine une seule image fixe
  function frozen(L) {
    if (!U.reduced) return false;
    if (L.drawn) return true;
    L.drawn = true;
    return false;
  }

  function pointer(el, state) {
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      state.mx = e.clientX - r.left;
      state.my = e.clientY - r.top;
      state.inside = true;
    });
    el.addEventListener('pointerleave', function () { state.inside = false; });
  }

  // --- starfield ------------------------------------------------------------

  FX.register('starfield', {
    setup: function (el) {
      var L = el._fxL = layer(el);
      el._fxStars = Array.from({ length: U.num(el, 'fxCount', 220) }, function () {
        return { x: U.rand(-1, 1), y: U.rand(-1, 1), z: U.rand(0.05, 1) };
      });
      pointer(el, L);
    },
    tick: function (el, dt) {
      var L = el._fxL;
      if (frozen(L)) return;
      var ctx = L.ctx;
      var speed = U.num(el, 'fxSpeed', 0.25);
      var cx = L.w / 2 + (L.inside ? (L.mx - L.w / 2) * 0.15 : 0);
      var cy = L.h / 2 + (L.inside ? (L.my - L.h / 2) * 0.15 : 0);
      ctx.clearRect(0, 0, L.w, L.h);
      ctx.fillStyle = U.cssVar(el, '--fx-star', '#f4f1ea');
      el._fxStars.forEach(function (s) {
        s.z -= speed * dt;
        if (s.z <= 0.02) { s.x = U.rand(-1, 1); s.y = U.rand(-1, 1); s.z = 1; }
        var k = 0.5 / s.z;
        var x = cx + s.x * L.w * k * 0.5;
        var y = cy + s.y * L.h * k * 0.5;
        if (x < 0 || y < 0 || x > L.w || y > L.h) return;
        var size = Math.max(0.4, (1 - s.z) * 2.4);
        ctx.globalAlpha = Math.min(1, (1 - s.z) * 1.5);
        ctx.fillRect(x, y, size, size);
      });
      ctx.globalAlpha = 1;
    }
  });

  // --- constellation --------------------------------------------------------

  FX.register('constellation', {
    setup: function (el) {
      var L = el._fxL = layer(el);
      el._fxPts = Array.from({ length: U.num(el, 'fxCount', 46) }, function () {
        return { x: Math.random(), y: Math.random(), vx: U.rand(-0.02, 0.02), vy: U.rand(-0.02, 0.02) };
      });
      pointer(el, L);
    },
    tick: function (el, dt) {
      var L = el._fxL;
      if (frozen(L)) return;
      var ctx = L.ctx;
      var link = U.num(el, 'fxLink', 110);
      var color = U.cssVar(el, '--fx-line', 'rgba(185, 167, 255, 1)');
      var dot = U.cssVar(el, '--fx-node', '#f4f1ea');
      var pts = el._fxPts.map(function (p) {
        p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.x < 0 || p.x > 1) p.vx *= -1;
        if (p.y < 0 || p.y > 1) p.vy *= -1;
        return { x: p.x * L.w, y: p.y * L.h };
      });
      if (L.inside) pts.push({ x: L.mx, y: L.my, cursor: true });
      ctx.clearRect(0, 0, L.w, L.h);
      ctx.strokeStyle = color;
      for (var i = 0; i < pts.length; i++) {
        for (var j = i + 1; j < pts.length; j++) {
          var d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
          var reach = pts[j].cursor ? link * 1.6 : link;
          if (d > reach) continue;
          ctx.globalAlpha = (1 - d / reach) * 0.7;
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = dot;
      pts.forEach(function (p) { if (!p.cursor) ctx.fillRect(p.x - 1.5, p.y - 1.5, 3, 3); });
    }
  });

  // --- wave-lines -----------------------------------------------------------

  FX.register('wave-lines', {
    setup: function (el) { el._fxL = layer(el); el._fxT = 0; },
    tick: function (el, dt) {
      var L = el._fxL;
      if (frozen(L)) return;
      var ctx = L.ctx;
      var n = U.num(el, 'fxLines', 14);
      var a = U.cssVar(el, '--fx-w1', '#ff5b2e');
      var b = U.cssVar(el, '--fx-w2', '#b9a7ff');
      el._fxT += dt * U.num(el, 'fxSpeed', 0.6);
      var t = el._fxT;
      ctx.clearRect(0, 0, L.w, L.h);
      ctx.lineWidth = 1.4;
      for (var i = 0; i < n; i++) {
        var k = i / (n - 1);
        ctx.strokeStyle = k < 0.5 ? a : b;
        ctx.globalAlpha = 0.25 + 0.6 * Math.sin(k * Math.PI);
        ctx.beginPath();
        for (var x = 0; x <= L.w; x += 6) {
          var y = L.h * (0.25 + k * 0.5) +
            Math.sin(x * 0.012 + t + k * 2) * 18 * (0.5 + k) +
            Math.sin(x * 0.03 - t * 1.4) * 6;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
  });

  // --- code-rain ------------------------------------------------------------

  FX.register('code-rain', {
    setup: function (el) { el._fxL = layer(el); el._fxAcc = 0; },
    tick: function (el, dt) {
      var L = el._fxL;
      var size = U.num(el, 'fxSize', 14);
      var cols = Math.ceil(L.w / size);
      if (!el._fxDrops || el._fxDrops.length !== cols) {
        el._fxDrops = Array.from({ length: cols }, function () { return U.rand(-30, 0); });
        L.ctx.clearRect(0, 0, L.w, L.h);
      }
      if (frozen(L)) return;
      el._fxAcc += dt;
      if (el._fxAcc < 0.055) return;
      el._fxAcc = 0;
      var ctx = L.ctx;
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,.12)';
      ctx.fillRect(0, 0, L.w, L.h);
      ctx.globalCompositeOperation = 'source-over';
      ctx.font = size + 'px ui-monospace, Consolas, monospace';
      var color = U.cssVar(el, '--fx-rain', '#20c7a5');
      el._fxDrops.forEach(function (y, i) {
        var ch = U.GLYPHS[(Math.random() * U.GLYPHS.length) | 0];
        ctx.fillStyle = Math.random() < 0.08 ? '#eafff9' : color;
        ctx.fillText(ch, i * size, y * size);
        el._fxDrops[i] = (y * size > L.h && Math.random() > 0.97) ? 0 : y + 1;
      });
    }
  });

  // --- water-ripple ---------------------------------------------------------

  FX.register('water-ripple', {
    setup: function (el) {
      var L = el._fxL = layer(el);
      el._fxRings = [];
      el._fxAuto = 0;
      var last = 0;
      function drop(x, y, strength) {
        el._fxRings.push({ x: x, y: y, r: 0, a: strength });
      }
      el.addEventListener('pointermove', function (e) {
        var now = performance.now();
        if (now - last < 90) return;
        last = now;
        var r = el.getBoundingClientRect();
        drop(e.clientX - r.left, e.clientY - r.top, 0.5);
      });
      el.addEventListener('pointerdown', function (e) {
        var r = el.getBoundingClientRect();
        drop(e.clientX - r.left, e.clientY - r.top, 1);
      });
      el._fxDrop = drop;
      L.inside = false;
    },
    tick: function (el, dt) {
      var L = el._fxL;
      if (frozen(L)) return;
      el._fxAuto += dt;
      if (el._fxAuto > 1.4) { el._fxAuto = 0; el._fxDrop(U.rand(0, L.w), U.rand(0, L.h), 0.7); }
      var ctx = L.ctx;
      var color = U.cssVar(el, '--fx-ripple', '#9fe8ff');
      ctx.clearRect(0, 0, L.w, L.h);
      ctx.strokeStyle = color;
      el._fxRings = el._fxRings.filter(function (g) {
        g.r += 70 * dt;
        g.a -= 0.35 * dt;
        if (g.a <= 0) return false;
        for (var k = 0; k < 3; k++) {
          var r = g.r - k * 12;
          if (r <= 0) continue;
          ctx.globalAlpha = g.a * (1 - k * 0.3);
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.ellipse(g.x, g.y, r, r * 0.6, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        return true;
      });
      ctx.globalAlpha = 1;
    }
  });

  // --- vhs ------------------------------------------------------------------

  FX.register('vhs', {
    setup: function (el) {
      var ui = U.make('div', 'fx-vhs-ui', el);
      ui.setAttribute('aria-hidden', 'true');
      var top = U.make('span', '', ui);
      top.textContent = '● REC  ' + (el.dataset.fxLabel || 'SP');
      var bottom = U.make('span', '', ui);
      el._fxClock = bottom;
      el._fxStart = performance.now();
    },
    tick: function (el) {
      var s = Math.floor((performance.now() - el._fxStart) / 1000);
      if (s === el._fxSec) return;
      el._fxSec = s;
      var pad = function (n) { return String(n).padStart(2, '0'); };
      el._fxClock.textContent = 'PLAY ▶ ' + pad(Math.floor(s / 3600)) + ':' + pad(Math.floor(s / 60) % 60) + ':' + pad(s % 60);
    }
  });

  FX.register('crt', { entrance: true });

  // --- flashlight -----------------------------------------------------------

  FX.register('flashlight', {
    setup: function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--fx-mx', (e.clientX - r.left) + 'px');
        el.style.setProperty('--fx-my', (e.clientY - r.top) + 'px');
      });
    }
  });

  // --- bokeh ----------------------------------------------------------------

  FX.register('bokeh', {
    setup: function (el) {
      var colors = (el.dataset.fxColors || '#ff5b2e,#b9a7ff,#ffcf4d,#20c7a5').split(',');
      for (var i = 0; i < U.num(el, 'fxCount', 14); i++) {
        var s = U.make('span', 'fx-bokeh', el);
        var size = U.rand(30, 110);
        s.style.width = s.style.height = size.toFixed(0) + 'px';
        s.style.left = U.rand(-10, 90).toFixed(1) + '%';
        s.style.top = U.rand(-10, 90).toFixed(1) + '%';
        s.style.setProperty('--c', colors[i % colors.length]);
        s.style.setProperty('--b', U.rand(1, 6).toFixed(1) + 'px');
        s.style.setProperty('--t', U.rand(6, 14).toFixed(1) + 's');
        s.style.setProperty('--d', U.rand(-10, 0).toFixed(1) + 's');
        s.style.setProperty('--x', U.rand(-40, 40).toFixed(0) + 'px');
        s.style.setProperty('--y', U.rand(-50, 30).toFixed(0) + 'px');
      }
    }
  });

  // --- orbit-rings ----------------------------------------------------------

  FX.register('orbit-rings', {
    setup: function (el) {
      [[0.38, 14], [0.62, 22], [0.88, 34]].forEach(function (o, i) {
        var r = U.make('span', 'fx-orbit');
        r.setAttribute('aria-hidden', 'true');
        r.style.setProperty('--k', o[0]);
        r.style.setProperty('--t', o[1] + 's');
        if (i === 1) r.style.animationDirection = 'reverse';
        el.insertBefore(r, el.firstChild);
      });
    }
  });
})(window.FX);
