/*!
 * Idéothèque — fx.js — bibliothèque d'idées visuelles
 * Active automatiquement tous les éléments [data-fx] de la page.
 * API : FX.init(racine), FX.replay(element), FX.trigger(element), FX.play(transition, callback, event),
 *       FX.register(nom, définition), FX.isEntrance(nom)
 * Licence MIT
 */
(function () {
  'use strict';

  // --- Outils partagés par tous les effets ----------------------------------

  var defs = {};
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canHover = window.matchMedia('(hover: hover)').matches;
  var raf = window.requestAnimationFrame.bind(window);
  var GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=/<>';

  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function rand(a, b) { return a + Math.random() * (b - a); }
  function cssVar(el, name, fallback) {
    var v = getComputedStyle(el).getPropertyValue(name).trim();
    return v || fallback;
  }
  // Lit un attribut numérique data-fx-* (clé en camelCase, ex. 'fxSpeed')
  function num(el, key, fallback) {
    var v = parseFloat(el.dataset[key]);
    return isNaN(v) ? fallback : v;
  }
  function ensurePositioned(el) {
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
  }
  function make(tag, className, parent) {
    var n = document.createElement(tag);
    if (className) n.className = className;
    if (parent) parent.appendChild(n);
    return n;
  }
  function easeOut(p) { return 1 - Math.pow(1 - p, 3); }
  function easeInOut(p) { return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; }

  // Interpolation sur une durée ; une nouvelle animation sur le même élément annule la précédente
  function tween(el, duration, fn, done) {
    var run = el._fxRun = (el._fxRun || 0) + 1;
    if (reduced) { fn(1); if (done) done(); return; }
    var start = null;
    function frame(t) {
      if (run !== el._fxRun) return;
      if (start === null) start = t;
      var p = Math.min((t - start) / duration, 1);
      fn(p);
      if (p < 1) raf(frame);
      else if (done) done();
    }
    raf(frame);
  }

  // --- Découpages de texte --------------------------------------------------

  // Lettres (.fx-char), regroupées par mot pour garder les coupures de ligne
  function splitChars(el) {
    if (el.dataset.fxSplit) return;
    el.dataset.fxSplit = '1';
    var text = el.textContent.trim();
    el.setAttribute('aria-label', text);
    el.textContent = '';
    var i = 0;
    text.split(/(\s+)/).forEach(function (word) {
      if (/^\s+$/.test(word)) { el.appendChild(document.createTextNode(' ')); return; }
      var w = make('span', 'fx-wordbox', el);
      w.setAttribute('aria-hidden', 'true');
      Array.from(word).forEach(function (ch) {
        var s = make('span', 'fx-char', w);
        s.textContent = ch;
        s.style.setProperty('--fx-i', i++);
      });
    });
    el.style.setProperty('--fx-n', i);
  }

  // Mots (.fx-word)
  function splitWords(el) {
    if (el.dataset.fxSplit) return;
    el.dataset.fxSplit = '1';
    var text = el.textContent.trim().replace(/\s+/g, ' ');
    el.setAttribute('aria-label', text);
    el.textContent = '';
    var words = text.split(' ');
    words.forEach(function (word, i) {
      var s = make('span', 'fx-word', el);
      s.setAttribute('aria-hidden', 'true');
      s.textContent = word;
      s.style.setProperty('--fx-i', i);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
    el.style.setProperty('--fx-n', words.length);
  }

  // Lignes visuelles (.fx-line > span), à refaire si la largeur change
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
      var s = make('span', '', el);
      s.textContent = word;
      s.style.display = 'inline-block';
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
      var line = make('span', 'fx-line', el);
      line.setAttribute('aria-hidden', 'true');
      var inner = make('span', '', line);
      inner.textContent = words.join(' ');
      inner.style.setProperty('--fx-i', i);
    });
  }

  // --- Visibilité, entrées, défilement -------------------------------------

  var pending = new Set();
  var scrollEls = new Set();
  var resizers = [];
  var lastY = window.scrollY;
  var velocity = 0;
  var smoothVelocity = 0;
  var scrollDir = 1;

  var visIO = 'IntersectionObserver' in window
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { e.target._fxVisible = e.isIntersecting; });
      }, { rootMargin: '120px 0px' })
    : null;

  function watchVisibility(el) {
    if (visIO) visIO.observe(el);
    else el._fxVisible = true;
  }

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

  function updateScroll() {
    var vh = window.innerHeight;
    scrollEls.forEach(function (el) {
      var r = el.getBoundingClientRect();
      var info = {
        enter: clamp((vh - r.top) / (vh * 0.85), 0, 1),
        pass: clamp((vh - r.top) / (vh + r.height), 0, 1),
        rect: r,
        vh: vh
      };
      el.style.setProperty('--fx-p', info.enter.toFixed(3));
      el.style.setProperty('--fx-pass', info.pass.toFixed(3));
      var d = defs[el.dataset.fx];
      if (d && typeof d.scroll === 'function') d.scroll(el, info);
    });
  }

  var ticking = false;
  window.addEventListener('scroll', function () {
    var y = window.scrollY;
    velocity = clamp(y - lastY, -120, 120);
    if (velocity) scrollDir = velocity > 0 ? 1 : -1;
    lastY = y;
    startLoop();
    if (ticking) return;
    ticking = true;
    raf(function () {
      ticking = false;
      updateScroll();
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
      resizers.forEach(function (fn) { fn(); });
      updateScroll();
    }, 150);
  });

  // --- Boucle d'animation partagée -----------------------------------------

  var tickers = [];
  var looping = false;
  var lastT = 0;

  // fn(dt, temps) est appelée à chaque image tant que l'élément est visible
  // (ou toujours si el est null)
  function addTicker(el, fn) {
    if (el) watchVisibility(el);
    tickers.push({ el: el, fn: fn });
    startLoop();
  }

  function startLoop() {
    if (looping) return;
    looping = true;
    raf(loop);
  }

  function loop(t) {
    var dt = lastT ? Math.min((t - lastT) / 1000, 0.05) : 0;
    lastT = t;
    smoothVelocity += (velocity - smoothVelocity) * 0.12;
    velocity *= 0.88;
    for (var i = 0; i < tickers.length; i++) {
      var tk = tickers[i];
      if (tk.el && (!tk.el._fxVisible || !tk.el.isConnected)) continue;
      tk.fn(dt, t);
    }
    raf(loop);
  }

  // --- Transitions plein écran ---------------------------------------------

  function overlay(name, pieces) {
    var o = make('div', 'fx-tr fx-tr-' + name);
    o.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < pieces; i++) {
      var p = make('i', '', o);
      p.style.setProperty('--fx-i', i);
    }
    o.style.setProperty('--fx-n', pieces);
    document.body.appendChild(o);
    return o;
  }

  function uncover(o, tr) {
    o.classList.remove('fx-cover');
    o.classList.add('fx-uncover');
    setTimeout(function () { o.remove(); }, tr.uncover || 1200);
  }

  // Recouvre l'écran, appelle callback, puis découvre (sauf si keep, pour une navigation)
  function play(name, callback, event, keep) {
    var d = defs[name];
    if (typeof callback !== 'function') callback = null;
    if (!d || !d.transition || reduced) { if (callback) callback(); return; }
    var tr = d.transition;
    if (tr.custom) { tr.custom(callback, event); return; }
    var o = overlay(name, tr.pieces || 1);
    var x = event && event.clientX != null ? event.clientX : window.innerWidth / 2;
    var y = event && event.clientY != null ? event.clientY : window.innerHeight / 2;
    o.style.setProperty('--fx-x', x + 'px');
    o.style.setProperty('--fx-y', y + 'px');
    o._fxEvent = event;
    if (tr.build) tr.build(o);
    raf(function () { raf(function () { o.classList.add('fx-cover'); }); });
    setTimeout(function () {
      if (callback) callback();
      if (!keep) uncover(o, tr);
    }, tr.cover || 900);
  }

  function arrive() {
    var name = null;
    try { name = sessionStorage.getItem('fx-arrive'); sessionStorage.removeItem('fx-arrive'); } catch (err) {}
    var d = name && defs[name];
    if (!d || !d.transition || d.transition.custom || reduced) return;
    var o = overlay(name, d.transition.pieces || 1);
    if (d.transition.build) d.transition.build(o);
    o.classList.add('fx-cover', 'fx-instant');
    raf(function () { raf(function () { o.classList.remove('fx-instant'); uncover(o, d.transition); }); });
  }

  // Un lien portant une transition la joue avant de changer de page
  function bindLink(el, name) {
    el.addEventListener('click', function (e) {
      var href = el.getAttribute('href');
      if (!href || href.charAt(0) === '#' || e.metaKey || e.ctrlKey || e.shiftKey || el.target === '_blank') return;
      e.preventDefault();
      play(name, function () {
        try { sessionStorage.setItem('fx-arrive', name); } catch (err) {}
        window.location.href = href;
      }, e, true);
    });
  }

  // --- Cycle de vie des effets ---------------------------------------------

  function enter(el) {
    el.classList.add('fx-in');
    var d = defs[el.dataset.fx];
    if (d && d.enter) d.enter(el);
  }

  function init(root) {
    (root || document).querySelectorAll('[data-fx]').forEach(function (el) {
      if (el.dataset.fxReady) return;
      el.dataset.fxReady = '1';
      var d = defs[el.dataset.fx];
      if (!d) return;
      if (d.setup) d.setup(el);
      if (d.scroll) { scrollEls.add(el); }
      if (d.tick) addTicker(el, function (dt, t) { d.tick(el, dt, t); });
      if (d.transition && el.tagName === 'A') bindLink(el, el.dataset.fx);
      if (d.trigger && d.triggerOn) {
        el.addEventListener(d.triggerOn, function (e) { d.trigger(el, e); });
      }
      if (d.entrance) {
        el.classList.add('fx-entrance');
        if (observer && !reduced) { observer.observe(el); pending.add(el); }
        else enter(el);
      }
    });
    updateScroll();
  }

  // Rejoue une entrée (utile pour les démos ou un contenu rechargé)
  function replay(el) {
    var d = defs[el.dataset.fx];
    el.classList.remove('fx-in');
    if (d && d.reset) d.reset(el);
    void el.offsetWidth; // force le navigateur à repartir de l'état initial
    raf(function () { raf(function () { enter(el); }); });
  }

  // Déclenche un effet ponctuel (secousse, confettis…) sur un élément
  function trigger(el, event) {
    var d = defs[el.dataset.fx];
    if (d && d.trigger) d.trigger(el, event);
    else if (d && d.entrance) replay(el);
  }

  function register(name, def) {
    defs[name] = def || {};
  }

  window.FX = {
    init: init,
    replay: replay,
    trigger: trigger,
    play: play,
    register: register,
    isEntrance: function (name) { return !!(defs[name] && defs[name].entrance); },
    has: function (name) { return !!defs[name]; },
    names: function () { return Object.keys(defs); },
    util: {
      reduced: reduced,
      canHover: canHover,
      raf: raf,
      GLYPHS: GLYPHS,
      clamp: clamp,
      lerp: lerp,
      rand: rand,
      cssVar: cssVar,
      num: num,
      make: make,
      ensurePositioned: ensurePositioned,
      easeOut: easeOut,
      easeInOut: easeInOut,
      tween: tween,
      splitChars: splitChars,
      splitWords: splitWords,
      splitLines: splitLines,
      addTicker: addTicker,
      watchVisibility: watchVisibility,
      onResize: function (fn) { resizers.push(fn); },
      velocity: function () { return smoothVelocity; },
      scrollDir: function () { return scrollDir; }
    },
    _boot: function () {
      function go() { arrive(); init(); }
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go);
      else go();
    }
  };
})();

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

