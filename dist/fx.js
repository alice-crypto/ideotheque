/*!
 * Idéothèque — fx.js — bibliothèque d'idées visuelles
 * Active automatiquement tous les éléments [data-fx] de la page.
 * API : FX.init(racine), FX.replay(element), FX.wipe(callback)
 * Licence MIT
 */
(function () {
  'use strict';

  // Effets déclenchés une fois quand l'élément entre à l'écran
  var ENTRANCES = [
    'curtain-soft', 'rise-stagger', 'blur-in', 'text-split', 'count-up',
    'line-mask', 'text-scramble', 'pixel-dissolve', 'pill-grow', 'preloader'
  ];
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canHover = window.matchMedia('(hover: hover)').matches;
  var raf = window.requestAnimationFrame.bind(window);
  var GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=/<>';

  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function cssVar(el, name, fallback) {
    var v = getComputedStyle(el).getPropertyValue(name).trim();
    return v || fallback;
  }

  // --- Découpages de texte -------------------------------------------------

  // Découpe un texte en lettres (.fx-char), mot par mot pour garder les coupures de ligne
  function splitChars(el) {
    if (el.dataset.fxSplit) return;
    el.dataset.fxSplit = '1';
    var text = el.textContent.trim();
    el.setAttribute('aria-label', text);
    el.textContent = '';
    var i = 0;
    text.split(/(\s+)/).forEach(function (word) {
      if (/^\s+$/.test(word)) {
        el.appendChild(document.createTextNode(' '));
        return;
      }
      var w = document.createElement('span');
      w.style.display = 'inline-block';
      w.style.whiteSpace = 'nowrap';
      w.setAttribute('aria-hidden', 'true');
      Array.from(word).forEach(function (ch) {
        var s = document.createElement('span');
        s.className = 'fx-char';
        s.textContent = ch;
        s.style.setProperty('--fx-i', i++);
        w.appendChild(s);
      });
      el.appendChild(w);
    });
  }

  // Découpe un texte en lignes visuelles (.fx-line > span), à refaire si la largeur change
  function splitLines(el) {
    if (!el.dataset.fxText) {
      // Les <br> du texte d'origine deviennent des retours à la ligne forcés
      el.querySelectorAll('br').forEach(function (br) { br.replaceWith(' \n '); });
      el.dataset.fxText = el.textContent.trim().replace(/[ \t\r]+/g, ' ').replace(/ *\n */g, ' \n ');
    }
    var text = el.dataset.fxText;
    el.setAttribute('aria-label', text.replace(/ \n /g, ' '));
    el.textContent = '';
    var spans = [];
    text.split(' ').forEach(function (word) {
      if (word === '\n') { el.appendChild(document.createElement('br')); return; }
      if (spans.length) el.appendChild(document.createTextNode(' '));
      var s = document.createElement('span');
      s.textContent = word;
      s.style.display = 'inline-block';
      el.appendChild(s);
      spans.push(s);
    });
    var lines = [];
    var top = null;
    spans.forEach(function (s) {
      if (s.offsetTop !== top) { lines.push([]); top = s.offsetTop; }
      lines[lines.length - 1].push(s.textContent);
    });
    el.textContent = '';
    lines.forEach(function (words, i) {
      var line = document.createElement('span');
      line.className = 'fx-line';
      line.setAttribute('aria-hidden', 'true');
      var inner = document.createElement('span');
      inner.textContent = words.join(' ');
      inner.style.setProperty('--fx-i', i);
      line.appendChild(inner);
      el.appendChild(line);
    });
  }

  // Remplace chaque lettre par un signe aléatoire (état de départ du brouillage)
  function garble(el) {
    if (reduced) return;
    el.textContent = Array.from(el.dataset.fxText).map(function (ch) {
      return ch === ' ' ? ' ' : GLYPHS[(Math.random() * GLYPHS.length) | 0];
    }).join('');
  }

  function scrambleTo(el) {
    var target = el.dataset.fxText;
    if (reduced) { el.textContent = target; return; }
    var duration = parseFloat(el.dataset.fxDuration || '1200');
    // Chaque lettre se fixe à un instant différent, globalement de gauche à droite
    var marks = Array.from(target).map(function (_, i, a) {
      return (i / a.length) * 0.6 + Math.random() * 0.4;
    });
    var run = el._fxRun = (el._fxRun || 0) + 1;
    var start = null;
    function frame(t) {
      if (run !== el._fxRun) return;
      if (start === null) start = t;
      var p = Math.min((t - start) / duration, 1);
      var out = '';
      for (var i = 0; i < target.length; i++) {
        var ch = target[i];
        out += (p >= marks[i] || ch === ' ') ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      el.textContent = out;
      if (p < 1) raf(frame);
    }
    raf(frame);
  }

  // --- Mosaïque de pixels --------------------------------------------------

  function paintPixels(el, progress, order) {
    var c = el._fxCanvas;
    var r = el.getBoundingClientRect();
    if (!r.width || !r.height) return;
    var dpr = window.devicePixelRatio || 1;
    if (c.width !== Math.round(r.width * dpr)) c.width = Math.round(r.width * dpr);
    if (c.height !== Math.round(r.height * dpr)) c.height = Math.round(r.height * dpr);
    var cols = parseInt(el.dataset.fxCols || '14', 10);
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
    order = el._fxOrder;
    var ctx = c.getContext('2d');
    var main = cssVar(el, '--fx-pixel-color', '#ff5b2e');
    var alt = cssVar(el, '--fx-pixel-alt', '#14141a');
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

  // --- Préparation propre à chaque effet ----------------------------------

  var setup = {
    'rise-stagger': function (el) {
      Array.prototype.forEach.call(el.children, function (child, i) {
        child.style.setProperty('--fx-i', i);
      });
    },

    'text-split': splitChars,
    'roll-text': splitChars,
    'line-mask': splitLines,

    'text-scramble': function (el) {
      el.dataset.fxText = el.textContent;
      el.setAttribute('aria-label', el.dataset.fxText);
      garble(el);
      if (el.dataset.fxHover === 'true') {
        el.addEventListener('pointerenter', function () { scrambleTo(el); });
      }
    },

    'pixel-dissolve': function (el) {
      if (reduced) return;
      if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
      var c = document.createElement('canvas');
      c.className = 'fx-pixels';
      c.setAttribute('aria-hidden', 'true');
      el.appendChild(c);
      el._fxCanvas = c;
      paintPixels(el, 0);
    },

    'preloader': function (el) {
      var label = el.dataset.fxLabel || 'Chargement';
      el.innerHTML =
        '<div class="fx-pre-label"></div>' +
        '<div class="fx-pre-num">0</div>' +
        '<div class="fx-pre-bar"><i></i></div>';
      el.querySelector('.fx-pre-label').textContent = label;
      el.setAttribute('role', 'status');
    },

    'scroll-expand': function (el) {
      scrollers.add(el);
      updateScrollers();
    },

    'marquee': function (el) {
      var track = document.createElement('div');
      track.className = 'fx-marquee-track';
      var unit = document.createElement('div');
      unit.className = 'fx-marquee-unit';
      while (el.firstChild) unit.appendChild(el.firstChild);
      track.appendChild(unit);
      el.appendChild(track);
      var state = { el: el, track: track, unit: unit, x: 0, w: 0 };
      // Copies supplémentaires pour remplir la largeur (masquées aux lecteurs d'écran)
      state.fill = function () {
        state.w = unit.offsetWidth;
        if (!state.w) return;
        while (track.children.length > 1) track.removeChild(track.lastChild);
        var copies = Math.ceil(el.offsetWidth / state.w) + 1;
        for (var i = 0; i < copies; i++) {
          var clone = unit.cloneNode(true);
          clone.setAttribute('aria-hidden', 'true');
          track.appendChild(clone);
        }
      };
      state.fill();
      marquees.push(state);
      startLoop();
    },

    'dot-grid': function (el) {
      if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
      var c = document.createElement('canvas');
      c.className = 'fx-dot-canvas';
      c.setAttribute('aria-hidden', 'true');
      el.insertBefore(c, el.firstChild);
      var state = { el: el, c: c, x: -1e4, y: -1e4, tx: -1e4, ty: -1e4, s: 0, ts: 0, dirty: true };
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        state.tx = e.clientX - r.left;
        state.ty = e.clientY - r.top;
        if (state.s === 0) { state.x = state.tx; state.y = state.ty; }
        state.ts = 1;
      });
      el.addEventListener('pointerleave', function () { state.ts = 0; });
      if ('ResizeObserver' in window) {
        new ResizeObserver(function () { state.dirty = true; }).observe(el);
      }
      dotGrids.push(state);
      startLoop();
    },

    'cursor': function (el) {
      if (reduced || !canHover) return;
      if (!cursor) {
        cursor = document.createElement('div');
        cursor.className = 'fx-cursor';
        cursor.setAttribute('aria-hidden', 'true');
        cursor.innerHTML = '<span></span>';
        document.body.appendChild(cursor);
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
      startLoop();
    },

    'page-wipe': function (el) {
      el.addEventListener('click', function (e) {
        var href = el.getAttribute('href');
        if (!href || e.metaKey || e.ctrlKey || e.shiftKey || el.target === '_blank') return;
        e.preventDefault();
        wipe(function () {
          try { sessionStorage.setItem('fx-wipe', '1'); } catch (err) {}
          window.location.href = href;
        }, true);
      });
    },

    'magnetic': function (el) {
      var strength = parseFloat(el.dataset.fxStrength || '0.35');
      el.addEventListener('pointermove', function (e) {
        if (reduced) return;
        var r = el.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height / 2);
        el.classList.add('fx-active');
        el.style.transform = 'translate(' + dx * strength + 'px,' + dy * strength + 'px)';
      });
      el.addEventListener('pointerleave', function () {
        el.classList.remove('fx-active');
        el.style.transform = '';
      });
    },

    'tilt-card': function (el) {
      var max = parseFloat(el.dataset.fxMax || '10');
      el.addEventListener('pointermove', function (e) {
        if (reduced) return;
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        el.classList.add('fx-active');
        el.style.setProperty('--fx-ry', (px * max * 2).toFixed(2) + 'deg');
        el.style.setProperty('--fx-rx', (-py * max * 2).toFixed(2) + 'deg');
      });
      el.addEventListener('pointerleave', function () {
        el.classList.remove('fx-active');
        el.style.setProperty('--fx-rx', '0deg');
        el.style.setProperty('--fx-ry', '0deg');
      });
    }
  };

  // --- Ce qui se passe quand une entrée devient visible -------------------

  var onEnter = {
    'count-up': function (el) {
      var to = parseFloat(el.dataset.fxTo || el.textContent.replace(/[^\d.-]/g, '')) || 0;
      var decimals = parseInt(el.dataset.fxDecimals || '0', 10);
      var duration = parseFloat(el.dataset.fxDuration || '1600');
      var fmt = new Intl.NumberFormat(document.documentElement.lang || undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      });
      if (reduced) { el.textContent = fmt.format(to); return; }
      var start = null;
      function frame(t) {
        if (start === null) start = t;
        var p = Math.min((t - start) / duration, 1);
        el.textContent = fmt.format(to * (1 - Math.pow(1 - p, 4)));
        if (p < 1) raf(frame);
      }
      raf(frame);
    },

    'text-scramble': scrambleTo,

    'pixel-dissolve': function (el) {
      if (!el._fxCanvas) return;
      var duration = parseFloat(el.dataset.fxDuration || '1100');
      var delay = parseFloat(el.dataset.fxDelay || '0');
      var run = el._fxRun = (el._fxRun || 0) + 1;
      el._fxOrder = null;
      paintPixels(el, 0);
      var start = null;
      function frame(t) {
        if (run !== el._fxRun) return;
        if (start === null) start = t + delay;
        var p = clamp((t - start) / duration, 0, 1);
        paintPixels(el, p < 1 ? p * p * (3 - 2 * p) : 1);
        if (p < 1) raf(frame);
      }
      raf(frame);
    },

    'preloader': function (el) {
      el.classList.remove('fx-done');
      var num = el.querySelector('.fx-pre-num');
      if (reduced) { el.classList.add('fx-done'); return; }
      var duration = parseFloat(el.dataset.fxDuration || '2200');
      var run = el._fxRun = (el._fxRun || 0) + 1;
      var start = null;
      var last = 0;
      function frame(t) {
        if (run !== el._fxRun) return;
        if (start === null) start = t;
        var p = Math.min((t - start) / duration, 1);
        // Mise à jour par paliers : un compteur « mécanique » plutôt que fluide
        if (t - last > 70 || p === 1) {
          last = t;
          var v = Math.round(100 * (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2));
          num.textContent = v;
          el.style.setProperty('--fx-p', v / 100);
        }
        if (p < 1) raf(frame);
        else setTimeout(function () {
          if (run !== el._fxRun) return;
          el.classList.add('fx-done');
          el.dispatchEvent(new CustomEvent('fx:done', { bubbles: true }));
        }, 250);
      }
      raf(frame);
    }
  };

  // --- Défilement : entrées, progression, vitesse -------------------------

  var pending = new Set();
  var scrollers = new Set();
  var marquees = [];
  var dotGrids = [];
  var cursor = null;
  var cur = { x: 0, y: 0, tx: 0, ty: 0, seen: false };
  var lastY = window.scrollY;
  var velocity = 0;
  var scrollDir = 1;

  var observer = 'IntersectionObserver' in window
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) settle(entry.target);
        });
      }, { threshold: 0, rootMargin: '0px 0px -12% 0px' })
    : null;

  function settle(el) {
    enter(el);
    if (el.dataset.fxRepeat !== 'true') {
      observer.unobserve(el);
      pending.delete(el);
    }
  }

  function updateScrollers() {
    var vh = window.innerHeight;
    scrollers.forEach(function (el) {
      var r = el.getBoundingClientRect();
      var p = clamp((vh - r.top) / (vh * 0.85), 0, 1);
      el.style.setProperty('--fx-p', p.toFixed(3));
    });
  }

  var ticking = false;
  window.addEventListener('scroll', function () {
    var y = window.scrollY;
    velocity = clamp(y - lastY, -80, 80);
    if (velocity) scrollDir = velocity > 0 ? 1 : -1;
    lastY = y;
    if (ticking) return;
    ticking = true;
    raf(function () {
      ticking = false;
      updateScrollers();
      // Filet de sécurité : un défilement rapide (ou un saut d'ancre) peut faire passer
      // un élément au-dessus de l'écran sans qu'il ait été détecté. On le révèle quand même.
      pending.forEach(function (el) {
        if (!el.classList.contains('fx-in') && el.getBoundingClientRect().bottom < 0) settle(el);
      });
    });
  }, { passive: true });

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      document.querySelectorAll('[data-fx="line-mask"]').forEach(splitLines);
      marquees.forEach(function (m) { m.fill(); });
      dotGrids.forEach(function (d) { d.dirty = true; });
      updateScrollers();
    }, 150);
  });

  // --- Boucle d'animation partagée (bandeaux, grilles de points, curseur) --

  var looping = false;
  var lastT = 0;
  var boost = 0;

  function startLoop() {
    if (looping) return;
    looping = true;
    raf(loop);
  }

  function visible(el) {
    var r = el.getBoundingClientRect();
    return r.bottom > 0 && r.top < window.innerHeight;
  }

  function loop(t) {
    var dt = lastT ? Math.min((t - lastT) / 1000, 0.05) : 0;
    lastT = t;
    boost += (Math.abs(velocity) / 10 - boost) * 0.08;
    velocity *= 0.9;

    if (!reduced) marquees.forEach(function (m) {
      if (!m.w || !visible(m.el)) return;
      var speed = parseFloat(m.el.dataset.fxSpeed || '60');
      var dir = parseFloat(m.el.dataset.fxDirection || '-1');
      m.x += dir * scrollDir * speed * (1 + boost) * dt;
      if (m.x <= -m.w) m.x += m.w;
      if (m.x > 0) m.x -= m.w;
      m.track.style.transform = 'translate3d(' + m.x.toFixed(2) + 'px,0,0)';
    });

    dotGrids.forEach(drawDots);

    if (cursor) {
      cur.x += (cur.tx - cur.x) * 0.2;
      cur.y += (cur.ty - cur.y) * 0.2;
      cursor.style.transform = 'translate3d(' + cur.x.toFixed(1) + 'px,' + cur.y.toFixed(1) + 'px,0)';
    }
    raf(loop);
  }

  function drawDots(d) {
    var moving = Math.abs(d.tx - d.x) > 0.3 || Math.abs(d.ty - d.y) > 0.3 || Math.abs(d.ts - d.s) > 0.01;
    if (!d.dirty && !moving) return;
    if (!visible(d.el)) return;
    d.dirty = false;
    var ease = reduced ? 1 : 0.14;
    d.x += (d.tx - d.x) * ease;
    d.y += (d.ty - d.y) * ease;
    d.s += (d.ts - d.s) * ease;
    var r = d.el.getBoundingClientRect();
    var dpr = window.devicePixelRatio || 1;
    var W = Math.round(r.width * dpr);
    var H = Math.round(r.height * dpr);
    if (d.c.width !== W) d.c.width = W;
    if (d.c.height !== H) d.c.height = H;
    var ctx = d.c.getContext('2d');
    var gap = parseFloat(d.el.dataset.fxGap || '24');
    var reach = parseFloat(d.el.dataset.fxReach || '160');
    var base = cssVar(d.el, '--fx-dot-color', 'rgba(255,255,255,.22)');
    var hot = cssVar(d.el, '--fx-dot-accent', '#ff5b2e');
    ctx.clearRect(0, 0, W, H);
    ctx.save();
    ctx.scale(dpr, dpr);
    for (var y = gap / 2; y < r.height; y += gap) {
      for (var x = gap / 2; x < r.width; x += gap) {
        var dist = Math.hypot(x - d.x, y - d.y);
        var k = d.s * Math.pow(Math.max(0, 1 - dist / reach), 2);
        ctx.fillStyle = k > 0.12 ? hot : base;
        ctx.beginPath();
        ctx.arc(x, y, 1.1 + k * 3.4, 0, 6.2832);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  // --- Transition de page --------------------------------------------------

  function makeWipe() {
    var o = document.createElement('div');
    o.className = 'fx-wipe';
    o.setAttribute('aria-hidden', 'true');
    o.innerHTML = '<i></i><i></i>';
    document.body.appendChild(o);
    return o;
  }

  function uncover(o) {
    o.classList.add('fx-uncover');
    setTimeout(function () { o.remove(); }, 1200);
  }

  // Recouvre l'écran, appelle callback, puis découvre (sauf si keep = true, pour une navigation)
  function wipe(callback, keep) {
    if (reduced) { if (callback) callback(); return; }
    var o = makeWipe();
    raf(function () { raf(function () { o.classList.add('fx-cover'); }); });
    setTimeout(function () {
      if (callback) callback();
      if (!keep) uncover(o);
    }, 950);
  }

  function arrivedWithWipe() {
    var flag = null;
    try { flag = sessionStorage.getItem('fx-wipe'); sessionStorage.removeItem('fx-wipe'); } catch (err) {}
    if (!flag || reduced) return;
    var o = makeWipe();
    o.classList.add('fx-cover', 'fx-instant');
    raf(function () { raf(function () { o.classList.remove('fx-instant'); uncover(o); }); });
  }

  // --- Initialisation -------------------------------------------------------

  function enter(el) {
    el.classList.add('fx-in');
    var fn = onEnter[el.dataset.fx];
    if (fn) fn(el);
  }

  function init(root) {
    (root || document).querySelectorAll('[data-fx]').forEach(function (el) {
      if (el.dataset.fxReady) return;
      el.dataset.fxReady = '1';
      var name = el.dataset.fx;
      if (setup[name]) setup[name](el);
      if (ENTRANCES.indexOf(name) !== -1) {
        if (observer && !reduced) { observer.observe(el); pending.add(el); }
        else enter(el);
      }
    });
  }

  // Rejoue une entrée (utile pour les démos ou un contenu rechargé)
  function replay(el) {
    el.classList.remove('fx-in');
    if (el.dataset.fx === 'text-scramble') garble(el);
    void el.offsetWidth; // force le navigateur à repartir de l'état initial
    raf(function () { raf(function () { enter(el); }); });
  }

  window.FX = { init: init, replay: replay, wipe: wipe };

  function boot() { arrivedWithWipe(); init(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
