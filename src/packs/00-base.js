/* Pack 00 — les 22 effets d'origine */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Entrées purement CSS : il suffit de les déclarer comme entrées
  ['curtain-soft', 'blur-in', 'pill-grow'].forEach(function (name) {
    FX.register(name, { entrance: true });
  });
  FX.register('text-split', { entrance: true, setup: U.splitChars });
  FX.register('line-mask', { entrance: true, setup: U.splitLines });
  U.onResize(function () {
    document.querySelectorAll('[data-fx="line-mask"]').forEach(U.splitLines);
  });

  FX.register('rise-stagger', {
    entrance: true,
    setup: function (el) {
      Array.prototype.forEach.call(el.children, function (child, i) {
        child.style.setProperty('--fx-i', i);
      });
    }
  });

  FX.register('count-up', {
    entrance: true,
    enter: function (el) {
      var to = parseFloat(el.dataset.fxTo || el.textContent.replace(/[^\d.-]/g, '')) || 0;
      var decimals = U.num(el, 'fxDecimals', 0);
      var fmt = new Intl.NumberFormat(document.documentElement.lang || undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      });
      U.tween(el, U.num(el, 'fxDuration', 1600), function (p) {
        el.textContent = fmt.format(to * (1 - Math.pow(1 - p, 4)));
      });
    }
  });

  // --- text-scramble --------------------------------------------------------

  // Remplace chaque lettre par un signe aléatoire (état de départ du brouillage)
  function garble(el) {
    if (U.reduced) return;
    el.textContent = Array.from(el.dataset.fxText).map(function (ch) {
      return ch === ' ' ? ' ' : U.GLYPHS[(Math.random() * U.GLYPHS.length) | 0];
    }).join('');
  }

  function scrambleTo(el) {
    var target = el.dataset.fxText;
    // Chaque lettre se fixe à un instant différent, globalement de gauche à droite
    var marks = Array.from(target).map(function (_, i, a) {
      return (i / a.length) * 0.6 + Math.random() * 0.4;
    });
    U.tween(el, U.num(el, 'fxDuration', 1200), function (p) {
      var out = '';
      for (var i = 0; i < target.length; i++) {
        var ch = target[i];
        out += (p >= marks[i] || ch === ' ') ? ch : U.GLYPHS[(Math.random() * U.GLYPHS.length) | 0];
      }
      el.textContent = out;
    });
  }

  FX.register('text-scramble', {
    entrance: true,
    setup: function (el) {
      el.dataset.fxText = el.textContent;
      el.setAttribute('aria-label', el.dataset.fxText);
      garble(el);
      if (el.dataset.fxHover === 'true') {
        el.addEventListener('pointerenter', function () { scrambleTo(el); });
      }
    },
    reset: garble,
    enter: scrambleTo
  });

  // --- pixel-dissolve -------------------------------------------------------

  function paintPixels(el, progress) {
    var c = el._fxCanvas;
    var r = el.getBoundingClientRect();
    if (!r.width || !r.height) return;
    var dpr = window.devicePixelRatio || 1;
    if (c.width !== Math.round(r.width * dpr)) c.width = Math.round(r.width * dpr);
    if (c.height !== Math.round(r.height * dpr)) c.height = Math.round(r.height * dpr);
    var cols = U.num(el, 'fxCols', 14);
    var size = c.width / cols;
    var rows = Math.ceil(c.height / size);
    var total = cols * rows;
    if (!el._fxOrder || el._fxOrder.length !== total) {
      // Ordre aléatoire de disparition, recalculé seulement si la grille change
      el._fxOrder = Array.from({ length: total }, function (_, i) { return i; });
      for (var k = total - 1; k > 0; k--) {
        var j = (Math.random() * (k + 1)) | 0;
        var tmp = el._fxOrder[k]; el._fxOrder[k] = el._fxOrder[j]; el._fxOrder[j] = tmp;
      }
    }
    var order = el._fxOrder;
    var ctx = c.getContext('2d');
    var main = U.cssVar(el, '--fx-pixel-color', '#ff5b2e');
    var alt = U.cssVar(el, '--fx-pixel-alt', '#14141a');
    var gone = Math.floor(progress * total);
    var band = Math.ceil(total * 0.08);
    ctx.clearRect(0, 0, c.width, c.height);
    for (var n = gone; n < total; n++) {
      var idx = order[n];
      var x = (idx % cols) * size;
      var y = Math.floor(idx / cols) * size;
      // Les cases sur le point de disparaître changent de teinte : effet de scintillement
      ctx.fillStyle = (n < gone + band && progress > 0) ? alt : main;
      ctx.fillRect(Math.floor(x), Math.floor(y), Math.ceil(size) + 1, Math.ceil(size) + 1);
    }
  }

  FX.register('pixel-dissolve', {
    entrance: true,
    setup: function (el) {
      if (U.reduced) return;
      U.ensurePositioned(el);
      var c = U.make('canvas', 'fx-pixels', el);
      c.setAttribute('aria-hidden', 'true');
      el._fxCanvas = c;
      paintPixels(el, 0);
    },
    enter: function (el) {
      if (!el._fxCanvas) return;
      el._fxOrder = null;
      paintPixels(el, 0);
      var delay = U.num(el, 'fxDelay', 0);
      setTimeout(function () {
        U.tween(el, U.num(el, 'fxDuration', 1100), function (p) {
          paintPixels(el, p * p * (3 - 2 * p));
        });
      }, delay);
    }
  });

  // --- preloader ------------------------------------------------------------

  FX.register('preloader', {
    entrance: true,
    setup: function (el) {
      el.innerHTML =
        '<div class="fx-pre-label"></div>' +
        '<div class="fx-pre-num">0</div>' +
        '<div class="fx-pre-bar"><i></i></div>';
      el.querySelector('.fx-pre-label').textContent = el.dataset.fxLabel || 'Chargement';
      el.setAttribute('role', 'status');
    },
    enter: function (el) {
      el.classList.remove('fx-done');
      var num = el.querySelector('.fx-pre-num');
      if (U.reduced) { el.classList.add('fx-done'); return; }
      var last = 0;
      U.tween(el, U.num(el, 'fxDuration', 2200), function (p) {
        // Mise à jour par paliers : un compteur « mécanique » plutôt que fluide
        var now = performance.now();
        if (now - last < 70 && p < 1) return;
        last = now;
        var v = Math.round(100 * U.easeInOut(p));
        num.textContent = v;
        el.style.setProperty('--fx-p', v / 100);
      }, function () {
        setTimeout(function () {
          el.classList.add('fx-done');
          el.dispatchEvent(new CustomEvent('fx:done', { bubbles: true }));
        }, 250);
      });
    }
  });

  // --- scroll-expand --------------------------------------------------------

  FX.register('scroll-expand', { scroll: true });

  // --- marquee --------------------------------------------------------------

  FX.register('marquee', {
    setup: function (el) {
      var track = U.make('div', 'fx-marquee-track');
      var unit = U.make('div', 'fx-marquee-unit', track);
      while (el.firstChild) unit.appendChild(el.firstChild);
      el.appendChild(track);
      el._fxM = { track: track, unit: unit, x: 0, w: 0 };
      // Copies supplémentaires pour remplir la largeur (masquées aux lecteurs d'écran)
      el._fxM.fill = function () {
        var m = el._fxM;
        m.w = unit.offsetWidth;
        if (!m.w) return;
        while (track.children.length > 1) track.removeChild(track.lastChild);
        var copies = Math.ceil(el.offsetWidth / m.w) + 1;
        for (var i = 0; i < copies; i++) {
          var clone = unit.cloneNode(true);
          clone.setAttribute('aria-hidden', 'true');
          track.appendChild(clone);
        }
      };
      el._fxM.fill();
      U.onResize(el._fxM.fill);
    },
    tick: function (el, dt) {
      var m = el._fxM;
      if (U.reduced) return;
      if (!m.w) m.fill();
      if (!m.w) return;
      var boost = Math.abs(U.velocity()) / 10;
      m.x += U.num(el, 'fxDirection', -1) * U.scrollDir() * U.num(el, 'fxSpeed', 60) * (1 + boost) * dt;
      if (m.x <= -m.w) m.x += m.w;
      if (m.x > 0) m.x -= m.w;
      m.track.style.transform = 'translate3d(' + m.x.toFixed(2) + 'px,0,0)';
    }
  });

  // --- dot-grid -------------------------------------------------------------

  FX.register('dot-grid', {
    setup: function (el) {
      U.ensurePositioned(el);
      var c = U.make('canvas', 'fx-dot-canvas');
      c.setAttribute('aria-hidden', 'true');
      el.insertBefore(c, el.firstChild);
      var d = el._fxD = { c: c, x: -1e4, y: -1e4, tx: -1e4, ty: -1e4, s: 0, ts: 0, dirty: true };
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        d.tx = e.clientX - r.left;
        d.ty = e.clientY - r.top;
        if (d.s === 0) { d.x = d.tx; d.y = d.ty; }
        d.ts = 1;
      });
      el.addEventListener('pointerleave', function () { d.ts = 0; });
      if ('ResizeObserver' in window) new ResizeObserver(function () { d.dirty = true; }).observe(el);
    },
    tick: function (el) {
      var d = el._fxD;
      var moving = Math.abs(d.tx - d.x) > 0.3 || Math.abs(d.ty - d.y) > 0.3 || Math.abs(d.ts - d.s) > 0.01;
      if (!d.dirty && !moving) return;
      d.dirty = false;
      var ease = U.reduced ? 1 : 0.14;
      d.x += (d.tx - d.x) * ease;
      d.y += (d.ty - d.y) * ease;
      d.s += (d.ts - d.s) * ease;
      var r = el.getBoundingClientRect();
      var dpr = window.devicePixelRatio || 1;
      var W = Math.round(r.width * dpr);
      var H = Math.round(r.height * dpr);
      if (d.c.width !== W) d.c.width = W;
      if (d.c.height !== H) d.c.height = H;
      var ctx = d.c.getContext('2d');
      var gap = U.num(el, 'fxGap', 24);
      var reach = U.num(el, 'fxReach', 160);
      var base = U.cssVar(el, '--fx-dot-color', 'rgba(255,255,255,.22)');
      var hot = U.cssVar(el, '--fx-dot-accent', '#ff5b2e');
      ctx.clearRect(0, 0, W, H);
      ctx.save();
      ctx.scale(dpr, dpr);
      for (var y = gap / 2; y < r.height; y += gap) {
        for (var x = gap / 2; x < r.width; x += gap) {
          var k = d.s * Math.pow(Math.max(0, 1 - Math.hypot(x - d.x, y - d.y) / reach), 2);
          ctx.fillStyle = k > 0.12 ? hot : base;
          ctx.beginPath();
          ctx.arc(x, y, 1.1 + k * 3.4, 0, 6.2832);
          ctx.fill();
        }
      }
      ctx.restore();
    }
  });

  // --- cursor ---------------------------------------------------------------

  var cursor = null;
  var cur = { x: 0, y: 0, tx: 0, ty: 0, seen: false };

  FX.register('cursor', {
    setup: function (el) {
      if (U.reduced || !U.canHover) return;
      if (!cursor) {
        cursor = U.make('div', 'fx-cursor', document.body);
        cursor.setAttribute('aria-hidden', 'true');
        U.make('span', '', cursor);
        U.addTicker(null, function () {
          cur.x += (cur.tx - cur.x) * 0.2;
          cur.y += (cur.ty - cur.y) * 0.2;
          cursor.style.transform = 'translate3d(' + cur.x.toFixed(1) + 'px,' + cur.y.toFixed(1) + 'px,0)';
        });
      }
      el.addEventListener('pointerenter', function () { cursor.classList.add('fx-on'); });
      el.addEventListener('pointerleave', function () { cursor.classList.remove('fx-on'); });
      el.addEventListener('pointermove', function (e) {
        cur.tx = e.clientX;
        cur.ty = e.clientY;
        if (!cur.seen) { cur.x = cur.tx; cur.y = cur.ty; cur.seen = true; }
      });
      el.addEventListener('pointerover', function (e) {
        var t = e.target.closest('a, button, [data-fx-cursor-label]');
        var label = t && t.dataset.fxCursorLabel;
        cursor.classList.toggle('fx-grow', !!t);
        cursor.classList.toggle('fx-label', !!label);
        cursor.firstChild.textContent = label || '';
      });
    }
  });

  // --- page-wipe ------------------------------------------------------------

  FX.register('page-wipe', { transition: { pieces: 2, cover: 950, uncover: 1200 } });
  // Ancien nom de l'API, conservé
  FX.wipe = function (callback, keep) { FX.play('page-wipe', callback, null, keep); };

  // --- magnetic / tilt-card -------------------------------------------------

  FX.register('magnetic', {
    setup: function (el) {
      var strength = U.num(el, 'fxStrength', 0.35);
      el.addEventListener('pointermove', function (e) {
        if (U.reduced) return;
        var r = el.getBoundingClientRect();
        el.classList.add('fx-active');
        el.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) * strength + 'px,' +
          (e.clientY - r.top - r.height / 2) * strength + 'px)';
      });
      el.addEventListener('pointerleave', function () {
        el.classList.remove('fx-active');
        el.style.transform = '';
      });
    }
  });

  FX.register('tilt-card', {
    setup: function (el) {
      var max = U.num(el, 'fxMax', 10);
      el.addEventListener('pointermove', function (e) {
        if (U.reduced) return;
        var r = el.getBoundingClientRect();
        el.classList.add('fx-active');
        el.style.setProperty('--fx-ry', (((e.clientX - r.left) / r.width - 0.5) * max * 2).toFixed(2) + 'deg');
        el.style.setProperty('--fx-rx', (-((e.clientY - r.top) / r.height - 0.5) * max * 2).toFixed(2) + 'deg');
      });
      el.addEventListener('pointerleave', function () {
        el.classList.remove('fx-active');
        el.style.setProperty('--fx-rx', '0deg');
        el.style.setProperty('--fx-ry', '0deg');
      });
    }
  });

  FX.register('roll-text', { setup: U.splitChars });

  // Effets purement CSS, sans comportement JavaScript
  ['underline-draw', 'corner-marks', 'scanlines', 'shimmer'].forEach(function (name) {
    FX.register(name, {});
  });
})(window.FX);