/* Pack 01 — Entrées */
(function (FX) {
  'use strict';
  var U = FX.util;

  [
    'fade-up', 'slide-in', 'zoom-in-soft', 'flip-up', 'swing-in', 'iris-open', 'diagonal-wipe',
    'split-reveal', 'block-reveal', 'stretch-in', 'skew-up', 'drop-bounce', 'pop-in', 'blinds-open',
    'ink-spread', 'fold-down', 'lift-shadow', 'rule-draw'
  ].forEach(function (name) { FX.register(name, { entrance: true }); });

  // Ordre diagonal : rangée + colonne, mesurées sur la grille réelle
  function orderTiles(el) {
    var kids = Array.prototype.slice.call(el.children);
    var tops = [];
    var lefts = [];
    kids.forEach(function (k) {
      if (tops.indexOf(k.offsetTop) === -1) tops.push(k.offsetTop);
      if (lefts.indexOf(k.offsetLeft) === -1) lefts.push(k.offsetLeft);
    });
    tops.sort(function (a, b) { return a - b; });
    lefts.sort(function (a, b) { return a - b; });
    kids.forEach(function (k) {
      k.style.setProperty('--fx-i', tops.indexOf(k.offsetTop) + lefts.indexOf(k.offsetLeft));
    });
  }
  FX.register('tile-cascade', { entrance: true, setup: orderTiles });
  U.onResize(function () { document.querySelectorAll('[data-fx="tile-cascade"]').forEach(orderTiles); });

  function scatter(el) {
    var spread = U.num(el, 'fxSpread', 140);
    Array.prototype.forEach.call(el.children, function (k, i) {
      k.style.setProperty('--fx-i', i);
      k.style.setProperty('--fx-x', U.rand(-spread, spread).toFixed(0) + 'px');
      k.style.setProperty('--fx-y', U.rand(-spread, spread).toFixed(0) + 'px');
      k.style.setProperty('--fx-r', U.rand(-90, 90).toFixed(0) + 'deg');
    });
  }
  FX.register('scatter-gather', { entrance: true, setup: scatter, reset: scatter });
})(window.FX);

/* Pack 02 — Texte */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Garde le texte d'origine pour les pseudo-éléments (::before / ::after)
  function copyText(el) { el.dataset.fxCopy = el.textContent.trim(); }

  FX.register('typewriter', {
    entrance: true,
    setup: function (el) {
      el.dataset.fxText = el.textContent.trim();
      el.setAttribute('aria-label', el.dataset.fxText);
      el.style.minHeight = el.offsetHeight + 'px';
      if (!U.reduced) el.textContent = '';
    },
    reset: function (el) { el.textContent = ''; },
    enter: function (el) {
      var text = el.dataset.fxText;
      var speed = U.num(el, 'fxSpeed', 45);
      U.tween(el, text.length * speed, function (p) {
        el.textContent = text.slice(0, Math.round(p * text.length));
      });
    }
  });

  FX.register('word-rise', { entrance: true, setup: U.splitWords });
  FX.register('wave-text', { setup: U.splitChars });
  FX.register('glitch-text', { setup: copyText });
  FX.register('slice-hover', { setup: copyText });
  ['gradient-flow', 'stroke-fill', 'neon-flicker', 'wavy-underline', 'image-text'].forEach(function (n) {
    FX.register(n, {});
  });
  ['highlight-sweep', 'strike-draw', 'track-in', 'long-shadow'].forEach(function (n) {
    FX.register(n, { entrance: true });
  });
  FX.register('char-flip', { entrance: true, setup: U.splitChars });

  FX.register('letter-focus', {
    entrance: true,
    setup: function (el) {
      U.splitChars(el);
      el.querySelectorAll('.fx-char').forEach(function (c) {
        c.style.setProperty('--fx-r', Math.random().toFixed(2));
      });
    }
  });

  // --- proximity-weight -----------------------------------------------------

  FX.register('proximity-weight', {
    setup: function (el) {
      U.splitChars(el);
      var chars = Array.prototype.slice.call(el.querySelectorAll('.fx-char'));
      var reach = U.num(el, 'fxReach', 120);
      var queued = null;
      function update(x, y) {
        chars.forEach(function (c) {
          var r = c.getBoundingClientRect();
          var d = Math.hypot(r.left + r.width / 2 - x, r.top + r.height / 2 - y);
          c.style.setProperty('--fx-k', Math.max(0, 1 - d / reach).toFixed(2));
        });
      }
      el.addEventListener('pointermove', function (e) {
        if (U.reduced) return;
        if (queued) return;
        queued = U.raf(function () { queued = null; update(e.clientX, e.clientY); });
      });
      el.addEventListener('pointerleave', function () { update(-1e4, -1e4); });
    }
  });

  // --- word-rotator ---------------------------------------------------------

  FX.register('word-rotator', {
    setup: function (el) {
      var words = (el.dataset.fxWords || el.textContent).split('|').map(function (w) { return w.trim(); });
      el.setAttribute('aria-label', words.join(', '));
      el.textContent = '';
      var spans = words.map(function (w) {
        var s = U.make('span', '', el);
        s.textContent = w;
        s.setAttribute('aria-hidden', 'true');
        return s;
      });
      var i = 0;
      spans[0].classList.add('fx-cur');
      function fit() { el.style.width = spans[i].offsetWidth + 'px'; }
      fit();
      U.onResize(fit);
      if (U.reduced || spans.length < 2) return;
      var timer = setInterval(function () {
        if (!el.isConnected) { clearInterval(timer); return; }
        var prev = spans[i];
        i = (i + 1) % spans.length;
        spans.forEach(function (s) { s.classList.remove('fx-prev'); });
        prev.classList.remove('fx-cur');
        prev.classList.add('fx-prev');
        spans[i].classList.add('fx-cur');
        fit();
      }, U.num(el, 'fxInterval', 2200));
    }
  });

  // --- odometer -------------------------------------------------------------

  FX.register('odometer', {
    entrance: true,
    setup: function (el) {
      var text = el.textContent.trim();
      el.setAttribute('aria-label', text);
      el.textContent = '';
      var col = 0;
      Array.from(text).forEach(function (ch) {
        if (!/\d/.test(ch)) {
          var s = U.make('span', '', el);
          s.textContent = ch;
          s.setAttribute('aria-hidden', 'true');
          return;
        }
        var c = U.make('span', 'fx-odo-col', el);
        c.setAttribute('aria-hidden', 'true');
        var strip = U.make('span', '', c);
        strip.textContent = '0\n1\n2\n3\n4\n5\n6\n7\n8\n9';
        strip.style.setProperty('--fx-d', ch);
        strip.style.setProperty('--fx-i', col++);
      });
    }
  });

  // --- scroll-ink -----------------------------------------------------------

  FX.register('scroll-ink', {
    setup: U.splitWords,
    scroll: function (el, info) {
      var words = el._fxWords || (el._fxWords = el.querySelectorAll('.fx-word'));
      var r = info.rect;
      var p = U.reduced ? 1 : U.clamp((info.vh * 0.85 - r.top) / (r.height + info.vh * 0.45), 0, 1);
      var on = Math.round(p * words.length);
      if (on === el._fxOn) return;
      el._fxOn = on;
      for (var i = 0; i < words.length; i++) words[i].classList.toggle('fx-on', i < on);
    }
  });

  // --- velocity-stretch -----------------------------------------------------

  FX.register('velocity-stretch', {
    tick: function (el) {
      if (U.reduced) return;
      var v = U.velocity();
      var k = U.clamp(Math.abs(v) / 50, 0, 0.7);
      el._fxK = U.lerp(el._fxK || 0, k, 0.15);
      el.style.transform = 'scaleY(' + (1 + el._fxK).toFixed(3) + ') skewX(' + (-U.clamp(v, -40, 40) / 4).toFixed(2) + 'deg)';
    }
  });

  FX.register('edge-label', { scroll: true });
})(window.FX);

