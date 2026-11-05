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

  // Une vague liquide monte et recouvre l'écran
  FX.register('wave-cover', { transition: { pieces: 1, cover: 900, uncover: 950, build: function (o) {
    var p = o.firstChild;
    p.innerHTML = '<svg viewBox="0 0 100 100" preserveAspectRatio="none" style="width:100%;height:100%;display:block"><path/></svg>';
    var path = p.querySelector('path'), t0 = null, lastOut = null;
    (function frame(t) {
      if (!o.isConnected) return;
      if (t0 === null) t0 = t;
      var out = o.classList.contains('fx-uncover');
      if (out && lastOut === null) lastOut = t;
      var a = Math.min(1, (t - t0) / 850), c = out ? Math.min(1, (t - lastOut) / 850) : 0;
      var top = 110 - U.easeInOut(a) * 120, bot = 110 - U.easeInOut(c) * 120;
      var amp = Math.sin(a * 3.14) * 10, ampB = Math.sin(c * 3.14) * 10;
      var d = 'M0 ' + top.toFixed(1) + ' Q25 ' + (top - amp).toFixed(1) + ' 50 ' + top.toFixed(1) + ' T100 ' + top.toFixed(1);
      d += out ? ' L100 ' + bot.toFixed(1) + ' Q75 ' + (bot + ampB).toFixed(1) + ' 50 ' + bot.toFixed(1) + ' T0 ' + bot.toFixed(1) + ' Z' : ' L100 100 L0 100 Z';
      path.setAttribute('d', d);
      U.raf(frame);
    })(0);
  } } });

  // Des lames horizontales et verticales se croisent
  FX.register('cross-blinds', { transition: { pieces: 16, cover: 800, uncover: 850, build: function (o) {
    Array.prototype.forEach.call(o.children, function (p, i) {
      var v = i % 2 === 0, k = Math.floor(i / 2);
      p.className = v ? 'fx-v' : 'fx-h';
      p.style[v ? 'left' : 'top'] = k * 12.5 + '%';
      p.style.setProperty('--fx-d', k * 28 + 'ms');
    });
  } } });

  // Deux panneaux se referment en 3D comme des portes
  FX.register('fold-doors', { transition: { pieces: 2, cover: 820, uncover: 860, build: function (o) {
    o.style.perspective = '1400px';
    o.children[0].className = 'fx-l';
    o.children[1].className = 'fx-r';
  } } });

  // Des éclats triangulaires convergent depuis le point de clic
  FX.register('shatter-tris', { transition: { pieces: 96, cover: 960, uncover: 900, build: function (o) {
    var C = 8, R = 6, e = o._fxEvent;
    var cx = e && e.clientX != null ? e.clientX / innerWidth : .5, cy = e && e.clientY != null ? e.clientY / innerHeight : .5;
    Array.prototype.forEach.call(o.children, function (p, i) {
      var q = i % 2, k = Math.floor(i / 2), c = k % C, r = Math.floor(k / C);
      p.style.left = c * 100 / C + '%'; p.style.top = r * 100 / R + '%';
      p.style.clipPath = q ? 'polygon(103% -3%,103% 103%,-3% 103%)' : 'polygon(-3% -3%,103% -3%,-3% 103%)';
      var d = Math.hypot((c + .5) / C - cx, (r + .5) / R - cy);
      p.style.setProperty('--fx-d', (d * 500).toFixed(0) + 'ms');
      p.style.setProperty('--fx-rot', U.rand(-120, 120).toFixed(0) + 'deg');
    });
  } } });

  // Des mots s'enchaînent en plein écran pendant le passage
  FX.register('word-flash', { transition: { pieces: 1, cover: 900, uncover: 700, build: function (o) {
    var src = o._fxEvent && o._fxEvent.currentTarget;
    var words = ((src && src.dataset && src.dataset.fxWords) || 'Un|Instant|Encore').split('|'), i = 0;
    var p = o.firstChild;
    var next = function () {
      if (!o.isConnected || i >= words.length) return;
      p.textContent = words[i++];
      setTimeout(next, 280);
    };
    setTimeout(next, 80);
  } } });

  // Des rangées de texte glissent en sens alternés
  FX.register('text-cover', { transition: { pieces: 6, cover: 850, uncover: 880, build: function (o) {
    var word = (document.documentElement.dataset.fxWord || document.title.split(/[\s—–-]/)[0] || 'Idéothèque') + ' ';
    Array.prototype.forEach.call(o.children, function (p, i) {
      p.textContent = word.repeat(14);
      p.style.top = i * 100 / 6 + '%';
      p.style.setProperty('--fx-dir', i % 2 ? 1 : -1);
      p.style.setProperty('--fx-d', i * 40 + 'ms');
    });
  } } });

  // Une trame de points grossit depuis le point de clic
  FX.register('dots-cover', { transition: { pieces: 140, cover: 900, uncover: 900, build: function (o) {
    var C = 14, R = 10, e = o._fxEvent;
    var cx = e && e.clientX != null ? e.clientX / innerWidth : .5, cy = e && e.clientY != null ? e.clientY / innerHeight : .5;
    Array.prototype.forEach.call(o.children, function (p, i) {
      var c = i % C, r = Math.floor(i / C);
      p.style.left = (c + .5) * 100 / C + '%'; p.style.top = (r + .5) * 100 / R + '%';
      p.style.setProperty('--fx-d', (Math.hypot((c + .5) / C - cx, (r + .5) / R - cy) * 460).toFixed(0) + 'ms');
    });
  } } });

  // Un rayon traverse l'écran et laisse un aplat derrière lui
  FX.register('scan-cover', { transition: { pieces: 2, cover: 760, uncover: 780, build: function (o) {
    o.children[0].className = 'fx-sc-fill';
    o.children[1].className = 'fx-sc-beam';
  } } });
})(window.FX);
