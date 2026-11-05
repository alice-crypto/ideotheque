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

  // Plusieurs aplats de couleur se suivent de près
  FX.register('color-stack', { transition: { pieces: 4, cover: 880, uncover: 920, build: function (o) {
    var list = U.cssVar(document.documentElement, '--fx-tr-colors', '#e10600,#ffd400,#0047ff,#0c0c0e').split(',');
    Array.prototype.forEach.call(o.children, function (p, i) {
      p.style.background = list[i % list.length];
      p.style.setProperty('--fx-d', i * 90 + 'ms');
    });
  } } });

  // Un grand X se dessine et s'épaissit jusqu'à couvrir l'écran
  FX.register('x-cross', { transition: { pieces: 2, cover: 800, uncover: 820, build: function (o) {
    o.style.setProperty('--fx-len', Math.hypot(innerWidth, innerHeight) * 1.1 + 'px');
    o.children[0].className = 'fx-a';
    o.children[1].className = 'fx-b';
  } } });

  // Une page se tourne comme dans un livre
  FX.register('page-turn', { transition: { pieces: 2, cover: 900, uncover: 900, build: function (o) {
    o.style.perspective = '2000px';
    var rtl = getComputedStyle(document.documentElement).direction === 'rtl';
    o.style.setProperty('--fx-side', rtl ? '100%' : '0%');
    o.children[0].className = 'fx-page';
    o.children[1].className = 'fx-fold';
  } } });

  // L'image se transforme en texte ASCII au survol
  FX.register('ascii-image', {
    setup: function (el) {
      var img = el.querySelector('img');
      if (!img) return;
      U.ensurePositioned(el);
      var pre = U.make('pre', 'fx-ascii', el);
      pre.setAttribute('aria-hidden', 'true');
      var draw = function () {
        var cols = U.num(el, 'fxCols', 46), w = el.offsetWidth || 200, h = el.offsetHeight || 150;
        var rows = Math.max(1, Math.round(cols * h / w * .5));
        var c = document.createElement('canvas');
        c.width = cols; c.height = rows;
        var x = c.getContext('2d');
        try {
          x.drawImage(img, 0, 0, cols, rows);
          var d = x.getImageData(0, 0, cols, rows).data, ramp = ' .:-=+*#%@', s = '';
          for (var j = 0; j < rows; j++) {
            for (var i = 0; i < cols; i++) {
              var k = (j * cols + i) * 4, l = (d[k] * .3 + d[k + 1] * .59 + d[k + 2] * .11) / 255;
              s += ramp.charAt(Math.floor(l * (ramp.length - .01)));
            }
            s += '\n';
          }
          pre.textContent = s;
          pre.style.fontSize = (w / cols / .6).toFixed(2) + 'px';
        } catch (err) { pre.textContent = ''; }
      };
      if (img.complete) draw(); else img.addEventListener('load', draw);
      U.onResize(draw);
    }
  });

  // L'image passe d'un tramage 1-bit à ses vraies couleurs
  FX.register('dither-reveal', {
    entrance: true,
    setup: function (el) {
      var img = el.querySelector('img');
      if (!img) return;
      U.ensurePositioned(el);
      var cv = el._fxCv = U.make('canvas', 'fx-dither', el);
      cv.setAttribute('aria-hidden', 'true');
      var B = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
      var draw = function () {
        var px = U.num(el, 'fxPixel', 3), w = Math.ceil((el.offsetWidth || 200) / px), h = Math.ceil((el.offsetHeight || 150) / px);
        cv.width = w; cv.height = h;
        var c = cv.getContext('2d');
        try {
          c.drawImage(img, 0, 0, w, h);
          var d = c.getImageData(0, 0, w, h), a = d.data;
          for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
            var i = (y * w + x) * 4, l = (a[i] * .3 + a[i + 1] * .59 + a[i + 2] * .11) / 255;
            var v = l > (B[(y % 4) * 4 + x % 4] + .5) / 16 ? 255 : 0;
            a[i] = a[i + 1] = a[i + 2] = v;
          }
          c.putImageData(d, 0, 0);
        } catch (err) { cv.remove(); }
      };
      if (img.complete) draw(); else img.addEventListener('load', draw);
    }
  });

  // Une image en deux couleurs qui retrouve ses teintes au survol
  FX.register('duotone-hover', {
    setup: function (el) {
      var hex = function (s) { var v = parseInt(s.replace('#', ''), 16); return [(v >> 16 & 255) / 255, (v >> 8 & 255) / 255, (v & 255) / 255]; };
      var a = hex(el.dataset.fxDark || '#0047ff'), b = hex(el.dataset.fxLight || '#ffd400');
      var id = 'fx-duo-' + Math.random().toString(36).slice(2, 8);
      var host = document.createElement('div');
      host.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
      host.innerHTML = '<svg aria-hidden="true"><filter id="' + id + '" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values=".33 .33 .33 0 0 .33 .33 .33 0 0 .33 .33 .33 0 0 0 0 0 1 0"/><feComponentTransfer>' +
        ['R', 'G', 'B'].map(function (c, i) { return '<feFunc' + c + ' type="table" tableValues="' + a[i].toFixed(3) + ' ' + b[i].toFixed(3) + '"/>'; }).join('') +
        '</feComponentTransfer></filter></svg>';
      document.body.appendChild(host);
      el.style.setProperty('--fx-duo', 'url(#' + id + ')');
    }
  });

  // L'image se recompose à partir de cellules éparses
  FX.register('mosaic-hover', {
    setup: function (el) {
      var img = el.querySelector('img');
      if (!img) return;
      var C = U.num(el, 'fxCols', 6), R = U.num(el, 'fxRows', 4);
      el.style.setProperty('--fx-c', C);
      el.style.setProperty('--fx-rw', R);
      var src = img.getAttribute('src');
      img.classList.add('fx-sr-img');
      for (var j = 0; j < R; j++) for (var i = 0; i < C; i++) {
        var s = U.make('i', '', el);
        s.setAttribute('aria-hidden', 'true');
        s.style.backgroundImage = 'url("' + src + '")';
        s.style.backgroundPosition = (C > 1 ? i * 100 / (C - 1) : 0) + '% ' + (R > 1 ? j * 100 / (R - 1) : 0) + '%';
        s.style.setProperty('--fx-dx', U.rand(-22, 22).toFixed(0) + 'px');
        s.style.setProperty('--fx-dy', U.rand(-22, 22).toFixed(0) + 'px');
        s.style.setProperty('--fx-dr', U.rand(-16, 16).toFixed(0) + 'deg');
      }
    }
  });

  // L'image ondule comme une surface d'eau au survol
  FX.register('wave-image', {
    setup: function (el) {
      var id = 'fx-wv-' + Math.random().toString(36).slice(2, 8);
      var h = document.createElement('div');
      h.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
      h.innerHTML = '<svg aria-hidden="true"><filter id="' + id + '"><feTurbulence type="turbulence" baseFrequency=".012 .05" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="0" xChannelSelector="R" yChannelSelector="G"/></filter></svg>';
      document.body.appendChild(h);
      el._fxT = h.querySelector('feTurbulence'); el._fxM = h.querySelector('feDisplacementMap');
      el._fxA = 0;
      (el.querySelector('img') || el).style.filter = 'url(#' + id + ')';
    },
    tick: function (el, dt, t) {
      if (U.reduced) return;
      var tg = (el.matches(':hover') || el.dataset.fxAuto === 'true') ? U.num(el, 'fxScale', 24) : 0;
      el._fxA = U.lerp(el._fxA, tg, .07);
      if (el._fxA < .1 && !tg) { if (el._fxOn) { el._fxM.setAttribute('scale', 0); el._fxOn = false; } return; }
      el._fxOn = true;
      el._fxM.setAttribute('scale', el._fxA.toFixed(1));
      el._fxT.setAttribute('baseFrequency', (.012 + Math.sin(t * .0007) * .004).toFixed(4) + ' ' + (.05 + Math.cos(t * .0009) * .012).toFixed(4));
    }
  });

  // L'image apparaît par lignes de plus en plus épaisses
  FX.register('scan-reveal', {
    entrance: true,
    setup: function (el) { el.style.setProperty('--fx-line', '0px'); },
    reset: function (el) { el.style.setProperty('--fx-line', '0px'); },
    enter: function (el) {
      var gap = U.num(el, 'fxGap', 10);
      U.tween(el, U.num(el, 'fxDuration', 1100), function (p) { el.style.setProperty('--fx-line', (U.easeInOut(p) * (gap + 1)).toFixed(2) + 'px'); }, function () { el.style.setProperty('--fx-line', (gap + 2) + 'px'); });
      el.style.setProperty('--fx-gap', gap + 'px');
    }
  });

  // Un diaporama qui change d'image par bandes verticales
  FX.register('strip-slider', {
    setup: function (el) {
      var imgs = Array.prototype.slice.call(el.querySelectorAll('img'));
      if (imgs.length < 2) return;
      var n = U.num(el, 'fxStrips', 8), i = 0, t = 0;
      el.setAttribute('role', 'group');
      el.setAttribute('aria-roledescription', 'diaporama');
      imgs.forEach(function (im, k) { if (k) im.setAttribute('aria-hidden', 'true'); });
      var wrap = U.make('div', 'fx-strips', el);
      wrap.setAttribute('aria-hidden', 'true');
      var strips = [];
      for (var k = 0; k < n; k++) {
        var s = U.make('i', '', wrap);
        s.style.setProperty('--fx-k', k);
        s.style.backgroundPosition = (n > 1 ? k * 100 / (n - 1) : 0) + '% 50%';
        s.style.backgroundSize = n * 100 + '% 100%';
        strips.push(s);
      }
      var show = function () {
        i = (i + 1) % imgs.length;
        strips.forEach(function (s) { s.style.backgroundImage = 'url("' + imgs[i].getAttribute('src') + '")'; });
        el.classList.remove('fx-go'); void el.offsetWidth; el.classList.add('fx-go');
        setTimeout(function () { imgs.forEach(function (im, k) { im.classList.toggle('fx-cur', k === i); }); }, 900);
      };
      imgs[0].classList.add('fx-cur');
      el._fxNext = show;
      el._fxTick = function (dt) { if (el.matches(':hover')) return; t += dt * 1000; if (t > U.num(el, 'fxHold', 3200)) { t = 0; show(); } };
    },
    tick: function (el, dt) { if (el._fxTick && !U.reduced) el._fxTick(dt); },
    trigger: function (el) { if (el._fxNext) el._fxNext(); }
  });
})(window.FX);