/* Pack 03 — Micro-interactions (survol, clic) */
(function (FX) {
  'use strict';
  var U = FX.util;

  [
    'fill-up', 'border-trace', 'shine-sweep', 'press-squash', 'lift-hover', 'jelly', 'conic-border',
    'underline-fill', 'zoom-frame', 'tooltip-pop', 'switch-morph', 'blob-morph', 'pulse-ring', 'invert-sweep'
  ].forEach(function (n) { FX.register(n, {}); });

  FX.register('ripple-click', {
    setup: function (el) {
      el.addEventListener('pointerdown', function (e) {
        if (U.reduced) return;
        var r = el.getBoundingClientRect();
        var size = Math.max(r.width, r.height) * 2.2;
        var s = U.make('span', 'fx-ripple', el);
        s.style.width = s.style.height = size + 'px';
        s.style.left = (e.clientX - r.left - size / 2) + 'px';
        s.style.top = (e.clientY - r.top - size / 2) + 'px';
        setTimeout(function () { s.remove(); }, 700);
      });
    }
  });

  FX.register('spotlight-card', {
    setup: function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--fx-mx', (e.clientX - r.left) + 'px');
        el.style.setProperty('--fx-my', (e.clientY - r.top) + 'px');
      });
    }
  });

  FX.register('icon-nudge', {
    setup: function (el) { if (!el.dataset.fxIcon) el.dataset.fxIcon = '→'; }
  });

  FX.register('swap-text', {
    setup: function (el) {
      var text = el.textContent.trim();
      var alt = el.dataset.fxAlt || text;
      el.textContent = '';
      var box = U.make('span', 'fx-swap', el);
      var a = U.make('span', '', box);
      a.textContent = text;
      var b = U.make('span', '', box);
      b.textContent = alt;
      b.setAttribute('aria-hidden', 'true');
    }
  });

  FX.register('click-burst', {
    triggerOn: 'click',
    trigger: function (el) {
      if (U.reduced) return;
      var n = U.num(el, 'fxCount', 12);
      var reach = U.num(el, 'fxReach', 70);
      for (var i = 0; i < n; i++) {
        var s = U.make('span', 'fx-spark', el);
        var a = (i / n) * Math.PI * 2 + U.rand(-0.2, 0.2);
        var d = reach * U.rand(0.6, 1.1);
        s.style.setProperty('--dx', (Math.cos(a) * d).toFixed(1) + 'px');
        s.style.setProperty('--dy', (Math.sin(a) * d).toFixed(1) + 'px');
        setTimeout(s.remove.bind(s), 700);
      }
    }
  });

  FX.register('shake', {
    trigger: function (el) {
      el.classList.remove('fx-shaking');
      void el.offsetWidth;
      el.classList.add('fx-shaking');
      if (navigator.vibrate && el.dataset.fxVibrate === 'true') navigator.vibrate(80);
    }
  });

  FX.register('fan-out', {
    setup: function (el) {
      var kids = el.children;
      Array.prototype.forEach.call(kids, function (k, i) { k.style.setProperty('--fx-i', i); });
      el.style.setProperty('--fx-mid', (kids.length - 1) / 2);
    }
  });

  FX.register('depth-hover', {
    setup: function (el) {
      var range = U.num(el, 'fxRange', 24);
      var layers = Array.prototype.slice.call(el.querySelectorAll('[data-fx-depth]'));
      el.addEventListener('pointermove', function (e) {
        if (U.reduced) return;
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        layers.forEach(function (l) {
          var d = parseFloat(l.dataset.fxDepth) || 0;
          l.style.transform = 'translate(' + (px * range * d * 2).toFixed(1) + 'px,' + (py * range * d * 2).toFixed(1) + 'px)';
        });
      });
      el.addEventListener('pointerleave', function () {
        layers.forEach(function (l) { l.style.transform = ''; });
      });
    }
  });
})(window.FX);

/* Pack 04 — Défilement */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Effets entièrement pilotés par --fx-p / --fx-pass (posés par le moteur)
  [
    'parallax', 'scroll-rotate', 'scale-on-scroll', 'fade-exit', 'hero-shrink', 'scroll-unveil',
    'perspective-scroll', 'split-columns', 'blur-exit', 'fill-scroll'
  ].forEach(function (n) { FX.register(n, { scroll: true }); });

  // --- Défilement dans une boîte ou dans la page --------------------------

  // Premier ancêtre déclaré défilant (sinon la page). On ne teste pas s'il déborde déjà :
  // certains effets (pin-horizontal) ne le font déborder qu'après leur mise en place.
  function scrollParent(el) {
    for (var p = el.parentElement; p && p !== document.body && p !== document.documentElement; p = p.parentElement) {
      var o = getComputedStyle(p).overflowY;
      if (o === 'auto' || o === 'scroll') return p;
    }
    return null;
  }

  function view(parent) {
    if (!parent) return { top: 0, h: window.innerHeight, w: window.innerWidth };
    var r = parent.getBoundingClientRect();
    return { top: r.top, h: parent.clientHeight, w: parent.clientWidth };
  }

  // Appelle update à chaque défilement de la page ou de la boîte qui contient l'élément
  function bindScroll(el, update) {
    var parent = scrollParent(el);
    var queued = false;
    function run() {
      if (queued) return;
      queued = true;
      U.raf(function () { queued = false; update(view(parent), parent); });
    }
    (parent || window).addEventListener('scroll', run, { passive: true });
    if (parent) window.addEventListener('scroll', run, { passive: true });
    U.onResize(run);
    run();
    return parent;
  }

  // Partagés avec les packs suivants (navigation…)
  U.scrollParent = scrollParent;
  U.bindScroll = bindScroll;

  // --- progress-bar ---------------------------------------------------------

  FX.register('progress-bar', {
    setup: function (el) {
      bindScroll(el, function () {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        el.style.setProperty('--fx-page', max > 0 ? (window.scrollY / max).toFixed(4) : 0);
      });
    }
  });

  // --- stack-cards ----------------------------------------------------------

  FX.register('stack-cards', {
    setup: function (el) {
      var kids = Array.prototype.slice.call(el.children);
      kids.forEach(function (k, i) { k.style.setProperty('--fx-i', i); });
      bindScroll(el, function () {
        if (U.reduced) return;
        kids.forEach(function (k, i) {
          var next = kids[i + 1];
          if (!next) return;
          var a = k.getBoundingClientRect();
          var b = next.getBoundingClientRect();
          var cover = U.clamp(1 - (b.top - a.top) / a.height, 0, 1);
          k.style.setProperty('--fx-s', (1 - cover * 0.08).toFixed(3));
          k.style.setProperty('--fx-shade', (1 - cover * 0.35).toFixed(3));
        });
      });
    }
  });

  // --- pin-horizontal -------------------------------------------------------

  FX.register('pin-horizontal', {
    setup: function (el) {
      var pin = U.make('div', 'fx-pin');
      var track = U.make('div', 'fx-track', pin);
      while (el.firstChild) track.appendChild(el.firstChild);
      el.appendChild(pin);
      bindScroll(el, function (v) {
        pin.style.height = v.h + 'px';
        var distance = Math.max(0, track.scrollWidth - v.w);
        el.style.height = (v.h + distance) + 'px';
        var r = el.getBoundingClientRect();
        var p = distance ? U.clamp((v.top - r.top) / distance, 0, 1) : 0;
        track.style.transform = 'translate3d(' + (-p * distance).toFixed(1) + 'px,0,0)';
      });
    }
  });

  // --- bg-shift -------------------------------------------------------------

  FX.register('bg-shift', {
    setup: function (el) {
      var scope = el.closest('[data-fx-bg-scope]') || document.body;
      bindScroll(el, function (v) {
        var r = el.getBoundingClientRect();
        var mid = v.top + v.h / 2;
        if (r.top <= mid && r.bottom > mid) {
          scope.style.backgroundColor = el.dataset.fxBg || '';
          if (el.dataset.fxColor) scope.style.color = el.dataset.fxColor;
        }
      });
    }
  });

  // --- scroll-count ---------------------------------------------------------

  FX.register('scroll-count', {
    setup: function (el) {
      el.dataset.fxTo = el.dataset.fxTo || el.textContent.replace(/[^\d.-]/g, '');
      el.setAttribute('aria-label', el.textContent.trim());
    },
    scroll: function (el, info) {
      var to = parseFloat(el.dataset.fxTo) || 0;
      var v = U.reduced ? to : Math.round(to * info.enter);
      if (v === el._fxV) return;
      el._fxV = v;
      el.textContent = v.toLocaleString(document.documentElement.lang || undefined);
    }
  });

  // --- path-scroll ----------------------------------------------------------

  FX.register('path-scroll', {
    setup: function (el) {
      el._fxPaths = Array.prototype.map.call(el.querySelectorAll('path'), function (p) {
        var len = p.getTotalLength();
        p.style.strokeDasharray = len;
        p.style.strokeDashoffset = len;
        return { p: p, len: len };
      });
    },
    scroll: function (el, info) {
      var k = U.reduced ? 1 : U.clamp(info.pass * 1.4 - 0.15, 0, 1);
      el._fxPaths.forEach(function (o) { o.p.style.strokeDashoffset = (o.len * (1 - k)).toFixed(1); });
    }
  });

  // --- skew-scroll ----------------------------------------------------------

  FX.register('skew-scroll', {
    tick: function (el) {
      if (U.reduced) return;
      var target = U.clamp(U.velocity() * 0.18, -10, 10);
      el._fxK = U.lerp(el._fxK || 0, target, 0.12);
      if (Math.abs(el._fxK) < 0.01 && !el.style.transform) return;
      el.style.transform = 'skewY(' + el._fxK.toFixed(2) + 'deg)';
    }
  });

  // --- scatter-scroll -------------------------------------------------------

  FX.register('scatter-scroll', {
    scroll: true,
    setup: function (el) {
      U.splitChars(el);
      var spread = U.num(el, 'fxSpread', 160);
      el.querySelectorAll('.fx-char').forEach(function (c) {
        c.style.setProperty('--fx-rx', U.rand(-spread, spread).toFixed(0) + 'px');
        c.style.setProperty('--fx-ry', U.rand(-spread, spread * 0.4).toFixed(0) + 'px');
        c.style.setProperty('--fx-rr', U.rand(-120, 120).toFixed(0) + 'deg');
      });
    }
  });
})(window.FX);

/* Pack 05 — Transitions plein écran */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Place les pièces d'une grille (--c colonne, --r rangée) et un délai aléatoire --fx-r
  function grid(cols) {
    return function (o) {
      Array.prototype.forEach.call(o.children, function (p, i) {
        p.style.setProperty('--c', i % cols);
        p.style.setProperty('--r', Math.floor(i / cols));
        if ((i % cols + Math.floor(i / cols)) % 2) p.classList.add('fx-alt');
        p.style.setProperty('--fx-r', Math.random().toFixed(2));
      });
    };
  }

  FX.register('bands', { transition: { pieces: 5, cover: 950, uncover: 1000 } });
  FX.register('circle-expand', { transition: { pieces: 1, cover: 850, uncover: 900 } });
  FX.register('slash', { transition: { pieces: 1, cover: 820, uncover: 850 } });
  FX.register('pixel-wipe', { transition: { pieces: 96, cover: 760, uncover: 800, build: grid(12) } });
  FX.register('shutter', { transition: { pieces: 8, cover: 820, uncover: 850 } });
  FX.register('curtain-close', { transition: { pieces: 2, cover: 800, uncover: 850 } });
  FX.register('fade-through', { transition: { pieces: 1, cover: 520, uncover: 550 } });
  FX.register('zoom-through', { transition: { pieces: 1, cover: 850, uncover: 800 } });
  FX.register('push-slide', { transition: { pieces: 1, cover: 780, uncover: 800 } });
  FX.register('arc-rise', { transition: { pieces: 1, cover: 920, uncover: 950 } });
  FX.register('tile-flip', { transition: { pieces: 40, cover: 1000, uncover: 1050, build: grid(8) } });
  FX.register('iris', { transition: { pieces: 1, cover: 820, uncover: 850 } });

  FX.register('glitch-cut', {
    transition: {
      pieces: 10,
      cover: 650,
      uncover: 700,
      build: function (o) {
        Array.prototype.forEach.call(o.children, function (p, i) {
          p.style.setProperty('--fx-dir', i % 2 ? 1 : -1);
          p.style.setProperty('--fx-r', Math.random().toFixed(2));
        });
      }
    }
  });

  FX.register('title-card', {
    transition: {
      pieces: 1,
      cover: 1300,
      uncover: 950,
      build: function (o) {
        var src = o._fxEvent && o._fxEvent.target && o._fxEvent.target.closest && o._fxEvent.target.closest('[data-fx-title]');
        var t = U.make('span', 'fx-tr-title', o);
        t.textContent = (src && src.dataset.fxTitle) || document.title;
      }
    }
  });

  // Morphing natif du navigateur entre deux états de la page ; repli immédiat sinon
  FX.register('view-morph', {
    transition: {
      custom: function (callback) {
        // Onglet masqué : le navigateur attendrait un rendu pour appeler callback
        if (!document.startViewTransition || U.reduced || document.hidden) { if (callback) callback(); return; }
        var vt = document.startViewTransition(function () { if (callback) callback(); });
        // Une transition interrompue rejette ses promesses : ce n'est pas une erreur pour la page
        if (vt && vt.ready) vt.ready.catch(function () {});
        if (vt && vt.finished) vt.finished.catch(function () {});
      }
    }
  });
})(window.FX);

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

/* Pack 07 — Images et médias */
(function (FX) {
  'use strict';
  var U = FX.util;
  var NS = 'http://www.w3.org/2000/svg';
  var uid = 0;

  ['ken-burns', 'color-reveal', 'blob-mask'].forEach(function (n) { FX.register(n, {}); });

  // --- Filtres SVG partagés -------------------------------------------------

  var defs = null;
  function svgDefs() {
    if (defs) return defs;
    var s = document.createElementNS(NS, 'svg');
    s.setAttribute('width', '0');
    s.setAttribute('height', '0');
    s.setAttribute('aria-hidden', 'true');
    s.style.position = 'absolute';
    defs = document.createElementNS(NS, 'defs');
    s.appendChild(defs);
    document.body.appendChild(s);
    return defs;
  }
  function addFilter(id, inner) {
    var f = document.createElementNS(NS, 'filter');
    f.setAttribute('id', id);
    f.setAttribute('x', '-10%');
    f.setAttribute('y', '-10%');
    f.setAttribute('width', '120%');
    f.setAttribute('height', '120%');
    f.setAttribute('color-interpolation-filters', 'sRGB');
    f.innerHTML = inner;
    svgDefs().appendChild(f);
    return f;
  }
  function imgOf(el) { return el.tagName === 'IMG' ? el : el.querySelector('img'); }
  function srcOf(img) { return img ? (img.currentSrc || img.src) : ''; }

  // --- svg-draw -------------------------------------------------------------

  FX.register('svg-draw', {
    entrance: true,
    setup: function (el) {
      el._fxShapes = Array.prototype.map.call(el.querySelectorAll('path, circle, line, polyline, rect'), function (s, i) {
        var len = s.getTotalLength ? s.getTotalLength() : 0;
        s.style.strokeDasharray = len;
        s.style.strokeDashoffset = U.reduced ? 0 : len;
        s.style.transitionDelay = (i * U.num(el, 'fxStagger', 120)) + 'ms';
        return { s: s, len: len };
      });
    },
    reset: function (el) { el._fxShapes.forEach(function (o) { o.s.style.strokeDashoffset = o.len; }); },
    enter: function (el) { el._fxShapes.forEach(function (o) { o.s.style.strokeDashoffset = 0; }); }
  });

  // --- image-trail ----------------------------------------------------------

  FX.register('image-trail', {
    setup: function (el) {
      var list = (el.dataset.fxImages || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
      if (!list.length) return;
      var gap = U.num(el, 'fxGap', 70);
      var last = null;
      var i = 0;
      el.addEventListener('pointermove', function (e) {
        if (U.reduced) return;
        var r = el.getBoundingClientRect();
        var x = e.clientX - r.left;
        var y = e.clientY - r.top;
        if (last && Math.hypot(x - last.x, y - last.y) < gap) return;
        last = { x: x, y: y };
        var img = U.make('img', 'fx-trail', el);
        img.src = list[i++ % list.length];
        img.alt = '';
        img.style.left = x + 'px';
        img.style.top = y + 'px';
        img.style.setProperty('--r', U.rand(-12, 12).toFixed(0) + 'deg');
        setTimeout(function () { img.remove(); }, 1150);
      });
    }
  });

  // --- hover-preview --------------------------------------------------------

  FX.register('hover-preview', {
    setup: function (el) {
      var p = el._fxP = { box: U.make('div', 'fx-preview', el), x: 0, y: 0, tx: 0, ty: 0 };
      p.box.setAttribute('aria-hidden', 'true');
      el.querySelectorAll('[data-fx-image]').forEach(function (item) {
        item.addEventListener('pointerenter', function () {
          p.box.style.backgroundImage = 'url("' + item.dataset.fxImage + '")';
          p.box.classList.add('fx-on');
        });
      });
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        p.tx = e.clientX - r.left + 24;
        p.ty = e.clientY - r.top - p.box.offsetHeight / 2;
        if (!p.box.classList.contains('fx-on')) { p.x = p.tx; p.y = p.ty; }
      });
      el.addEventListener('pointerleave', function () { p.box.classList.remove('fx-on'); });
    },
    tick: function (el) {
      var p = el._fxP;
      var k = U.reduced ? 1 : 0.16;
      p.x += (p.tx - p.x) * k;
      p.y += (p.ty - p.y) * k;
      p.box.style.transform = 'translate(' + p.x.toFixed(1) + 'px,' + p.y.toFixed(1) + 'px)';
    }
  });

  // --- slice-in -------------------------------------------------------------

  FX.register('slice-in', {
    entrance: true,
    setup: function (el) {
      var img = imgOf(el);
      if (!img) return;
      var n = U.num(el, 'fxSlices', 6);
      for (var i = 0; i < n; i++) {
        var s = U.make('div', 'fx-slice', el);
        s.style.left = (i * 100 / n) + '%';
        s.style.width = 'calc(' + (100 / n) + '% + 1px)';
        s.style.setProperty('--fx-i', i);
        s.style.setProperty('--fx-dir', i % 2 ? -1 : 1);
        var inner = U.make('i', '', s);
        inner.style.left = (-i * 100) + '%';
        inner.style.width = (n * 100) + '%';
        inner.style.backgroundImage = 'url("' + srcOf(img) + '")';
      }
    }
  });

  // --- rgb-split ------------------------------------------------------------

  FX.register('rgb-split', {
    setup: function () {
      if (document.getElementById('fx-rgb-split')) return;
      addFilter('fx-rgb-split',
        '<feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r"/>' +
        '<feOffset in="r" dx="-6" result="ro"/>' +
        '<feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g"/>' +
        '<feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b"/>' +
        '<feOffset in="b" dx="6" result="bo"/>' +
        '<feBlend in="ro" in2="g" mode="screen" result="rg"/>' +
        '<feBlend in="rg" in2="bo" mode="screen"/>');
    }
  });

  // --- compare --------------------------------------------------------------

  FX.register('compare', {
    setup: function (el) {
      var handle = U.make('div', 'fx-handle', el);
      handle.setAttribute('aria-hidden', 'true');
      var range = U.make('input', '', el);
      range.type = 'range';
      range.min = 0;
      range.max = 100;
      range.value = U.num(el, 'fxStart', 50);
      range.setAttribute('aria-label', el.dataset.fxLabel || 'Comparer avant et après');
      function set() { el.style.setProperty('--fx-pos', range.value + '%'); }
      range.addEventListener('input', set);
      set();
    }
  });

  // --- glare ----------------------------------------------------------------

  FX.register('glare', {
    setup: function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--fx-mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
        el.style.setProperty('--fx-my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
      });
    }
  });

  // --- lens -----------------------------------------------------------------

  FX.register('lens', {
    setup: function (el) {
      var img = imgOf(el);
      if (!img) return;
      var lens = U.make('div', 'fx-lens', el);
      lens.setAttribute('aria-hidden', 'true');
      var zoom = U.num(el, 'fxZoom', 2.4);
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = e.clientX - r.left;
        var y = e.clientY - r.top;
        var size = lens.offsetWidth;
        lens.style.backgroundImage = 'url("' + srcOf(img) + '")';
        lens.style.backgroundSize = (r.width * zoom) + 'px ' + (r.height * zoom) + 'px';
        lens.style.backgroundPosition = (-(x * zoom - size / 2)) + 'px ' + (-(y * zoom - size / 2)) + 'px';
        lens.style.transform = 'translate(' + (x - size / 2) + 'px,' + (y - size / 2) + 'px)';
      });
    }
  });

  // --- photo-stack ----------------------------------------------------------

  function nextPhoto(el) {
    var top = el.lastElementChild;
    if (!top || el._fxBusy) return;
    el._fxBusy = true;
    top.classList.add('fx-out');
    setTimeout(function () {
      el.insertBefore(top, el.firstElementChild);
      top.classList.remove('fx-out');
      el._fxBusy = false;
    }, U.reduced ? 0 : 420);
  }

  FX.register('photo-stack', {
    setup: function (el) {
      Array.prototype.forEach.call(el.children, function (k, i, all) {
        k.style.setProperty('--r', (i === all.length - 1 ? 0 : U.rand(-9, 9)).toFixed(1) + 'deg');
      });
      if (!el.hasAttribute('tabindex')) el.tabIndex = 0;
      el.setAttribute('role', 'button');
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); nextPhoto(el); }
      });
    },
    triggerOn: 'click',
    trigger: nextPhoto
  });

  // --- liquid-hover ---------------------------------------------------------

  FX.register('liquid-hover', {
    setup: function (el) {
      var id = 'fx-liquid-' + (++uid);
      var f = addFilter(id,
        '<feTurbulence type="fractalNoise" baseFrequency="0.012 0.04" numOctaves="2" seed="3" result="t"/>' +
        '<feDisplacementMap in="SourceGraphic" in2="t" scale="0" xChannelSelector="R" yChannelSelector="G"/>');
      var map = f.querySelector('feDisplacementMap');
      var turb = f.querySelector('feTurbulence');
      el.addEventListener('pointerenter', function () {
        if (U.reduced) return;
        el.style.filter = 'url(#' + id + ')';
        U.tween(el, 1100, function (p) {
          map.setAttribute('scale', (34 * Math.sin(p * Math.PI) * (1 - p * 0.4)).toFixed(2));
          turb.setAttribute('baseFrequency', (0.012 + p * 0.008).toFixed(4) + ' ' + (0.04 - p * 0.015).toFixed(4));
        }, function () { el.style.filter = ''; });
      });
    }
  });

  // --- pixelate -------------------------------------------------------------

  FX.register('pixelate', {
    setup: function (el) {
      var img = imgOf(el);
      if (!img || U.reduced) return;
      var c = U.make('canvas', '', el);
      c.setAttribute('aria-hidden', 'true');
      var small = document.createElement('canvas');
      var max = U.num(el, 'fxBlock', 22);
      function draw(block) {
        var w = el.clientWidth;
        var h = el.clientHeight;
        if (!w || !h) return;
        c.width = w;
        c.height = h;
        var sw = Math.max(1, Math.ceil(w / block));
        var sh = Math.max(1, Math.ceil(h / block));
        small.width = sw;
        small.height = sh;
        var iw = img.naturalWidth || w;
        var ih = img.naturalHeight || h;
        var k = Math.max(sw / iw, sh / ih);
        var sctx = small.getContext('2d');
        sctx.drawImage(img, (sw - iw * k) / 2, (sh - ih * k) / 2, iw * k, ih * k);
        var ctx = c.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(small, 0, 0, sw, sh, 0, 0, w, h);
      }
      el._fxBlock = max;
      function animateTo(target, done) {
        var from = el._fxBlock;
        U.tween(el, 600, function (p) {
          el._fxBlock = Math.max(1, Math.round(from + (target - from) * U.easeOut(p)));
          draw(el._fxBlock);
        }, done);
      }
      if (img.complete) draw(max); else img.addEventListener('load', function () { draw(max); });
      el.addEventListener('pointerenter', function () {
        animateTo(1, function () { c.style.opacity = 0; });
      });
      el.addEventListener('pointerleave', function () {
        c.style.opacity = 1;
        animateTo(max);
      });
    }
  });

  // --- flip-card ------------------------------------------------------------

  FX.register('flip-card', {
    setup: function (el) {
      if (!el.hasAttribute('tabindex')) el.tabIndex = 0;
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.classList.toggle('fx-flipped'); }
      });
    },
    triggerOn: 'click',
    trigger: function (el) { el.classList.toggle('fx-flipped'); }
  });

  // --- carousel-ring --------------------------------------------------------

  FX.register('carousel-ring', {
    setup: function (el) {
      var ring = U.make('div', 'fx-ring');
      var kids = Array.prototype.slice.call(el.children);
      kids.forEach(function (k, i) {
        k.style.setProperty('--fx-i', i);
        ring.appendChild(k);
      });
      el.appendChild(ring);
      ring.style.setProperty('--fx-n', kids.length);
      var w = kids[0] ? kids[0].offsetWidth : 120;
      var gap = U.num(el, 'fxGap', 18);
      el.style.setProperty('--fx-radius', ((w / 2 + gap) / Math.tan(Math.PI / Math.max(3, kids.length))).toFixed(0) + 'px');
    }
  });

  // --- drag-gallery ---------------------------------------------------------

  FX.register('drag-gallery', {
    setup: function (el) {
      var track = U.make('div', 'fx-track');
      while (el.firstChild) track.appendChild(el.firstChild);
      el.appendChild(track);
      var s = el._fxG = { track: track, x: 0, v: 0, drag: false, lx: 0, lt: 0 };
      if (!el.hasAttribute('tabindex')) el.tabIndex = 0;
      el.setAttribute('aria-roledescription', 'galerie défilante');
      el.addEventListener('pointerdown', function (e) {
        s.drag = true;
        s.lx = e.clientX;
        s.lt = performance.now();
        s.v = 0;
        el.classList.add('fx-dragging');
        el.setPointerCapture(e.pointerId);
      });
      el.addEventListener('pointermove', function (e) {
        if (!s.drag) return;
        var now = performance.now();
        var dx = e.clientX - s.lx;
        s.x += dx;
        s.v = dx / Math.max(1, now - s.lt) * 1000;
        s.lx = e.clientX;
        s.lt = now;
      });
      function release() { s.drag = false; el.classList.remove('fx-dragging'); }
      el.addEventListener('pointerup', release);
      el.addEventListener('pointercancel', release);
      el.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') s.v = -900;
        if (e.key === 'ArrowLeft') s.v = 900;
      });
    },
    tick: function (el, dt) {
      var s = el._fxG;
      var min = Math.min(0, el.clientWidth - s.track.scrollWidth);
      if (!s.drag) {
        s.x += s.v * dt;
        s.v *= Math.pow(0.05, dt);
        if (s.x > 0) { s.x += (0 - s.x) * 0.2; s.v = 0; }
        if (s.x < min) { s.x += (min - s.x) * 0.2; s.v = 0; }
      }
      s.track.style.transform = 'translate3d(' + s.x.toFixed(1) + 'px,0,0)';
    }
  });

  // --- noise-reveal ---------------------------------------------------------

  FX.register('noise-reveal', {
    entrance: true,
    setup: function (el) {
      var id = 'fx-noise-' + (++uid);
      var f = addFilter(id,
        '<feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="3" seed="7" result="t"/>' +
        '<feDisplacementMap in="SourceGraphic" in2="t" scale="160" xChannelSelector="R" yChannelSelector="B"/>');
      el._fxMap = f.querySelector('feDisplacementMap');
      el._fxId = id;
      if (!U.reduced) el.style.filter = 'url(#' + id + ')';
    },
    reset: function (el) {
      el._fxMap.setAttribute('scale', 160);
      el.style.filter = 'url(#' + el._fxId + ')';
    },
    enter: function (el) {
      U.tween(el, U.num(el, 'fxDuration', 1400), function (p) {
        el._fxMap.setAttribute('scale', (160 * Math.pow(1 - p, 3)).toFixed(1));
      }, function () { el.style.filter = ''; });
    }
  });
})(window.FX);

/* Pack 08 — Navigation et composants d'interface */
(function (FX) {
  'use strict';
  var U = FX.util;

  FX.register('focus-list', {});

  // --- Ouverture / fermeture partagées --------------------------------------

  var openable = ['menu-reveal', 'drawer', 'modal-zoom', 'dropdown'];

  function setOpen(el, open) {
    el.classList.toggle('fx-open', open);
    if (el.dataset.fx !== 'dropdown') el.setAttribute('aria-hidden', open ? 'false' : 'true');
    document.querySelectorAll('[data-fx-toggle]').forEach(function (t) {
      var target = document.querySelector(t.dataset.fxToggle);
      if (target === el) t.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    if (open) {
      var focusable = el.querySelector('a, button, input, [tabindex]');
      if (focusable && el.dataset.fx !== 'dropdown') setTimeout(function () { focusable.focus({ preventScroll: true }); }, 50);
    }
  }
  function toggle(el, e) {
    var open = !el.classList.contains('fx-open');
    var d = el._fxBeforeOpen;
    if (open && d) d(el, e);
    setOpen(el, open);
  }

  // Tout élément [data-fx-toggle="#id"] ouvre ou ferme le composant ciblé
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-fx-toggle]');
    if (t) {
      var target = document.querySelector(t.dataset.fxToggle);
      if (target && FX.has(target.dataset.fx)) { e.preventDefault(); FX.trigger(target, e); }
      return;
    }
    var close = e.target.closest('[data-fx-close]');
    if (close) {
      var host = close.closest('.fx-open');
      if (host) setOpen(host, false);
    }
    // Clic en dehors d'une liste déroulante ouverte : on la ferme
    document.querySelectorAll('[data-fx="dropdown"].fx-open').forEach(function (dd) {
      if (!dd.contains(e.target)) setOpen(dd, false);
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('.fx-open').forEach(function (el) {
      if (openable.indexOf(el.dataset.fx) !== -1) setOpen(el, false);
    });
  });

  function openableDef(extra) {
    return Object.assign({
      setup: function (el) { if (el.dataset.fx !== 'dropdown') el.setAttribute('aria-hidden', 'true'); },
      trigger: toggle
    }, extra || {});
  }

  FX.register('menu-reveal', openableDef({
    setup: function (el) {
      el.setAttribute('aria-hidden', 'true');
      Array.prototype.forEach.call(el.children, function (k, i) { k.style.setProperty('--fx-i', i); });
    }
  }));

  FX.register('drawer', openableDef({
    setup: function (el) {
      el.setAttribute('aria-hidden', 'true');
      // Un clic sur le voile (hors du panneau) ferme le tiroir
      el.addEventListener('click', function (e) { if (e.target === el) setOpen(el, false); });
    }
  }));

  FX.register('modal-zoom', openableDef({
    setup: function (el) {
      el.setAttribute('aria-hidden', 'true');
      el.addEventListener('click', function (e) { if (e.target === el) setOpen(el, false); });
      // Point de départ : le centre de l'élément cliqué, relatif au centre de la fenêtre
      el._fxBeforeOpen = function (modal, e) {
        var src = e && e.target && e.target.getBoundingClientRect ? e.target.getBoundingClientRect() : null;
        var box = modal.getBoundingClientRect();
        if (!src || !box.width) { modal.style.removeProperty('--fx-dx'); modal.style.removeProperty('--fx-dy'); return; }
        modal.style.setProperty('--fx-dx', (src.left + src.width / 2 - (box.left + box.width / 2)).toFixed(0) + 'px');
        modal.style.setProperty('--fx-dy', (src.top + src.height / 2 - (box.top + box.height / 2)).toFixed(0) + 'px');
      };
    }
  }));

  FX.register('dropdown', openableDef({
    setup: function (el) {
      var btn = el.firstElementChild;
      var menu = el.lastElementChild;
      Array.prototype.forEach.call(menu.children, function (k, i) { k.style.setProperty('--fx-i', i); });
      if (btn) {
        btn.setAttribute('aria-expanded', 'false');
        btn.setAttribute('aria-haspopup', 'true');
        btn.addEventListener('click', function (e) {
          e.stopPropagation();
          toggle(el, e);
          btn.setAttribute('aria-expanded', el.classList.contains('fx-open') ? 'true' : 'false');
        });
      }
    }
  }));

  // --- burger-morph ---------------------------------------------------------

  FX.register('burger-morph', {
    setup: function (el) {
      if (!el.children.length) for (var i = 0; i < 3; i++) U.make('span', '', el);
      Array.prototype.forEach.call(el.children, function (s) { s.setAttribute('aria-hidden', 'true'); });
      if (!el.hasAttribute('aria-expanded')) el.setAttribute('aria-expanded', 'false');
      if (!el.hasAttribute('aria-label')) el.setAttribute('aria-label', 'Menu');
    },
    triggerOn: 'click',
    trigger: function (el) {
      // Si le bouton pilote un menu (data-fx-toggle), c'est ce menu qui met à jour aria-expanded
      if (el.dataset.fxToggle) return;
      el.setAttribute('aria-expanded', el.getAttribute('aria-expanded') === 'true' ? 'false' : 'true');
    }
  });

  // --- smart-header / header-shrink -----------------------------------------

  function scrollTopOf(parent) { return parent ? parent.scrollTop : window.scrollY; }

  FX.register('smart-header', {
    setup: function (el) {
      var last = 0;
      U.bindScroll(el, function (v, parent) {
        var y = scrollTopOf(parent);
        var delta = y - last;
        if (Math.abs(delta) > 4) {
          el.classList.toggle('fx-hidden', delta > 0 && y > el.offsetHeight * 1.5);
          last = y;
        }
        el.classList.toggle('fx-scrolled', y > 4);
      });
      el.addEventListener('focusin', function () { el.classList.remove('fx-hidden'); });
    }
  });

  FX.register('header-shrink', {
    setup: function (el) {
      U.bindScroll(el, function (v, parent) {
        el.classList.toggle('fx-small', scrollTopOf(parent) > U.num(el, 'fxAfter', 40));
      });
    }
  });

  // --- tab-slider -----------------------------------------------------------

  FX.register('tab-slider', {
    setup: function (el) {
      var ind = U.make('span', 'fx-indicator');
      ind.setAttribute('aria-hidden', 'true');
      el.insertBefore(ind, el.firstChild);
      el.setAttribute('role', el.getAttribute('role') || 'tablist');
      var tabs = Array.prototype.filter.call(el.children, function (k) { return k !== ind; });
      function place(tab) {
        ind.style.width = tab.offsetWidth + 'px';
        ind.style.height = tab.offsetHeight + 'px';
        ind.style.transform = 'translate(' + tab.offsetLeft + 'px,' + tab.offsetTop + 'px)';
      }
      function select(tab) {
        tabs.forEach(function (t) { t.setAttribute('aria-selected', t === tab ? 'true' : 'false'); });
        place(tab);
      }
      tabs.forEach(function (t) {
        t.setAttribute('role', 'tab');
        t.addEventListener('click', function () { select(t); });
      });
      select(tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0] || tabs[0]);
      U.onResize(function () { var cur = el.querySelector('[aria-selected="true"]'); if (cur) place(cur); });
    }
  });

  // --- dot-nav / scroll-spy (section active selon le défilement) -----------

  function spy(el, onChange) {
    var links = Array.prototype.slice.call(el.querySelectorAll('a[href^="#"]'));
    var targets = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
    var anchor = targets.filter(Boolean)[0] || el;
    U.bindScroll(anchor, function (v) {
      var mid = v.top + v.h * 0.4;
      var current = 0;
      targets.forEach(function (t, i) { if (t && t.getBoundingClientRect().top <= mid) current = i; });
      links.forEach(function (a, i) {
        a.classList.toggle('fx-active', i === current);
        if (i === current) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      });
      if (onChange) onChange(links[current]);
    });
    // Navigation dans une boîte qui défile : on fait défiler la boîte plutôt que la page
    links.forEach(function (a, i) {
      a.addEventListener('click', function (e) {
        var t = targets[i];
        if (!t) return;
        e.preventDefault();
        t.scrollIntoView({ behavior: U.reduced ? 'auto' : 'smooth', block: 'start' });
      });
    });
  }

  FX.register('dot-nav', { setup: function (el) { spy(el); } });

  FX.register('scroll-spy', {
    setup: function (el) {
      var marker = U.make('span', 'fx-marker');
      marker.setAttribute('aria-hidden', 'true');
      el.insertBefore(marker, el.firstChild);
      spy(el, function (a) {
        if (!a) return;
        marker.style.height = a.offsetHeight + 'px';
        marker.style.transform = 'translateY(' + a.offsetTop + 'px)';
      });
    }
  });

  // --- top-ring -------------------------------------------------------------

  FX.register('top-ring', {
    setup: function (el) {
      if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', 'Revenir en haut de la page');
      el.insertAdjacentHTML('afterbegin', '<svg viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="23"/></svg>');
      if (!el.textContent.trim()) el.insertAdjacentHTML('beforeend', '<span aria-hidden="true">↑</span>');
      var circle = el.querySelector('circle');
      var len = 2 * Math.PI * 23;
      circle.style.strokeDasharray = len;
      U.bindScroll(el, function () {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        var p = max > 0 ? window.scrollY / max : 0;
        circle.style.strokeDashoffset = (len * (1 - p)).toFixed(1);
        el.classList.toggle('fx-visible', el.dataset.fxLocal != null || window.scrollY > window.innerHeight * 0.5);
      });
      el.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: U.reduced ? 'auto' : 'smooth' });
      });
    }
  });

  // --- hover-pill -----------------------------------------------------------

  FX.register('hover-pill', {
    setup: function (el) {
      var pill = U.make('span', 'fx-pill');
      pill.setAttribute('aria-hidden', 'true');
      el.insertBefore(pill, el.firstChild);
      function place(item) {
        pill.style.width = item.offsetWidth + 'px';
        pill.style.height = item.offsetHeight + 'px';
        pill.style.transform = 'translate(' + item.offsetLeft + 'px,' + item.offsetTop + 'px)';
      }
      Array.prototype.forEach.call(el.children, function (item) {
        if (item === pill) return;
        item.addEventListener('pointerenter', function () {
          if (!pill.classList.contains('fx-on')) {
            pill.style.transition = 'none';
            place(item);
            void pill.offsetWidth;
            pill.style.transition = '';
          }
          place(item);
          pill.classList.add('fx-on');
        });
        item.addEventListener('focus', function () { place(item); pill.classList.add('fx-on'); });
      });
      el.addEventListener('pointerleave', function () { pill.classList.remove('fx-on'); });
    }
  });

  // --- accordion ------------------------------------------------------------

  FX.register('accordion', {
    setup: function (el) {
      var summary = el.querySelector('summary');
      if (!summary || !el.animate) return;
      summary.addEventListener('click', function (e) {
        if (U.reduced) return;
        e.preventDefault();
        var start = el.offsetHeight;
        var opening = !el.open;
        if (opening) el.open = true;
        var end = opening ? el.scrollHeight : summary.offsetHeight;
        if (opening) {
          el.style.height = start + 'px';
          end = el.scrollHeight;
        }
        var anim = el.animate({ height: [start + 'px', end + 'px'] }, { duration: 380, easing: 'cubic-bezier(.16,1,.3,1)' });
        anim.onfinish = function () {
          el.style.height = '';
          if (!opening) el.open = false;
        };
      });
    }
  });

  // --- dots-morph -----------------------------------------------------------

  FX.register('dots-morph', {
    setup: function (el) {
      var n = U.num(el, 'fxCount', el.children.length || 4);
      if (!el.children.length) for (var i = 0; i < n; i++) U.make('button', '', el);
      var dots = Array.prototype.slice.call(el.children);
      var interval = U.num(el, 'fxInterval', 3000);
      el.style.setProperty('--fx-interval', interval + 'ms');
      el.setAttribute('role', el.getAttribute('role') || 'group');
      var cur = 0;
      function go(i) {
        cur = i;
        dots.forEach(function (d, k) {
          d.setAttribute('aria-current', k === i ? 'true' : 'false');
          d.setAttribute('aria-label', 'Diapositive ' + (k + 1));
        });
        el.dispatchEvent(new CustomEvent('fx:change', { detail: { index: i }, bubbles: true }));
      }
      dots.forEach(function (d, k) { d.type = 'button'; d.addEventListener('click', function () { go(k); restart(); }); });
      var timer = null;
      function restart() {
        clearInterval(timer);
        if (U.reduced || el.dataset.fxAuto === 'false') return;
        timer = setInterval(function () {
          if (!el.isConnected) { clearInterval(timer); return; }
          go((cur + 1) % dots.length);
        }, interval);
      }
      go(0);
      restart();
    }
  });
})(window.FX);

/* Pack 09 — États et retours */
(function (FX) {
  'use strict';
  var U = FX.util;
  var NS = 'http://www.w3.org/2000/svg';

  ['orbit-loader', 'loading-bar', 'float', 'live-dot'].forEach(function (n) { FX.register(n, {}); });

  FX.register('typing-dots', {
    setup: function (el) {
      if (!el.children.length) for (var i = 0; i < 3; i++) U.make('i', '', el);
      el.setAttribute('role', 'status');
      if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', 'En train d\'écrire');
    }
  });

  // --- check-draw / cross-draw ----------------------------------------------

  function drawIcon(paths, label) {
    return function (el) {
      if (!el.querySelector('svg')) {
        el.innerHTML = '<svg viewBox="0 0 52 52" xmlns="' + NS + '"><circle cx="26" cy="26" r="23" pathLength="1"/>' +
          paths.map(function (d) { return '<path d="' + d + '" pathLength="1"/>'; }).join('') + '</svg>';
      }
      el.setAttribute('role', 'img');
      if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', label);
    };
  }
  FX.register('check-draw', { entrance: true, setup: drawIcon(['M15 27 l7 7 l15 -16'], 'Réussi') });
  FX.register('cross-draw', { entrance: true, setup: drawIcon(['M18 18 l16 16', 'M34 18 l-16 16'], 'Erreur') });

  // --- confetti -------------------------------------------------------------

  FX.register('confetti', {
    triggerOn: 'click',
    trigger: function (el) {
      if (U.reduced) return;
      var r = el.getBoundingClientRect();
      var c = U.make('canvas', '', document.body);
      c.setAttribute('aria-hidden', 'true');
      c.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:9999';
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      c.width = window.innerWidth * dpr;
      c.height = window.innerHeight * dpr;
      var ctx = c.getContext('2d');
      ctx.scale(dpr, dpr);
      var colors = (el.dataset.fxColors || '#ff5b2e,#b9a7ff,#ffcf4d,#20c7a5,#f4f1ea').split(',');
      var ox = r.left + r.width / 2;
      var oy = r.top + r.height / 2;
      var parts = Array.from({ length: U.num(el, 'fxCount', 90) }, function (_, i) {
        var a = U.rand(-Math.PI * 0.95, -Math.PI * 0.05);
        var v = U.rand(260, 620);
        return {
          x: ox, y: oy, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
          w: U.rand(5, 10), h: U.rand(8, 16), rot: U.rand(0, 6), vr: U.rand(-10, 10),
          color: colors[i % colors.length]
        };
      });
      var start = null;
      var last = null;
      function frame(t) {
        if (start === null) { start = t; last = t; }
        var dt = Math.min((t - last) / 1000, 0.04);
        last = t;
        var life = (t - start) / 2200;
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        parts.forEach(function (p) {
          p.vy += 900 * dt;
          p.vx *= 0.99;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.rot += p.vr * dt;
          ctx.save();
          ctx.globalAlpha = Math.max(0, 1 - life);
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.rot * 1.7)));
          ctx.restore();
        });
        if (life < 1) U.raf(frame); else c.remove();
      }
      U.raf(frame);
    }
  });

  // --- toast ----------------------------------------------------------------

  FX.register('toast', {
    setup: function (el) {
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
    },
    trigger: function (el, e) {
      var src = e && e.target && e.target.closest && e.target.closest('[data-fx-message]');
      var t = U.make('div', 'fx-toast', el);
      t.textContent = (src && src.dataset.fxMessage) || el.dataset.fxMessage || 'C\'est enregistré.';
      setTimeout(function () {
        t.classList.add('fx-leaving');
        setTimeout(function () { t.remove(); }, U.reduced ? 0 : 360);
      }, U.num(el, 'fxDuration', 3000));
    }
  });

  // --- progress-ring --------------------------------------------------------

  FX.register('progress-ring', {
    entrance: true,
    setup: function (el) {
      var value = U.clamp(U.num(el, 'fxValue', 72), 0, 100);
      el.innerHTML = '<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="42"/><circle cx="50" cy="50" r="42"/></svg><span class="fx-value">0%</span>';
      el.setAttribute('role', 'progressbar');
      el.setAttribute('aria-valuemin', '0');
      el.setAttribute('aria-valuemax', '100');
      el.setAttribute('aria-valuenow', value);
      var arc = el.querySelectorAll('circle')[1];
      var len = 2 * Math.PI * 42;
      arc.style.strokeDasharray = len;
      arc.style.strokeDashoffset = len;
      el._fxRing = { arc: arc, len: len, value: value, label: el.querySelector('.fx-value') };
    },
    reset: function (el) { el._fxRing.arc.style.strokeDashoffset = el._fxRing.len; el._fxRing.label.textContent = '0%'; },
    enter: function (el) {
      var g = el._fxRing;
      U.tween(el, U.num(el, 'fxDuration', 1400), function (p) {
        var v = g.value * U.easeOut(p);
        g.arc.style.strokeDashoffset = (g.len * (1 - v / 100)).toFixed(1);
        g.label.textContent = Math.round(v) + '%';
      });
    }
  });

  // --- badge-bump -----------------------------------------------------------

  FX.register('badge-bump', {
    setup: function (el) { el.setAttribute('aria-live', 'polite'); },
    trigger: function (el) {
      var n = (parseInt(el.textContent, 10) || 0) + 1;
      el.textContent = n > 99 ? '99+' : n;
      el.classList.remove('fx-bump');
      void el.offsetWidth;
      el.classList.add('fx-bump');
    }
  });

  // --- heart-like -----------------------------------------------------------

  FX.register('heart-like', {
    setup: function (el) {
      if (!el.hasAttribute('aria-pressed')) el.setAttribute('aria-pressed', 'false');
      if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', 'J\'aime');
    },
    triggerOn: 'click',
    trigger: function (el) {
      el.setAttribute('aria-pressed', el.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
    }
  });

  // --- copy-morph -----------------------------------------------------------

  FX.register('copy-morph', {
    setup: function (el) { el._fxLabel = el.textContent.trim(); },
    triggerOn: 'click',
    trigger: function (el) {
      var text = el.dataset.fxCopy;
      if (text && navigator.clipboard) navigator.clipboard.writeText(text).catch(function () {});
      var from = el.offsetWidth;
      el.style.width = from + 'px';
      el.innerHTML = '<span>' + (el.dataset.fxDone || 'Copié ✓') + '</span>';
      el.classList.add('fx-done');
      el.style.width = 'auto';
      var to = el.offsetWidth;
      el.style.width = from + 'px';
      void el.offsetWidth;
      el.style.width = to + 'px';
      clearTimeout(el._fxT);
      el._fxT = setTimeout(function () {
        el.innerHTML = '<span></span>';
        el.firstChild.textContent = el._fxLabel;
        el.classList.remove('fx-done');
        el.style.width = '';
      }, 1600);
    }
  });

  // --- liquid-fill ----------------------------------------------------------

  FX.register('liquid-fill', {
    entrance: true,
    setup: function (el) { el.style.setProperty('--fx-target', U.clamp(U.num(el, 'fxValue', 65), 0, 100) / 100); }
  });

  // --- flip-clock -----------------------------------------------------------

  FX.register('flip-clock', {
    setup: function (el) {
      el.setAttribute('role', 'timer');
      el.textContent = '';
      var parts = [];
      for (var g = 0; g < 3; g++) {
        if (g) { var s = U.make('span', 'fx-sep', el); s.textContent = ':'; s.setAttribute('aria-hidden', 'true'); }
        parts.push(U.make('span', 'fx-digit', el), U.make('span', 'fx-digit', el));
      }
      el._fxDigits = parts;
      el._fxTarget = el.dataset.fxTo ? new Date(el.dataset.fxTo).getTime() : null;
    },
    tick: function (el) {
      var now = Date.now();
      var secs;
      if (el._fxTarget) secs = Math.max(0, Math.floor((el._fxTarget - now) / 1000));
      else { var d = new Date(); secs = d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds(); }
      if (secs === el._fxLast) return;
      el._fxLast = secs;
      // Au-delà de 99 heures, l'affichage passe en jours : heures : minutes
      var long = secs >= 360000;
      var a = long ? Math.min(99, Math.floor(secs / 86400)) : Math.floor(secs / 3600);
      var b = long ? Math.floor(secs / 3600) % 24 : Math.floor(secs / 60) % 60;
      var c = long ? Math.floor(secs / 60) % 60 : secs % 60;
      var str = String(a).padStart(2, '0') + String(b).padStart(2, '0') + String(c).padStart(2, '0');
      el.classList.toggle('fx-days', long);
      el.setAttribute('aria-label', long
        ? a + ' jours ' + b + ' heures ' + c + ' minutes'
        : str.slice(0, 2) + ':' + str.slice(2, 4) + ':' + str.slice(4));
      el._fxDigits.forEach(function (dg, i) {
        if (dg.textContent === str[i]) return;
        dg.textContent = str[i];
        dg.setAttribute('aria-hidden', 'true');
        if (U.reduced) return;
        dg.classList.remove('fx-flip');
        void dg.offsetWidth;
        dg.classList.add('fx-flip');
      });
    }
  });

  // --- loading-quips --------------------------------------------------------

  FX.register('loading-quips', {
    setup: function (el) {
      var quips = (el.dataset.fxMessages || 'On prépare tout…|Presque prêt…|Encore une seconde…').split('|');
      el.setAttribute('role', 'status');
      el.innerHTML = '';
      var q = U.make('span', 'fx-quip', el);
      var bar = U.make('div', 'fx-quip-bar', el);
      bar.setAttribute('aria-hidden', 'true');
      var i = 0;
      var p = 0;
      function show() {
        var n = U.make('span', 'fx-quip');
        n.textContent = quips[i % quips.length];
        el.replaceChild(n, el.firstChild);
        p = (i % quips.length + 1) / quips.length;
        el.style.setProperty('--fx-p', p.toFixed(3));
        i++;
      }
      show();
      var timer = setInterval(function () {
        if (!el.isConnected) { clearInterval(timer); return; }
        show();
      }, U.num(el, 'fxInterval', 1800));
      q.remove();
    }
  });
})(window.FX);

/* Pack 10 — Présentation */
(function (FX) {
  'use strict';
  var U = FX.util;
  var NS = 'http://www.w3.org/2000/svg';

  ['scroll-cue', 'peel', 'expand-panels'].forEach(function (n) { FX.register(n, {}); });

  // Répète une action tant que l'élément est dans la page
  function every(el, ms, fn) {
    if (U.reduced) return;
    var timer = setInterval(function () {
      if (!el.isConnected) { clearInterval(timer); return; }
      fn();
    }, ms);
  }

  // --- band-loader ----------------------------------------------------------

  FX.register('band-loader', {
    entrance: true,
    setup: function (el) {
      var quips = (el.dataset.fxMessages || 'On met la table…|Ça arrive, patience…|Dernière touche…').split('|');
      el.innerHTML = '<div class="fx-bands"><i></i><i></i><i></i><i></i><i></i></div>' +
        '<div class="fx-band-ui"><span class="fx-band-msg"></span><div class="fx-band-bar"></div></div>';
      el.querySelectorAll('.fx-bands i').forEach(function (b, i) { b.style.setProperty('--fx-i', i); });
      el.setAttribute('role', 'status');
      el._fxQuips = quips;
    },
    enter: function (el) {
      el.classList.remove('fx-done');
      var msg = el.querySelector('.fx-band-msg');
      if (U.reduced) { el.classList.add('fx-done'); return; }
      U.tween(el, U.num(el, 'fxDuration', 2600), function (p) {
        el.style.setProperty('--fx-p', p.toFixed(3));
        var q = el._fxQuips[Math.min(el._fxQuips.length - 1, Math.floor(p * el._fxQuips.length))];
        if (msg.textContent !== q) msg.textContent = q;
      }, function () {
        el.classList.add('fx-done');
        el.dispatchEvent(new CustomEvent('fx:done', { bubbles: true }));
      });
    }
  });

  // --- bars-grow ------------------------------------------------------------

  FX.register('bars-grow', {
    entrance: true,
    setup: function (el) {
      var bars = Array.prototype.slice.call(el.children);
      var max = Math.max.apply(null, bars.map(function (b) { return parseFloat(b.dataset.fxValue) || 0; })) || 1;
      bars.forEach(function (b, i) {
        b.style.setProperty('--fx-i', i);
        b.style.setProperty('--fx-v', ((parseFloat(b.dataset.fxValue) || 0) / max * 100).toFixed(1));
        if (!b.getAttribute('aria-label') && b.dataset.fxValue) b.setAttribute('aria-label', (b.dataset.fxLabel || '') + ' ' + b.dataset.fxValue);
      });
    }
  });

  // --- marquee-vertical -----------------------------------------------------

  FX.register('marquee-vertical', {
    setup: function (el) {
      var track = U.make('div', 'fx-vtrack');
      while (el.firstChild) track.appendChild(el.firstChild);
      Array.prototype.slice.call(track.children).forEach(function (k) {
        var c = k.cloneNode(true);
        c.setAttribute('aria-hidden', 'true');
        track.appendChild(c);
      });
      el.appendChild(track);
    }
  });

  // --- timeline -------------------------------------------------------------

  FX.register('timeline', {
    scroll: function (el, info) {
      var p = U.reduced ? 1 : U.clamp((info.vh * 0.6 - info.rect.top) / info.rect.height, 0, 1);
      el.style.setProperty('--fx-tl', p.toFixed(3));
      var line = info.rect.top + p * info.rect.height;
      Array.prototype.forEach.call(el.children, function (k) {
        k.classList.toggle('fx-on', k.getBoundingClientRect().top + 8 <= line);
      });
    }
  });

  // --- spotlight-focus ------------------------------------------------------

  function spotStep(el) {
    var s = el._fxSpot;
    if (!s || !s.steps.length) return;
    s.i = (s.i + 1) % s.steps.length;
    var target = s.steps[s.i];
    var pad = U.num(el, 'fxPad', 8);
    s.box.style.width = (target.offsetWidth + pad * 2) + 'px';
    s.box.style.height = (target.offsetHeight + pad * 2) + 'px';
    s.box.style.transform = 'translate(' + (target.offsetLeft - pad) + 'px,' + (target.offsetTop - pad) + 'px)';
    s.tip.textContent = target.dataset.fxTip || '';
    s.tip.style.display = target.dataset.fxTip ? '' : 'none';
  }

  FX.register('spotlight-focus', {
    setup: function (el) {
      var steps = Array.prototype.slice.call(el.querySelectorAll('[data-fx-step]'));
      steps.sort(function (a, b) { return (parseFloat(a.dataset.fxStep) || 0) - (parseFloat(b.dataset.fxStep) || 0); });
      var box = U.make('div', 'fx-spot', el);
      box.setAttribute('aria-hidden', 'true');
      var tip = U.make('span', 'fx-spot-tip', box);
      el._fxSpot = { steps: steps, box: box, tip: tip, i: -1 };
      U.raf(function () { spotStep(el); });
      every(el, U.num(el, 'fxInterval', 2600), function () { spotStep(el); });
      U.onResize(function () { el._fxSpot.i--; spotStep(el); });
    },
    trigger: spotStep
  });

  // --- logo-cycle -----------------------------------------------------------

  FX.register('logo-cycle', {
    setup: function (el) {
      var pool = Array.prototype.slice.call(el.children);
      var n = Math.min(U.num(el, 'fxSlots', 3), pool.length);
      el.style.setProperty('--fx-slots', n);
      el.innerHTML = '';
      var slots = [];
      for (var i = 0; i < n; i++) {
        var s = U.make('div', 'fx-slot', el);
        s.appendChild(pool[i]);
        slots.push(s);
      }
      var next = n;
      var turn = 0;
      every(el, U.num(el, 'fxInterval', 1800), function () {
        if (pool.length <= n) return;
        var slot = slots[turn++ % n];
        var old = slot.firstElementChild;
        var fresh = pool[next++ % pool.length];
        // Le logo choisi ne doit pas être déjà affiché ailleurs
        while (fresh.parentNode && fresh.parentNode.className === 'fx-slot') fresh = pool[next++ % pool.length];
        fresh.classList.add('fx-enter');
        slot.appendChild(fresh);
        void fresh.offsetWidth;
        fresh.classList.remove('fx-enter');
        old.classList.add('fx-leave');
        setTimeout(function () { old.classList.remove('fx-leave'); old.remove(); }, 650);
      });
    }
  });

  // --- quote-rotator --------------------------------------------------------

  FX.register('quote-rotator', {
    setup: function (el) {
      var quotes = Array.prototype.slice.call(el.children);
      var i = 0;
      quotes[0].classList.add('fx-cur');
      el.setAttribute('aria-live', 'polite');
      el.addEventListener('pointerenter', function () { el._fxPause = true; });
      el.addEventListener('pointerleave', function () { el._fxPause = false; });
      every(el, U.num(el, 'fxInterval', 4500), function () {
        if (el._fxPause || quotes.length < 2) return;
        quotes[i].classList.remove('fx-cur');
        i = (i + 1) % quotes.length;
        quotes[i].classList.add('fx-cur');
      });
    }
  });

  // --- circle-text ----------------------------------------------------------

  FX.register('circle-text', {
    setup: function (el) {
      var text = el.textContent.trim();
      // Un séparateur en fin de texte pour boucler proprement
      if (!/[✳•·*]\s*$/.test(text)) text += ' • ';
      el.setAttribute('aria-label', el.textContent.trim());
      el.textContent = '';
      // Chaque caractère, espaces compris, occupe une position sur le cercle
      Array.from(text).forEach(function (ch, i) {
        var s = U.make('span', 'fx-char', el);
        s.textContent = ch === ' ' ? ' ' : ch;
        s.setAttribute('aria-hidden', 'true');
        s.style.setProperty('--fx-i', i);
      });
      el.style.setProperty('--fx-n', Array.from(text).length);
    }
  });

  // --- split-flap -----------------------------------------------------------

  FX.register('split-flap', {
    setup: function (el) {
      var words = (el.dataset.fxWords || el.textContent).split('|').map(function (w) { return w.trim().toUpperCase(); });
      var len = Math.max.apply(null, words.map(function (w) { return w.length; }));
      el.setAttribute('aria-label', words.join(', '));
      el.textContent = '';
      var cells = [];
      for (var i = 0; i < len; i++) {
        var c = U.make('span', 'fx-flap', el);
        c.setAttribute('aria-hidden', 'true');
        cells.push(c);
      }
      var w = 0;
      var abc = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      function show(word) {
        word = word.padEnd(len, ' ');
        cells.forEach(function (c, i) {
          var target = word[i];
          if (U.reduced) { c.textContent = target; return; }
          var steps = 4 + ((Math.random() * 8) | 0) + i;
          var k = 0;
          (function flip() {
            c.textContent = k >= steps ? target : abc[(Math.random() * abc.length) | 0];
            if (k++ < steps) setTimeout(flip, 45);
          })();
        });
      }
      show(words[0]);
      every(el, U.num(el, 'fxInterval', 2600), function () { w = (w + 1) % words.length; show(words[w]); });
    }
  });

  // --- line-chart -----------------------------------------------------------

  FX.register('line-chart', {
    entrance: true,
    setup: function (el) {
      var values = (el.dataset.fxValues || '12,18,15,26,22,34,30,42').split(',').map(Number);
      var W = 300, H = 120, pad = 8;
      var max = Math.max.apply(null, values);
      var min = Math.min.apply(null, values);
      var pts = values.map(function (v, i) {
        return [pad + i * (W - pad * 2) / (values.length - 1), H - pad - (v - min) / ((max - min) || 1) * (H - pad * 2)];
      });
      var d = pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' ');
      el.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      el.setAttribute('role', 'img');
      if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', 'Graphique : ' + values.join(', '));
      el.innerHTML = '<path class="fx-area" d="' + d + ' L' + pts[pts.length - 1][0] + ' ' + H + ' L' + pts[0][0] + ' ' + H + 'Z"/>' +
        '<path class="fx-line" d="' + d + '"/>' +
        pts.map(function (p, i) { return '<circle class="fx-point" cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="4" style="--fx-i:' + i + '"/>'; }).join('');
      var line = el.querySelector('.fx-line');
      var len = line.getTotalLength();
      line.style.strokeDasharray = len;
      line.style.strokeDashoffset = U.reduced ? 0 : len;
      el._fxLine = { line: line, len: len };
    },
    reset: function (el) { el._fxLine.line.style.strokeDashoffset = el._fxLine.len; },
    enter: function (el) { el._fxLine.line.style.strokeDashoffset = 0; }
  });

  // --- holo-card ------------------------------------------------------------

  FX.register('holo-card', {
    setup: function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width;
        var y = (e.clientY - r.top) / r.height;
        el.style.setProperty('--fx-mx', (x * 100).toFixed(1) + '%');
        el.style.setProperty('--fx-my', (y * 100).toFixed(1) + '%');
        el.style.setProperty('--fx-hx', (x * 100).toFixed(1) + '%');
        el.style.setProperty('--fx-hy', (y * 100).toFixed(1) + '%');
        if (U.reduced) return;
        el.style.setProperty('--fx-ry', ((x - 0.5) * 16).toFixed(2) + 'deg');
        el.style.setProperty('--fx-rx', (-(y - 0.5) * 16).toFixed(2) + 'deg');
      });
      el.addEventListener('pointerleave', function () {
        el.style.setProperty('--fx-rx', '0deg');
        el.style.setProperty('--fx-ry', '0deg');
      });
    }
  });

  // --- donut ----------------------------------------------------------------

  FX.register('donut', {
    entrance: true,
    setup: function (el) {
      var values = (el.dataset.fxValues || '45,25,20,10').split(',').map(Number);
      var colors = (el.dataset.fxColors || '#ff5b2e,#b9a7ff,#20c7a5,#ffcf4d,#f4f1ea').split(',');
      var total = values.reduce(function (a, b) { return a + b; }, 0) || 1;
      var r = 40;
      var c = 2 * Math.PI * r;
      var offset = 0;
      var label = el.textContent.trim();
      el.innerHTML = '<svg viewBox="0 0 100 100" aria-hidden="true"></svg><span class="fx-donut-label"></span>';
      el.querySelector('.fx-donut-label').textContent = label;
      var svg = el.querySelector('svg');
      el._fxArcs = values.map(function (v, i) {
        var len = v / total * c;
        var circle = document.createElementNS(NS, 'circle');
        circle.setAttribute('cx', 50);
        circle.setAttribute('cy', 50);
        circle.setAttribute('r', r);
        circle.style.stroke = colors[i % colors.length];
        circle.style.strokeDashoffset = (-offset).toFixed(2);
        circle.style.strokeDasharray = U.reduced ? len + ' ' + c : '0 ' + c;
        circle.style.setProperty('--fx-i', i);
        svg.appendChild(circle);
        offset += len;
        return { el: circle, len: len, c: c };
      });
      el.setAttribute('role', 'img');
      if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', 'Répartition : ' + values.join(', '));
    },
    reset: function (el) { el._fxArcs.forEach(function (a) { a.el.style.strokeDasharray = '0 ' + a.c; }); },
    enter: function (el) { el._fxArcs.forEach(function (a) { a.el.style.strokeDasharray = (a.len - 1.2).toFixed(2) + ' ' + a.c; }); }
  });
})(window.FX);

window.FX._boot();
