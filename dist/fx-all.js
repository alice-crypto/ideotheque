/*!
 * Idéothèque — fx.js — bibliothèque d'idées visuelles
 * Active automatiquement tous les éléments [data-fx] de la page.
 * API : FX.init(racine), FX.replay(element), FX.trigger(element), FX.play(transition, callback, event),
 *       FX.go(transition, adresse, event),
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
    o._fxArrive = true;
    if (d.transition.build) d.transition.build(o);
    o.classList.add('fx-cover', 'fx-instant');
    raf(function () { raf(function () { o.classList.remove('fx-instant'); uncover(o, d.transition); }); });
  }

  // Joue une transition puis change de page ; la page suivante la termine
  function go(name, href, event) {
    var d = defs[name];
    if (!d || !d.transition || d.transition.custom || reduced) { window.location.href = href; return; }
    play(name, function () {
      try { sessionStorage.setItem('fx-arrive', name); } catch (err) {}
      window.location.href = href;
    }, event, true);
  }

  // Un lien portant une transition la joue avant de changer de page
  function bindLink(el, name) {
    el.addEventListener('click', function (e) {
      var href = el.getAttribute('href');
      if (!href || href.charAt(0) === '#' || e.metaKey || e.ctrlKey || e.shiftKey || el.target === '_blank') return;
      e.preventDefault();
      go(name, href, e);
    });
  }

  // --- Cycle de vie des effets ---------------------------------------------

  function enter(el) {
    el.classList.add('fx-in');
    var d = defs[el.dataset.fx];
    if (d && d.enter) d.enter(el);
  }

  function init(root) {
    // data-fx-tr : une transition sur un lien qui porte déjà un autre effet
    (root || document).querySelectorAll('a[data-fx-tr]').forEach(function (el) {
      if (el.dataset.fxTrReady) return;
      el.dataset.fxTrReady = '1';
      var d = defs[el.dataset.fxTr];
      if (d && d.transition) bindLink(el, el.dataset.fxTr);
    });
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
    go: go,
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
        var text = (src && src.dataset.fxTitle) || document.title;
        // À l'arrivée sur la page suivante, le carton garde le titre de départ
        try {
          if (o._fxArrive) text = sessionStorage.getItem('fx-title') || text;
          else sessionStorage.setItem('fx-title', text);
        } catch (err) {}
        t.textContent = text;
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

/* Pack 11 — Idées de l'ère de l'IA */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Réponse « générée » : des groupes de 1 à 3 mots arrivent à un rythme irrégulier.
  // Pour afficher une nouvelle réponse : el.dataset.fxText = '…' puis FX.replay(el).
  FX.register('stream-text', {
    entrance: true,
    setup: function (el) {
      if (!el.dataset.fxText) el.dataset.fxText = el.textContent.trim().replace(/\s+/g, ' ');
      el.setAttribute('aria-label', el.dataset.fxText);
      if (!U.reduced) el.textContent = '';
    },
    reset: function (el) { el._fxStream = (el._fxStream || 0) + 1; el.textContent = ''; el.classList.remove('fx-done'); },
    enter: function (el) {
      var text = el.dataset.fxText;
      var run = el._fxStream = (el._fxStream || 0) + 1;
      el.setAttribute('aria-label', text);
      el.classList.remove('fx-done');
      if (U.reduced) { el.textContent = text; el.classList.add('fx-done'); return; }
      el.textContent = '';
      var words = text.split(' ');
      var speed = U.num(el, 'fxSpeed', 55);
      var caret = U.make('span', 'fx-caret', el);
      caret.setAttribute('aria-hidden', 'true');
      var i = 0;
      (function next() {
        if (run !== el._fxStream) return;
        var n = 1 + Math.floor(Math.random() * 3);
        for (var k = 0; k < n && i < words.length; k++, i++) {
          var tok = document.createElement('span');
          tok.className = 'fx-tok';
          tok.setAttribute('aria-hidden', 'true');
          tok.textContent = (i ? ' ' : '') + words[i];
          el.insertBefore(tok, caret);
        }
        if (i < words.length) setTimeout(next, speed * n * (.6 + Math.random() * .8));
        else {
          el.classList.add('fx-done');
          el.dispatchEvent(new CustomEvent('fx:done', { bubbles: true }));
        }
      })();
    }
  });

  FX.register('text-shimmer', {});
  FX.register('ai-orb', {});

  // Champ de saisie qui écrit, montre puis efface des exemples de demandes, en boucle
  FX.register('prompt-box', {
    setup: function (el) {
      var list = (el.dataset.fxPrompts || 'Résume ce document en trois points|Propose un titre plus court').split('|');
      el.innerHTML = '<span class="fx-prompt-text"></span><span class="fx-prompt-caret" aria-hidden="true"></span><span class="fx-prompt-send" aria-hidden="true"></span>';
      el.setAttribute('role', 'img');
      el.setAttribute('aria-label', 'Exemples de demandes : ' + list.join(' ; '));
      el._fxPrompt = { list: list, i: 0, n: 0, phase: 'type', t: 0, txt: el.querySelector('.fx-prompt-text') };
      if (U.reduced) { el._fxPrompt.txt.textContent = list[0]; el.classList.add('fx-ready'); }
    },
    tick: function (el, dt) {
      if (U.reduced) return;
      var s = el._fxPrompt;
      var word = s.list[s.i];
      s.t += dt * 1000;
      if (s.phase === 'type') {
        if (s.t < U.num(el, 'fxSpeed', 45)) return;
        s.t = 0;
        s.txt.textContent = word.slice(0, ++s.n);
        if (s.n >= word.length) { s.phase = 'hold'; el.classList.add('fx-ready'); }
      } else if (s.phase === 'hold') {
        if (s.t < U.num(el, 'fxHold', 1800)) return;
        s.t = 0;
        s.phase = 'erase';
        el.classList.remove('fx-ready');
      } else {
        if (s.t < 16) return;
        s.t = 0;
        s.n = Math.max(0, s.n - 2);
        s.txt.textContent = word.slice(0, s.n);
        if (!s.n) { s.phase = 'type'; s.i = (s.i + 1) % s.list.length; }
      }
    }
  });

  // Grille dont les lignes s'allument autour du curseur
  FX.register('glow-grid', {
    setup: function (el) {
      if (!U.canHover) return;
      // Écoute la fenêtre : la grille peut ainsi être un calque placé sous le contenu
      window.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        if (e.clientY < r.top - 200 || e.clientY > r.bottom + 200) return;
        el.style.setProperty('--fx-mx', (e.clientX - r.left) + 'px');
        el.style.setProperty('--fx-my', (e.clientY - r.top) + 'px');
      }, { passive: true });
    }
  });

  // Étapes d'un agent : chacune tourne pendant data-fx-step ms puis se coche
  FX.register('thinking-steps', {
    entrance: true,
    reset: function (el) {
      el._fxSteps = (el._fxSteps || 0) + 1;
      Array.prototype.forEach.call(el.children, function (li) { li.classList.remove('fx-active', 'fx-done'); });
    },
    enter: function (el) {
      var items = Array.prototype.slice.call(el.children);
      var run = el._fxSteps = (el._fxSteps || 0) + 1;
      if (U.reduced) { items.forEach(function (li) { li.classList.add('fx-done'); }); return; }
      var step = U.num(el, 'fxStep', 900);
      var i = 0;
      (function next() {
        if (run !== el._fxSteps) return;
        if (i > 0) { items[i - 1].classList.remove('fx-active'); items[i - 1].classList.add('fx-done'); }
        if (i >= items.length) { el.dispatchEvent(new CustomEvent('fx:done', { bubbles: true })); return; }
        items[i].classList.add('fx-active');
        i++;
        setTimeout(next, step * (.7 + Math.random() * .6));
      })();
    }
  });
})(window.FX);

/* Pack 12 — Typographie cinétique */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Une vague de graisse parcourt le mot, lettre après lettre
  FX.register('weight-wave', {
    setup: function (el) { U.splitChars(el); el._fxChars = el.querySelectorAll('.fx-char'); },
    tick: function (el, dt, t) {
      if (U.reduced) return;
      var speed = U.num(el, 'fxSpeed', 1);
      el._fxChars.forEach(function (c, i) {
        c.style.setProperty('--fx-w', ((Math.sin(t * .003 * speed - i * .55) + 1) / 2).toFixed(3));
      });
    }
  });

  // Les lettres tombent du haut et rebondissent sur la ligne de base
  FX.register('letter-rain', {
    entrance: true,
    setup: function (el) { U.splitChars(el); el._fxChars = Array.prototype.slice.call(el.querySelectorAll('.fx-char')); },
    reset: function (el) { el._fxRun = (el._fxRun || 0) + 1; el._fxChars.forEach(function (c) { c.style.transform = ''; c.style.opacity = 0; }); },
    enter: function (el) {
      if (U.reduced) { el._fxChars.forEach(function (c) { c.style.opacity = 1; }); return; }
      var run = el._fxRun = (el._fxRun || 0) + 1;
      var g = U.num(el, 'fxGravity', 2600);
      var bits = el._fxChars.map(function () { return { y: -U.rand(120, 260), v: 0, wait: U.rand(0, .5), n: 0 }; });
      var last = 0;
      (function frame(t) {
        if (run !== el._fxRun) return;
        var dt = last ? Math.min((t - last) / 1000, .04) : 0;
        last = t;
        var moving = false;
        bits.forEach(function (b, i) {
          var c = el._fxChars[i];
          if (b.wait > 0) { b.wait -= dt; moving = true; return; }
          c.style.opacity = 1;
          if (b.n > 3) return;
          moving = true;
          b.v += g * dt;
          b.y += b.v * dt;
          if (b.y > 0) { b.y = 0; b.v *= -.42; b.n++; }
          c.style.transform = 'translateY(' + b.y.toFixed(1) + 'px)';
        });
        if (moving) U.raf(frame);
      })(0);
    }
  });

  // Le titre se resserre pendant qu'on défile vers lui
  FX.register('headline-collapse', {
    scroll: true,
    setup: function (el) { el.style.setProperty('--fx-gap', U.num(el, 'fxGap', .6) + 'em'); }
  });

  // Les lettres s'écartent du curseur et reviennent en douceur
  FX.register('cursor-repel', {
    setup: function (el) {
      U.splitChars(el);
      var s = el._fxS = { chars: Array.prototype.slice.call(el.querySelectorAll('.fx-char')).map(function (c) { return { el: c, x: 0, y: 0 }; }), mx: -9999, my: -9999 };
      if (!U.canHover || U.reduced) return;
      el.addEventListener('pointermove', function (e) { s.mx = e.clientX; s.my = e.clientY; });
      el.addEventListener('pointerleave', function () { s.mx = s.my = -9999; });
    },
    tick: function (el) {
      var s = el._fxS, R = U.num(el, 'fxRadius', 110), F = U.num(el, 'fxForce', 34);
      if (U.reduced) return;
      s.chars.forEach(function (c) {
        var r = c.el.getBoundingClientRect();
        var dx = r.left + r.width / 2 - c.x - s.mx, dy = r.top + r.height / 2 - c.y - s.my;
        var d = Math.sqrt(dx * dx + dy * dy) || 1;
        var k = Math.max(0, 1 - d / R);
        c.x += (dx / d * F * k - c.x) * .14;
        c.y += (dy / d * F * k - c.y) * .14;
        c.el.style.transform = 'translate(' + c.x.toFixed(1) + 'px,' + c.y.toFixed(1) + 'px)';
      });
    }
  });

  // Le mot est le plus gras quand il passe au centre de l'écran
  FX.register('scroll-weight', {
    scroll: function (el, info) {
      el.style.setProperty('--fx-peak', (1 - Math.abs(info.pass * 2 - 1)).toFixed(3));
    }
  });

  // La lettre survolée s'étire et ses voisines suivent, comme un accordéon
  FX.register('letter-accordion', {
    setup: function (el) {
      U.splitChars(el);
      var cs = Array.prototype.slice.call(el.querySelectorAll('.fx-char'));
      function set(active) {
        cs.forEach(function (c, i) {
          var d = active < 0 ? 9 : Math.abs(i - active);
          c.style.setProperty('--fx-a', Math.max(0, 1 - d / 3).toFixed(2));
        });
      }
      cs.forEach(function (c, i) { c.addEventListener('pointerenter', function () { set(i); }); });
      el.addEventListener('pointerleave', function () { set(-1); });
      el.addEventListener('focusin', function () { set(0); });
      el.addEventListener('focusout', function () { set(-1); });
    }
  });

  // Texte en contour, rempli seulement autour du curseur
  FX.register('spot-fill', {
    setup: function (el) {
      var txt = el.textContent.trim();
      el.textContent = '';
      var box = el._fxBox = U.make('span', 'fx-sf', el);
      box.textContent = txt;
      box.dataset.fxLabel = txt;
      el._fxHover = false;
      el.addEventListener('pointermove', function (e) {
        var r = box.getBoundingClientRect();
        el._fxHover = true;
        el.style.setProperty('--fx-mx', (e.clientX - r.left) + 'px');
        el.style.setProperty('--fx-my', (e.clientY - r.top) + 'px');
      });
      el.addEventListener('pointerleave', function () { el._fxHover = false; });
    },
    tick: function (el, dt, t) {
      if (el._fxHover || U.reduced) return;
      var r = el._fxBox.getBoundingClientRect();
      el.style.setProperty('--fx-mx', ((Math.sin(t * .001) + 1) / 2 * r.width).toFixed(0) + 'px');
      el.style.setProperty('--fx-my', (r.height / 2).toFixed(0) + 'px');
    }
  });

  // Les lettres tournent en cercle puis se posent sur la ligne
  FX.register('letter-orbit', {
    entrance: true,
    setup: function (el) { U.splitChars(el); el._fxChars = Array.prototype.slice.call(el.querySelectorAll('.fx-char')); el._fxPlace = function (p) {
      var n = el._fxChars.length, R = U.num(el, 'fxRadius', 70);
      el._fxChars.forEach(function (c, i) {
        var q = U.easeInOut(U.clamp(p * 1.4 - i / n * .4, 0, 1));
        var a = i / n * Math.PI * 2 + (1 - q) * 3;
        var dx = Math.cos(a) * R * (1 - q), dy = Math.sin(a) * R * (1 - q);
        c.style.transform = 'translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px) rotate(' + ((1 - q) * a * 57.3).toFixed(0) + 'deg)';
        c.style.opacity = Math.min(1, p * 4);
      });
    }; el._fxPlace(0); },
    reset: function (el) { el._fxPlace(0); },
    enter: function (el) { U.tween(el, U.num(el, 'fxDuration', 1500), el._fxPlace); }
  });

  // Le titre se reflète dessous, comme sur l'eau
  FX.register('mirror-type', {
    setup: function (el) {
      var txt = el.textContent.trim();
      el.innerHTML = '';
      U.make('span', 'fx-mir-top', el).textContent = txt;
      var m = U.make('span', 'fx-mir-low', el);
      m.textContent = txt;
      m.setAttribute('aria-hidden', 'true');
      el._fxLow = m;
    },
    tick: function (el, dt, t) {
      if (U.reduced) return;
      el._fxLow.style.setProperty('--fx-sk', (Math.sin(t * .0016) * 4).toFixed(2) + 'deg');
    }
  });

  // Le titre se répète en éventail derrière lui
  FX.register('echo-stack', {
    setup: function (el) {
      var txt = el.textContent.trim(), n = U.num(el, 'fxCount', 5);
      el.textContent = '';
      var box = U.make('span', 'fx-echo-box', el);
      box.textContent = txt;
      for (var i = 1; i <= n; i++) {
        var s = U.make('span', 'fx-echo', box);
        s.textContent = txt;
        s.setAttribute('aria-hidden', 'true');
        s.style.setProperty('--fx-i', i);
      }
      el.style.setProperty('--fx-n', n);
    },
    tick: function (el, dt, t) {
      if (U.reduced) return;
      el.style.setProperty('--fx-open', ((Math.sin(t * .0012) + 1) / 2).toFixed(3));
    }
  });

  // Chaque lettre est un rouleau de machine à sous qui s'arrête à son tour
  FX.register('slot-letters', {
    entrance: true,
    setup: function (el) {
      var txt = el.textContent.trim(), rolls = U.num(el, 'fxRolls', 8);
      el.setAttribute('aria-label', txt);
      el.textContent = '';
      Array.from(txt).forEach(function (ch, i) {
        var box = U.make('span', 'fx-slot', el);
        box.setAttribute('aria-hidden', 'true');
        var col = U.make('span', 'fx-slot-col', box);
        var s = '';
        for (var k = 0; k < rolls; k++) s += U.GLYPHS.charAt(Math.floor(Math.random() * U.GLYPHS.length)) + '\n';
        col.textContent = s + ch;
        col.style.setProperty('--fx-rolls', rolls);
        col.style.setProperty('--fx-i', i);
      });
    }
  });

  // Le titre s'allume point par point, comme un panneau d'affichage
  FX.register('dot-matrix', {
    entrance: true,
    setup: function (el) {
      var txt = el.textContent.trim();
      el.setAttribute('aria-label', txt);
      el.setAttribute('role', 'img');
      el.textContent = '';
      var cv = U.make('canvas', '', el), ctx = cv.getContext('2d');
      var cs = getComputedStyle(el), fs = parseFloat(cs.fontSize);
      var step = U.num(el, 'fxStep', 4), w, h, dots, last = 0;
      var font = cs.fontWeight + ' ' + fs + 'px ' + cs.fontFamily;
      var scan = function () {
        var off = document.createElement('canvas').getContext('2d');
        off.font = font;
        w = Math.ceil(off.measureText(txt).width); h = Math.ceil(fs * 1.2);
        off.canvas.width = w; off.canvas.height = h;
        off.font = font; off.textBaseline = 'middle'; off.fillText(txt, 0, h / 2);
        var data = off.getImageData(0, 0, w, h).data;
        dots = [];
        for (var y = 0; y < h; y += step) for (var x = 0; x < w; x += step) if (data[(y * w + x) * 4 + 3] > 120) dots.push([x, y]);
        cv.width = w; cv.height = h;
      };
      scan();
      if (document.fonts) document.fonts.load(font).then(function () { scan(); el._fxPaint(last); });
      el._fxPaint = function (p) {
        last = p;
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = cs.color;
        dots.forEach(function (d) {
          var a = U.clamp(p * 1.5 - d[0] / w * .5, 0, 1);
          if (a <= 0) return;
          ctx.globalAlpha = a;
          ctx.beginPath();
          ctx.arc(d[0], d[1], step * .4, 0, 7);
          ctx.fill();
        });
      };
      el._fxPaint(0);
    },
    reset: function (el) { el._fxPaint(0); },
    enter: function (el) { U.tween(el, U.num(el, 'fxDuration', 1200), el._fxPaint); }
  });

  // Les lettres se résolvent à travers des blocs de densité
  FX.register('ascii-decay', {
    entrance: true,
    setup: function (el) {
      var txt = el.textContent.trim();
      el._fxTxt = txt;
      el.setAttribute('aria-label', txt);
      el._fxShow = function (p) {
        var ramp = '█▓▒░', out = '';
        for (var i = 0; i < txt.length; i++) {
          var q = U.clamp(p * 1.6 - i / txt.length * .6, 0, 1);
          if (txt[i] === ' ' || q >= 1) out += txt[i];
          else out += q <= 0 ? ' ' : ramp.charAt(Math.floor(q * ramp.length));
        }
        el.textContent = out;
      };
      if (!U.reduced) el._fxShow(0);
    },
    reset: function (el) { el._fxShow(0); },
    enter: function (el) { U.tween(el, U.num(el, 'fxDuration', 1400), el._fxShow); }
  });

  // Au survol, un saut se propage depuis la lettre touchée
  FX.register('hop-row', {
    setup: function (el) {
      U.splitChars(el);
      var cs = Array.prototype.slice.call(el.querySelectorAll('.fx-char'));
      cs.forEach(function (c, i) {
        c.addEventListener('pointerenter', function () {
          if (el.classList.contains('fx-hop')) return;
          cs.forEach(function (o, k) { o.style.setProperty('--fx-d', Math.abs(k - i)); });
          el.classList.add('fx-hop');
          setTimeout(function () { el.classList.remove('fx-hop'); }, 500 + cs.length * 40);
        });
      });
    }
  });

  // Le haut et le bas du mot glissent en sens contraire au défilement
  FX.register('half-shift', {
    scroll: function (el, info) { el.style.setProperty('--fx-shift', ((info.pass - .5) * U.num(el, 'fxShift', 60)).toFixed(1) + 'px'); },
    setup: function (el) {
      var t = el.textContent.trim();
      el.setAttribute('aria-label', t);
      el.innerHTML = '';
      ['fx-h-a', 'fx-h-b'].forEach(function (c) { var s = U.make('span', c, el); s.textContent = t; s.setAttribute('aria-hidden', 'true'); });
    }
  });

  // Au survol, la ligne de texte défile en continu
  FX.register('hover-marquee', {
    setup: function (el) {
      var txt = el.textContent.trim();
      el.setAttribute('aria-label', txt);
      el.textContent = '';
      var track = U.make('span', 'fx-hm-track', el);
      track.setAttribute('aria-hidden', 'true');
      var one = U.make('span', '', track);
      one.textContent = txt + ' — ';
      var w = one.offsetWidth || 120;
      var copies = Math.ceil((el.offsetWidth || 300) / w) + 1;
      for (var i = 0; i < copies; i++) track.appendChild(one.cloneNode(true));
      el.style.setProperty('--fx-w', w + 'px');
      el.style.setProperty('--fx-t', (w / U.num(el, 'fxSpeed', 80)).toFixed(2) + 's');
    }
  });

  // Les mots sont posés sur un cube qui tourne d'un quart de tour
  FX.register('cube-words', {
    setup: function (el) {
      var words = (el.dataset.fxWords || el.textContent).split('|').map(function (s) { return s.trim(); }).slice(0, 4);
      el.setAttribute('aria-label', words.join(', '));
      el.textContent = '';
      var cube = U.make('span', 'fx-cube', el);
      cube.setAttribute('aria-hidden', 'true');
      words.forEach(function (w, i) { var f = U.make('span', 'fx-face', cube); f.textContent = w; f.style.setProperty('--fx-i', i); });
      el._fxCube = { cube: cube, n: 0, t: 0, count: words.length };
    },
    tick: function (el, dt) {
      if (U.reduced) return;
      var s = el._fxCube;
      s.t += dt * 1000;
      if (s.t < U.num(el, 'fxHold', 1800)) return;
      s.t = 0;
      s.n++;
      if (s.n % 4 >= s.count) s.n += 4 - s.n % 4;
      s.cube.style.setProperty('--fx-turn', s.n);
    }
  });

  // La casse des lettres hésite, puis se fixe au repos
  FX.register('case-shuffle', {
    setup: function (el) {
      el._fxOrig = el.textContent.trim();
      el._fxOn = true; el._fxT = 0;
      el.setAttribute('aria-label', el._fxOrig);
      el.addEventListener('pointerenter', function () { el._fxOn = true; });
      el.addEventListener('pointerleave', function () { el._fxOn = false; el.textContent = el._fxOrig; });
      setTimeout(function () { if (!el.matches(':hover')) { el._fxOn = false; el.textContent = el._fxOrig; } }, 1400);
    },
    tick: function (el, dt) {
      if (!el._fxOn || U.reduced) return;
      el._fxT += dt * 1000;
      if (el._fxT < U.num(el, 'fxRate', 90)) return;
      el._fxT = 0;
      el.textContent = Array.from(el._fxOrig).map(function (c) { return Math.random() < .5 ? c.toUpperCase() : c.toLowerCase(); }).join('');
    }
  });

  // L'espacement des lettres inspire et expire
  FX.register('breathe-track', {
    tick: function (el, dt, t) {
      if (U.reduced) return;
      var c = (t / U.num(el, 'fxCycle', 6000)) % 1;
      var v = c < .45 ? U.easeInOut(c / .45) : c < .55 ? 1 : 1 - U.easeInOut((c - .55) / .45);
      el.style.setProperty('--fx-b', v.toFixed(3));
    }
  });

  // L'encre se répand depuis un trait fin jusqu'à la lettre nette
  FX.register('ink-bleed', {
    entrance: true,
    setup: function (el) {
      var root = document.getElementById('fx-ink-svg');
      if (!root) {
        root = document.createElement('div');
        root.id = 'fx-ink-svg';
        root.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
        root.innerHTML = '<svg aria-hidden="true"><filter id="fx-ink"><feTurbulence type="fractalNoise" baseFrequency=".04" numOctaves="3"/><feDisplacementMap in="SourceGraphic" scale="0"/></filter></svg>';
        document.body.appendChild(root);
      }
      el._fxMap = root.querySelector('feDisplacementMap');
    },
    enter: function (el) {
      var m = el._fxMap;
      U.tween(el, U.num(el, 'fxDuration', 1600), function (p) {
        m.setAttribute('scale', (U.num(el, 'fxScale', 40) * (1 - U.easeOut(p))).toFixed(1));
        el.style.opacity = Math.min(1, p * 3);
        if (p === 1) el.style.filter = 'none';
      });
    },
    reset: function (el) { el.style.filter = ''; el.style.opacity = 0; }
  });

  // Des barres noires se retirent des mots, dans le désordre
  FX.register('redact-reveal', {
    entrance: true,
    setup: function (el) {
      U.splitWords(el);
      var ws = Array.prototype.slice.call(el.querySelectorAll('.fx-word'));
      ws.map(function (w) { return { w: w, r: Math.random() }; })
        .sort(function (a, b) { return a.r - b.r; })
        .forEach(function (o, i) { o.w.style.setProperty('--fx-o', i); });
    }
  });

  // Chaque lettre est une étiquette collée de travers
  FX.register('sticker-letters', {
    entrance: true,
    setup: function (el) {
      U.splitChars(el);
      var pal = (el.dataset.fxColors || '').split(',').filter(Boolean);
      el.querySelectorAll('.fx-char').forEach(function (c, i) {
        c.style.setProperty('--fx-r', U.rand(-9, 9).toFixed(1) + 'deg');
        if (pal.length) c.style.background = pal[i % pal.length];
      });
    }
  });

  // Le titre glisse de côté quand on défile vite, puis revient
  FX.register('drift-title', {
    setup: function (el) { el._fxX = 0; },
    tick: function (el) {
      if (U.reduced) return;
      var target = U.velocity() * U.num(el, 'fxDrift', 3);
      el._fxX += (target - el._fxX) * .08;
      el.style.setProperty('--fx-x', el._fxX.toFixed(1) + 'px');
      el.style.setProperty('--fx-s', U.clamp(el._fxX * .05, -8, 8).toFixed(2) + 'deg');
    }
  });

  // Le texte suit une courbe et y avance en continu
  FX.register('path-type', {
    setup: function (el) {
      var txt = el.textContent.trim();
      var id = 'fx-path-' + Math.random().toString(36).slice(2, 8);
      el.setAttribute('aria-label', txt);
      el.setAttribute('role', 'img');
      el.innerHTML = '<svg viewBox="0 0 600 160" aria-hidden="true"><path id="' + id + '" d="' + (el.dataset.fxPath || 'M-20 90 C 120 -10, 220 190, 320 90 S 520 -10, 640 90') + '" fill="none"/><text><textPath href="#' + id + '"></textPath></text></svg>';
      el._fxTp = el.querySelector('textPath');
      el._fxTp.textContent = (txt + ' · ').repeat(4);
      el._fxO = 0;
    },
    tick: function (el, dt) {
      if (U.reduced) return;
      el._fxO = (el._fxO + dt * U.num(el, 'fxSpeed', 2.4)) % 25;
      el._fxTp.setAttribute('startOffset', (-el._fxO) + '%');
    }
  });

  // Une couleur vive passe de mot en mot dans la phrase
  FX.register('color-cycle-words', {
    setup: function (el) {
      U.splitWords(el);
      el._fxW = el.querySelectorAll('.fx-word');
      el._fxT = 0; el._fxI = -1;
    },
    tick: function (el, dt) {
      if (U.reduced) return;
      el._fxT += dt * 1000;
      if (el._fxT < U.num(el, 'fxStep', 500) && el._fxI >= 0) return;
      el._fxT = 0;
      if (el._fxI >= 0) el._fxW[el._fxI].classList.remove('fx-on');
      el._fxI = (el._fxI + 1) % el._fxW.length;
      el._fxW[el._fxI].classList.add('fx-on');
    }
  });

  // Le curseur est un soleil : l'ombre du titre part à l'opposé
  FX.register('sun-shadow', {
    setup: function (el) {
      var cast = function (dx, dy) {
        var n = U.num(el, 'fxLength', 18), col = U.cssVar(el, '--fx-shadow', 'rgba(0,0,0,.35)'), s = [];
        for (var i = 1; i <= n; i++) s.push((dx * i).toFixed(1) + 'px ' + (dy * i).toFixed(1) + 'px 0 ' + col);
        el.style.textShadow = s.join(',');
      };
      cast(.7, .7);
      if (!U.canHover || U.reduced) return;
      window.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > innerHeight + 200) return;
        var dx = r.left + r.width / 2 - e.clientX, dy = r.top + r.height / 2 - e.clientY;
        var d = Math.sqrt(dx * dx + dy * dy) || 1;
        cast(dx / d, dy / d);
      }, { passive: true });
    }
  });

  // Le texte s'éloigne vers l'horizon, en perspective
  FX.register('depth-crawl', {
    setup: function (el) { el._fxY = el.offsetHeight * .75; },
    tick: function (el, dt) {
      if (U.reduced) return;
      var inner = el.firstElementChild;
      if (!inner) return;
      el._fxY += dt * U.num(el, 'fxSpeed', 22);
      if (el._fxY > inner.offsetHeight + el.offsetHeight) el._fxY = 0;
      inner.style.setProperty('--fx-y', (el.offsetHeight - el._fxY).toFixed(1) + 'px');
    }
  });

  // Au clic, les lettres se décrochent et tombent, puis reviennent
  FX.register('gravity-letters', {
    setup: function (el) { U.splitChars(el); el._fxChars = Array.prototype.slice.call(el.querySelectorAll('.fx-char')); },
    triggerOn: 'click',
    trigger: function (el) {
      if (U.reduced || el._fxFalling) return;
      el._fxFalling = true;
      var bits = el._fxChars.map(function () { return { x: 0, y: 0, vx: U.rand(-140, 140), vy: U.rand(-420, -120), r: 0, vr: U.rand(-300, 300) }; });
      var start = 0, last = 0;
      U.raf(function frame(t) {
        if (!start) start = last = t;
        var dt = (t - last) / 1000; last = t;
        bits.forEach(function (b, i) {
          b.vy += 1800 * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.r += b.vr * dt;
          el._fxChars[i].style.transform = 'translate(' + b.x.toFixed(0) + 'px,' + b.y.toFixed(0) + 'px) rotate(' + b.r.toFixed(0) + 'deg)';
        });
        if (t - start < 1000) return U.raf(frame);
        el._fxChars.forEach(function (c) { c.style.transition = 'transform .6s var(--fx-ease-spring)'; c.style.transform = ''; });
        setTimeout(function () { el._fxChars.forEach(function (c) { c.style.transition = ''; }); el._fxFalling = false; }, 650);
      });
    }
  });

  // Le mot passe de gros pixels à une image nette, par paliers
  FX.register('pixel-type', {
    entrance: true,
    setup: function (el) {
      var txt = el.textContent.trim();
      el.setAttribute('aria-label', txt); el.setAttribute('role', 'img');
      var cs = getComputedStyle(el), fs = parseFloat(cs.fontSize);
      var font = cs.fontWeight + ' ' + fs + 'px ' + cs.fontFamily, color = cs.color;
      el.textContent = '';
      var cv = U.make('canvas', '', el), ctx = cv.getContext('2d');
      var w, h, lastBlock = U.reduced ? 1 : 16;
      var size = function () {
        ctx.font = font;
        w = Math.ceil(ctx.measureText(txt).width); h = Math.ceil(fs * 1.25);
        cv.width = w; cv.height = h;
      };
      size();
      var off = document.createElement('canvas'), o = off.getContext('2d');
      if (document.fonts) document.fonts.load(font).then(function () { size(); el._fxDraw(lastBlock); });
      el._fxDraw = function (block) {
        lastBlock = block;
        ctx.font = font;
        if (Math.ceil(ctx.measureText(txt).width) !== w) size();
        var sw = Math.max(1, Math.ceil(w / block)), sh = Math.max(1, Math.ceil(h / block));
        off.width = sw; off.height = sh;
        o.setTransform(sw / w, 0, 0, sh / h, 0, 0);
        o.font = font; o.fillStyle = color; o.textBaseline = 'middle';
        o.fillText(txt, 0, h / 2);
        ctx.clearRect(0, 0, w, h);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(off, 0, 0, w, h);
      };
      el._fxDraw(U.reduced ? 1 : 16);
    },
    reset: function (el) { el._fxDraw(16); },
    enter: function (el) {
      var steps = [16, 8, 4, 2, 1];
      U.tween(el, U.num(el, 'fxDuration', 900), function (p) { el._fxDraw(steps[Math.min(4, Math.floor(p * 5))]); });
    }
  });

  // Un cercle dessiné à la main entoure le mot important
  FX.register('scribble-circle', {
    entrance: true,
    setup: function (el) {
      var j = function () { return U.rand(-3, 3).toFixed(1); };
      var d = 'M' + (12 + +j()) + ' 26 C 20 ' + (4 + +j()) + ', 170 ' + (2 + +j()) + ', 192 24 C 208 ' + (44 + +j()) + ', 110 ' + (58 + +j()) + ', 40 50 C -4 ' + (44 + +j()) + ', 2 ' + (14 + +j()) + ', 60 7 C 100 2, 150 3, 180 12';
      var w = document.createElement('span');
      w.className = 'fx-scribble';
      w.setAttribute('aria-hidden', 'true');
      w.innerHTML = '<svg viewBox="0 0 200 60" preserveAspectRatio="none"><path d="' + d + '" pathLength="1" fill="none"/></svg>';
      el.appendChild(w);
    }
  });
})(window.FX);

/* Pack 13 — Scènes de défilement */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Un cercle s'ouvre sur l'image à mesure qu'on défile
  FX.register('circle-unveil', {
    scroll: function (el, info) { el.style.setProperty('--fx-r', (U.easeInOut(info.enter) * 75).toFixed(2) + '%'); }
  });

  // Des lames horizontales s'ouvrent les unes après les autres
  FX.register('slat-scroll', {
    setup: function (el) {
      var n = U.num(el, 'fxSlats', 7);
      U.ensurePositioned(el);
      var box = U.make('div', 'fx-slats', el);
      box.setAttribute('aria-hidden', 'true');
      for (var i = 0; i < n; i++) { var s = U.make('i', '', box); s.style.setProperty('--fx-q', U.clamp(1 - i / n, 0, 1)); }
      el.style.setProperty('--fx-n', n);
    },
    scroll: function (el, info) { el.style.setProperty('--fx-open', info.enter.toFixed(3)); }
  });

  // Le texte s'écrit au fil du défilement, et s'efface si on remonte
  FX.register('scroll-typing', {
    setup: function (el) {
      el._fxTxt = el.textContent.trim();
      el.setAttribute('aria-label', el._fxTxt);
      el.textContent = '';
      el._fxShown = U.make('span', 'fx-st-on', el);
      el._fxRest = U.make('span', 'fx-st-off', el);
      el._fxShown.setAttribute('aria-hidden', 'true');
      el._fxRest.setAttribute('aria-hidden', 'true');
    },
    scroll: function (el, info) {
      var n = Math.round(info.enter * el._fxTxt.length);
      if (n === el._fxN) return;
      el._fxN = n;
      el._fxShown.textContent = el._fxTxt.slice(0, n);
      el._fxRest.textContent = el._fxTxt.slice(n);
    }
  });

  // Une bande de texte géant traverse l'écran au défilement
  FX.register('band-slide', {
    setup: function (el) {
      var t = el.textContent.trim();
      el.setAttribute('aria-label', t);
      el.textContent = '';
      var b = U.make('span', 'fx-band', el);
      b.setAttribute('aria-hidden', 'true');
      b.textContent = (t + ' — ').repeat(6);
    },
    scroll: function (el, info) {
      var dir = el.dataset.fxDir === 'right' ? 1 : -1;
      el.style.setProperty('--fx-x', (info.pass * dir * U.num(el, 'fxTravel', 40)).toFixed(2) + '%');
    }
  });

  // Les lignes glissent en sens opposé
  FX.register('cross-rows', {
    setup: function (el) { Array.prototype.forEach.call(el.children, function (r, i) { r.style.setProperty('--fx-dir', i % 2 ? 1 : -1); }); },
    scroll: function (el, info) { el.style.setProperty('--fx-t', ((info.pass - .5) * U.num(el, 'fxTravel', 160)).toFixed(1) + 'px'); }
  });

  // Les cartes s'ouvrent en éventail au défilement
  FX.register('fan-scroll', {
    setup: function (el) {
      var n = el.children.length;
      Array.prototype.forEach.call(el.children, function (c, i) { c.style.setProperty('--fx-k', (i - (n - 1) / 2).toFixed(1)); });
    },
    scroll: function (el, info) { el.style.setProperty('--fx-open', U.easeOut(info.enter).toFixed(3)); }
  });

  // On plonge à travers des cadres concentriques
  FX.register('tunnel-scroll', {
    setup: function (el) {
      var n = U.num(el, 'fxFrames', 6);
      U.ensurePositioned(el);
      for (var i = 0; i < n; i++) {
        var f = U.make('i', 'fx-tun', el);
        f.setAttribute('aria-hidden', 'true');
        f.style.setProperty('--fx-q', i / n);
      }
    },
    scroll: function (el, info) { el.style.setProperty('--fx-dive', info.pass.toFixed(3)); }
  });

  // Chaque couche se déplace selon sa profondeur
  FX.register('depth-stack', {
    setup: function (el) {
      Array.prototype.forEach.call(el.children, function (c, i) { c.style.setProperty('--fx-z', c.dataset.depth || (i + 1) / el.children.length); });
    },
    scroll: function (el, info) { el.style.setProperty('--fx-y', ((.5 - info.pass) * U.num(el, 'fxAmp', 180)).toFixed(1) + 'px'); }
  });

  // Une interface couchée se redresse et se pose
  FX.register('plane-land', {
    scroll: function (el, info) { el.style.setProperty('--fx-land', (1 - U.easeOut(info.enter)).toFixed(3)); }
  });

  // Les éléments tournent sur une roue verticale
  FX.register('wheel-scroll', {
    setup: function (el) { el._fxK = el.children.length; Array.prototype.forEach.call(el.children, function (c, i) { c.style.setProperty('--fx-i', i); }); el.style.setProperty('--fx-count', el._fxK); },
    scroll: function (el, info) { el.style.setProperty('--fx-rot', ((info.pass - .5) * U.num(el, 'fxTurn', 180)).toFixed(1) + 'deg'); }
  });

  // Un fil se remplit le long de la section
  FX.register('thread-line', {
    setup: function (el) { U.ensurePositioned(el); var t = U.make('i', 'fx-thread', el); t.setAttribute('aria-hidden', 'true'); U.make('b', '', t); },
    scroll: function (el, info) {
      var p = U.clamp((info.vh * .6 - info.rect.top) / Math.max(1, info.rect.height), 0, 1);
      el.style.setProperty('--fx-fill', p.toFixed(3));
    }
  });

  // Une vague fait gonfler les points d'une grille
  FX.register('dot-swell', {
    setup: function (el) {
      U.ensurePositioned(el);
      el._fxCv = U.make('canvas', 'fx-swell', el);
      el._fxCv.setAttribute('aria-hidden', 'true');
      el._fxP = .5;
    },
    scroll: function (el, info) { el._fxP = info.pass; },
    tick: function (el) {
      var cv = el._fxCv, w = cv.clientWidth, h = cv.clientHeight, step = U.num(el, 'fxStep', 16);
      if (!w) return;
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
      if (el._fxDrawn === el._fxP && cv.dataset.w === '' + w) return;
      el._fxDrawn = el._fxP; cv.dataset.w = w;
      var c = cv.getContext('2d'), front = el._fxP * (h + 160) - 80;
      c.clearRect(0, 0, w, h);
      c.fillStyle = getComputedStyle(cv).color;
      for (var y = step / 2; y < h; y += step) for (var x = step / 2; x < w; x += step) {
        var k = Math.max(0, 1 - Math.abs(y - front) / 80);
        c.beginPath(); c.arc(x, y, .8 + k * step * .42, 0, 7); c.fill();
      }
    }
  });

  // On entre dans le mot : il grandit jusqu'à devenir l'écran
  FX.register('aperture-text', {
    setup: function (el) { el.style.overflow = 'hidden'; },
    scroll: function (el, info) { el.style.setProperty('--fx-zoom', Math.pow(U.num(el, 'fxMax', 18), U.clamp(info.pass * 2 - .6, 0, 1)).toFixed(2)); }
  });

  // La teinte glisse au fil du défilement
  FX.register('hue-drift', {
    scroll: function (el, info) { el.style.setProperty('--fx-hue', (info.pass * U.num(el, 'fxRange', 140)).toFixed(1) + 'deg'); }
  });

  // Les barres montent et redescendent avec le défilement
  FX.register('bars-scrub', {
    setup: function (el) {
      var v = (el.dataset.fxValues || '30,55,40,75,60,95').split(',').map(Number), max = Math.max.apply(null, v);
      el.setAttribute('role', 'img');
      el.setAttribute('aria-label', 'Valeurs : ' + v.join(', '));
      v.forEach(function (n, i) {
        var b = U.make('i', '', el);
        b.style.setProperty('--fx-v', n / max);
        b.style.setProperty('--fx-q', i / v.length);
      });
    },
    scroll: function (el, info) { el.style.setProperty('--fx-grow', info.enter.toFixed(3)); }
  });

  // Deux battants s'ouvrent sur le contenu
  FX.register('door-scroll', {
    setup: function (el) {
      U.ensurePositioned(el);
      ['fx-door-l', 'fx-door-r'].forEach(function (c) { U.make('i', c, el).setAttribute('aria-hidden', 'true'); });
    },
    scroll: function (el, info) { el.style.setProperty('--fx-door', U.easeInOut(U.clamp(info.enter * 1.2 - .1, 0, 1)).toFixed(3)); }
  });

  // La grille se resserre en arrivant au centre
  FX.register('grid-breathe', {
    scroll: function (el, info) { el.style.setProperty('--fx-air', Math.abs(info.pass * 2 - 1).toFixed(3)); }
  });

  // La carte se retourne au fil du défilement
  FX.register('flip-scrub', {
    scroll: function (el, info) { el.style.setProperty('--fx-a', (U.clamp(info.pass * 2 - .5, 0, 1) * 180).toFixed(1) + 'deg'); }
  });

  // Un rideau de couleur se lève au défilement
  FX.register('curtain-scrub', {
    setup: function (el) { U.ensurePositioned(el); U.make('i', 'fx-cs', el).setAttribute('aria-hidden', 'true'); },
    scroll: function (el, info) { el.style.setProperty('--fx-lift', U.easeOut(info.enter).toFixed(3)); }
  });

  // Les lettres dispersées se rassemblent au défilement
  FX.register('letters-scrub', {
    setup: function (el) {
      U.splitChars(el);
      el.querySelectorAll('.fx-char').forEach(function (c) {
        c.style.setProperty('--fx-dx', U.rand(-90, 90).toFixed(0) + 'px');
        c.style.setProperty('--fx-dy', U.rand(-70, 70).toFixed(0) + 'px');
        c.style.setProperty('--fx-dr', U.rand(-120, 120).toFixed(0) + 'deg');
      });
    },
    scroll: function (el, info) { el.style.setProperty('--fx-left', (1 - U.easeOut(info.enter)).toFixed(3)); }
  });

  // Les mots passent du gris au plein quand on les atteint
  FX.register('reading-marker', {
    setup: function (el) { U.splitWords(el); el._fxW = el.querySelectorAll('.fx-word'); el._fxN = -1; },
    scroll: function (el, info) {
      var line = info.vh * U.num(el, 'fxLine', .65);
      var p = U.clamp((line - info.rect.top) / Math.max(1, info.rect.height), 0, 1);
      var n = Math.round(p * el._fxW.length);
      if (n === el._fxN) return;
      el._fxN = n;
      el._fxW.forEach(function (w, i) { w.classList.toggle('fx-read', i < n); });
    }
  });

  // Un compteur de chapitres suit la page
  FX.register('chapter-ticker', {
    setup: function (el) {
      var sel = el.dataset.fxTarget || 'section';
      el.setAttribute('aria-hidden', 'true');
      el.innerHTML = '<span class="fx-tk-col"></span><span class="fx-tk-tot"></span>';
      el._fxCol = el.firstChild;
      el._fxSec = Array.prototype.slice.call(document.querySelectorAll(sel));
      var n = Math.max(el._fxSec.length, U.num(el, 'fxCount', 5));
      for (var i = 1; i <= n; i++) U.make('b', '', el._fxCol).textContent = ('0' + i).slice(-2);
      el.lastChild.textContent = '/' + ('0' + n).slice(-2);
      el._fxCount = n;
    },
    scroll: function (el, info) {
      var i = 0;
      if (el._fxSec.length) el._fxSec.forEach(function (s, k) { if (s.getBoundingClientRect().top < info.vh * .5) i = k; });
      else i = Math.floor(info.pass * el._fxCount * .999);
      el.style.setProperty('--fx-cur', i);
    }
  });

  // L'image coulisse lentement à l'intérieur de son cadre
  FX.register('frame-drift', {
    scroll: function (el, info) { el.style.setProperty('--fx-d', ((info.pass - .5) * U.num(el, 'fxRange', 16)).toFixed(2) + '%'); }
  });

  // La bordure de section ondule quand on défile
  FX.register('wave-morph', {
    setup: function (el) {
      el.setAttribute('aria-hidden', 'true');
      el.innerHTML = '<svg viewBox="0 0 600 100" preserveAspectRatio="none"><path/></svg>';
      el._fxPath = el.querySelector('path');
    },
    scroll: function (el, info) {
      var a = 10 + Math.abs(U.velocity()) * .5 + U.num(el, 'fxAmp', 22) * Math.sin(info.pass * 3.14), ph = info.pass * 9, d = 'M0 100 L0 50';
      for (var x = 0; x <= 600; x += 30) d += ' L' + x + ' ' + (50 + Math.sin(x * .012 + ph) * a).toFixed(1);
      el._fxPath.setAttribute('d', d + ' L600 100 Z');
    }
  });

  // Des éléments tournent autour d'un centre au défilement
  FX.register('orbit-scrub', {
    setup: function (el) { var n = el.children.length; Array.prototype.forEach.call(el.children, function (c, i) { c.style.setProperty('--fx-a', (i / n * 360) + 'deg'); }); },
    scroll: function (el, info) { el.style.setProperty('--fx-turn', (info.pass * U.num(el, 'fxTurn', 240)).toFixed(1) + 'deg'); }
  });

  // Les blocs s'alignent comme des marches
  FX.register('stairs-scroll', {
    setup: function (el) { Array.prototype.forEach.call(el.children, function (c, i) { c.style.setProperty('--fx-i', i); }); },
    scroll: function (el, info) { el.style.setProperty('--fx-rest', (1 - U.easeOut(info.enter)).toFixed(3)); }
  });

  // Un balayage progressif dévoile l'élément en biais
  FX.register('wipe-scrub', {
    scroll: function (el, info) { el.style.setProperty('--fx-at', (info.enter * 160 - 30).toFixed(1) + '%'); }
  });

  // La section recule et s'arrondit en sortant
  FX.register('card-recede', {
    scroll: function (el, info) {
      var out = U.clamp(-info.rect.top / Math.max(1, Math.min(info.rect.height, info.vh)), 0, 1);
      el.style.setProperty('--fx-out', (el.dataset.fxDemo ? info.pass : out).toFixed(3));
    }
  });

  // Des lignes de vitesse apparaissent quand on défile vite
  FX.register('speed-lines', {
    setup: function (el) {
      U.ensurePositioned(el);
      el._fxCv = U.make('canvas', 'fx-speed', el);
      el._fxCv.setAttribute('aria-hidden', 'true');
      el._fxLn = [];
      for (var i = 0; i < U.num(el, 'fxLines', 26); i++) el._fxLn.push({ x: Math.random(), y: Math.random(), k: U.rand(.4, 1) });
    },
    tick: function (el, dt, t) {
      if (U.reduced) return;
      var cv = el._fxCv, w = cv.clientWidth, h = cv.clientHeight;
      if (!w) return;
      if (cv.width !== w) { cv.width = w; cv.height = h; }
      var v = el.dataset.fxDemo ? 60 * (.5 + .5 * Math.sin(t * .002)) : U.velocity();
      var c = cv.getContext('2d');
      c.clearRect(0, 0, w, h);
      if (Math.abs(v) < 1) return;
      c.strokeStyle = getComputedStyle(cv).color;
      c.lineWidth = 1;
      el._fxLn.forEach(function (l) {
        l.y = (l.y + v * l.k * .0009 + 1) % 1;
        var y = l.y * h, len = Math.abs(v) * l.k * 1.8;
        c.globalAlpha = Math.min(1, Math.abs(v) / 40) * l.k;
        c.beginPath(); c.moveTo(l.x * w, y); c.lineTo(l.x * w, y + len); c.stroke();
      });
    }
  });

  // Une jauge circulaire se remplit selon le défilement de l'élément
  FX.register('scroll-gauge', {
    setup: function (el) {
      el.setAttribute('role', 'meter');
      el.setAttribute('aria-valuemin', '0');
      el.setAttribute('aria-valuemax', '100');
      el.innerHTML = '<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="44" class="fx-g-bg"/><circle cx="50" cy="50" r="44" pathLength="100" class="fx-g-on"/></svg><b></b>';
      el._fxV = el.querySelector('b');
      el._fxGoal = U.num(el, 'fxGoal', 100);
    },
    scroll: function (el, info) {
      var v = Math.round(info.enter * el._fxGoal);
      el.style.setProperty('--fx-v', v);
      el._fxV.textContent = v + '%';
      el.setAttribute('aria-valuenow', v);
    }
  });
})(window.FX);

/* Pack 14 — Gestes et curseur */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Un point suit le curseur à l'intérieur de l'élément, retenu par un ressort
  FX.register('spring-follow', {
    setup: function (el) {
      U.ensurePositioned(el);
      var dot = U.make('i', 'fx-spring-dot', el);
      dot.setAttribute('aria-hidden', 'true');
      var s = el._fxS = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0, dot: dot };
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        s.tx = e.clientX - r.left; s.ty = e.clientY - r.top;
        el.classList.add('fx-on');
      });
      el.addEventListener('pointerleave', function () { el.classList.remove('fx-on'); });
    },
    tick: function (el, dt) {
      var s = el._fxS, k = U.num(el, 'fxStiff', 90), d = U.num(el, 'fxDamp', 11);
      if (U.reduced) { s.x = s.tx; s.y = s.ty; }
      else {
        s.vx += ((s.tx - s.x) * k - s.vx * d) * dt; s.vy += ((s.ty - s.y) * k - s.vy * d) * dt;
        s.x += s.vx * dt; s.y += s.vy * dt;
      }
      s.dot.style.transform = 'translate(' + s.x.toFixed(1) + 'px,' + s.y.toFixed(1) + 'px)';
    }
  });

  // On attrape l'élément, il s'étire, puis revient comme un élastique
  FX.register('squish-drag', {
    setup: function (el) {
      var s = el._fxS = { x: 0, y: 0, vx: 0, vy: 0, drag: false, sx: 0, sy: 0 };
      el.style.touchAction = 'none';
      el.addEventListener('pointerdown', function (e) {
        s.drag = true; s.sx = e.clientX - s.x; s.sy = e.clientY - s.y;
        if (el.setPointerCapture && e.isTrusted) el.setPointerCapture(e.pointerId);
        el.classList.add('fx-grab');
      });
      el.addEventListener('pointermove', function (e) {
        if (!s.drag) return;
        var nx = e.clientX - s.sx, ny = e.clientY - s.sy;
        s.vx = (nx - s.x) * 60; s.vy = (ny - s.y) * 60; s.x = nx; s.y = ny;
      });
      var up = function () { s.drag = false; el.classList.remove('fx-grab'); };
      el.addEventListener('pointerup', up);
      el.addEventListener('pointercancel', up);
    },
    tick: function (el, dt) {
      var s = el._fxS;
      if (!s.drag) {
        s.vx += (-s.x * 120 - s.vx * 10) * dt; s.vy += (-s.y * 120 - s.vy * 10) * dt;
        s.x += s.vx * dt; s.y += s.vy * dt;
        if (U.reduced) { s.x = s.y = 0; }
      }
      var sp = U.clamp(Math.sqrt(s.vx * s.vx + s.vy * s.vy) * .0003, 0, .35);
      var a = Math.atan2(s.vy, s.vx) * 57.3;
      el.style.transform = 'translate(' + s.x.toFixed(1) + 'px,' + s.y.toFixed(1) + 'px) rotate(' + a.toFixed(1) + 'deg) scale(' + (1 + sp).toFixed(3) + ',' + (1 - sp).toFixed(3) + ') rotate(' + (-a).toFixed(1) + 'deg)';
      if (s.drag) { s.vx *= .8; s.vy *= .8; }
    }
  });

  // Une étiquette accompagne le curseur au survol
  FX.register('cursor-label', {
    setup: function (el) {
      U.ensurePositioned(el);
      var l = U.make('span', 'fx-cl', el);
      l.textContent = el.dataset.fxLabel || 'Voir';
      l.setAttribute('aria-hidden', 'true');
      var s = el._fxS = { x: 0, y: 0, tx: 0, ty: 0, l: l };
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        s.tx = e.clientX - r.left; s.ty = e.clientY - r.top;
        el.classList.add('fx-on');
      });
      el.addEventListener('pointerleave', function () { el.classList.remove('fx-on'); });
    },
    tick: function (el) {
      var s = el._fxS;
      s.x = U.lerp(s.x, s.tx, .16); s.y = U.lerp(s.y, s.ty, .16);
      s.l.style.setProperty('--fx-x', s.x.toFixed(1) + 'px');
      s.l.style.setProperty('--fx-y', s.y.toFixed(1) + 'px');
    }
  });

  // Le texte pivote en 3D vers le curseur, avec un reflet qui glisse
  FX.register('hover-tilt-text', {
    setup: function (el) {
      var s = el._fxS = { rx: 0, ry: 0, tx: 0, ty: 0 };
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        s.ty = ((e.clientX - r.left) / r.width - .5) * U.num(el, 'fxMax', 26);
        s.tx = -((e.clientY - r.top) / r.height - .5) * U.num(el, 'fxMax', 26);
      });
      el.addEventListener('pointerleave', function () { s.tx = s.ty = 0; });
    },
    tick: function (el) {
      var s = el._fxS;
      if (U.reduced) return;
      s.rx = U.lerp(s.rx, s.tx, .1); s.ry = U.lerp(s.ry, s.ty, .1);
      el.style.setProperty('--fx-rx', s.rx.toFixed(2) + 'deg');
      el.style.setProperty('--fx-ry', s.ry.toFixed(2) + 'deg');
      el.style.setProperty('--fx-sx', (s.ry * -.5).toFixed(1) + 'px');
      el.style.setProperty('--fx-sy', (s.rx * .5).toFixed(1) + 'px');
    }
  });

  // Au clic, un cercle part du doigt et inverse la couleur du bouton
  FX.register('press-ripple-text', {
    setup: function (el) {
      var text = el.textContent;
      el.innerHTML = '<span class="fx-prt-a"></span><span class="fx-prt-b" aria-hidden="true"></span>';
      el.firstChild.textContent = text; el.lastChild.textContent = text;
    },
    triggerOn: 'click',
    trigger: function (el, e) {
      var r = el.getBoundingClientRect();
      var keyboard = !e || !e.clientX;
      el.style.setProperty('--fx-x', (keyboard ? r.width / 2 : e.clientX - r.left) + 'px');
      el.style.setProperty('--fx-y', (keyboard ? r.height / 2 : e.clientY - r.top) + 'px');
      el.classList.remove('fx-go');
      void el.offsetWidth;
      el.classList.add('fx-go');
      setTimeout(function () { el.classList.remove('fx-go'); }, 800);
    }
  });

  // Un bandeau unique glisse d'une ligne à l'autre
  FX.register('swipe-reveal-row', {
    setup: function (el) {
      U.ensurePositioned(el);
      var bg = U.make('i', 'fx-srr', el);
      bg.setAttribute('aria-hidden', 'true');
      el.insertBefore(bg, el.firstChild);
      var go = function (row) {
        el.style.setProperty('--fx-y', row.offsetTop + 'px');
        el.style.setProperty('--fx-h', row.offsetHeight + 'px');
        el.classList.add('fx-on');
      };
      Array.prototype.forEach.call(el.children, function (row) {
        if (row === bg) return;
        row.addEventListener('pointerenter', function () { go(row); });
        row.addEventListener('focusin', function () { go(row); });
      });
      el.addEventListener('pointerleave', function () { el.classList.remove('fx-on'); });
    }
  });

  // Une chaîne de perles suit le curseur
  FX.register('trail-dots', {
    setup: function (el) {
      U.ensurePositioned(el);
      var n = U.num(el, 'fxCount', 10), s = el._fxS = { pts: [], tx: 0, ty: 0 };
      for (var i = 0; i < n; i++) {
        var d = U.make('i', 'fx-td', el);
        d.setAttribute('aria-hidden', 'true');
        d.style.setProperty('--fx-q', 1 - i / n);
        s.pts.push({ x: 0, y: 0, el: d });
      }
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        s.tx = e.clientX - r.left; s.ty = e.clientY - r.top;
        el.classList.add('fx-on');
      });
      el.addEventListener('pointerleave', function () { el.classList.remove('fx-on'); });
    },
    tick: function (el) {
      var s = el._fxS, px = s.tx, py = s.ty;
      if (U.reduced) return;
      s.pts.forEach(function (p) {
        p.x = U.lerp(p.x, px, .34); p.y = U.lerp(p.y, py, .34);
        p.el.style.transform = 'translate(' + p.x.toFixed(1) + 'px,' + p.y.toFixed(1) + 'px)';
        px = p.x; py = p.y;
      });
    }
  });

  // Il faut maintenir le bouton pour confirmer
  FX.register('hold-confirm', {
    setup: function (el) {
      var t = 0, holding = false, done = false, dur = U.num(el, 'fxHold', 1200);
      var start = function () { if (done) return; holding = true; el.classList.add('fx-hold'); };
      var stop = function () { holding = false; if (!done) { t = 0; el.style.setProperty('--fx-h', 0); el.classList.remove('fx-hold'); } };
      el.addEventListener('pointerdown', start);
      ['pointerup', 'pointerleave', 'pointercancel', 'blur'].forEach(function (n) { el.addEventListener(n, stop); });
      el.addEventListener('keydown', function (e) { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); start(); } });
      el.addEventListener('keyup', stop);
      el._fxStep = function (dt) {
        if (!holding || done) return;
        t += dt * 1000;
        el.style.setProperty('--fx-h', Math.min(1, t / dur).toFixed(3));
        if (t >= dur) {
          done = true;
          el.classList.add('fx-confirmed');
          el.dispatchEvent(new CustomEvent('fx:confirm', { bubbles: true }));
          setTimeout(function () { done = false; holding = false; t = 0; el.style.setProperty('--fx-h', 0); el.classList.remove('fx-confirmed', 'fx-hold'); }, 1600);
        }
      };
    },
    tick: function (el, dt) { el._fxStep(dt); }
  });

  // Un interrupteur dont le bouton s'étire avant de sauter de l'autre côté
  FX.register('snap-toggle', {
    setup: function (el) {
      el.setAttribute('role', 'switch');
      el.tabIndex = 0;
      el.setAttribute('aria-checked', el.dataset.fxOn === 'true' ? 'true' : 'false');
      U.make('i', '', el).setAttribute('aria-hidden', 'true');
      el.addEventListener('keydown', function (e) { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); FX.trigger(el); } });
    },
    triggerOn: 'click',
    trigger: function (el) {
      var on = el.getAttribute('aria-checked') !== 'true';
      el.setAttribute('aria-checked', on);
      el.dispatchEvent(new CustomEvent('fx:change', { bubbles: true, detail: { on: on } }));
    }
  });

  // Un compteur dont le chiffre glisse dans le sens du changement
  FX.register('stepper-pop', {
    setup: function (el) {
      var v = U.num(el, 'fxValue', 1), min = U.num(el, 'fxMin', 0), max = U.num(el, 'fxMax', 99);
      el.setAttribute('role', 'group');
      el.innerHTML = '<button type="button" aria-label="Moins">−</button><output aria-live="polite"><span></span></output><button type="button" aria-label="Plus">+</button>';
      var out = el.querySelector('output');
      out.firstChild.textContent = v;
      var change = function (d) {
        var nv = U.clamp(v + d, min, max);
        if (nv === v) { el.classList.remove('fx-stop'); void el.offsetWidth; el.classList.add('fx-stop'); return; }
        v = nv;
        var s = document.createElement('span');
        s.textContent = v;
        s.className = d > 0 ? 'fx-up' : 'fx-down';
        out.textContent = '';
        out.appendChild(s);
        el.dispatchEvent(new CustomEvent('fx:change', { bubbles: true, detail: { value: v } }));
      };
      el.firstChild.addEventListener('click', function () { change(-1); });
      el.lastChild.addEventListener('click', function () { change(1); });
    }
  });

  // Une note dont les étoiles s'allument en vague
  FX.register('star-rate', {
    setup: function (el) {
      var n = U.num(el, 'fxMax', 5), val = U.num(el, 'fxValue', 0);
      el.setAttribute('role', 'slider');
      el.setAttribute('aria-valuemin', 0); el.setAttribute('aria-valuemax', n);
      el.setAttribute('aria-label', el.getAttribute('aria-label') || 'Note');
      el.tabIndex = 0;
      var stars = [];
      for (var i = 0; i < n; i++) { var s = U.make('i', '', el); s.textContent = '★'; s.style.setProperty('--fx-i', i); stars.push(s); }
      var paint = function (k) { stars.forEach(function (s, i) { s.classList.toggle('fx-on', i < k); }); };
      var set = function (k) {
        val = U.clamp(k, 0, n); paint(val);
        el.setAttribute('aria-valuenow', val);
        el.dispatchEvent(new CustomEvent('fx:change', { bubbles: true, detail: { value: val } }));
      };
      stars.forEach(function (s, i) {
        s.addEventListener('pointerenter', function () { paint(i + 1); });
        s.addEventListener('click', function () { set(i + 1); });
      });
      el.addEventListener('pointerleave', function () { paint(val); });
      el.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); set(val + 1); }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); set(val - 1); }
      });
      paint(val); el.setAttribute('aria-valuenow', val);
    }
  });

  // Une goutte de couleur entre par le côté où arrive le curseur
  FX.register('ink-button', {
    setup: function (el) {
      var mark = function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--fx-x', (e.clientX - r.left) + 'px');
        el.style.setProperty('--fx-y', (e.clientY - r.top) + 'px');
      };
      el.addEventListener('pointerenter', mark);
      el.addEventListener('pointerleave', mark);
    }
  });

  // Un bouton dont les actions s'échappent comme des gouttes
  FX.register('gooey-menu', {
    setup: function (el) {
      if (!document.getElementById('fx-goo')) {
        var d = document.createElement('div');
        d.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
        d.innerHTML = '<svg aria-hidden="true"><filter id="fx-goo"><feGaussianBlur in="SourceGraphic" stdDeviation="7"/><feColorMatrix values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 22 -9"/></filter></svg>';
        document.body.appendChild(d);
      }
      var btn = el.querySelector('button');
      var items = el.querySelectorAll('a,[data-item]');
      // Les gouttes sont dans un calque filtré à part : les icônes restent nettes au-dessus
      var layer = U.make('span', 'fx-goo-l', el);
      layer.setAttribute('aria-hidden', 'true');
      el.insertBefore(layer, el.firstChild);
      U.make('i', '', layer);
      items.forEach(function (a, i) {
        a.style.setProperty('--fx-i', i + 1);
        U.make('i', '', layer).style.setProperty('--fx-i', i + 1);
      });
      btn.setAttribute('aria-expanded', 'false');
      btn.addEventListener('click', function () {
        var on = !el.classList.contains('fx-open');
        el.classList.toggle('fx-open', on);
        btn.setAttribute('aria-expanded', on);
      });
    }
  });

  // Une plaque de verre dont le reflet suit le curseur
  FX.register('liquid-glass', {
    setup: function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--fx-gx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
        el.style.setProperty('--fx-gy', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
      });
      el.addEventListener('pointerleave', function () { el.style.removeProperty('--fx-gx'); el.style.removeProperty('--fx-gy'); });
    }
  });

  // Les éléments grossissent à l'approche du curseur, comme un dock
  FX.register('jelly-list', {
    setup: function (el) {
      var items = Array.prototype.slice.call(el.children);
      var R = U.num(el, 'fxRadius', 110);
      el.addEventListener('pointermove', function (e) {
        items.forEach(function (it) {
          var r = it.getBoundingClientRect();
          var d = Math.abs(r.left + r.width / 2 - e.clientX);
          it.style.setProperty('--fx-k', Math.max(0, 1 - d / R).toFixed(3));
        });
      });
      el.addEventListener('pointerleave', function () { items.forEach(function (it) { it.style.setProperty('--fx-k', 0); }); });
    }
  });

  // Un cadre lumineux glisse d'un champ au suivant
  FX.register('focus-beam', {
    setup: function (el) {
      U.ensurePositioned(el);
      var b = U.make('i', 'fx-beam', el);
      b.setAttribute('aria-hidden', 'true');
      el.addEventListener('focusin', function (e) {
        var r = e.target.getBoundingClientRect(), o = el.getBoundingClientRect();
        b.style.transform = 'translate(' + (r.left - o.left) + 'px,' + (r.top - o.top) + 'px)';
        b.style.width = r.width + 'px';
        b.style.height = r.height + 'px';
        el.classList.add('fx-on');
      });
      el.addEventListener('focusout', function (e) { if (!el.contains(e.relatedTarget)) el.classList.remove('fx-on'); });
    }
  });

  // Une lumière fait le tour de la carte, plus vite au survol
  FX.register('border-chase', {
    setup: function (el) { el._fxA = 0; el._fxV = 40; },
    tick: function (el, dt) {
      if (U.reduced) return;
      var target = el.matches(':hover') ? 240 : U.num(el, 'fxIdle', 50);
      el._fxV = U.lerp(el._fxV, target, .05);
      el._fxA = (el._fxA + el._fxV * dt) % 360;
      el.style.setProperty('--fx-ang', el._fxA.toFixed(1) + 'deg');
    }
  });

  // Le coin d'une note se soulève à l'approche du curseur
  FX.register('sticky-note-peel', {
    setup: function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var d = Math.hypot(r.right - e.clientX, r.bottom - e.clientY);
        el.style.setProperty('--fx-lift', U.clamp(1 - d / (r.width * .9), .12, 1).toFixed(3));
      });
      el.addEventListener('pointerleave', function () { el.style.setProperty('--fx-lift', 0); });
    }
  });

  // Une petite image s'ouvre au milieu de la ligne au survol du lien
  FX.register('image-pop-link', {
    setup: function (el) {
      var i = document.createElement('img');
      i.src = el.dataset.fxImg || 'assets/dune.svg';
      i.alt = '';
      i.className = 'fx-ipl';
      i.setAttribute('aria-hidden', 'true');
      var at = U.num(el, 'fxAt', -1);
      var words = el.textContent.trim().split(' ');
      if (at < 0) at = Math.ceil(words.length / 2);
      el.textContent = words.slice(0, at).join(' ') + ' ';
      el.appendChild(i);
      el.appendChild(document.createTextNode(' ' + words.slice(at).join(' ')));
    }
  });

  // Une liste que l'on réorganise en faisant glisser, et les voisins s'écartent
  FX.register('drag-reorder', {
    setup: function (el) {
      Array.prototype.forEach.call(el.children, function (it) {
        it.tabIndex = 0;
        var startY = 0, drag = false;
        it.addEventListener('pointerdown', function (e) {
          drag = true; startY = e.clientY; it.classList.add('fx-drag');
          if (it.setPointerCapture && e.isTrusted) it.setPointerCapture(e.pointerId);
        });
        it.addEventListener('pointermove', function (e) {
          if (!drag) return;
          var dy = e.clientY - startY;
          it.style.transform = 'translateY(' + dy + 'px) scale(1.03)';
          var h = it.offsetHeight;
          if (dy > h * .6 && it.nextElementSibling) { el.insertBefore(it.nextElementSibling, it); startY += h; flash(it); }
          else if (dy < -h * .6 && it.previousElementSibling) { el.insertBefore(it, it.previousElementSibling); startY -= h; flash(it); }
        });
        var end = function () { drag = false; it.classList.remove('fx-drag'); it.style.transform = ''; };
        it.addEventListener('pointerup', end);
        it.addEventListener('pointercancel', end);
        it.addEventListener('keydown', function (e) {
          if (!e.altKey) return;
          if (e.key === 'ArrowDown' && it.nextElementSibling) { e.preventDefault(); el.insertBefore(it.nextElementSibling, it); it.focus(); }
          if (e.key === 'ArrowUp' && it.previousElementSibling) { e.preventDefault(); el.insertBefore(it, it.previousElementSibling); it.focus(); }
        });
      });
      function flash() { el.dispatchEvent(new CustomEvent('fx:change', { bubbles: true })); }
    }
  });

  // Une pile de cartes qu'on balaye vers la gauche ou la droite
  FX.register('swipe-card', {
    setup: function (el) {
      var layout = function () { Array.prototype.forEach.call(el.children, function (c, i) { c.style.setProperty('--fx-pos', i); c.style.zIndex = 20 - i; }); };
      layout();
      var top = function () { return el.firstElementChild; }, sx = 0, dx = 0, drag = false;
      var send = function (dir) {
        var c = top();
        el.classList.add('fx-fly');
        c.style.transform = 'translateX(' + (dir * 340) + 'px) rotate(' + (dir * 24) + 'deg)';
        c.style.opacity = 0;
        el.dispatchEvent(new CustomEvent('fx:swipe', { bubbles: true, detail: { dir: dir > 0 ? 'right' : 'left' } }));
        setTimeout(function () { el.classList.remove('fx-fly'); c.style.transform = ''; c.style.opacity = ''; el.appendChild(c); layout(); }, 300);
      };
      el.tabIndex = 0;
      el.addEventListener('pointerdown', function (e) { drag = true; sx = e.clientX; dx = 0; if (e.isTrusted) el.setPointerCapture(e.pointerId); });
      el.addEventListener('pointermove', function (e) {
        if (!drag) return;
        dx = e.clientX - sx;
        top().style.transform = 'translateX(' + dx + 'px) rotate(' + dx * .08 + 'deg)';
      });
      var up = function () {
        if (!drag) return;
        drag = false;
        if (Math.abs(dx) > U.num(el, 'fxDistance', 80)) send(dx > 0 ? 1 : -1);
        else top().style.transform = '';
      };
      el.addEventListener('pointerup', up);
      el.addEventListener('pointercancel', up);
      el.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') send(-1);
        if (e.key === 'ArrowRight') send(1);
      });
    }
  });

  // Un petit égaliseur s'anime au survol
  FX.register('sound-bars-hover', {
    setup: function (el) {
      var n = U.num(el, 'fxBars', 5);
      el.setAttribute('aria-hidden', 'true');
      el._fxB = [];
      for (var i = 0; i < n; i++) el._fxB.push({ el: U.make('i', '', el), v: .2, a: U.rand(.006, .012), b: U.rand(.002, .006) });
      el._fxAll = el.dataset.fxAuto === 'true';
    },
    tick: function (el, dt, t) {
      if (U.reduced) return;
      var hot = el._fxAll || el.matches(':hover') || (el.parentElement && el.parentElement.matches(':hover'));
      el._fxB.forEach(function (b) {
        var tg = hot ? .25 + .75 * Math.abs(Math.sin(t * b.a) * Math.cos(t * b.b)) : .18;
        b.v = U.lerp(b.v, tg, .22);
        b.el.style.transform = 'scaleY(' + b.v.toFixed(3) + ')';
      });
    }
  });

  // Plus on appuie longtemps, plus le mot s'écrase
  FX.register('pressure-word', {
    setup: function (el) {
      el._fxP = 0; el._fxDown = false;
      el.addEventListener('pointerdown', function () { el._fxDown = true; });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (n) { el.addEventListener(n, function () { el._fxDown = false; }); });
    },
    tick: function (el, dt) {
      if (U.reduced) return;
      el._fxP = el._fxDown ? Math.min(1, el._fxP + dt * 1.2) : el._fxP * .86;
      el.style.setProperty('--fx-press', el._fxP.toFixed(3));
    }
  });

  // Un prix qui change avec un défilement de chiffres
  FX.register('price-flip', {
    setup: function (el) {
      var vals = (el.dataset.fxValues || '19|190').split('|'), i = 0;
      el.setAttribute('aria-live', 'polite');
      var show = function (txt, dir) {
        var o = el.firstElementChild;
        if (o) { o.className = 'fx-pf-out' + (dir > 0 ? ' up' : ''); setTimeout(function () { o.remove(); }, 300); }
        var n = document.createElement('span');
        n.className = 'fx-pf-in' + (dir > 0 ? ' up' : '');
        n.textContent = txt;
        el.appendChild(n);
      };
      show(vals[0], 1);
      el._fxNext = function () { i = (i + 1) % vals.length; show(vals[i], i ? 1 : -1); el.dispatchEvent(new CustomEvent('fx:change', { bubbles: true, detail: { value: vals[i] } })); };
      var tog = el.dataset.fxToggle && document.querySelector(el.dataset.fxToggle);
      if (tog) tog.addEventListener('click', el._fxNext);
    },
    trigger: function (el) { el._fxNext(); }
  });

  // Une case qui coche d'un trait de stylo et biffe le texte
  FX.register('checkbox-scribble', {
    setup: function (el) {
      var input = el.querySelector('input');
      if (!input) return;
      var i = document.createElement('i');
      i.className = 'fx-cs-box';
      i.setAttribute('aria-hidden', 'true');
      i.innerHTML = '<svg viewBox="0 0 24 24"><path pathLength="1" d="M4 13 C7 15, 9 18, 10 20 C13 13, 16 8, 21 4"/></svg>';
      input.after(i);
      var txt = el.querySelector('span');
      if (txt) {
        var w = document.createElement('span');
        w.className = 'fx-cs-line';
        w.setAttribute('aria-hidden', 'true');
        w.innerHTML = '<svg viewBox="0 0 100 10" preserveAspectRatio="none"><path pathLength="1" d="M0 5 C20 2, 40 9, 60 5 S 90 2, 100 6"/></svg>';
        txt.style.position = 'relative';
        txt.appendChild(w);
      }
    }
  });

  // Une icône de recherche qui s'ouvre en champ de saisie
  FX.register('search-expand', {
    setup: function (el) {
      var input = el.querySelector('input'), btn = el.querySelector('button');
      if (!input || !btn) return;
      btn.setAttribute('aria-expanded', 'false');
      var set = function (on) { el.classList.toggle('fx-open', on); btn.setAttribute('aria-expanded', on); };
      btn.addEventListener('click', function () {
        var on = !el.classList.contains('fx-open');
        set(on);
        if (on) input.focus();
      });
      input.addEventListener('keydown', function (e) { if (e.key === 'Escape') { set(false); btn.focus(); } });
      input.addEventListener('blur', function () { if (!input.value) set(false); });
    }
  });

  // L'étiquette supprimée s'envole et les autres comblent la place
  FX.register('tag-delete', {
    setup: function (el) {
      el.addEventListener('click', function (e) {
        var b = e.target.closest('button');
        if (!b || !el.contains(b)) return;
        var tag = b.parentElement;
        tag.style.width = tag.offsetWidth + 'px';
        void tag.offsetWidth;
        tag.classList.add('fx-out');
        var next = tag.nextElementSibling || tag.previousElementSibling;
        setTimeout(function () {
          tag.remove();
          if (next && next.querySelector('button')) next.querySelector('button').focus({ preventScroll: true });
          el.dispatchEvent(new CustomEvent('fx:remove', { bubbles: true }));
        }, 340);
      });
    }
  });

  // Une petite bulle confirme l'action à l'endroit du clic
  FX.register('copy-pop-toast', {
    triggerOn: 'click',
    trigger: function (el, e) {
      var b = document.createElement('span');
      b.className = 'fx-cpt';
      b.setAttribute('role', 'status');
      b.textContent = el.dataset.fxMessage || 'Copié !';
      var r = el.getBoundingClientRect();
      b.style.left = (e && e.clientX ? e.clientX : r.left + r.width / 2) + 'px';
      b.style.top = (e && e.clientY ? e.clientY : r.top) + 'px';
      document.body.appendChild(b);
      setTimeout(function () { b.remove(); }, 900);
      if (el.dataset.fxCopy && navigator.clipboard) navigator.clipboard.writeText(el.dataset.fxCopy).catch(function () {});
    }
  });

  // Un bouton rotatif qu'on tourne à la souris ou au clavier
  FX.register('knob-dial', {
    setup: function (el) {
      var min = U.num(el, 'fxMin', 0), max = U.num(el, 'fxMax', 100), v = U.num(el, 'fxValue', 40);
      el.setAttribute('role', 'slider');
      el.setAttribute('aria-valuemin', min); el.setAttribute('aria-valuemax', max);
      el.tabIndex = 0;
      el.innerHTML = '<i></i><b></b>';
      var set = function (nv) {
        v = U.clamp(nv, min, max);
        var p = (v - min) / (max - min);
        el.style.setProperty('--fx-ang', (-135 + p * 270) + 'deg');
        el.style.setProperty('--fx-pct', p * 75);
        el.lastChild.textContent = Math.round(v);
        el.setAttribute('aria-valuenow', Math.round(v));
        el.dispatchEvent(new CustomEvent('fx:change', { bubbles: true, detail: { value: v } }));
      };
      set(v);
      var y0 = 0, v0 = 0, drag = false;
      el.addEventListener('pointerdown', function (e) { drag = true; y0 = e.clientY; v0 = v; if (e.isTrusted) el.setPointerCapture(e.pointerId); });
      el.addEventListener('pointermove', function (e) { if (drag) set(v0 + (y0 - e.clientY) * (max - min) / 150); });
      el.addEventListener('pointerup', function () { drag = false; });
      el.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowUp' || e.key === 'ArrowRight') { e.preventDefault(); set(v + 1); }
        if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') { e.preventDefault(); set(v - 1); }
      });
    }
  });
})(window.FX);

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

  // Une bande reste nette et suit le curseur, le reste est flou
  FX.register('tilt-focus', {
    setup: function (el) {
      var img = el.querySelector('img');
      if (!img) return;
      var c = img.cloneNode();
      c.alt = '';
      c.setAttribute('aria-hidden', 'true');
      c.className = 'fx-tf-blur';
      el.appendChild(c);
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--fx-fy', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
      });
    }
  });

  // Des photos tombent sur la table et se posent en désordre
  FX.register('polaroid-drop', {
    entrance: true,
    setup: function (el) {
      var top = el.children.length;
      Array.prototype.forEach.call(el.children, function (c, i) {
        c.style.setProperty('--fx-rot', U.rand(-14, 14).toFixed(1) + 'deg');
        c.style.setProperty('--fx-dx', U.rand(-28, 28).toFixed(0) + 'px');
        c.style.setProperty('--fx-dy', U.rand(-16, 16).toFixed(0) + 'px');
        c.style.setProperty('--fx-i', i);
        c.addEventListener('click', function () { c.style.zIndex = ++top; });
      });
    }
  });

  // Le curseur révèle une seconde image, comme une radio
  FX.register('x-ray', {
    setup: function (el) {
      var s = el._fxS = { x: 0, y: 0, tx: 0, ty: 0, r: 0, on: false };
      el.addEventListener('pointermove', function (e) {
        var b = el.getBoundingClientRect();
        s.tx = e.clientX - b.left; s.ty = e.clientY - b.top; s.on = true;
      });
      el.addEventListener('pointerleave', function () { s.on = false; });
    },
    tick: function (el, dt, t) {
      var s = el._fxS;
      if (el.dataset.fxAuto === 'true' && !s.on) {
        s.tx = el.offsetWidth * (.5 + Math.sin(t * .0009) * .35);
        s.ty = el.offsetHeight * (.5 + Math.cos(t * .0013) * .3);
      }
      s.x = U.lerp(s.x, s.tx, .14); s.y = U.lerp(s.y, s.ty, .14);
      s.r = U.lerp(s.r, s.on || el.dataset.fxAuto === 'true' ? U.num(el, 'fxRadius', 70) : 0, .12);
      el.style.setProperty('--fx-x', s.x.toFixed(1) + 'px');
      el.style.setProperty('--fx-y', s.y.toFixed(1) + 'px');
      el.style.setProperty('--fx-r', s.r.toFixed(1) + 'px');
    }
  });
})(window.FX);

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

  // Des flocons tombent à plusieurs profondeurs
  FX.register('snow-fall', {
    setup: function (el) {
      U.ensurePositioned(el);
      el._fxCv = U.make('canvas', 'fx-gen', el);
      el._fxCv.setAttribute('aria-hidden', 'true');
      el._fxF = [];
      for (var i = 0; i < U.num(el, 'fxCount', 70); i++) { var z = Math.random(); el._fxF.push({ x: Math.random(), y: Math.random(), z: z, a: U.rand(0, 6) }); }
    },
    tick: function (el, dt, t) {
      var cv = el._fxCv, w = cv.clientWidth, h = cv.clientHeight;
      if (!w) return;
      if (cv.width !== w) { cv.width = w; cv.height = h; }
      if (U.reduced && el._fxDone) return;
      el._fxDone = true;
      var c = cv.getContext('2d');
      c.clearRect(0, 0, w, h);
      c.fillStyle = getComputedStyle(cv).color;
      el._fxF.forEach(function (f) {
        f.y += (.03 + f.z * .09) * dt;
        f.x += Math.sin(t * .0006 + f.a) * .0006;
        if (f.y > 1.02) { f.y = -.02; f.x = Math.random(); }
        c.globalAlpha = .3 + f.z * .7;
        c.beginPath();
        c.arc(((f.x % 1) + 1) % 1 * w, f.y * h, .6 + f.z * 2.2, 0, 7);
        c.fill();
      });
    }
  });

  // Des lucioles errent et s'allument tour à tour
  FX.register('fireflies', {
    setup: function (el) {
      U.ensurePositioned(el);
      el._fxCv = U.make('canvas', 'fx-gen', el);
      el._fxCv.setAttribute('aria-hidden', 'true');
      el._fxF = [];
      for (var i = 0; i < U.num(el, 'fxCount', 26); i++) el._fxF.push({ x: Math.random(), y: Math.random(), vx: 0, vy: 0, a: U.rand(0, 6), s: U.rand(.5, 1.4) });
    },
    tick: function (el, dt, t) {
      var cv = el._fxCv, w = cv.clientWidth, h = cv.clientHeight;
      if (!w) return;
      if (cv.width !== w) { cv.width = w; cv.height = h; }
      if (U.reduced && el._fxDone) return;
      el._fxDone = true;
      var c = cv.getContext('2d'), col = getComputedStyle(cv).color;
      c.clearRect(0, 0, w, h);
      el._fxF.forEach(function (f) {
        f.vx = (f.vx + U.rand(-.04, .04) * dt) * .985; f.vy = (f.vy + U.rand(-.04, .04) * dt) * .985;
        f.x += f.vx; f.y += f.vy;
        if (f.x < 0 || f.x > 1) f.vx *= -1;
        if (f.y < 0 || f.y > 1) f.vy *= -1;
        var on = Math.pow(Math.max(0, Math.sin(t * .001 * f.s + f.a)), 3);
        c.globalAlpha = on;
        c.shadowBlur = 14;
        c.shadowColor = col;
        c.fillStyle = col;
        c.beginPath();
        c.arc(f.x * w, f.y * h, 2, 0, 7);
        c.fill();
      });
    }
  });

  // Un terrain de points ondule en perspective
  FX.register('matrix-dots-wave', {
    setup: function (el) { U.ensurePositioned(el); el._fxCv = U.make('canvas', 'fx-gen', el); el._fxCv.setAttribute('aria-hidden', 'true'); },
    tick: function (el, dt, t) {
      var cv = el._fxCv, w = cv.clientWidth, h = cv.clientHeight;
      if (!w) return;
      if (U.reduced && el._fxDone) return;
      el._fxDone = true;
      if (cv.width !== w) { cv.width = w; cv.height = h; }
      var c = cv.getContext('2d'), N = U.num(el, 'fxRows', 22), T = t * .0012;
      c.clearRect(0, 0, w, h);
      c.fillStyle = getComputedStyle(cv).color;
      for (var z = N; z > 0; z--) for (var x = -N; x <= N; x++) {
        var y = Math.sin(x * .45 + T) * Math.cos(z * .4 + T * .7) * 26;
        var k = 240 / (z * 16 + 70);
        var px = w / 2 + x * 24 * k, py = h * .35 + (y + 90) * k;
        if (px < 0 || px > w || py > h) continue;
        c.globalAlpha = 1 - z / N * .85;
        c.fillRect(px, py, Math.max(1, k * 2.4), Math.max(1, k * 2.4));
      }
    }
  });

  // Des rayons tournent lentement autour d'un point
  FX.register('sun-rays', {
    setup: function (el) { el._fxA = 0; },
    tick: function (el, dt) {
      if (U.reduced) return;
      el._fxA = (el._fxA + dt * U.num(el, 'fxSpeed', 8)) % 360;
      el.style.setProperty('--fx-ray', el._fxA.toFixed(1) + 'deg');
    }
  });

  // Un plasma coloré, calculé pixel par pixel
  FX.register('plasma', {
    setup: function (el) {
      U.ensurePositioned(el);
      var cv = el._fxCv = U.make('canvas', 'fx-plasma', el);
      cv.width = 80; cv.height = 60;
      cv.setAttribute('aria-hidden', 'true');
      var p = function (v, d) { var n = parseInt((U.cssVar(el, v, d)).replace('#', ''), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
      el._fxA = p('--fx-a', '#0047ff'); el._fxB = p('--fx-b', '#e10600'); el._fxC = p('--fx-c', '#ffd400');
    },
    tick: function (el, dt, t) {
      if (U.reduced && el._fxDone) return;
      el._fxDone = true;
      var c = el._fxCv.getContext('2d'), W = 80, H = 60, im = c.createImageData(W, H), d = im.data, T = t * .0008;
      var A = el._fxA, B = el._fxB, C = el._fxC;
      for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) {
        var v = (Math.sin(x * .13 + T) + Math.sin(y * .17 - T * .7) + Math.sin((x + y) * .09 + T * 1.3) + Math.sin(Math.sqrt(x * x + y * y) * .12)) / 4 * .5 + .5;
        var i = (y * W + x) * 4, f, P, Q;
        if (v < .5) { f = v * 2; P = A; Q = B; } else { f = (v - .5) * 2; P = B; Q = C; }
        d[i] = P[0] + (Q[0] - P[0]) * f; d[i + 1] = P[1] + (Q[1] - P[1]) * f; d[i + 2] = P[2] + (Q[2] - P[2]) * f; d[i + 3] = 255;
      }
      c.putImageData(im, 0, 0);
    }
  });

  // Un grand égaliseur rythme le bas de la section
  FX.register('equalizer-bg', {
    setup: function (el) {
      U.ensurePositioned(el);
      el._fxCv = U.make('canvas', 'fx-gen', el);
      el._fxCv.setAttribute('aria-hidden', 'true');
      el._fxB = [];
      for (var i = 0; i < U.num(el, 'fxBars', 28); i++) el._fxB.push({ v: 0, a: U.rand(1, 5), b: U.rand(0, 6) });
    },
    tick: function (el, dt, t) {
      var cv = el._fxCv, w = cv.clientWidth, h = cv.clientHeight;
      if (!w) return;
      if (U.reduced && el._fxDone) return;
      el._fxDone = true;
      if (cv.width !== w) { cv.width = w; cv.height = h; }
      var c = cv.getContext('2d'), bw = w / el._fxB.length;
      c.clearRect(0, 0, w, h);
      c.fillStyle = getComputedStyle(cv).color;
      el._fxB.forEach(function (b, i) {
        var tg = .15 + .85 * Math.abs(Math.sin(t * .001 * b.a + b.b) * Math.sin(t * .0023 + i * .4));
        b.v = U.lerp(b.v, tg, .16);
        var H = b.v * h * .8;
        c.fillRect(i * bw + 1, h - H, bw - 2, H);
      });
    }
  });

  // Des formes colorées se multiplient en kaléidoscope
  FX.register('kaleidoscope', {
    setup: function (el) {
      U.ensurePositioned(el);
      el._fxCv = U.make('canvas', 'fx-gen', el);
      el._fxCv.setAttribute('aria-hidden', 'true');
      el._fxS = (el.dataset.fxColors || '#e10600,#ffd400,#0047ff').split(',');
    },
    tick: function (el, dt, t) {
      var cv = el._fxCv, w = cv.clientWidth, h = cv.clientHeight;
      if (!w) return;
      if (U.reduced && el._fxDone) return;
      el._fxDone = true;
      if (cv.width !== w) { cv.width = w; cv.height = h; }
      var c = cv.getContext('2d'), n = U.num(el, 'fxSides', 8), R = Math.max(w, h) * .62, T = t * .0003;
      c.clearRect(0, 0, w, h);
      c.save();
      c.translate(w / 2, h / 2);
      for (var i = 0; i < n * 2; i++) {
        c.save();
        c.rotate(i * Math.PI / n);
        if (i % 2) c.scale(1, -1);
        c.beginPath();
        c.moveTo(0, 0);
        c.arc(0, 0, R, 0, Math.PI / n);
        c.closePath();
        c.clip();
        el._fxS.forEach(function (col, k) {
          c.fillStyle = col;
          c.beginPath();
          var r = R * (.18 + k * .22) + Math.sin(T * 4 + k) * R * .1;
          var a = Math.PI / n * (.5 + .5 * Math.sin(T * 3 + k * 2));
          c.arc(Math.cos(a) * r, Math.sin(a) * r, R * (.1 + .05 * Math.sin(T * 5 + k)), 0, 7);
          c.fill();
        });
        c.restore();
      }
      c.restore();
    }
  });

  // Un éclair zèbre le fond de temps en temps
  FX.register('lightning', {
    setup: function (el) {
      U.ensurePositioned(el);
      el._fxCv = U.make('canvas', 'fx-gen', el);
      el._fxCv.setAttribute('aria-hidden', 'true');
      el._fxWait = 1; el._fxLife = 0;
    },
    trigger: function (el) { el._fxWait = 0; },
    tick: function (el, dt) {
      if (U.reduced) return;
      var cv = el._fxCv, w = cv.clientWidth, h = cv.clientHeight;
      if (!w) return;
      if (cv.width !== w) { cv.width = w; cv.height = h; }
      var c = cv.getContext('2d');
      c.globalCompositeOperation = 'destination-out';
      c.fillStyle = 'rgba(0,0,0,.25)';
      c.fillRect(0, 0, w, h);
      c.globalCompositeOperation = 'source-over';
      el._fxWait -= dt;
      if (el._fxWait > 0) return;
      el._fxWait = U.rand(1.6, 5);
      var pts = [[U.rand(.2, .8) * w, 0], [U.rand(.2, .8) * w, h]];
      for (var d = h / 3, it = 0; it < 6; it++, d /= 2) {
        var n = [];
        pts.forEach(function (p, i) {
          n.push(p);
          if (i < pts.length - 1) n.push([(p[0] + pts[i + 1][0]) / 2 + U.rand(-d, d), (p[1] + pts[i + 1][1]) / 2]);
        });
        pts = n;
      }
      c.strokeStyle = getComputedStyle(cv).color;
      c.lineWidth = 1.5;
      c.shadowBlur = 12;
      c.shadowColor = c.strokeStyle;
      c.beginPath();
      pts.forEach(function (p, i) { if (i) c.lineTo(p[0], p[1]); else c.moveTo(p[0], p[1]); });
      c.stroke();
      c.shadowBlur = 0;
    }
  });

  // Du sable s'écoule et forme des dunes
  FX.register('sand-grain', {
    setup: function (el) {
      U.ensurePositioned(el);
      el._fxCv = U.make('canvas', 'fx-gen', el);
      el._fxCv.setAttribute('aria-hidden', 'true');
    },
    tick: function (el, dt, t) {
      var cv = el._fxCv, S = 3, w = Math.floor(cv.clientWidth / S), H = Math.floor(cv.clientHeight / S);
      if (!w) return;
      if (el._fxW !== w) {
        el._fxW = w; cv.width = w * S; cv.height = H * S;
        el._fxH = new Uint16Array(w);
        for (var i = 0; i < w; i++) el._fxH[i] = Math.floor(H * .1 * (1 + Math.sin(i * .04)));
      }
      if (U.reduced && el._fxDone) return;
      el._fxDone = true;
      var c = cv.getContext('2d'), h = el._fxH;
      c.fillStyle = getComputedStyle(cv).color;
      for (var n = 0; n < U.num(el, 'fxRate', 8); n++) {
        var x = Math.round(w / 2 + Math.sin(t * .0007) * w * .35 + U.rand(-6, 6));
        x = U.clamp(x, 0, w - 1);
        while (true) {
          if (x > 0 && h[x - 1] + 1 < h[x]) x--;
          else if (x < w - 1 && h[x + 1] + 1 < h[x]) x++;
          else break;
        }
        h[x]++;
        c.fillRect(x * S, (H - h[x]) * S, S, S);
        if (h[x] > H * .85) { el._fxW = 0; c.clearRect(0, 0, cv.width, cv.height); return; }
      }
    }
  });

  // Un dégradé maillé qui se déforme lentement
  FX.register('mesh-gradient', {
    tick: function (el, dt, t) {
      if (U.reduced) return;
      var T = t * .00025 * U.num(el, 'fxSpeed', 1);
      for (var i = 0; i < 4; i++) {
        el.style.setProperty('--fx-x' + i, (50 + Math.sin(T * (1 + i * .3) + i * 2) * 42).toFixed(1) + '%');
        el.style.setProperty('--fx-y' + i, (50 + Math.cos(T * (1.2 - i * .2) + i) * 42).toFixed(1) + '%');
      }
    }
  });

  // Une façade de tuiles qui s'allument au hasard
  FX.register('tiles-flicker', {
    setup: function (el) {
      U.ensurePositioned(el);
      el._fxCv = U.make('canvas', 'fx-gen', el);
      el._fxCv.setAttribute('aria-hidden', 'true');
    },
    tick: function (el, dt) {
      var cv = el._fxCv, S = U.num(el, 'fxCell', 22), w = Math.ceil(cv.clientWidth / S), h = Math.ceil(cv.clientHeight / S);
      if (!w) return;
      if (el._fxW !== w) {
        el._fxW = w; cv.width = w * S; cv.height = h * S;
        el._fxV = new Float32Array(w * h);
        el._fxTg = new Float32Array(w * h);
        for (var i = 0; i < w * h; i++) el._fxTg[i] = Math.random() * .6;
      }
      if (U.reduced && el._fxDone) return;
      el._fxDone = true;
      var c = cv.getContext('2d'), V = el._fxV, G = el._fxTg;
      c.clearRect(0, 0, cv.width, cv.height);
      c.fillStyle = getComputedStyle(cv).color;
      for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
        var k = y * w + x;
        if (Math.random() < .004) G[k] = Math.random() < .15 ? 1 : Math.random() * .3;
        V[k] += (G[k] - V[k]) * .06;
        c.globalAlpha = V[k];
        c.fillRect(x * S + 1, y * S + 1, S - 2, S - 2);
      }
    }
  });

  // Une galaxie tourne lentement sur elle-même
  FX.register('spiral-galaxy', {
    setup: function (el) {
      U.ensurePositioned(el);
      el._fxCv = U.make('canvas', 'fx-gen', el);
      el._fxCv.setAttribute('aria-hidden', 'true');
      var arms = U.num(el, 'fxArms', 3);
      el._fxS = [];
      for (var i = 0; i < U.num(el, 'fxCount', 520); i++) {
        var r = Math.pow(Math.random(), 1.7);
        el._fxS.push({ r: r, a: (i % arms) / arms * 6.283 + r * 5 + U.rand(-.3, .3) * (1 - r * .4), z: Math.random() });
      }
    },
    tick: function (el, dt, t) {
      var cv = el._fxCv, w = cv.clientWidth, h = cv.clientHeight;
      if (!w) return;
      if (U.reduced && el._fxDone) return;
      el._fxDone = true;
      if (cv.width !== w) { cv.width = w; cv.height = h; }
      var c = cv.getContext('2d'), R = Math.min(w, h) * .48, T = t * .00012;
      c.clearRect(0, 0, w, h);
      c.fillStyle = getComputedStyle(cv).color;
      el._fxS.forEach(function (s) {
        var a = s.a + T / (s.r + .25);
        c.globalAlpha = .25 + s.z * .75;
        var d = 1 + s.z * 1.2;
        c.fillRect(w / 2 + Math.cos(a) * s.r * R * 1.3, h / 2 + Math.sin(a) * s.r * R * .75, d, d);
      });
    }
  });

  // Des crêtes montagneuses se succèdent en lignes
  FX.register('noise-terrain', {
    setup: function (el) { U.ensurePositioned(el); el._fxCv = U.make('canvas', 'fx-gen', el); el._fxCv.setAttribute('aria-hidden', 'true'); },
    tick: function (el, dt, t) {
      var cv = el._fxCv, w = cv.clientWidth, h = cv.clientHeight;
      if (!w) return;
      if (U.reduced && el._fxDone) return;
      el._fxDone = true;
      if (cv.width !== w) { cv.width = w; cv.height = h; }
      var c = cv.getContext('2d'), n = U.num(el, 'fxLines', 18), T = t * .00035;
      var col = getComputedStyle(cv).color, bg = U.cssVar(el, '--fx-terrain-bg', 'transparent');
      c.clearRect(0, 0, w, h);
      c.strokeStyle = col;
      c.lineWidth = 1;
      for (var i = 0; i < n; i++) {
        var base = h * .22 + i / n * h * .72;
        c.beginPath();
        c.moveTo(0, h);
        for (var x = 0; x <= w; x += 4) {
          var q = x / w, env = Math.pow(Math.sin(q * 3.14), 2.4);
          var y = base - env * (Math.abs(Math.sin(x * .05 + i * 1.7 + T) * Math.cos(x * .021 - i * .8 - T * .6)) * 26 + 3);
          c.lineTo(x, y);
        }
        c.lineTo(w, h);
        c.closePath();
        c.globalCompositeOperation = 'destination-out';
        c.fill();
        c.globalCompositeOperation = 'source-over';
        c.stroke();
      }
      if (bg !== 'transparent') { c.globalCompositeOperation = 'destination-over'; c.fillStyle = bg; c.fillRect(0, 0, w, h); c.globalCompositeOperation = 'source-over'; }
    }
  });

  // Des bulles montent, éclatent quand on les touche
  FX.register('bubble-rise', {
    setup: function (el) {
      U.ensurePositioned(el);
      var cv = el._fxCv = U.make('canvas', 'fx-gen', el);
      cv.setAttribute('aria-hidden', 'true');
      var bs = el._fxB = [], rings = el._fxR = [];
      var spawn = function (b) { b.x = Math.random(); b.y = 1 + Math.random() * .4; b.r = U.rand(5, 18); b.a = U.rand(0, 6); return b; };
      for (var i = 0; i < U.num(el, 'fxCount', 22); i++) { var b = spawn({}); b.y = Math.random(); bs.push(b); }
      el._fxSp = spawn;
      el.addEventListener('pointermove', function (e) {
        var q = cv.getBoundingClientRect(), mx = e.clientX - q.left, my = e.clientY - q.top;
        bs.forEach(function (b) {
          var dx = b.x * q.width - mx, dy = b.y * q.height - my;
          if (dx * dx + dy * dy < b.r * b.r) { rings.push({ x: b.x * q.width, y: b.y * q.height, r: b.r, l: 1 }); spawn(b); }
        });
      });
    },
    tick: function (el, dt, t) {
      var cv = el._fxCv, w = cv.clientWidth, h = cv.clientHeight;
      if (!w) return;
      if (U.reduced && el._fxDone) return;
      el._fxDone = true;
      if (cv.width !== w) { cv.width = w; cv.height = h; }
      var c = cv.getContext('2d');
      c.clearRect(0, 0, w, h);
      c.strokeStyle = getComputedStyle(cv).color;
      c.lineWidth = 1.5;
      el._fxB.forEach(function (b) {
        b.y -= (.03 + .9 / b.r * .05) * dt;
        if (b.y * h < -b.r) el._fxSp(b);
        c.globalAlpha = .75;
        c.beginPath();
        c.arc(b.x * w + Math.sin(t * .001 + b.a) * 7, b.y * h, b.r, 0, 7);
        c.stroke();
      });
      el._fxR = el._fxR.filter(function (r) {
        r.l -= dt * 3; r.r += dt * 60;
        if (r.l <= 0) return false;
        c.globalAlpha = r.l;
        c.beginPath();
        c.arc(r.x, r.y, r.r, 0, 7);
        c.stroke();
        return true;
      });
    }
  });

  // Un soleil en pointillés, comme une gravure qui respire
  FX.register('stipple-sun', {
    setup: function (el) {
      U.ensurePositioned(el);
      el._fxCv = U.make('canvas', 'fx-gen', el);
      el._fxCv.setAttribute('aria-hidden', 'true');
      el._fxP = [];
      for (var i = 0; i < U.num(el, 'fxCount', 1500); i++) {
        var a = Math.random() * 6.283, r = Math.pow(Math.random(), .6);
        el._fxP.push({ a: a, r: r * 1.3, s: Math.random(), o: U.rand(0, 6) });
      }
    },
    tick: function (el, dt, t) {
      var cv = el._fxCv, w = cv.clientWidth, h = cv.clientHeight;
      if (!w) return;
      if (U.reduced && el._fxDone) return;
      el._fxDone = true;
      if (cv.width !== w) { cv.width = w; cv.height = h; }
      var c = cv.getContext('2d'), R = Math.min(w, h) * .36, T = t * .001;
      c.clearRect(0, 0, w, h);
      c.fillStyle = getComputedStyle(cv).color;
      el._fxP.forEach(function (p) {
        // Plein au centre, puis des points de plus en plus rares
        if (p.r > 1 && p.s > 1 - (p.r - 1) * 2.8 + .1) return;
        var rr = p.r + Math.sin(T + p.o) * .012;
        c.fillRect(w / 2 + Math.cos(p.a) * rr * R, h / 2 + Math.sin(p.a) * rr * R, 1.3, 1.3);
      });
    }
  });

  // Un globe en fil de fer tourne, et suit le curseur
  FX.register('wire-globe', {
    setup: function (el) {
      U.ensurePositioned(el);
      el._fxCv = U.make('canvas', 'fx-gen', el);
      el._fxCv.setAttribute('aria-hidden', 'true');
      el._fxRot = 0; el._fxTilt = .4; el._fxTg = .4; el._fxSp = 0;
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el._fxTg = ((e.clientY - r.top) / r.height - .5) * 1.2;
        el._fxSp = ((e.clientX - r.left) / r.width - .5) * 1.6;
      });
      el.addEventListener('pointerleave', function () { el._fxSp = 0; el._fxTg = .4; });
    },
    tick: function (el, dt) {
      var cv = el._fxCv, w = cv.clientWidth, h = cv.clientHeight;
      if (!w) return;
      if (U.reduced && el._fxDone) return;
      el._fxDone = true;
      if (cv.width !== w) { cv.width = w; cv.height = h; }
      el._fxRot += dt * (.25 + el._fxSp);
      el._fxTilt = U.lerp(el._fxTilt, el._fxTg, .06);
      var c = cv.getContext('2d'), R = Math.min(w, h) * .44, rot = el._fxRot, ct = Math.cos(el._fxTilt), st = Math.sin(el._fxTilt);
      c.clearRect(0, 0, w, h);
      c.strokeStyle = getComputedStyle(cv).color;
      var seg = function (lat0, lon0, lat1, lon1) {
        var P = function (la, lo) {
          var x = Math.cos(la) * Math.sin(lo + rot), y = Math.sin(la), z = Math.cos(la) * Math.cos(lo + rot);
          return [x, y * ct - z * st, y * st + z * ct];
        };
        var a = P(lat0, lon0), b = P(lat1, lon1), front = (a[2] + b[2]) / 2;
        c.globalAlpha = front > 0 ? .9 : .16;
        c.beginPath();
        c.moveTo(w / 2 + a[0] * R, h / 2 + a[1] * R);
        c.lineTo(w / 2 + b[0] * R, h / 2 + b[1] * R);
        c.stroke();
      };
      var D = Math.PI / 18;
      for (var la = -Math.PI / 2 + Math.PI / 9; la < Math.PI / 2 - .01; la += Math.PI / 9) for (var lo = 0; lo < 6.28; lo += D) seg(la, lo, la, lo + D);
      for (lo = 0; lo < 6.28; lo += Math.PI / 9) for (la = -Math.PI / 2; la < Math.PI / 2 - .01; la += D) seg(la, lo, la + D, lo);
    }
  });

  // L'air chaud fait trembler l'image
  FX.register('heat-haze', {
    setup: function (el) {
      var id = 'fx-haze-' + Math.random().toString(36).slice(2, 8);
      var h = document.createElement('div');
      h.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
      h.innerHTML = '<svg aria-hidden="true"><filter id="' + id + '"><feTurbulence type="fractalNoise" baseFrequency=".02 .09" numOctaves="2"/><feDisplacementMap in="SourceGraphic" scale="' + U.num(el, 'fxScale', 7) + '"/></filter></svg>';
      document.body.appendChild(h);
      el._fxT = h.querySelector('feTurbulence');
      (el.firstElementChild || el).style.filter = U.reduced ? '' : 'url(#' + id + ')';
    },
    tick: function (el, dt, t) {
      if (U.reduced) return;
      el._fxT.setAttribute('baseFrequency', (.018 + Math.sin(t * .0005) * .004).toFixed(4) + ' ' + (.09 + Math.sin(t * .0013) * .03).toFixed(4));
    }
  });
})(window.FX);

/* Pack 17 — Parcours et mises en page */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Une case de la grille s'ouvre et les autres se rangent autour d'elle
  FX.register('bento-expand', {
    setup: function (el) {
      var cells = Array.prototype.slice.call(el.children);
      var flip = function (change) {
        var first = cells.map(function (c) { return c.getBoundingClientRect(); });
        change();
        cells.forEach(function (c, i) {
          var l = c.getBoundingClientRect(), o = first[i];
          if (U.reduced || !c.animate) return;
          c.animate([{ transform: 'translate(' + (o.left - l.left) + 'px,' + (o.top - l.top) + 'px)' }, { transform: 'none' }], { duration: 480, easing: 'cubic-bezier(.16,1,.3,1)' });
        });
      };
      cells.forEach(function (c) {
        c.tabIndex = 0;
        c.setAttribute('role', 'button');
        c.setAttribute('aria-expanded', 'false');
        var toggle = function () {
          var on = !c.classList.contains('fx-big');
          flip(function () {
            cells.forEach(function (o) { o.classList.remove('fx-big'); o.setAttribute('aria-expanded', 'false'); });
            if (on) { c.classList.add('fx-big'); c.setAttribute('aria-expanded', 'true'); }
          });
        };
        c.addEventListener('click', toggle);
        c.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
          if (e.key === 'Escape' && c.classList.contains('fx-big')) toggle();
        });
      });
    }
  });

  // Une liste de grands liens dont l'aperçu change au survol
  FX.register('mega-index', {
    setup: function (el) {
      var pv = U.make('div', 'fx-mi-pv', el);
      pv.setAttribute('aria-hidden', 'true');
      var links = el.querySelectorAll('a');
      var show = function (a) {
        links.forEach(function (o) { o.classList.toggle('fx-dim', o !== a); });
        var src = a.dataset.fxImg;
        if (src) pv.style.backgroundImage = 'url("' + src + '")';
        pv.classList.add('fx-on');
      };
      var hide = function () {
        links.forEach(function (o) { o.classList.remove('fx-dim'); });
        pv.classList.remove('fx-on');
      };
      links.forEach(function (a) {
        if (a.dataset.fxImg) (new Image()).src = a.dataset.fxImg;
        a.addEventListener('pointerenter', function () { show(a); });
        a.addEventListener('focus', function () { show(a); });
        a.addEventListener('blur', hide);
      });
      el.addEventListener('pointerleave', hide);
    }
  });

  // Une barre en pilule qui se réduit quand on descend
  FX.register('pill-nav-morph', {
    setup: function (el) {
      var lastY = window.scrollY;
      var upd = function () {
        var y = window.scrollY;
        if (Math.abs(y - lastY) < 6) return;
        el.classList.toggle('fx-small', y > lastY && y > U.num(el, 'fxAfter', 120));
        lastY = y;
      };
      window.addEventListener('scroll', upd, { passive: true });
      el.addEventListener('pointerenter', function () { el.classList.remove('fx-small'); });
      el.addEventListener('focusin', function () { el.classList.remove('fx-small'); });
      if (el.dataset.fxDemo) setInterval(function () { el.classList.toggle('fx-small'); }, 1800);
    }
  });

  // Un rail vertical indique la section et la progression
  FX.register('rail-progress-nav', {
    setup: function (el) {
      var links = Array.prototype.slice.call(el.querySelectorAll('a[href^="#"]'));
      el._fxL = links.map(function (a) { return { a: a, t: document.querySelector(a.getAttribute('href').length > 1 ? a.getAttribute('href') : null) }; }).filter(function (o) { return o.t; });
      links.forEach(function (a) { U.make('i', '', a).setAttribute('aria-hidden', 'true'); });
      if (!el._fxL.length && links.length) links[0].classList.add('fx-cur');
    },
    scroll: function (el, info) {
      if (!el._fxL.length) { el.style.setProperty('--fx-q', info.pass.toFixed(3)); return; }
      var cur = 0, mid = info.vh / 2;
      el._fxL.forEach(function (o, i) { if (o.t.getBoundingClientRect().top < mid) cur = i; });
      el._fxL.forEach(function (o, i) {
        var on = i === cur;
        o.a.classList.toggle('fx-cur', on);
        if (on) { o.a.setAttribute('aria-current', 'true'); var r = o.t.getBoundingClientRect(); o.a.style.setProperty('--fx-q', U.clamp((mid - r.top) / r.height, 0, 1).toFixed(3)); }
        else o.a.removeAttribute('aria-current');
      });
    }
  });

  // Une palette de commandes qui filtre en direct
  FX.register('command-dock', {
    setup: function (el) {
      var input = el.querySelector('input'), items = Array.prototype.slice.call(el.querySelectorAll('li')), cur = 0;
      if (!input) return;
      input.setAttribute('role', 'combobox');
      input.setAttribute('aria-expanded', 'true');
      var list = el.querySelector('ul');
      if (list) list.setAttribute('role', 'listbox');
      var vis = function () { return items.filter(function (i) { return !i.hidden; }); };
      var mark = function () {
        var v = vis();
        items.forEach(function (i) { i.classList.remove('fx-cur'); i.setAttribute('role', 'option'); i.setAttribute('aria-selected', 'false'); });
        if (v[cur]) { v[cur].classList.add('fx-cur'); v[cur].setAttribute('aria-selected', 'true'); }
      };
      input.addEventListener('input', function () {
        var q = input.value.trim().toLowerCase();
        items.forEach(function (i) { i.hidden = i.textContent.toLowerCase().indexOf(q) === -1; });
        cur = 0; mark();
      });
      input.addEventListener('keydown', function (e) {
        var v = vis();
        if (e.key === 'ArrowDown') { e.preventDefault(); cur = (cur + 1) % Math.max(1, v.length); mark(); }
        if (e.key === 'ArrowUp') { e.preventDefault(); cur = (cur - 1 + v.length) % Math.max(1, v.length); mark(); }
        if (e.key === 'Enter' && v[cur]) { e.preventDefault(); el.dispatchEvent(new CustomEvent('fx:pick', { bubbles: true, detail: { text: v[cur].textContent.trim() } })); var a = v[cur].querySelector('a'); if (a) a.click(); }
      });
      items.forEach(function (i, k) { i.style.setProperty('--fx-i', k); i.addEventListener('pointerenter', function () { cur = vis().indexOf(i); mark(); }); });
      mark();
      window.addEventListener('keydown', function (e) { if ((e.ctrlKey || e.metaKey) && e.key === 'k' && el.dataset.fxShortcut === 'true') { e.preventDefault(); input.focus(); } });
    }
  });

  // Un fil d'Ariane qui replie ses niveaux intermédiaires
  FX.register('breadcrumb-fold', {
    setup: function (el) {
      var items = Array.prototype.slice.call(el.children);
      if (items.length <= U.num(el, 'fxKeep', 3)) return;
      var mid = items.slice(1, -1);
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'fx-bc-more';
      btn.textContent = '…';
      btn.setAttribute('aria-label', 'Afficher ' + mid.length + ' niveaux');
      btn.setAttribute('aria-expanded', 'false');
      el.insertBefore(btn, items[1]);
      mid.forEach(function (m, i) { m.classList.add('fx-bc-mid'); m.style.setProperty('--fx-i', i); });
      btn.addEventListener('click', function () {
        el.classList.add('fx-open');
        btn.setAttribute('aria-expanded', 'true');
        btn.hidden = true;
        if (mid[0].querySelector('a')) mid[0].querySelector('a').focus();
      });
    }
  });

  // Les titres de section s'empilent en haut de l'écran
  FX.register('sticky-stack-nav', {
    setup: function (el) {
      var layout = function () {
        var heads = el.querySelectorAll(el.dataset.fxHead || 'h2,h3');
        var top = U.num(el, 'fxTop', 0);
        heads.forEach(function (h, i) { h.style.setProperty('--fx-top', top + 'px'); h.style.zIndex = 10 + i; top += h.offsetHeight; });
        heads.forEach(function (h, i) { h.style.setProperty('--fx-bot', (top - parseFloat(h.style.getPropertyValue('--fx-top')) - h.offsetHeight) + 'px'); });
      };
      layout();
      U.onResize(layout);
    }
  });

  // Un panneau qu'on tire vers le haut depuis le bas de l'écran
  FX.register('page-peek', {
    setup: function (el) {
      var handle = el.querySelector('button') || el.firstElementChild, startY = 0, base = 0, drag = false, stops = [0, .5, 1], cur = 0;
      var H = function () { return el.offsetHeight - U.num(el, 'fxPeek', 56); };
      var go = function (i) {
        cur = i;
        el.style.setProperty('--fx-pos', (H() * (1 - stops[i])) + 'px');
        if (handle) handle.setAttribute('aria-expanded', i > 0);
      };
      go(0);
      if (!handle) return;
      handle.addEventListener('pointerdown', function (e) { drag = true; startY = e.clientY; base = H() * (1 - stops[cur]); el.classList.add('fx-drag'); if (e.isTrusted) handle.setPointerCapture(e.pointerId); });
      handle.addEventListener('pointermove', function (e) { if (drag) el.style.setProperty('--fx-pos', U.clamp(base + e.clientY - startY, 0, H()) + 'px'); });
      handle.addEventListener('pointerup', function (e) {
        if (!drag) return;
        drag = false; el.classList.remove('fx-drag');
        var moved = Math.abs(e.clientY - startY) > 6;
        if (!moved) return go((cur + 1) % stops.length);
        var q = 1 - parseFloat(el.style.getPropertyValue('--fx-pos')) / H(), best = 0;
        stops.forEach(function (s, i) { if (Math.abs(s - q) < Math.abs(stops[best] - q)) best = i; });
        go(best);
      });
      handle.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go((cur + 1) % stops.length); } });
    }
  });

  // Une rangée horizontale avec accroche et commandes
  FX.register('horizontal-snap', {
    setup: function (el) {
      var track = el.firstElementChild, items = Array.prototype.slice.call(track.children), cur = 0;
      var bar = U.make('div', 'fx-hs-bar', el);
      bar.innerHTML = '<button type="button" aria-label="Précédent">←</button><span class="fx-hs-dots"></span><button type="button" aria-label="Suivant">→</button>';
      var dots = bar.querySelector('.fx-hs-dots');
      items.forEach(function (it, i) {
        var d = U.make('i', '', dots);
        d.addEventListener('click', function () { go(i); });
      });
      var go = function (i) {
        i = U.clamp(i, 0, items.length - 1);
        track.scrollTo({ left: items[i].offsetLeft - track.offsetLeft, behavior: U.reduced ? 'auto' : 'smooth' });
      };
      bar.firstChild.addEventListener('click', function () { go(cur - 1); });
      bar.lastChild.addEventListener('click', function () { go(cur + 1); });
      var mark = function () {
        var best = 0, bd = 1e9;
        items.forEach(function (it, i) { var d = Math.abs(it.offsetLeft - track.offsetLeft - track.scrollLeft); if (d < bd) { bd = d; best = i; } });
        cur = best;
        Array.prototype.forEach.call(dots.children, function (d, i) { d.classList.toggle('fx-on', i === best); });
      };
      track.addEventListener('scroll', function () { U.raf(mark); }, { passive: true });
      mark();
    }
  });

  // Deux panneaux : celui qu'on survole prend presque toute la place
  FX.register('split-hover-hero', {
    setup: function (el) {
      var k = Array.prototype.slice.call(el.children);
      var set = function (i) { k.forEach(function (c, j) { c.style.setProperty('--fx-g', i === j ? U.num(el, 'fxGrow', 3) : 1); c.classList.toggle('fx-on', i === j); }); };
      k.forEach(function (c, i) {
        c.addEventListener('pointerenter', function () { set(i); });
        c.addEventListener('focusin', function () { set(i); });
      });
      el.addEventListener('pointerleave', function () { set(-1); });
    }
  });

  // Un mur dont les colonnes se remplissent et se réorganisent en douceur
  FX.register('masonry-flow', {
    setup: function (el) {
      var kids = Array.prototype.slice.call(el.children);
      var layout = function () {
        var w = el.clientWidth, gap = U.num(el, 'fxGap', 8), min = U.num(el, 'fxMin', 80);
        var cols = Math.max(1, Math.floor((w + gap) / (min + gap))), cw = (w - gap * (cols - 1)) / cols, H = new Array(cols).fill(0);
        kids.forEach(function (k) {
          k.style.width = cw + 'px';
          var c = H.indexOf(Math.min.apply(null, H));
          k.style.transform = 'translate(' + (c * (cw + gap)) + 'px,' + H[c] + 'px)';
          H[c] += k.offsetHeight + gap;
        });
        el.style.height = Math.max.apply(null, H) + 'px';
      };
      layout();
      U.onResize(layout);
      el.querySelectorAll('img').forEach(function (i) { if (!i.complete) i.addEventListener('load', layout); });
    }
  });

  // Le trait d'onglet s'étire jusqu'au suivant avant de se rétracter
  FX.register('tab-underline-ink', {
    setup: function (el) {
      var tabs = Array.prototype.slice.call(el.querySelectorAll('[role="tab"],button,a'));
      var ink = U.make('i', 'fx-ink', el);
      ink.setAttribute('aria-hidden', 'true');
      var L = 0, R = 0;
      var move = function (t, instant) {
        var r = t.getBoundingClientRect(), o = el.getBoundingClientRect();
        var nl = r.left - o.left, nr = o.right - r.right;
        var right = nl > L;
        ink.style.transitionDelay = instant ? '0s' : (right ? '.09s, 0s' : '0s, .09s');
        if (instant) ink.style.transitionDuration = '0s';
        el.style.setProperty('--fx-l', nl + 'px');
        el.style.setProperty('--fx-r', nr + 'px');
        L = nl; R = nr;
        if (instant) { void ink.offsetWidth; ink.style.transitionDuration = ''; }
      };
      tabs.forEach(function (t) {
        t.addEventListener('click', function () {
          tabs.forEach(function (o) { o.setAttribute('aria-selected', o === t); });
          move(t);
        });
      });
      var first = tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0] || tabs[0];
      if (first) { first.setAttribute('aria-selected', 'true'); move(first, true); }
      U.onResize(function () { var a = el.querySelector('[aria-selected="true"]'); if (a) move(a, true); });
    }
  });

  // Une barre d'onglets dont le renflement glisse sous l'icône active
  FX.register('mobile-tabbar-bump', {
    setup: function (el) {
      var tabs = Array.prototype.slice.call(el.querySelectorAll('button,a'));
      U.make('i', 'fx-bump', el).setAttribute('aria-hidden', 'true');
      var set = function (t) {
        tabs.forEach(function (o) { o.classList.toggle('fx-cur', o === t); if (o === t) o.setAttribute('aria-current', 'page'); else o.removeAttribute('aria-current'); });
        el.style.setProperty('--fx-x', (t.offsetLeft + t.offsetWidth / 2) + 'px');
      };
      tabs.forEach(function (t) { t.addEventListener('click', function (e) { if (t.tagName === 'A' && t.getAttribute('href') === '#') e.preventDefault(); set(t); }); });
      if (tabs[0]) set(tabs[0]);
      U.onResize(function () { var c = el.querySelector('.fx-cur'); if (c) set(c); });
    }
  });

  // Une miniature de la page montre où se trouve l'écran
  FX.register('toc-minimap', {
    setup: function (el) {
      var secs = Array.prototype.slice.call(document.querySelectorAll(el.dataset.fxTarget || 'main > section'));
      el._fxV = U.make('i', 'fx-mm-view', el);
      el._fxSecs = secs;
      el.setAttribute('role', 'navigation');
      el.setAttribute('aria-label', 'Plan de la page');
      if (!secs.length) { for (var i = 0; i < 6; i++) U.make('b', '', el).style.flex = 1 + i % 3; return; }
      var tot = document.documentElement.scrollHeight;
      secs.forEach(function (s, i) {
        var b = document.createElement('a');
        b.href = s.id ? '#' + s.id : '#';
        b.style.flex = s.offsetHeight / tot;
        b.setAttribute('aria-label', (s.querySelector('h1,h2,h3') || {}).textContent || 'Section ' + (i + 1));
        el.appendChild(b);
      });
    },
    scroll: function (el, info) {
      var tot = document.documentElement.scrollHeight;
      el._fxV.style.setProperty('--fx-t', (window.scrollY / tot * 100).toFixed(2) + '%');
      el._fxV.style.setProperty('--fx-h', Math.max(6, info.vh / tot * 100).toFixed(2) + '%');
    }
  });

  // Un menu radial qui s'ouvre sous le curseur
  FX.register('cursor-menu-ring', {
    setup: function (el) {
      var items = Array.prototype.slice.call(el.querySelectorAll('button,a')), n = items.length, cur = -1;
      items.forEach(function (b, i) {
        var a = i / n * 6.283 - 1.571;
        b.style.setProperty('--fx-x', (Math.cos(a) * U.num(el, 'fxRadius', 62)).toFixed(1) + 'px');
        b.style.setProperty('--fx-y', (Math.sin(a) * U.num(el, 'fxRadius', 62)).toFixed(1) + 'px');
        b.style.setProperty('--fx-i', i);
      });
      var open = function (x, y) {
        var o = (el.offsetParent || el.parentElement).getBoundingClientRect();
        el.style.left = (x - o.left) + 'px';
        el.style.top = (y - o.top) + 'px';
        el.classList.add('fx-open');
      };
      var close = function () { el.classList.remove('fx-open'); items.forEach(function (b) { b.classList.remove('fx-cur'); }); cur = -1; };
      var host = el.parentElement;
      host.addEventListener('contextmenu', function (e) { e.preventDefault(); open(e.clientX, e.clientY); items[0].focus({ preventScroll: true }); });
      document.addEventListener('pointerdown', function (e) { if (!el.contains(e.target)) close(); });
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') close();
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); items[(items.indexOf(document.activeElement) + 1) % n].focus(); }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); items[(items.indexOf(document.activeElement) - 1 + n) % n].focus(); }
      });
      if (el.dataset.fxDemo) { var r = el.parentElement.getBoundingClientRect(); open(r.left + r.width / 2, r.top + r.height / 2); }
      el._fxOpen = open;
    },
    trigger: function (el, e) { var r = el.parentElement.getBoundingClientRect(); el._fxOpen(r.left + r.width / 2, r.top + r.height / 2); }
  });

  // Des sections empilées comme des onglets de classeur
  FX.register('stacked-sections-tabs', {
    setup: function (el) {
      var secs = Array.prototype.slice.call(el.children), n = secs.length;
      el.style.setProperty('--fx-n', n);
      var open = function (i) {
        secs.forEach(function (s, j) {
          var on = i === j;
          s.classList.toggle('fx-open', on);
          var b = s.querySelector('button');
          if (b) b.setAttribute('aria-expanded', on);
        });
      };
      secs.forEach(function (s, i) {
        var b = s.querySelector('button');
        if (b) b.addEventListener('click', function () { open(i); });
      });
      open(0);
    }
  });

  // Des couvertures en perspective autour de l'élément central
  FX.register('carousel-3d-coverflow', {
    setup: function (el) {
      var k = Array.prototype.slice.call(el.children), cur = Math.floor(k.length / 2);
      el.tabIndex = 0;
      el.setAttribute('role', 'group');
      el.setAttribute('aria-roledescription', 'carrousel');
      var show = function () {
        k.forEach(function (c, i) {
          var d = i - cur;
          c.style.setProperty('--fx-d', d);
          c.style.setProperty('--fx-a', Math.abs(d));
          c.style.zIndex = 20 - Math.abs(d);
          c.setAttribute('aria-hidden', d !== 0);
        });
      };
      k.forEach(function (c, i) { c.addEventListener('click', function () { cur = i; show(); }); });
      el.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') { cur = Math.max(0, cur - 1); show(); }
        if (e.key === 'ArrowRight') { cur = Math.min(k.length - 1, cur + 1); show(); }
      });
      show();
    }
  });

  // Un lien d'évitement qui apparaît au clavier et emmène au contenu
  FX.register('skip-link-reveal', {
    setup: function (el) {
      el.addEventListener('click', function (e) {
        var href = el.getAttribute('href');
        if (!href || href.charAt(0) !== '#' || href.length < 2) return;
        var t = document.querySelector(href);
        if (!t) return;
        e.preventDefault();
        if (!t.hasAttribute('tabindex')) t.setAttribute('tabindex', '-1');
        t.focus({ preventScroll: true });
        t.scrollIntoView({ behavior: U.reduced ? 'auto' : 'smooth' });
      });
    }
  });

  // Un sélecteur de langue dont les sigles se croisent
  FX.register('language-switch-flip', {
    setup: function (el) {
      var langs = (el.dataset.fxLangs || 'FR|EN|ES').split('|'), cur = 0;
      el.setAttribute('aria-label', 'Choisir la langue');
      el.innerHTML = '<span class="fx-ls-now"></span>';
      var now = el.firstChild;
      var render = function (dir) {
        var s = document.createElement('span');
        s.className = 'fx-ls-in';
        s.textContent = langs[cur];
        now.innerHTML = '';
        now.appendChild(s);
      };
      render();
      el.addEventListener('click', function () {
        cur = (cur + 1) % langs.length;
        render();
        document.documentElement.lang = langs[cur].toLowerCase();
        el.dispatchEvent(new CustomEvent('fx:change', { bubbles: true, detail: { lang: langs[cur] } }));
      });
    }
  });

  // Un parcours en étapes dont la ligne avance en courant
  FX.register('progress-steps-rail', {
    setup: function (el) {
      var st = Array.prototype.slice.call(el.children), n = st.length, cur = U.num(el, 'fxStep', 0);
      U.make('i', 'fx-psr', el).setAttribute('aria-hidden', 'true');
      el._fxSet = function (i) {
        cur = U.clamp(i, 0, n - 1);
        st.forEach(function (s, j) {
          s.classList.toggle('fx-done', j < cur);
          s.classList.toggle('fx-cur', j === cur);
          if (j === cur) s.setAttribute('aria-current', 'step'); else s.removeAttribute('aria-current');
        });
        el.style.setProperty('--fx-p', n > 1 ? cur / (n - 1) : 1);
      };
      el._fxSet(cur);
      el._fxN = function () { el._fxSet((cur + 1) % n); };
    },
    trigger: function (el) { el._fxN(); }
  });
})(window.FX);

/* Pack 18 — Données et présentation */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Des barres rayonnent autour d'un centre
  FX.register('radial-bars', {
    entrance: true,
    setup: function (el) {
      var v = (el.dataset.fxValues || '40,70,55,90,35,65,80,50,75,45,60,85').split(',').map(Number), max = Math.max.apply(null, v);
      el.setAttribute('role', 'img');
      el.setAttribute('aria-label', 'Valeurs : ' + v.join(', '));
      v.forEach(function (n, i) {
        var b = U.make('i', '', el);
        b.style.setProperty('--fx-a', (i / v.length * 360) + 'deg');
        b.style.setProperty('--fx-v', n / max);
        b.style.setProperty('--fx-i', i);
      });
    }
  });

  // Une petite courbe se dessine à l'entrée
  FX.register('sparkline-draw', {
    entrance: true,
    setup: function (el) {
      var v = (el.dataset.fxValues || '12,18,14,22,19,28,24,33').split(',').map(Number);
      var mn = Math.min.apply(null, v), mx = Math.max.apply(null, v), W = 100, H = 30;
      var pt = v.map(function (n, i) { return [i / (v.length - 1) * W, H - 3 - (n - mn) / ((mx - mn) || 1) * (H - 6)]; });
      var line = 'M' + pt.map(function (p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' L');
      var last = pt[pt.length - 1];
      el.setAttribute('role', 'img');
      el.setAttribute('aria-label', 'Tendance, de ' + v[0] + ' à ' + v[v.length - 1]);
      el.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" aria-hidden="true"><path class="fx-sl-area" d="' + line + ' L' + W + ' ' + H + ' L0 ' + H + ' Z"/><path class="fx-sl-line" pathLength="1" d="' + line + '"/></svg><i style="left:' + last[0] + '%;top:' + (last[1] / H * 100) + '%"></i>';
    },
    // Les pointillés du dessin se décalent quand le tracé est étiré : on les retire une fois la courbe dessinée
    enter: function (el) { setTimeout(function () { el.classList.add('fx-drawn'); }, 1150); },
    reset: function (el) { el.classList.remove('fx-drawn'); }
  });

  // Un calendrier d'activité qui s'allume en vague
  FX.register('heat-calendar', {
    entrance: true,
    setup: function (el) {
      var w = U.num(el, 'fxWeeks', 16), vals = el.dataset.fxValues ? el.dataset.fxValues.split(',').map(Number) : null;
      el.setAttribute('role', 'img');
      el.setAttribute('aria-label', el.getAttribute('aria-label') || 'Activité sur ' + w + ' semaines');
      el.style.setProperty('--fx-w', w);
      for (var i = 0; i < w * 7; i++) {
        var c = U.make('i', '', el);
        var col = Math.floor(i / 7);
        var v = vals ? (vals[i] || 0) : Math.pow(Math.random(), 2.2);
        c.style.setProperty('--fx-v', v.toFixed(2));
        c.style.setProperty('--fx-d', (col * 28 + (i % 7) * 12) + 'ms');
      }
    }
  });

  // Une barre répartie en segments avec sa légende
  FX.register('stacked-progress', {
    entrance: true,
    setup: function (el) {
      var parts = (el.dataset.fxParts || 'Design:40,Code:35,Son:25').split(',').map(function (s) { var p = s.split(':'); return { n: p[0], v: parseFloat(p[1]) }; });
      var sum = parts.reduce(function (a, p) { return a + p.v; }, 0);
      var bar = U.make('div', 'fx-sp-bar', el), leg = U.make('ul', 'fx-sp-leg', el);
      bar.setAttribute('aria-hidden', 'true');
      parts.forEach(function (p, i) {
        var s = U.make('i', '', bar);
        s.style.setProperty('--fx-w', p.v / sum);
        s.style.setProperty('--fx-i', i);
        var li = U.make('li', '', leg);
        li.style.setProperty('--fx-i', i);
        li.textContent = p.n + ' ' + Math.round(p.v / sum * 100) + ' %';
      });
    }
  });

  // Deux valeurs face à face, chacune pousse depuis son côté
  FX.register('versus-bars', {
    entrance: true,
    setup: function (el) {
      var a = U.num(el, 'fxA', 62), b = U.num(el, 'fxB', 38), na = el.dataset.fxNameA || 'Avant', nb = el.dataset.fxNameB || 'Après';
      el.innerHTML = '<div class="fx-vs-l"><b>' + a + '</b><span>' + na + '</span></div><div class="fx-vs-r"><span>' + nb + '</span><b>' + b + '</b></div><div class="fx-vs-bar"><i class="a"></i><i class="b"></i></div>';
      el.style.setProperty('--fx-a', a / (a + b));
      el.classList.add(a >= b ? 'fx-a-wins' : 'fx-b-wins');
    }
  });

  // Un cadran dont l'aiguille monte et oscille un instant
  FX.register('gauge-needle', {
    entrance: true,
    setup: function (el) {
      el.setAttribute('role', 'meter');
      var v = U.num(el, 'fxValue', 72), max = U.num(el, 'fxMax', 100);
      el.setAttribute('aria-valuenow', v); el.setAttribute('aria-valuemin', 0); el.setAttribute('aria-valuemax', max);
      el.innerHTML = '<svg viewBox="0 0 120 70" aria-hidden="true"><path class="bg" pathLength="1" d="M10 62 A50 50 0 0 1 110 62"/><path class="on" pathLength="1" d="M10 62 A50 50 0 0 1 110 62"/><g class="nd"><line x1="60" y1="62" x2="60" y2="20"/><circle cx="60" cy="62" r="4"/></g></svg><b>' + v + '</b>';
      el._fxQ = v / max;
    },
    reset: function (el) { el.style.setProperty('--fx-q', 0); },
    enter: function (el) {
      var q = el._fxQ;
      U.tween(el, 1100, function (p) {
        var o = 1 - Math.pow(1 - p, 3), wob = Math.sin(p * 12) * (1 - p) * .05;
        el.style.setProperty('--fx-q', (q * o + wob * q).toFixed(4));
      });
    }
  });

  // Un classement dont les lignes se dépassent
  FX.register('rank-race', {
    setup: function (el) {
      var rows = (el.dataset.fxItems || 'Atlas:40,Brume:55,Halo:30,Ocre:65,Verdure:48').split(',').map(function (s) {
        var p = s.split(':'), r = U.make('div', 'fx-rr', el);
        r.innerHTML = '<span></span><i></i><b></b>';
        r.firstChild.textContent = p[0];
        return { el: r, v: parseFloat(p[1]) };
      });
      el.style.setProperty('--fx-count', rows.length);
      var draw = function () {
        var mx = Math.max.apply(null, rows.map(function (r) { return r.v; }));
        rows.slice().sort(function (a, b) { return b.v - a.v; }).forEach(function (r, i) {
          r.el.style.setProperty('--fx-rank', i);
          r.el.style.setProperty('--fx-w', r.v / mx);
          r.el.lastChild.textContent = Math.round(r.v);
        });
      };
      draw();
      el._fxRows = rows; el._fxDraw = draw; el._fxT = 0;
    },
    tick: function (el, dt) {
      if (U.reduced) return;
      el._fxT += dt;
      if (el._fxT < U.num(el, 'fxEvery', 1.1)) return;
      el._fxT = 0;
      el._fxRows.forEach(function (r) { r.v = Math.max(5, r.v + U.rand(-4, 12)); });
      el._fxDraw();
    }
  });

  // Une frise où chaque date affiche son histoire
  FX.register('timeline-scrub', {
    setup: function (el) {
      var items = Array.prototype.slice.call(el.children);
      var rail = U.make('div', 'fx-ts-rail', el), out = U.make('div', 'fx-ts-out', el);
      rail.setAttribute('role', 'tablist');
      out.setAttribute('aria-live', 'polite');
      var dots = items.map(function (it, i) {
        it.hidden = true;
        var b = U.make('button', '', rail);
        b.type = 'button';
        b.setAttribute('role', 'tab');
        b.textContent = it.dataset.date || i + 1;
        b.style.setProperty('--fx-x', items.length > 1 ? i / (items.length - 1) : 0);
        b.addEventListener('click', function () { set(i); });
        b.addEventListener('pointerenter', function () { set(i); });
        return b;
      });
      var set = function (i) {
        dots.forEach(function (d, k) { d.setAttribute('aria-selected', k === i); d.tabIndex = k === i ? 0 : -1; });
        rail.style.setProperty('--fx-p', items.length > 1 ? i / (items.length - 1) : 0);
        out.innerHTML = '';
        var c = items[i].cloneNode(true);
        c.hidden = false;
        c.className = 'fx-ts-in';
        out.appendChild(c);
      };
      rail.addEventListener('keydown', function (e) {
        var i = dots.indexOf(document.activeElement);
        if (e.key === 'ArrowRight' && dots[i + 1]) { set(i + 1); dots[i + 1].focus(); }
        if (e.key === 'ArrowLeft' && dots[i - 1]) { set(i - 1); dots[i - 1].focus(); }
      });
      set(0);
    }
  });

  // Des bobines de chiffres tournent et s'arrêtent sur le nombre
  FX.register('number-ticker-reel', {
    entrance: true,
    setup: function (el) {
      var txt = (el.dataset.fxValue || el.textContent).trim();
      el.setAttribute('aria-label', txt);
      el.textContent = '';
      Array.from(txt).forEach(function (ch, i) {
        var box = U.make('span', 'fx-ntr', el);
        box.setAttribute('aria-hidden', 'true');
        if (!/\d/.test(ch)) { box.textContent = ch; box.classList.add('fx-ntr-fix'); return; }
        var col = U.make('span', 'fx-ntr-col', box), s = '';
        for (var k = 0; k < 20; k++) s += k % 10 + '\n';
        col.textContent = s + ch;
        col.style.setProperty('--fx-i', i);
      });
    }
  });

  // Une pile de témoignages dont la première carte part au fond
  FX.register('quote-card-shuffle', {
    setup: function (el) {
      el._fxT = 0;
      el._fxOrder = function () { Array.prototype.forEach.call(el.children, function (c, i) { c.style.setProperty('--fx-pos', i); c.style.zIndex = 30 - i; c.setAttribute('aria-hidden', i > 0); }); };
      el._fxOrder();
      el._fxNext = function () {
        var f = el.firstElementChild;
        f.classList.add('fx-out');
        setTimeout(function () { f.classList.remove('fx-out'); el.appendChild(f); el._fxOrder(); }, 420);
      };
      el.addEventListener('click', el._fxNext);
    },
    trigger: function (el) { el._fxNext(); },
    tick: function (el, dt) {
      if (U.reduced || el.matches(':hover')) return;
      el._fxT += dt;
      if (el._fxT > U.num(el, 'fxHold', 3.5)) { el._fxT = 0; el._fxNext(); }
    }
  });

  // Des cartes de tarifs dont les prix suivent la bascule annuelle
  FX.register('pricing-toggle-cards', {
    setup: function (el) {
      var tog = el.querySelector('input[type="checkbox"]'), prices = el.querySelectorAll('[data-month]');
      if (!tog) return;
      var render = function () {
        prices.forEach(function (p) {
          var to = parseFloat(tog.checked ? p.dataset.year : p.dataset.month), from = parseFloat(p.textContent) || to;
          U.tween(p, 450, function (k) { p.textContent = Math.round(U.lerp(from, to, U.easeOut(k))); });
        });
        el.classList.toggle('fx-year', tog.checked);
      };
      prices.forEach(function (p) { p.textContent = p.dataset.month; });
      tog.addEventListener('change', render);
    }
  });

  // Une liste de fonctions dont l'élément actif change et se remplit
  FX.register('feature-orbit-card', {
    setup: function (el) {
      var k = Array.prototype.slice.call(el.children), cur = 0;
      el._fxT = 0; el._fxD = U.num(el, 'fxHold', 3.2);
      var set = function (i) { cur = i; el._fxT = 0; k.forEach(function (c, j) { c.classList.toggle('fx-cur', j === i); if (j === i) c.setAttribute('aria-current', 'true'); else c.removeAttribute('aria-current'); }); };
      k.forEach(function (c, i) { c.tabIndex = 0; c.addEventListener('pointerenter', function () { set(i); }); c.addEventListener('focus', function () { set(i); }); U.make('i', 'fx-foc', c).setAttribute('aria-hidden', 'true'); });
      set(0);
      el._fxNext = function () { set((cur + 1) % k.length); };
      el._fxCur = function () { return k[cur]; };
    },
    tick: function (el, dt) {
      if (U.reduced || el.matches(':hover')) return;
      el._fxT += dt;
      el._fxCur().style.setProperty('--fx-q', Math.min(1, el._fxT / el._fxD).toFixed(3));
      if (el._fxT >= el._fxD) el._fxNext();
    }
  });

  // Un mur de logos dont les cases se retournent une à une
  FX.register('logo-wall-flip', {
    setup: function (el) {
      var all = (el.dataset.fxLogos || 'Atlas|Brume|Halo|Ocre|Verdure|Nord|Sable|Iris|Onde').split('|'), n = U.num(el, 'fxCells', 6);
      el.style.setProperty('--fx-cells', Math.ceil(n / 2));
      el.setAttribute('aria-label', 'Références : ' + all.join(', '));
      el.setAttribute('role', 'img');
      var cells = [];
      for (var i = 0; i < n; i++) { var c = U.make('span', '', el); c.setAttribute('aria-hidden', 'true'); c.textContent = all[i % all.length]; cells.push(c); }
      el._fxC = cells; el._fxNx = n; el._fxAll = all; el._fxT = 0;
    },
    tick: function (el, dt) {
      if (U.reduced) return;
      el._fxT += dt;
      if (el._fxT < U.num(el, 'fxEvery', 1.1)) return;
      el._fxT = 0;
      var c = el._fxC[Math.floor(Math.random() * el._fxC.length)], t = el._fxAll[el._fxNx++ % el._fxAll.length];
      c.classList.add('fx-flip');
      setTimeout(function () { c.textContent = t; }, 220);
      setTimeout(function () { c.classList.remove('fx-flip'); }, 460);
    }
  });

  // Un grand chiffre monte pendant que son libellé se dévoile
  FX.register('stat-reveal-split', {
    entrance: true,
    setup: function (el) {
      var v = U.num(el, 'fxValue', 87), s = el.dataset.fxSuffix || '%', l = el.dataset.fxLabel || '';
      el.innerHTML = '<b></b><span></span>';
      el.lastChild.textContent = l;
      el.setAttribute('aria-label', v + ' ' + s + ' ' + l);
      el._fxW = function (p) { el.firstChild.textContent = Math.round(v * U.easeOut(p)) + s; };
      el._fxW(0);
    },
    reset: function (el) { el._fxW(0); },
    enter: function (el) { U.tween(el, 1200, el._fxW); }
  });

  // Une carte en points avec des épingles qui s'allument
  FX.register('world-pins', {
    entrance: true,
    setup: function (el) {
      var pins = (el.dataset.fxPins || '48,2;40,-74;35,139;-23,-46;51,0;1,103').split(';').map(function (s) { return s.split(',').map(Number); });
      el.setAttribute('role', 'img');
      el.setAttribute('aria-label', el.getAttribute('aria-label') || pins.length + ' implantations dans le monde');
      var svg = '<svg viewBox="0 0 360 170" aria-hidden="true">';
      // Grandes masses de terre approximées par des ellipses : suffisant pour un décor en points
      var land = [[-100, 45, 50, 25], [-60, -15, 22, 32], [15, 50, 25, 15], [20, 5, 26, 32], [90, 45, 62, 25], [135, -25, 20, 12]];
      for (var y = -60; y <= 80; y += 6) for (var x = -170; x <= 175; x += 6) {
        if (land.some(function (l) { var dx = (x - l[0]) / l[2], dy = (y - l[1]) / l[3]; return dx * dx + dy * dy < 1; })) svg += '<circle class="d" cx="' + (x + 180) + '" cy="' + (85 - y) + '" r="1.2"/>';
      }
      pins.forEach(function (p, i) { svg += '<g class="p" style="--fx-i:' + i + ';transform-origin:' + (p[1] + 180) + 'px ' + (85 - p[0]) + 'px"><circle cx="' + (p[1] + 180) + '" cy="' + (85 - p[0]) + '" r="3"/><circle class="r" cx="' + (p[1] + 180) + '" cy="' + (85 - p[0]) + '" r="3"/></g>'; });
      el.innerHTML = svg + '</svg>';
    }
  });

  // Dans un tableau, la colonne survolée s'illumine en entier
  FX.register('compare-table-sweep', {
    setup: function (el) {
      var cells = el.querySelectorAll('th,td'), best = U.num(el, 'fxBest', -1);
      var mark = function (i) { cells.forEach(function (c) { c.classList.toggle('fx-col', c.cellIndex === i); }); };
      cells.forEach(function (c) {
        c.addEventListener('pointerenter', function () { if (c.cellIndex > 0) mark(c.cellIndex); });
        c.addEventListener('focusin', function () { if (c.cellIndex > 0) mark(c.cellIndex); });
      });
      el.addEventListener('pointerleave', function () { mark(best); });
      mark(best);
    }
  });

  // Un itinéraire se dessine au fil du défilement et allume ses étapes
  FX.register('map-route-draw', {
    setup: function (el) {
      var path = el.querySelector('path');
      if (!path) return;
      var L = path.getTotalLength();
      path.style.strokeDasharray = L;
      el._fxP = path; el._fxL = L;
      el._fxS = Array.prototype.slice.call(el.querySelectorAll('[data-at]')).map(function (d) { return { d: d, at: parseFloat(d.dataset.at) }; });
    },
    scroll: function (el, info) {
      if (!el._fxP) return;
      var q = el.dataset.fxDemo ? .72 : info.enter;
      el._fxP.style.strokeDashoffset = (el._fxL * (1 - q)).toFixed(1);
      el._fxS.forEach(function (s) { s.d.classList.toggle('fx-on', q >= s.at); });
    }
  });

  // Une rangée de visages, dont celui survolé s'agrandit et se présente
  FX.register('team-card-spotlight', {
    setup: function (el) {
      var k = Array.prototype.slice.call(el.children);
      var cap = document.createElement('div');
      cap.className = 'fx-tc-cap';
      cap.setAttribute('aria-live', 'polite');
      el.appendChild(cap);
      var set = function (c) {
        k.forEach(function (o) { o.classList.toggle('fx-on', o === c); });
        cap.textContent = (c.dataset.name || '') + (c.dataset.role ? ' — ' + c.dataset.role : '');
      };
      k.forEach(function (c) {
        c.tabIndex = 0;
        c.addEventListener('pointerenter', function () { set(c); });
        c.addEventListener('focus', function () { set(c); });
      });
      set(k[0]);
    }
  });

  // Un journal des nouveautés, filtrable par type
  FX.register('changelog-feed', {
    entrance: true,
    setup: function (el) {
      var items = Array.prototype.slice.call(el.children), types = [];
      items.forEach(function (it, i) {
        it.style.setProperty('--fx-i', i);
        if (it.dataset.type && types.indexOf(it.dataset.type) < 0) types.push(it.dataset.type);
      });
      if (!types.length) return;
      var bar = document.createElement('div');
      bar.className = 'fx-cf-bar';
      el.parentNode.insertBefore(bar, el);
      ['Tout'].concat(types).forEach(function (t, k) {
        var b = U.make('button', '', bar);
        b.type = 'button';
        b.textContent = t;
        b.setAttribute('aria-pressed', k === 0);
        b.addEventListener('click', function () {
          bar.querySelectorAll('button').forEach(function (o) { o.setAttribute('aria-pressed', o === b); });
          items.forEach(function (it) { it.hidden = !(k === 0 || it.dataset.type === t); });
        });
      });
    }
  });
})(window.FX);

/* Pack 19 — États et interfaces d'IA */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Un agent parcourt un graphe d'étapes, nœud après nœud
  FX.register('agent-graph', {
    entrance: true,
    setup: function (el) {
      var names = (el.dataset.fxSteps || 'Lire|Chercher|Écrire|Vérifier').split('|');
      el.setAttribute('role', 'list');
      el._fxN = names.map(function (n, i) {
        var d = U.make('span', 'fx-ag', el);
        d.setAttribute('role', 'listitem');
        d.textContent = n;
        d.style.setProperty('--fx-i', i);
        return d;
      });
    },
    reset: function (el) { el._fxRun2 = (el._fxRun2 || 0) + 1; el._fxN.forEach(function (d) { d.classList.remove('fx-on', 'fx-ok'); }); },
    enter: function (el) {
      var run = el._fxRun2 = (el._fxRun2 || 0) + 1, i = 0, step = U.num(el, 'fxStep', 800);
      if (U.reduced) { el._fxN.forEach(function (d) { d.classList.add('fx-ok'); }); return; }
      (function next() {
        if (run !== el._fxRun2) return;
        if (i) { el._fxN[i - 1].classList.remove('fx-on'); el._fxN[i - 1].classList.add('fx-ok'); }
        if (i >= el._fxN.length) { el.dispatchEvent(new CustomEvent('fx:done', { bubbles: true })); return; }
        el._fxN[i++].classList.add('fx-on');
        setTimeout(next, step);
      })();
    }
  });

  // Une onde vocale qui réagit quand l'assistant écoute
  FX.register('voice-wave', {
    setup: function (el) {
      el.setAttribute('role', 'img');
      el.setAttribute('aria-label', el.getAttribute('aria-label') || "L'assistant écoute");
      el._fxB = [];
      for (var i = 0; i < U.num(el, 'fxBars', 13); i++) el._fxB.push(U.make('i', '', el));
    },
    tick: function (el, dt, t) {
      if (U.reduced) return;
      var level = typeof el.fxLevel === 'number' ? el.fxLevel : .5 + .5 * Math.sin(t * .0023) * Math.sin(t * .0007);
      var n = el._fxB.length;
      el._fxB.forEach(function (b, i) {
        var env = Math.sin((i + .5) / n * 3.14);
        var v = .12 + env * level * (.5 + .5 * Math.sin(t * .012 + i * 1.3));
        b.style.transform = 'scaleY(' + v.toFixed(3) + ')';
      });
    }
  });

  // Des sources numérotées s'ouvrent dans le texte d'une réponse
  FX.register('citation-pop', {
    setup: function (el) {
      el.querySelectorAll('[data-source]').forEach(function (c, i) {
        var n = i + 1, a = document.createElement('a');
        a.className = 'fx-cite';
        a.href = c.getAttribute('href') || '#';
        a.textContent = n;
        a.setAttribute('aria-label', 'Source ' + n + ' : ' + c.dataset.source);
        var tip = U.make('span', 'fx-cite-tip', a);
        tip.textContent = c.dataset.source;
        tip.setAttribute('aria-hidden', 'true');
        a.style.setProperty('--fx-i', i);
        c.replaceWith(a);
      });
    }
  });

  // Une petite barre dit à quel point la réponse est sûre
  FX.register('confidence-meter', {
    entrance: true,
    setup: function (el) {
      var v = U.clamp(U.num(el, 'fxValue', 72), 0, 100);
      var lvl = v >= 75 ? 'Élevée' : v >= 40 ? 'Moyenne' : 'Faible';
      el.classList.add('fx-lvl-' + (v >= 75 ? 'h' : v >= 40 ? 'm' : 'l'));
      el.setAttribute('role', 'meter');
      el.setAttribute('aria-valuenow', v); el.setAttribute('aria-valuemin', 0); el.setAttribute('aria-valuemax', 100);
      el.setAttribute('aria-label', 'Confiance');
      el.innerHTML = '<span>Confiance : ' + lvl + '</span><i><b></b></i>';
      el.style.setProperty('--fx-v', v / 100);
    }
  });

  // Un texte montre ce qui a été retiré puis ajouté
  FX.register('diff-reveal', {
    entrance: true,
    setup: function (el) {
      el.querySelectorAll('del,ins').forEach(function (d, i) { d.style.setProperty('--fx-i', i); });
    }
  });

  // De petites étiquettes montrent ce que l'assistant est en train de lire
  FX.register('context-chips', {
    entrance: true,
    setup: function (el) {
      el._fxList = (el.dataset.fxItems || 'rapport.pdf|notes.md|budget.xlsx').split('|');
      el.setAttribute('aria-live', 'polite');
    },
    reset: function (el) { el._fxK = (el._fxK || 0) + 1; el.textContent = ''; },
    enter: function (el) {
      var run = el._fxK = (el._fxK || 0) + 1, i = 0;
      el.textContent = '';
      (function add() {
        if (run !== el._fxK || i >= el._fxList.length) return;
        var s = U.make('span', 'fx-cc', el);
        s.textContent = el._fxList[i++];
        if (U.reduced) add(); else setTimeout(add, U.num(el, 'fxStep', 500));
      })();
    }
  });

  // Le squelette de chargement se fond dans le vrai contenu
  FX.register('skeleton-morph', {
    entrance: true,
    setup: function (el) {
      el.setAttribute('aria-busy', 'true');
      el._fxDone = function () { el.classList.add('fx-ready'); el.setAttribute('aria-busy', 'false'); };
    },
    reset: function (el) { clearTimeout(el._fxTo); el.classList.remove('fx-ready'); el.setAttribute('aria-busy', 'true'); },
    enter: function (el) { el._fxTo = setTimeout(el._fxDone, U.num(el, 'fxWait', 1500)); }
  });

  // Du code s'écrit tout seul, avec une coloration simple
  FX.register('streaming-code', {
    entrance: true,
    setup: function (el) {
      el._fxSrc = el.textContent.replace(/^\n/, '');
      el.setAttribute('aria-label', el._fxSrc);
      if (!U.reduced) el.textContent = '';
    },
    reset: function (el) { el._fxS = (el._fxS || 0) + 1; el.textContent = ''; },
    enter: function (el) {
      var run = el._fxS = (el._fxS || 0) + 1, src = el._fxSrc, i = 0;
      var esc = function (s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;'); };
      var hl = function (s) {
        return esc(s).replace(/(\/\/.*)|('[^']*'?|"[^"]*"?)|\b(function|const|let|var|return|if|else|for|await|async|import|from)\b/g, function (m, c, q, k) {
          return '<span class="' + (c ? 'c' : q ? 's' : 'k') + '">' + m + '</span>';
        });
      };
      if (U.reduced) { el.innerHTML = hl(src); return; }
      (function next() {
        if (run !== el._fxS) return;
        i = Math.min(src.length, i + 1 + Math.floor(Math.random() * 3));
        el.innerHTML = hl(src.slice(0, i)) + (i < src.length ? '<i class="fx-cur"></i>' : '');
        if (i < src.length) setTimeout(next, U.num(el, 'fxSpeed', 22));
        else el.dispatchEvent(new CustomEvent('fx:done', { bubbles: true }));
      })();
    }
  });

  // Une file d'attente qui avance, avec la place restante
  FX.register('queue-position', {
    setup: function (el) {
      var start = U.num(el, 'fxStart', 6);
      el.setAttribute('role', 'status');
      el.innerHTML = '<div class="fx-q-row"></div><span></span>';
      var row = el.firstChild;
      for (var i = 0; i < start; i++) U.make('i', '', row);
      el._fxQ = { n: start - 1, t: 0, row: row, msg: el.lastChild };
      el._fxPaint = function () {
        var q = el._fxQ;
        Array.prototype.forEach.call(row.children, function (d, i) { d.classList.toggle('fx-me', i === q.n); d.classList.toggle('fx-gone', i > q.n); });
        q.msg.textContent = q.n > 0 ? q.n + (q.n > 1 ? ' personnes devant vous' : ' personne devant vous') : "C'est à vous !";
      };
      el._fxPaint();
    },
    tick: function (el, dt) {
      if (U.reduced) return;
      var q = el._fxQ;
      q.t += dt;
      if (q.t < U.num(el, 'fxEvery', 1.4)) return;
      q.t = 0;
      if (q.n > 0) {
        q.n--;
        el._fxPaint();
        if (!q.n) el.dispatchEvent(new CustomEvent('fx:ready', { bubbles: true }));
      } else if (el.dataset.fxLoop === 'true') { q.n = q.row.children.length - 1; el._fxPaint(); }
    }
  });

  // Un champ refuse avec une secousse et explique pourquoi
  FX.register('error-glitch-shake', {
    trigger: function (el, e) {
      var msg = el.dataset.fxError || 'Cette valeur ne convient pas.', box = el.querySelector('.fx-eg-msg');
      if (!box) { box = U.make('span', 'fx-eg-msg', el); box.setAttribute('role', 'alert'); }
      box.textContent = msg;
      var input = el.querySelector('input,textarea,select');
      if (input) { input.setAttribute('aria-invalid', 'true'); input.focus({ preventScroll: true }); }
      el.classList.remove('fx-err'); void el.offsetWidth; el.classList.add('fx-err');
    },
    setup: function (el) {
      var input = el.querySelector('input,textarea,select');
      if (input) input.addEventListener('input', function () { el.classList.remove('fx-err'); input.removeAttribute('aria-invalid'); var b = el.querySelector('.fx-eg-msg'); if (b) b.textContent = ''; });
    }
  });

  // Un tampon « Validé » s'écrase sur l'élément
  FX.register('success-stamp', {
    setup: function (el) {
      U.ensurePositioned(el);
      var s = el._fxS = U.make('span', 'fx-stamp', el);
      s.textContent = el.dataset.fxStamp || 'Validé';
      s.setAttribute('role', 'status');
      s.style.setProperty('--fx-r', U.rand(-14, -6).toFixed(1) + 'deg');
      if (el.dataset.fxAuto === 'true') FX.trigger(el);
    },
    triggerOn: 'fx:ok',
    trigger: function (el) { el._fxS.classList.remove('fx-on'); void el._fxS.offsetWidth; el._fxS.classList.add('fx-on'); el.classList.add('fx-stamped'); setTimeout(function () { el.classList.remove('fx-stamped'); }, 260); }
  });

  // Faire glisser pour confirmer une action
  FX.register('unlock-slide', {
    setup: function (el) {
      var label = el.dataset.fxLabel || 'Glisser pour confirmer';
      el.innerHTML = '<span class="fx-us-t"></span><button type="button" aria-label="' + label + '">→</button>';
      el.firstChild.textContent = label;
      var b = el.lastChild, sx = 0, x = 0, drag = false;
      var max = function () { return el.clientWidth - b.offsetWidth - 8; };
      var pos = function (v) { x = v; el.style.setProperty('--fx-x', v + 'px'); el.style.setProperty('--fx-p', max() ? (v / max()).toFixed(3) : 0); };
      var done = function () {
        el.classList.add('fx-done');
        el.firstChild.textContent = el.dataset.fxDone || 'Confirmé';
        pos(max());
        el.dispatchEvent(new CustomEvent('fx:unlock', { bubbles: true }));
      };
      b.addEventListener('pointerdown', function (e) { if (el.classList.contains('fx-done')) return; drag = true; sx = e.clientX - x; el.classList.add('fx-drag'); if (e.isTrusted) b.setPointerCapture(e.pointerId); });
      b.addEventListener('pointermove', function (e) { if (drag) pos(U.clamp(e.clientX - sx, 0, max())); });
      b.addEventListener('pointerup', function () { if (!drag) return; drag = false; el.classList.remove('fx-drag'); if (x > max() * .86) done(); else pos(0); });
      b.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); done(); } });
    }
  });

  // Une zone de dépôt qui réagit à l'arrivée de fichiers
  FX.register('upload-drop', {
    setup: function (el) {
      var input = el.querySelector('input[type="file"]');
      var list = U.make('ul', 'fx-ud-list', el);
      var take = function (files) {
        Array.prototype.forEach.call(files, function (f) { var li = U.make('li', '', list); li.textContent = f.name; });
        el.dispatchEvent(new CustomEvent('fx:files', { bubbles: true, detail: { files: files } }));
      };
      ['dragenter', 'dragover'].forEach(function (n) { el.addEventListener(n, function (e) { e.preventDefault(); el.classList.add('fx-over'); }); });
      ['dragleave', 'drop'].forEach(function (n) { el.addEventListener(n, function (e) { e.preventDefault(); el.classList.remove('fx-over'); }); });
      el.addEventListener('drop', function (e) { if (e.dataTransfer) take(e.dataTransfer.files); });
      if (input) input.addEventListener('change', function () { take(input.files); });
    }
  });

  // Un bandeau descend quand la connexion se perd
  FX.register('offline-banner', {
    setup: function (el) {
      el.setAttribute('role', 'status');
      var off = el.dataset.fxOff || 'Vous êtes hors ligne. Vos changements seront envoyés au retour.', on = el.dataset.fxOn || 'De nouveau en ligne.', to;
      var sync = function (state) {
        clearTimeout(to);
        el.textContent = state ? on : off;
        el.classList.add('fx-show');
        el.classList.toggle('fx-ok', state);
        if (state) to = setTimeout(function () { el.classList.remove('fx-show'); }, 2500);
      };
      window.addEventListener('offline', function () { sync(false); });
      window.addEventListener('online', function () { sync(true); });
      if (!navigator.onLine) sync(false);
      el._fxSync = sync; el._fxState = false;
    },
    trigger: function (el) { el._fxSync(el._fxState); el._fxState = !el._fxState; }
  });

  // Une pile qui se remplit et signale un niveau faible
  FX.register('battery-level', {
    entrance: true,
    setup: function (el) {
      var v = U.clamp(U.num(el, 'fxValue', 68), 0, 100);
      el.setAttribute('role', 'meter');
      el.setAttribute('aria-valuenow', v); el.setAttribute('aria-valuemin', 0); el.setAttribute('aria-valuemax', 100);
      el.setAttribute('aria-label', 'Niveau');
      el.innerHTML = '<i></i><b>' + v + ' %</b>';
      el.style.setProperty('--fx-v', v / 100);
      el.classList.toggle('fx-low', v < U.num(el, 'fxLow', 20));
      el.classList.toggle('fx-charge', el.dataset.fxCharging === 'true');
    }
  });

  // « Noa est en train d'écrire… », avec l'accord selon le nombre
  FX.register('typing-indicator-name', {
    setup: function (el) {
      el.setAttribute('role', 'status');
      el._fxSet = function (names) {
        var t = !names.length ? '' : names.length === 1 ? names[0] + " est en train d'écrire" : names.length === 2 ? names[0] + ' et ' + names[1] + " sont en train d'écrire" : names.length + " personnes sont en train d'écrire";
        el.innerHTML = t ? '<span></span><i></i><i></i><i></i>' : '';
        if (t) el.firstChild.textContent = t;
      };
      el._fxSet((el.dataset.fxNames || 'Noa').split('|').filter(Boolean));
      el._fxI = 0;
    },
    trigger: function (el) {
      var seq = [['Noa'], ['Noa', 'Sam'], ['Noa', 'Sam', 'Lou'], []];
      el._fxSet(seq[el._fxI++ % seq.length]);
    }
  });

  // Une pastille discrète indique l'enregistrement automatique
  FX.register('save-pill', {
    setup: function (el) {
      el.setAttribute('role', 'status');
      el._fxSt = function (s) {
        var msg = { saving: 'Enregistrement…', saved: 'Enregistré', error: 'Échec, nouvel essai…', idle: '' };
        el.dataset.fxState = s;
        el.textContent = msg[s];
      };
      el._fxSt('idle');
      el._fxC = 0;
    },
    trigger: function (el) {
      clearTimeout(el._fxTo);
      el._fxSt('saving');
      var fail = el.dataset.fxDemo && ++el._fxC % 3 === 0;
      el._fxTo = setTimeout(function () {
        el._fxSt(fail ? 'error' : 'saved');
        el._fxTo = setTimeout(function () { el._fxSt(fail ? 'saving' : 'idle'); if (fail) el._fxTo = setTimeout(function () { el._fxSt('saved'); }, 700); }, 1500);
      }, 800);
    },
    tick: function (el, dt) {
      if (!el.dataset.fxDemo || U.reduced) return;
      el._fxW = (el._fxW || 3) + dt;
      if (el._fxW > 3.6) { el._fxW = 0; FX.trigger(el); }
    }
  });

  // Une illustration flotte doucement quand il n'y a rien à afficher
  FX.register('empty-state-float', {
    setup: function (el) {
      var s = el._fxS = { x: 0, y: 0, tx: 0, ty: 0 };
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        s.tx = ((e.clientX - r.left) / r.width - .5) * 12;
        s.ty = ((e.clientY - r.top) / r.height - .5) * 12;
      });
      el.addEventListener('pointerleave', function () { s.tx = s.ty = 0; });
    },
    tick: function (el, dt, t) {
      if (U.reduced) return;
      var s = el._fxS;
      s.x = U.lerp(s.x, s.tx, .06); s.y = U.lerp(s.y, s.ty, .06);
      el.style.setProperty('--fx-x', s.x.toFixed(1) + 'px');
      el.style.setProperty('--fx-y', (s.y + Math.sin(t * .0016) * 6).toFixed(1) + 'px');
      el.style.setProperty('--fx-shadow', (1 - (Math.sin(t * .0016) + 1) * .12).toFixed(3));
    }
  });

  // Plusieurs tâches avancent, chacune à son rythme
  FX.register('multi-file-progress', {
    setup: function (el) {
      var names = (el.dataset.fxItems || 'photos.zip|contrat.pdf|notes.md').split('|');
      el._fxRows = names.map(function (n) {
        var r = U.make('div', 'fx-mf', el);
        r.innerHTML = '<span></span><i role="progressbar" aria-valuemin="0" aria-valuemax="100"><b></b></i><em></em>';
        r.firstChild.textContent = n;
        r.children[1].setAttribute('aria-label', n);
        return { el: r, p: 0, s: U.rand(.1, .4) };
      });
      el._fxSet = function (i, v) {
        var r = el._fxRows[i];
        r.p = U.clamp(v, 0, 1);
        r.el.style.setProperty('--fx-v', r.p);
        r.el.children[1].setAttribute('aria-valuenow', Math.round(r.p * 100));
        r.el.lastChild.textContent = r.p >= 1 ? '✓' : Math.round(r.p * 100) + ' %';
        r.el.classList.toggle('fx-ok', r.p >= 1);
      };
      el._fxRows.forEach(function (r, i) { el._fxSet(i, 0); });
      el._fxWait = 0;
    },
    tick: function (el, dt) {
      if (U.reduced || el.dataset.fxManual === 'true') return;
      var all = true;
      el._fxRows.forEach(function (r, i) { if (r.p < 1) { all = false; el._fxSet(i, r.p + r.s * dt); } });
      if (all && (el._fxWait += dt) > 2) { el._fxWait = 0; el._fxRows.forEach(function (r, i) { el._fxSet(i, 0); }); }
    }
  });

  // Des notifications s'empilent et se serrent
  FX.register('notification-stack', {
    setup: function (el) {
      el.setAttribute('role', 'log');
      el.setAttribute('aria-live', 'polite');
      el._fxPush = function (text) {
        var n = U.make('div', 'fx-ns', el);
        n.textContent = text;
        var x = U.make('button', '', n);
        x.type = 'button'; x.textContent = '×'; x.setAttribute('aria-label', 'Fermer');
        var bye = function () { n.classList.add('fx-out'); setTimeout(function () { n.remove(); order(); }, 280); };
        x.addEventListener('click', bye);
        setTimeout(bye, U.num(el, 'fxLife', 4500));
        order();
      };
      var order = function () {
        var k = el.children, max = U.num(el, 'fxMax', 3);
        for (var i = 0; i < k.length; i++) { var d = k.length - 1 - i; k[i].style.setProperty('--fx-d', d); k[i].classList.toggle('fx-hide', d >= max); }
      };
      el._fxN = 0;
    },
    trigger: function (el) {
      var msgs = ['Fichier enregistré', 'Nouvelle réponse', 'Export terminé', 'Rappel dans 5 minutes'];
      el._fxPush(msgs[el._fxN++ % msgs.length]);
    },
    tick: function (el, dt) {
      if (el.dataset.fxDemo !== 'true' || U.reduced) return;
      el._fxT = (el._fxT || 1.2) + dt;
      if (el._fxT > 1.4) { el._fxT = 0; FX.trigger(el); }
    }
  });

  // Des suggestions qui remplissent le champ d'une IA
  FX.register('prompt-suggestions', {
    setup: function (el) {
      Array.prototype.forEach.call(el.children, function (b, i) {
        b.style.setProperty('--fx-i', i);
        b.addEventListener('click', function () {
          var target = el.dataset.fxTarget && document.querySelector(el.dataset.fxTarget);
          var text = b.dataset.prompt || b.textContent.trim();
          if (target) { target.value = text; target.focus(); target.dispatchEvent(new Event('input', { bubbles: true })); }
          el.dispatchEvent(new CustomEvent('fx:pick', { bubbles: true, detail: { text: text } }));
        });
      });
    }
  });

  // Un sélecteur compact pour choisir un mode ou un modèle
  FX.register('model-switcher', {
    setup: function (el) {
      var opts = (el.dataset.fxOptions || 'Rapide|Équilibré|Précis').split('|'), cur = 0;
      el.innerHTML = '<button type="button" aria-haspopup="listbox" aria-expanded="false"></button><ul role="listbox" tabindex="-1"></ul>';
      var btn = el.firstChild, ul = el.lastChild;
      opts.forEach(function (o, i) { var li = U.make('li', '', ul); li.textContent = o; li.setAttribute('role', 'option'); li.style.setProperty('--fx-i', i); li.addEventListener('click', function () { pick(i); }); });
      var pick = function (i) {
        cur = i;
        btn.textContent = opts[i];
        Array.prototype.forEach.call(ul.children, function (l, k) { l.setAttribute('aria-selected', k === i); });
        set(false);
        el.dispatchEvent(new CustomEvent('fx:change', { bubbles: true, detail: { value: opts[i] } }));
      };
      var set = function (on) { el.classList.toggle('fx-open', on); btn.setAttribute('aria-expanded', on); };
      btn.addEventListener('click', function () { set(!el.classList.contains('fx-open')); });
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { set(false); btn.focus(); }
        if (e.key === 'ArrowDown') { e.preventDefault(); set(true); pick((cur + 1) % opts.length); set(true); }
        if (e.key === 'ArrowUp') { e.preventDefault(); set(true); pick((cur - 1 + opts.length) % opts.length); set(true); }
      });
      document.addEventListener('pointerdown', function (e) { if (!el.contains(e.target)) set(false); });
      pick(0);
    }
  });
})(window.FX);

/* Pack 20 — Nouvelles entrées */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Les enfants arrivent selon leur position réelle à l'écran
  FX.register('cascade-rows', {
    entrance: true,
    setup: function (el) {
      var tops = [];
      Array.prototype.forEach.call(el.children, function (c) { if (tops.indexOf(c.offsetTop) < 0) tops.push(c.offsetTop); });
      Array.prototype.forEach.call(el.children, function (c) { c.style.setProperty('--fx-rw', tops.indexOf(c.offsetTop)); });
    }
  });

  // Un projecteur balaye l'élément puis l'éclaire en entier
  FX.register('spotlight-in', {
    entrance: true,
    setup: function (el) { el.style.setProperty('--fx-r', '0%'); },
    reset: function (el) { el.style.setProperty('--fx-r', '0%'); },
    enter: function (el) {
      U.tween(el, U.num(el, 'fxDuration', 1400), function (p) {
        var e = U.easeInOut(p);
        el.style.setProperty('--fx-x', (15 + Math.sin(e * 3.14) * 70).toFixed(1) + '%');
        el.style.setProperty('--fx-y', (30 + e * 20).toFixed(1) + '%');
        el.style.setProperty('--fx-r', (10 + e * e * 130).toFixed(1) + '%');
      });
    }
  });

  // Les lignes glissent de chaque côté et se calent sur la marge
  FX.register('typeset-lines', {
    entrance: true,
    setup: function (el) {
      var run = function () { U.splitLines(el); el.querySelectorAll('.fx-line > span').forEach(function (s, i) { s.style.setProperty('--fx-dir', i % 2 ? 1 : -1); }); };
      run();
      U.onResize(run);
    }
  });

  // Les cases rebondissent en onde depuis le centre
  FX.register('bounce-grid', {
    entrance: true,
    setup: function (el) {
      var b = el.getBoundingClientRect(), cx = b.left + b.width / 2, cy = b.top + b.height / 2;
      Array.prototype.forEach.call(el.children, function (c) {
        var r = c.getBoundingClientRect();
        c.style.setProperty('--fx-d', (Math.hypot(r.left + r.width / 2 - cx, r.top + r.height / 2 - cy) * 1.6).toFixed(0) + 'ms');
      });
    }
  });

  // Un cadre s'ouvre vers le haut, et l'image se pose en même temps
  FX.register('mask-rise-image', {
    entrance: true,
    setup: function (el) { if (!el.firstElementChild) U.make('div', '', el); el.firstElementChild.classList.add('fx-mri'); }
  });

  // Des panneaux se déplient comme un paravent
  FX.register('accordion-unfold', {
    entrance: true,
    setup: function (el) { Array.prototype.forEach.call(el.children, function (c, i) { c.style.setProperty('--fx-i', i); c.classList.add(i % 2 ? 'fx-odd' : 'fx-even'); }); }
  });

  // Les mots sortent du flou l'un après l'autre
  FX.register('blur-words', { entrance: true, setup: function (el) { U.splitWords(el); } });

  // Des cartes sont distribuées depuis un même point
  FX.register('card-deal', {
    entrance: true,
    setup: function (el) {
      var b = el.getBoundingClientRect();
      Array.prototype.forEach.call(el.children, function (c, i) {
        var r = c.getBoundingClientRect();
        c.style.setProperty('--fx-dx', (b.left + b.width / 2 - r.left - r.width / 2).toFixed(0) + 'px');
        c.style.setProperty('--fx-dy', (b.top + b.height + 40 - r.top).toFixed(0) + 'px');
        c.style.setProperty('--fx-r', U.rand(-22, 22).toFixed(0) + 'deg');
        c.style.setProperty('--fx-i', i);
      });
    }
  });

  // Des bandes s'ouvrent comme un obturateur sur l'élément
  FX.register('shutter-text', {
    entrance: true,
    setup: function (el) {
      U.ensurePositioned(el);
      var b = U.make('span', 'fx-sht', el), n = U.num(el, 'fxBands', 6);
      b.setAttribute('aria-hidden', 'true');
      for (var i = 0; i < n; i++) U.make('i', '', b).style.setProperty('--fx-i', i);
    }
  });

  // Un cadre se dessine autour du contenu, puis le contenu apparaît
  FX.register('line-draw-box', {
    entrance: true,
    setup: function (el) {
      U.ensurePositioned(el);
      var host = U.make('span', 'fx-ldb', el);
      host.setAttribute('aria-hidden', 'true');
      host.innerHTML = '<svg><rect pathLength="1" x="1" y="1"/></svg>';
      var fit = function () {
        var r = host.querySelector('rect');
        r.setAttribute('width', Math.max(0, el.offsetWidth - 2));
        r.setAttribute('height', Math.max(0, el.offsetHeight - 2));
        r.setAttribute('rx', U.num(el, 'fxRadius', 10));
      };
      fit();
      U.onResize(fit);
    }
  });

  // Une rangée s'ouvre depuis son centre
  FX.register('stagger-scale-row', {
    entrance: true,
    setup: function (el) {
      var n = el.children.length;
      Array.prototype.forEach.call(el.children, function (c, i) { c.style.setProperty('--fx-o', Math.abs(i - (n - 1) / 2).toFixed(1)); });
    }
  });

  // L'image apparaît à travers un grain de pellicule
  FX.register('grain-fade', {
    entrance: true,
    setup: function (el) {
      if (!FX._fxGrainUrl) {
        var c = document.createElement('canvas');
        c.width = c.height = 128;
        var x = c.getContext('2d'), im = x.createImageData(128, 128);
        for (var i = 0; i < im.data.length; i += 4) { im.data[i + 3] = Math.random() * 255; }
        x.putImageData(im, 0, 0);
        FX._fxGrainUrl = 'url(' + c.toDataURL() + ')';
      }
      el.style.setProperty('--fx-noise', FX._fxGrainUrl);
    }
  });

  // Les tuiles pivotent d'un quart de tour pour se ranger
  FX.register('rotate-tile-in', {
    entrance: true,
    setup: function (el) {
      Array.prototype.forEach.call(el.children, function (c, i) {
        c.style.setProperty('--fx-r', [90, 180, 270, -90][Math.floor(Math.random() * 4)] + 'deg');
        c.style.setProperty('--fx-i', i);
      });
    }
  });

  // Une ligne se dessine, puis le contenu se lève derrière elle
  FX.register('horizon-rise', {
    entrance: true,
    setup: function (el) {
      var w = document.createElement('span');
      w.className = 'fx-hr-in';
      while (el.firstChild) w.appendChild(el.firstChild);
      el.appendChild(w);
      U.make('i', 'fx-hr', el).setAttribute('aria-hidden', 'true');
    }
  });

  // Plusieurs copies d'un grand numéro se rassemblent
  FX.register('number-stack-in', {
    entrance: true,
    setup: function (el) {
      var t = el.textContent.trim(), n = 4;
      el.textContent = '';
      el.setAttribute('aria-label', t);
      for (var i = n; i >= 0; i--) {
        var s = U.make('span', i ? 'fx-ns-c' : 'fx-ns-t', el);
        s.textContent = t;
        s.setAttribute('aria-hidden', 'true');
        s.style.setProperty('--fx-i', i);
      }
    }
  });

  // Des filets se dessinent et les lignes de la liste arrivent
  FX.register('list-strike-in', {
    entrance: true,
    setup: function (el) {
      Array.prototype.forEach.call(el.children, function (c, i) {
        c.style.setProperty('--fx-i', i);
        U.ensurePositioned(c);
        U.make('i', 'fx-lsi', c).setAttribute('aria-hidden', 'true');
      });
    }
  });

  // Les éléments arrivent du fond et deviennent nets
  FX.register('depth-focus-in', {
    entrance: true,
    setup: function (el) { Array.prototype.forEach.call(el.children, function (c, i) { c.style.setProperty('--fx-i', i); }); }
  });

  // Un surligneur traverse chaque ligne l'une après l'autre
  FX.register('marker-swipe-in', {
    entrance: true,
    setup: function (el) { var r = function () { U.splitLines(el); }; r(); U.onResize(r); }
  });

  // Des colonnes se déroulent de haut en bas l'une après l'autre
  FX.register('wipe-columns-in', {
    entrance: true,
    setup: function (el) {
      var k = el.children, step = Math.min(160, 700 / Math.max(1, k.length));
      Array.prototype.forEach.call(k, function (c, i) { c.style.setProperty('--fx-d', (i * step).toFixed(0) + 'ms'); });
    }
  });

  // L'élément s'allume comme un tube néon
  FX.register('glow-on', {
    entrance: true,
    reset: function (el) { el.style.setProperty('--fx-g', 0); },
    setup: function (el) { el.style.setProperty('--fx-g', 0); },
    enter: function (el) {
      var seq = [0, .9, .1, .1, 1, .2, 1, 1], t0 = null;
      if (U.reduced) { el.style.setProperty('--fx-g', 1); return; }
      U.tween(el, U.num(el, 'fxDuration', 700), function (p) { el.style.setProperty('--fx-g', seq[Math.min(seq.length - 1, Math.floor(p * seq.length))]); }, function () { el.style.setProperty('--fx-g', 1); });
    }
  });

  // Chaque mot monte de derrière sa ligne
  FX.register('curtain-words', {
    entrance: true,
    setup: function (el) {
      U.splitWords(el);
      el.querySelectorAll('.fx-word').forEach(function (w) {
        var i = document.createElement('span');
        i.className = 'fx-cw';
        i.textContent = w.textContent;
        w.textContent = '';
        w.appendChild(i);
      });
    }
  });

  // Les cases se retournent dans le désordre et révèlent le tableau
  FX.register('flip-board-in', {
    entrance: true,
    setup: function (el) {
      var k = Array.prototype.slice.call(el.children), o = k.map(function (_, i) { return i; }).sort(function () { return Math.random() - .5; });
      k.forEach(function (c, i) { c.style.setProperty('--fx-o', o[i]); });
    }
  });

  // L'élément arrive étiré, s'écrase et rebondit
  FX.register('rubber-in', {
    entrance: true,
    setup: function (el) { el.style.setProperty('--fx-delay', U.num(el, 'fxDelay', 0) + 'ms'); }
  });

  // Les éléments rejoignent leur place par une trajectoire courbe
  FX.register('path-follow-in', {
    entrance: true,
    setup: function (el) {
      Array.prototype.forEach.call(el.children, function (c, i) {
        var x = U.rand(-160, 160), y = U.rand(60, 140), cx = x * U.rand(-.6, .6), cy = y + U.rand(40, 90);
        c.style.setProperty('--fx-path', 'path("M ' + x.toFixed(0) + ' ' + y.toFixed(0) + ' Q ' + cx.toFixed(0) + ' ' + cy.toFixed(0) + ' 0 0")');
        c.style.setProperty('--fx-i', i);
      });
    }
  });

  // Toute une page apparaît doucement, de haut en bas
  FX.register('soft-page-in', {
    entrance: true,
    setup: function (el) { Array.prototype.forEach.call(el.children, function (c, i) { c.style.setProperty('--fx-d', Math.min(i * 90, 450) + 'ms'); }); }
  });

  // Le mot arrive en tranches verticales décalées
  FX.register('slice-column-text', {
    entrance: true,
    setup: function (el) {
      var t = el.textContent.trim(), n = U.num(el, 'fxSlices', 7);
      el.setAttribute('aria-label', t);
      el.textContent = '';
      for (var i = 0; i < n; i++) {
        var s = U.make('span', '', el);
        s.setAttribute('aria-hidden', 'true');
        s.textContent = t;
        s.style.clipPath = 'inset(0 ' + (100 - (i + 1) * 100 / n).toFixed(2) + '% 0 ' + (i * 100 / n).toFixed(2) + '%)';
        s.style.setProperty('--fx-dy', (i % 2 ? 1 : -1) * U.rand(50, 120) + '%');
        s.style.setProperty('--fx-i', i);
      }
    }
  });

  // Un titre arrive et lance quelques éclats autour de lui
  FX.register('pop-confetti-title', {
    entrance: true,
    reset: function (el) { el.querySelectorAll('.fx-pct').forEach(function (i) { i.remove(); }); },
    enter: function (el) {
      if (U.reduced) return;
      U.ensurePositioned(el);
      for (var k = 0; k < U.num(el, 'fxBits', 16); k++) {
        var b = U.make('i', 'fx-pct', el), a = Math.random() * 6.283, d = U.rand(40, 110);
        b.setAttribute('aria-hidden', 'true');
        b.style.setProperty('--fx-x', (Math.cos(a) * d).toFixed(0) + 'px');
        b.style.setProperty('--fx-y', (Math.sin(a) * d * .7).toFixed(0) + 'px');
        b.style.setProperty('--fx-r', U.rand(-180, 180).toFixed(0) + 'deg');
        b.style.background = ['var(--fx-accent)', 'var(--fx-accent-2)', 'currentColor'][k % 3];
        setTimeout(function (n) { n.remove(); }.bind(null, b), 1100);
      }
    }
  });
})(window.FX);

/* Pack 21 — Détails éditoriaux */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Une lettrine entre en grand et le texte se place autour d'elle
  FX.register('drop-cap-draw', {
    entrance: true,
    setup: function (el) {
      var t = el.textContent.trim();
      el.setAttribute('aria-label', t);
      el.textContent = '';
      var c = U.make('span', 'fx-dc', el);
      c.textContent = t.charAt(0);
      c.setAttribute('aria-hidden', 'true');
      var r = U.make('span', 'fx-dc-r', el);
      r.textContent = t.slice(1);
      r.setAttribute('aria-hidden', 'true');
    }
  });

  // Une note en marge s'éclaire quand on survole sa référence
  FX.register('margin-note', {
    setup: function (el) {
      var refs = el.querySelectorAll('[data-note]');
      refs.forEach(function (r, i) {
        r.classList.add('fx-mn-ref');
        r.tabIndex = 0;
        var n = document.createElement('small');
        n.className = 'fx-mn';
        n.textContent = (i + 1) + '. ' + r.dataset.note;
        r.appendChild(n);
        r.style.setProperty('--fx-n', '"' + (i + 1) + '"');
      });
    }
  });

  // Une grande citation monte, précédée de ses guillemets
  FX.register('pull-quote-rise', {
    entrance: true,
    setup: function (el) {
      var r = function () { U.splitLines(el); };
      r();
      U.onResize(r);
    }
  });

  // Un petit bandeau indique le temps de lecture restant
  FX.register('reading-time-bar', {
    setup: function (el) {
      var target = document.querySelector(el.dataset.fxTarget || 'article');
      var words = target ? target.textContent.trim().split(/\s+/).length : U.num(el, 'fxWords', 1200);
      el._fxMin = Math.max(1, Math.ceil(words / U.num(el, 'fxWpm', 220)));
      el._fxT = target;
      el.setAttribute('role', 'status');
      el.innerHTML = '<span></span><i></i>';
    },
    scroll: function (el, info) {
      var p = info.pass;
      if (el._fxT) { var r = el._fxT.getBoundingClientRect(); p = U.clamp(-r.top / Math.max(1, r.height - info.vh), 0, 1); }
      var m = Math.ceil(el._fxMin * (1 - p));
      if (m !== el._fxLast) { el._fxLast = m; el.firstChild.textContent = m > 0 ? m + ' min restante' + (m > 1 ? 's' : '') : 'Lecture terminée'; }
      el.style.setProperty('--fx-p', p.toFixed(3));
    }
  });

  // Autour du curseur, les mots sont nets et le reste s'estompe
  FX.register('kerning-focus', {
    setup: function (el) {
      U.splitWords(el);
      var ws = el.querySelectorAll('.fx-word');
      el.addEventListener('pointermove', function (e) {
        ws.forEach(function (w) {
          var r = w.getBoundingClientRect();
          var d = Math.hypot(r.left + r.width / 2 - e.clientX, r.top + r.height / 2 - e.clientY);
          w.style.setProperty('--fx-k', U.clamp(1 - d / U.num(el, 'fxRadius', 130), .12, 1).toFixed(2));
        });
      });
      el.addEventListener('pointerleave', function () { ws.forEach(function (w) { w.style.removeProperty('--fx-k'); }); });
    }
  });

  // Un bandeau d'informations qu'on peut mettre en pause
  FX.register('news-ticker-pause', {
    setup: function (el) {
      var items = Array.prototype.slice.call(el.children);
      var track = document.createElement('div');
      track.className = 'fx-nt';
      items.forEach(function (i) { track.appendChild(i); });
      el.appendChild(track);
      items.forEach(function (i) { var c = i.cloneNode(true); c.setAttribute('aria-hidden', 'true'); c.querySelectorAll('a').forEach(function (a) { a.tabIndex = -1; }); track.appendChild(c); });
      var b = U.make('button', 'fx-nt-b', el);
      b.type = 'button';
      var set = function (p) { el.classList.toggle('fx-paused', p); b.textContent = p ? '▶' : '❚❚'; b.setAttribute('aria-label', p ? 'Reprendre' : 'Mettre en pause'); };
      set(U.reduced);
      b.addEventListener('click', function () { set(!el.classList.contains('fx-paused')); });
      el.style.setProperty('--fx-t', (track.scrollWidth / 2 / U.num(el, 'fxSpeed', 50)).toFixed(1) + 's');
    }
  });

  // Une phrase bascule entre deux langues, lettre par lettre
  FX.register('bilingual-toggle', {
    setup: function (el) {
      var a = el.textContent.trim(), b = el.dataset.fxOther || a, cur = a, lang = false;
      el.setAttribute('aria-label', a);
      var morph = function (to) {
        var from = cur, n = Math.max(from.length, to.length);
        U.tween(el, U.num(el, 'fxDuration', 650), function (p) {
          var c = Math.floor(p * (n + 6)), s = '';
          for (var i = 0; i < n; i++) {
            if (i < c - 6) s += to.charAt(i);
            else if (i < c) s += to.charAt(i) && to.charAt(i) !== ' ' ? U.GLYPHS.charAt(Math.floor(Math.random() * U.GLYPHS.length)) : ' ';
            else s += from.charAt(i);
          }
          el.textContent = p >= 1 ? to : s;
        }, function () { cur = to; el.textContent = to; el.setAttribute('aria-label', to); });
      };
      el._fxFlip = function () { lang = !lang; morph(lang ? b : a); };
      el.addEventListener('click', el._fxFlip);
    },
    trigger: function (el) { el._fxFlip(); }
  });

  // Un champ d'écriture qui compte les mots jusqu'à un objectif
  FX.register('word-counter-goal', {
    setup: function (el) {
      var area = el.querySelector('textarea,[contenteditable]'), goal = U.num(el, 'fxGoal', 30);
      var out = U.make('div', 'fx-wc', el);
      out.setAttribute('aria-live', 'polite');
      var upd = function () {
        var t = area ? (area.value != null ? area.value : area.textContent) : '';
        var n = t.trim() ? t.trim().split(/\s+/).length : 0, ok = n >= goal;
        el.style.setProperty('--fx-q', Math.min(1, n / goal).toFixed(3));
        out.textContent = n + ' / ' + goal + ' mots';
        if (ok !== el._fxOk) { el._fxOk = ok; el.classList.toggle('fx-goal', ok); if (ok) el.dispatchEvent(new CustomEvent('fx:goal', { bubbles: true })); }
      };
      if (area) area.addEventListener('input', upd);
      upd();
    }
  });

  // Un spécimen de police qu'on règle en direct
  FX.register('typo-specimen', {
    setup: function (el) {
      var txt = el.textContent.trim() || 'Aa';
      el.innerHTML = '<div class="fx-ts-v" contenteditable="true" spellcheck="false" aria-label="Texte du spécimen"></div><label>Taille <input type="range" min="16" max="120" value="48"></label><label>Graisse <input type="range" min="100" max="900" step="100" value="500"></label>';
      var v = el.firstChild;
      v.textContent = txt;
      el.querySelectorAll('input').forEach(function (r, i) {
        var set = function () { v.style.setProperty(i ? '--fx-w' : '--fx-s', r.value + (i ? '' : 'px')); };
        r.addEventListener('input', set);
        set();
      });
    }
  });

  // Dans un titre fixe, un mot change avec la section
  FX.register('headline-replace-scroll', {
    setup: function (el) {
      el._fxSecs = Array.prototype.slice.call(document.querySelectorAll(el.dataset.fxTarget || '[data-word]'));
      el._fxWords = (el.dataset.fxWords || 'créer|tester|publier').split('|');
      el.setAttribute('aria-live', 'off');
      el.innerHTML = '<span class="fx-hr-w"></span>';
      el._fxBox = el.firstChild;
      el._fxI = -1;
    },
    scroll: function (el, info) {
      var i;
      if (el._fxSecs.length) {
        i = 0;
        el._fxSecs.forEach(function (s, k) { if (s.getBoundingClientRect().top < info.vh / 2) i = k; });
      } else i = Math.min(el._fxWords.length - 1, Math.floor(info.pass * el._fxWords.length));
      if (i === el._fxI) return;
      el._fxI = i;
      var w = el._fxSecs.length ? el._fxSecs[i].dataset.word : el._fxWords[i];
      var s = document.createElement('span');
      s.className = 'fx-hr-in';
      s.textContent = w;
      el._fxBox.textContent = '';
      el._fxBox.appendChild(s);
    }
  });

  // Des mots clés se surlignent l'un après l'autre dans le texte
  FX.register('highlight-terms-sweep', {
    entrance: true,
    setup: function (el) {
      var terms = (el.dataset.fxTerms || '').split('|').filter(Boolean);
      if (!terms.length) return;
      var esc = function (s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); };
      var re = new RegExp('(' + terms.map(esc).join('|') + ')', 'gi'), i = 0;
      var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach(function (n) {
        if (!re.test(n.nodeValue)) return;
        re.lastIndex = 0;
        var f = document.createDocumentFragment(), parts = n.nodeValue.split(re);
        parts.forEach(function (p, k) {
          if (k % 2) { var m = document.createElement('mark'); m.textContent = p; m.style.setProperty('--fx-i', i++); f.appendChild(m); }
          else if (p) f.appendChild(document.createTextNode(p));
        });
        n.replaceWith(f);
      });
    }
  });

  // Une référence amène à sa note, qui rebondit pour se signaler
  FX.register('footnote-spring', {
    setup: function (el) {
      el.addEventListener('click', function (e) {
        var a = e.target.closest('a[href^="#"]');
        if (!a) return;
        var t = document.querySelector(a.getAttribute('href').length > 1 ? a.getAttribute('href') : null);
        if (!t) return;
        e.preventDefault();
        t.scrollIntoView({ behavior: U.reduced ? 'auto' : 'smooth', block: 'center' });
        t.classList.remove('fx-fn'); void t.offsetWidth; t.classList.add('fx-fn');
        if (!t.hasAttribute('tabindex')) t.tabIndex = -1;
        t.focus({ preventScroll: true });
      });
    }
  });

  // Un autocollant se décolle un peu au survol
  FX.register('sticker-peel-hover', {
    setup: function (el) {
      el.style.setProperty('--fx-rot', U.rand(-8, 8).toFixed(1) + 'deg');
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--fx-rx', (-(e.clientY - r.top) / r.height * 18 + 9).toFixed(1) + 'deg');
        el.style.setProperty('--fx-ry', ((e.clientX - r.left) / r.width * 22 - 11).toFixed(1) + 'deg');
      });
      el.addEventListener('pointerleave', function () { el.style.setProperty('--fx-rx', '0deg'); el.style.setProperty('--fx-ry', '0deg'); });
    }
  });

  // Un soulignement ondulé se dessine sous le lien
  FX.register('underline-wave-draw', {
    setup: function (el) {
      var w = Math.max(60, Math.round(el.offsetWidth || 120)), d = 'M0 5', n = Math.round(w / 12);
      for (var i = 0; i < n; i++) d += ' q ' + (w / n / 2).toFixed(1) + ' ' + (i % 2 ? 7 : -7) + ' ' + (w / n).toFixed(1) + ' 0';
      var s = U.make('span', 'fx-uwd', el);
      s.setAttribute('aria-hidden', 'true');
      s.innerHTML = '<svg viewBox="0 0 ' + w + ' 10" preserveAspectRatio="none"><path pathLength="1" d="' + d + '"/></svg>';
    }
  });

  // Des réactions s'envolent quand on clique
  FX.register('emoji-burst', {
    triggerOn: 'click',
    trigger: function (el) {
      if (U.reduced) return;
      U.ensurePositioned(el);
      var list = (el.dataset.fxIcons || '♥|★|✦').split('|');
      for (var i = 0; i < U.num(el, 'fxCount', 6); i++) {
        var s = U.make('span', 'fx-eb', el);
        s.setAttribute('aria-hidden', 'true');
        s.textContent = list[Math.floor(Math.random() * list.length)];
        s.style.setProperty('--fx-x', U.rand(-50, 50).toFixed(0) + 'px');
        s.style.setProperty('--fx-y', U.rand(-120, -60).toFixed(0) + 'px');
        s.style.setProperty('--fx-r', U.rand(-40, 40).toFixed(0) + 'deg');
        s.style.animationDelay = i * 40 + 'ms';
        setTimeout(function (n) { n.remove(); }.bind(null, s), 1300);
      }
    }
  });

  // Une grille d'aiguilles s'oriente vers le curseur
  FX.register('cursor-compass', {
    setup: function (el) {
      var n = U.num(el, 'fxCount', 42);
      el.setAttribute('aria-hidden', 'true');
      for (var i = 0; i < n; i++) U.make('i', '', el);
      var nodes = el.children;
      var look = function (x, y) {
        for (var k = 0; k < nodes.length; k++) {
          var r = nodes[k].getBoundingClientRect();
          nodes[k].style.transform = 'rotate(' + Math.atan2(y - r.top - r.height / 2, x - r.left - r.width / 2).toFixed(3) + 'rad)';
        }
      };
      if (!U.reduced) window.addEventListener('pointermove', function (e) {
        var b = el.getBoundingClientRect();
        if (b.bottom < -100 || b.top > innerHeight + 100) return;
        look(e.clientX, e.clientY);
      }, { passive: true });
      el._fxLook = look;
      el._fxA = 0;
    },
    tick: function (el, dt) {
      if (U.reduced || U.canHover) return;
      el._fxA += dt;
      var b = el.getBoundingClientRect();
      el._fxLook(b.left + b.width / 2 + Math.cos(el._fxA) * 100, b.top + b.height / 2 + Math.sin(el._fxA) * 100);
    }
  });

  // Un double appui sur l'image fait apparaître un cœur
  FX.register('double-click-like', {
    setup: function (el) {
      U.ensurePositioned(el);
      el._fxBurst = function (x, y) {
        var h = U.make('span', 'fx-dcl', el);
        h.textContent = '♥';
        h.setAttribute('aria-hidden', 'true');
        h.style.left = x + 'px';
        h.style.top = y + 'px';
        h.style.setProperty('--fx-r', U.rand(-16, 16).toFixed(0) + 'deg');
        setTimeout(function () { h.remove(); }, 900);
        el.dispatchEvent(new CustomEvent('fx:like', { bubbles: true }));
      };
      el.addEventListener('dblclick', function (e) {
        var r = el.getBoundingClientRect();
        el._fxBurst(e.clientX - r.left, e.clientY - r.top);
      });
    },
    trigger: function (el) { el._fxBurst(el.offsetWidth / 2, el.offsetHeight / 2); }
  });

  // Un curseur dont la valeur suit dans une bulle
  FX.register('range-bubble', {
    setup: function (el) {
      var input = el.querySelector('input[type="range"]');
      if (!input) return;
      var b = U.make('output', 'fx-rb', el), unit = el.dataset.fxUnit || '';
      var upd = function () {
        var min = +input.min || 0, max = +input.max || 100, p = (input.value - min) / (max - min);
        el.style.setProperty('--fx-p', p.toFixed(3));
        b.textContent = input.value + unit;
      };
      input.addEventListener('input', upd);
      input.addEventListener('pointerdown', function () { el.classList.add('fx-on'); });
      input.addEventListener('focus', function () { el.classList.add('fx-on'); });
      input.addEventListener('blur', function () { el.classList.remove('fx-on'); });
      window.addEventListener('pointerup', function () { if (document.activeElement !== input) el.classList.remove('fx-on'); });
      upd();
    }
  });

  // Une info-bulle riche suit le curseur sans quitter l'écran
  FX.register('rich-tooltip-follow', {
    setup: function (el) {
      var tip = U.make('div', 'fx-rt', document.body);
      tip.setAttribute('role', 'tooltip');
      tip.textContent = el.dataset.fxTip || '';
      var id = 'fx-rt-' + Math.random().toString(36).slice(2, 7);
      tip.id = id;
      el.setAttribute('aria-describedby', id);
      if (!el.hasAttribute('tabindex') && !el.matches('a,button,input')) el.tabIndex = 0;
      var to;
      var place = function (x, y) {
        var w = tip.offsetWidth, h = tip.offsetHeight;
        tip.style.left = U.clamp(x + 14, 8, innerWidth - w - 8) + 'px';
        tip.style.top = U.clamp(y + 16, 8, innerHeight - h - 8) + 'px';
      };
      var show = function () { clearTimeout(to); to = setTimeout(function () { tip.classList.add('fx-on'); }, U.num(el, 'fxDelay', 120)); };
      var hide = function () { clearTimeout(to); tip.classList.remove('fx-on'); };
      el.addEventListener('pointermove', function (e) { place(e.clientX, e.clientY); });
      el.addEventListener('pointerenter', show);
      el.addEventListener('pointerleave', hide);
      el.addEventListener('focus', function () { var r = el.getBoundingClientRect(); place(r.left, r.bottom); show(); });
      el.addEventListener('blur', hide);
      el.addEventListener('keydown', function (e) { if (e.key === 'Escape') hide(); });
    }
  });

  // Des pastilles de couleur changent la teinte d'un produit
  FX.register('color-picker-orbit', {
    setup: function (el) {
      var cols = (el.dataset.fxColors || '#e10600|#ffd400|#0047ff|#111111').split('|');
      var names = (el.dataset.fxNames || cols.join('|')).split('|');
      var t = el.dataset.fxTarget && document.querySelector(el.dataset.fxTarget);
      el.setAttribute('role', 'radiogroup');
      el.setAttribute('aria-label', el.getAttribute('aria-label') || 'Couleur');
      cols.forEach(function (c, i) {
        var b = U.make('button', '', el);
        b.type = 'button';
        b.setAttribute('role', 'radio');
        b.setAttribute('aria-label', names[i]);
        b.style.setProperty('--fx-c', c);
        b.addEventListener('click', function () {
          el.querySelectorAll('button').forEach(function (o) { o.setAttribute('aria-checked', o === b); });
          if (t) t.style.setProperty('--fx-color', c);
          el.dispatchEvent(new CustomEvent('fx:change', { bubbles: true, detail: { color: c } }));
        });
        if (!i) b.setAttribute('aria-checked', 'true');
      });
    }
  });

  // Une pagination dont l'indicateur s'étire d'une page à l'autre
  FX.register('pagination-squeeze', {
    setup: function (el) {
      var n = U.num(el, 'fxPages', 5), cur = 1, nav = el;
      nav.setAttribute('aria-label', nav.getAttribute('aria-label') || 'Pagination');
      U.make('i', 'fx-pgs', el).setAttribute('aria-hidden', 'true');
      var bs = [];
      var go = function (p) {
        cur = U.clamp(p, 1, n);
        bs.forEach(function (b, i) { var on = i === cur - 1; b.setAttribute('aria-current', on ? 'page' : 'false'); });
        var a = bs[cur - 1];
        el.style.setProperty('--fx-l', a.offsetLeft + 'px');
        el.style.setProperty('--fx-w', a.offsetWidth + 'px');
        el.dispatchEvent(new CustomEvent('fx:page', { bubbles: true, detail: { page: cur } }));
      };
      for (var i = 1; i <= n; i++) (function (k) {
        var b = U.make('button', '', el);
        b.type = 'button'; b.textContent = k;
        b.addEventListener('click', function () { go(k); });
        bs.push(b);
      })(i);
      go(1);
      el._fxGo = function () { go(cur % n + 1); };
    },
    trigger: function (el) { el._fxGo(); }
  });

  // Une foire aux questions dont le plus se change en moins
  FX.register('accordion-plus-morph', {
    setup: function (el) {
      var single = el.dataset.fxSingle !== 'false';
      var items = Array.prototype.slice.call(el.children);
      items.forEach(function (it) {
        var b = it.querySelector('button');
        if (!b) return;
        b.setAttribute('aria-expanded', 'false');
        U.make('i', 'fx-apm', b).setAttribute('aria-hidden', 'true');
        b.addEventListener('click', function () {
          var on = b.getAttribute('aria-expanded') !== 'true';
          if (single) items.forEach(function (o) { var x = o.querySelector('button'); if (x) x.setAttribute('aria-expanded', 'false'); o.classList.remove('fx-open'); });
          b.setAttribute('aria-expanded', on);
          it.classList.toggle('fx-open', on);
        });
      });
    }
  });
})(window.FX);

/* Pack 22 — Dernières idées */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Le cadre reste fixe, et les images se succèdent au défilement
  FX.register('sticky-slideshow', {
    setup: function (el) { el._fxK = Array.prototype.slice.call(el.querySelectorAll('.fx-slide,img')); },
    scroll: function (el, info) {
      var n = el._fxK.length, p = U.clamp(-info.rect.top / Math.max(1, info.rect.height - info.vh), 0, .999);
      if (el.dataset.fxDemo) p = info.pass * .999;
      var c = Math.floor(p * n);
      if (c === el._fxC) return;
      el._fxC = c;
      el._fxK.forEach(function (s, i) { s.classList.toggle('fx-cur', i === c); });
    }
  });

  // Une horloge dont les aiguilles tournent avec le défilement
  FX.register('scroll-clock', {
    setup: function (el) {
      el.setAttribute('aria-hidden', 'true');
      el.innerHTML = '<i class="h"></i><i class="m"></i>';
    },
    scroll: function (el, info) {
      var total = info.pass * U.num(el, 'fxHours', 12) * 60;
      el.style.setProperty('--fx-m', (total * 6) + 'deg');
      el.style.setProperty('--fx-h', (total * .5) + 'deg');
    }
  });

  // Chaque lettre monte à sa propre vitesse
  FX.register('parallax-letters', {
    setup: function (el) {
      U.splitChars(el);
      el.querySelectorAll('.fx-char').forEach(function (c) { c.style.setProperty('--fx-s', U.rand(-1, 1).toFixed(2)); });
    },
    scroll: function (el, info) { el.style.setProperty('--fx-t', ((.5 - info.pass) * U.num(el, 'fxAmp', 160)).toFixed(1) + 'px'); }
  });

  // Un bandeau incliné traverse la section
  FX.register('tilted-band', {
    setup: function (el) {
      var t = el.textContent.trim();
      el.setAttribute('aria-label', t);
      el.textContent = '';
      var s = U.make('span', '', el);
      s.setAttribute('aria-hidden', 'true');
      s.textContent = (t + ' ✦ ').repeat(10);
      el._fxDir = el.dataset.fxDir === 'right' ? 1 : -1;
    },
    scroll: function (el, info) { el.firstChild.style.transform = 'translateX(' + ((info.pass * 30) * el._fxDir - 10).toFixed(2) + '%)'; }
  });

  // Une grille de cases s'ouvre au hasard sur l'image
  FX.register('grid-open-scroll', {
    setup: function (el) {
      U.ensurePositioned(el);
      var C = U.num(el, 'fxCols', 8), R = U.num(el, 'fxRows', 6), g = U.make('div', 'fx-gos', el);
      g.setAttribute('aria-hidden', 'true');
      el.style.setProperty('--fx-c', C);
      el.style.setProperty('--fx-rw', R);
      el._fxC = [];
      for (var i = 0; i < C * R; i++) el._fxC.push({ d: U.make('i', '', g), at: Math.random() * .85 });
    },
    scroll: function (el, info) { var p = info.enter; el._fxC.forEach(function (c) { var o = p < c.at; if (o !== c.o) { c.o = o; c.d.classList.toggle('fx-on', o); } }); }
  });

  // L'image plein cadre recule et se cadre
  FX.register('zoom-out-frame', {
    scroll: function (el, info) { el.style.setProperty('--fx-z', (1 + (1 - U.easeOut(info.enter)) * U.num(el, 'fxFrom', .8)).toFixed(3)); }
  });

  // Le texte ondule quand on défile
  FX.register('wave-text-scroll', {
    setup: function (el) {
      U.splitChars(el);
      el._fxC = el.querySelectorAll('.fx-char');
    },
    scroll: function (el, info) {
      var ph = info.pass * 18, a = U.num(el, 'fxAmp', 14) * Math.sin(info.pass * 3.14);
      el._fxC.forEach(function (c, i) { c.style.transform = 'translateY(' + (Math.sin(ph + i * .5) * a).toFixed(1) + 'px)'; });
    }
  });

  // Un titre n'est pleinement visible qu'au centre de l'écran
  FX.register('title-fade-pass', {
    scroll: function (el, info) {
      var d = Math.abs(info.pass - .5) * 2;
      el.style.setProperty('--fx-a', U.clamp(1.4 - d * 1.6, 0, 1).toFixed(3));
      el.style.setProperty('--fx-b', (d * d * U.num(el, 'fxBlur', 8)).toFixed(2) + 'px');
      el.style.setProperty('--fx-y', ((.5 - info.pass) * 40).toFixed(1) + 'px');
    }
  });

  // L'image s'agrandit et suit le curseur pour voir les détails
  FX.register('hover-zoom-pan', {
    setup: function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--fx-ox', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
        el.style.setProperty('--fx-oy', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
      });
    }
  });

  // Des points sur une image ouvrent des explications
  FX.register('hotspot-image', {
    setup: function (el) {
      U.ensurePositioned(el);
      el.querySelectorAll('[data-x]').forEach(function (b) {
        b.style.left = b.dataset.x + '%';
        b.style.top = b.dataset.y + '%';
        var tip = U.make('span', 'fx-hs-t', b);
        tip.textContent = b.dataset.text || '';
        b.setAttribute('aria-expanded', 'false');
        b.setAttribute('aria-label', b.dataset.text || 'Détail');
        b.addEventListener('click', function () {
          var on = b.getAttribute('aria-expanded') !== 'true';
          el.querySelectorAll('[data-x]').forEach(function (o) { o.setAttribute('aria-expanded', 'false'); });
          b.setAttribute('aria-expanded', on);
        });
      });
    }
  });

  // Dans une galerie, tout s'estompe sauf l'image survolée
  FX.register('grid-dim-hover', {
    setup: function (el) {
      Array.prototype.forEach.call(el.children, function (c) {
        var on = function () { el.classList.add('fx-on'); Array.prototype.forEach.call(el.children, function (o) { o.classList.toggle('fx-cur', o === c); }); };
        c.addEventListener('pointerenter', on);
        c.addEventListener('focusin', on);
      });
      var off = function () { el.classList.remove('fx-on'); };
      el.addEventListener('pointerleave', off);
      el.addEventListener('focusout', function (e) { if (!el.contains(e.relatedTarget)) off(); });
    }
  });

  // On parcourt une séquence d'images en déplaçant le curseur
  FX.register('film-scrub', {
    setup: function (el) {
      var imgs = el.querySelectorAll('img');
      el.style.touchAction = 'pan-y';
      var show = function (p) {
        var k = U.clamp(Math.floor(p * imgs.length), 0, imgs.length - 1);
        imgs.forEach(function (im, i) { im.classList.toggle('fx-cur', i === k); });
        el.style.setProperty('--fx-p', p.toFixed(3));
      };
      el.addEventListener('pointermove', function (e) { var r = el.getBoundingClientRect(); show((e.clientX - r.left) / r.width); });
      show(0);
      el._fxShow = show;
    }
  });

  // Les bords s'assombrissent et le centre suit le regard
  FX.register('vignette-focus', {
    setup: function (el) {
      var s = el._fxS = { x: 50, y: 50, tx: 50, ty: 50 };
      el.addEventListener('pointermove', function (e) { var r = el.getBoundingClientRect(); s.tx = (e.clientX - r.left) / r.width * 100; s.ty = (e.clientY - r.top) / r.height * 100; });
      el.addEventListener('pointerleave', function () { s.tx = s.ty = 50; });
    },
    tick: function (el) {
      var s = el._fxS;
      s.x = U.lerp(s.x, s.tx, .08); s.y = U.lerp(s.y, s.ty, .08);
      el.style.setProperty('--fx-vx', s.x.toFixed(1) + '%');
      el.style.setProperty('--fx-vy', s.y.toFixed(1) + '%');
    }
  });

  // La miniature grandit jusqu'au plein écran, sans coupure
  FX.register('lightbox-flip', {
    setup: function (el) {
      el.addEventListener('click', function (e) {
        var img = e.target.closest('img');
        if (!img) return;
        var r = img.getBoundingClientRect(), bg = U.make('div', 'fx-lb', document.body), c = img.cloneNode();
        bg.setAttribute('role', 'dialog');
        bg.setAttribute('aria-modal', 'true');
        bg.setAttribute('aria-label', img.alt || 'Image agrandie');
        bg.tabIndex = -1;
        bg.appendChild(c);
        c.style.cssText = 'position:absolute;left:' + r.left + 'px;top:' + r.top + 'px;width:' + r.width + 'px;height:' + r.height + 'px';
        var k = Math.min(innerWidth * .9 / r.width, innerHeight * .9 / r.height);
        var tx = innerWidth / 2 - r.left - r.width / 2, ty = innerHeight / 2 - r.top - r.height / 2;
        var close = function () {
          bg.classList.remove('fx-on');
          c.style.transform = '';
          setTimeout(function () { bg.remove(); img.focus && img.focus({ preventScroll: true }); }, U.reduced ? 0 : 400);
          document.removeEventListener('keydown', key);
        };
        var key = function (ev) { if (ev.key === 'Escape') close(); };
        bg.addEventListener('click', close);
        document.addEventListener('keydown', key);
        U.raf(function () { U.raf(function () { bg.classList.add('fx-on'); c.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + k + ')'; bg.focus(); }); });
      });
    }
  });

  // On gratte une surface pour découvrir ce qu'il y a dessous
  FX.register('scratch-reveal', {
    setup: function (el) {
      U.ensurePositioned(el);
      var cv = U.make('canvas', 'fx-scr', el), c = cv.getContext('2d'), down = false, count = 0;
      cv.setAttribute('aria-hidden', 'true');
      var init = function () {
        cv.width = el.offsetWidth; cv.height = el.offsetHeight;
        c.globalCompositeOperation = 'source-over';
        c.fillStyle = U.cssVar(el, '--fx-foil', '#888');
        c.fillRect(0, 0, cv.width, cv.height);
        c.fillStyle = 'rgba(255,255,255,.75)';
        c.font = '600 14px system-ui, sans-serif';
        c.textAlign = 'center';
        c.fillText(el.dataset.fxHint || 'Grattez ici', cv.width / 2, cv.height / 2);
        c.globalCompositeOperation = 'destination-out';
        c.lineWidth = U.num(el, 'fxBrush', 34);
        c.lineCap = 'round';
      };
      init();
      var at = function (e) { var r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
      var last;
      cv.style.touchAction = 'none';
      cv.addEventListener('pointerdown', function (e) { down = true; last = at(e); });
      window.addEventListener('pointerup', function () { down = false; });
      cv.addEventListener('pointermove', function (e) {
        if (!down) return;
        var p = at(e);
        c.beginPath(); c.moveTo(last[0], last[1]); c.lineTo(p[0], p[1]); c.stroke();
        last = p;
        if (++count % 12) return;
        var d = c.getImageData(0, 0, cv.width, cv.height).data, clear = 0;
        for (var i = 3; i < d.length; i += 64) if (!d[i]) clear++;
        if (clear / (d.length / 64) > U.num(el, 'fxDone', .5)) { el.classList.add('fx-done'); el.dispatchEvent(new CustomEvent('fx:done', { bubbles: true })); }
      });
      el.addEventListener('keydown', function (e) { if (e.key === 'Enter') el.classList.add('fx-done'); });
      if (U.reduced) el.classList.add('fx-done');
    },
    trigger: function (el) { el.classList.add('fx-done'); }
  });

  // L'image est grise, sauf autour du curseur
  FX.register('color-splash', {
    setup: function (el) {
      var s = el._fxS = { x: 0, y: 0, tx: 0, ty: 0, r: 0, on: false };
      var img = el.querySelector('img');
      if (!img) return;
      var c = img.cloneNode();
      c.alt = '';
      c.setAttribute('aria-hidden', 'true');
      c.className = 'fx-cs-top';
      el.appendChild(c);
      el.addEventListener('pointermove', function (e) { var r = el.getBoundingClientRect(); s.tx = e.clientX - r.left; s.ty = e.clientY - r.top; s.on = true; });
      el.addEventListener('pointerleave', function () { s.on = false; });
    },
    tick: function (el, dt, t) {
      var s = el._fxS, auto = el.dataset.fxAuto === 'true' && !s.on;
      if (auto) { s.tx = el.offsetWidth * (.5 + Math.cos(t * .001) * .3); s.ty = el.offsetHeight * (.5 + Math.sin(t * .0014) * .3); }
      s.x = U.lerp(s.x, s.tx, .14); s.y = U.lerp(s.y, s.ty, .14);
      s.r = U.lerp(s.r, s.on || auto ? U.num(el, 'fxRadius', 70) : 0, .1);
      el.style.setProperty('--fx-cx', s.x.toFixed(1) + 'px');
      el.style.setProperty('--fx-cy', s.y.toFixed(1) + 'px');
      el.style.setProperty('--fx-cr', s.r.toFixed(1) + 'px');
    }
  });

  // Des anneaux de couleur partent du point de clic
  FX.register('ripple-rings', { transition: { pieces: 5, cover: 900, uncover: 850, build: function (o) {
    var e = o._fxEvent, x = e && e.clientX != null ? e.clientX : innerWidth / 2, y = e && e.clientY != null ? e.clientY : innerHeight / 2;
    var list = U.cssVar(document.documentElement, '--fx-tr-colors', '#e10600,#ffd400,#0047ff,#e10600,#0c0c0e').split(',');
    Array.prototype.forEach.call(o.children, function (p, i) {
      p.style.left = x + 'px'; p.style.top = y + 'px';
      p.style.background = list[i % list.length];
      p.style.setProperty('--fx-d', i * 70 + 'ms');
    });
  } } });

  // Un grand triangle balaye l'écran depuis le coin le plus proche
  FX.register('corner-sweep', { transition: { pieces: 1, cover: 780, uncover: 800, build: function (o) {
    var e = o._fxEvent, x = e && e.clientX != null ? e.clientX : 0, y = e && e.clientY != null ? e.clientY : 0;
    o.style.setProperty('--fx-sx', x < innerWidth / 2 ? 1 : -1);
    o.style.setProperty('--fx-sy', y < innerHeight / 2 ? 1 : -1);
  } } });

  // Un bord en dents de scie monte et couvre l'écran
  FX.register('zigzag-cover', { transition: { pieces: 1, cover: 800, uncover: 820, build: function (o) {
    var n = Math.max(6, Math.round(innerWidth / 70)), pts = [];
    for (var i = 0; i <= n; i++) pts.push((i * 100 / n).toFixed(2) + '% ' + (i % 2 ? 0 : 60) + 'px');
    o.firstChild.style.clipPath = 'polygon(' + pts.join(',') + ',100% 100%,0 100%)';
  } } });

  // Deux moitiés se ferment au centre avec une ligne de lumière
  FX.register('mirror-split', { transition: { pieces: 3, cover: 720, uncover: 760, build: function (o) {
    o.children[0].className = 'fx-t';
    o.children[1].className = 'fx-b';
    o.children[2].className = 'fx-line';
  } } });

  // Un radar balaye et révèle des échos
  FX.register('radar-sweep', {
    setup: function (el) {
      el.setAttribute('aria-hidden', 'true');
      el._fxA = 0;
      el._fxE = [];
      for (var i = 0; i < U.num(el, 'fxBlips', 7); i++) {
        var d = U.make('i', '', el), a = Math.random() * 360, r = U.rand(16, 46);
        d.style.left = (50 + Math.cos(a / 57.3) * r) + '%';
        d.style.top = (50 + Math.sin(a / 57.3) * r) + '%';
        el._fxE.push({ d: d, a: (a + 90 + 360) % 360 });
      }
    },
    tick: function (el, dt) {
      if (U.reduced) return;
      var prev = el._fxA;
      el._fxA = (prev + dt * U.num(el, 'fxSpeed', 70)) % 360;
      el.style.setProperty('--fx-a', el._fxA.toFixed(1) + 'deg');
      el._fxE.forEach(function (b) {
        if ((prev < b.a && el._fxA >= b.a) || (prev > el._fxA && (b.a > prev || b.a <= el._fxA))) { b.d.classList.remove('fx-hit'); void b.d.offsetWidth; b.d.classList.add('fx-hit'); }
      });
    }
  });

  // Des impulsions de lumière voyagent sur un circuit
  FX.register('circuit-pulse', {
    setup: function (el) {
      U.ensurePositioned(el);
      el._fxCv = U.make('canvas', 'fx-gen', el);
      el._fxCv.setAttribute('aria-hidden', 'true');
      el._fxP = null;
    },
    tick: function (el, dt) {
      var cv = el._fxCv, w = cv.clientWidth, h = cv.clientHeight;
      if (!w) return;
      if (!el._fxP || cv.width !== w) {
        cv.width = w; cv.height = h;
        el._fxP = [];
        var G = 24;
        for (var i = 0; i < U.num(el, 'fxTraces', 12); i++) {
          var x = Math.floor(Math.random() * w / G) * G, y = Math.floor(Math.random() * h / G) * G, pts = [[x, y]];
          for (var k = 0; k < 5; k++) {
            if (k % 2) x += (Math.random() < .5 ? -1 : 1) * G * Math.ceil(Math.random() * 4);
            else y += (Math.random() < .5 ? -1 : 1) * G * Math.ceil(Math.random() * 3);
            pts.push([x, y]);
          }
          var L = 0; for (k = 1; k < pts.length; k++) L += Math.abs(pts[k][0] - pts[k - 1][0]) + Math.abs(pts[k][1] - pts[k - 1][1]);
          el._fxP.push({ pts: pts, L: L, t: Math.random() * L, s: U.rand(60, 150) });
        }
      }
      if (U.reduced && el._fxDone) return;
      el._fxDone = true;
      var c = cv.getContext('2d'), col = getComputedStyle(cv).color;
      c.clearRect(0, 0, w, h);
      c.strokeStyle = col; c.fillStyle = col;
      el._fxP.forEach(function (p) {
        c.globalAlpha = .22;
        c.beginPath();
        p.pts.forEach(function (q, i) { if (i) c.lineTo(q[0], q[1]); else c.moveTo(q[0], q[1]); });
        c.stroke();
        p.t = (p.t + p.s * dt) % p.L;
        var d = p.t;
        for (var i = 1; i < p.pts.length; i++) {
          var a = p.pts[i - 1], b = p.pts[i], s = Math.abs(b[0] - a[0]) + Math.abs(b[1] - a[1]);
          if (d <= s) { var k = d / (s || 1); c.globalAlpha = 1; c.beginPath(); c.arc(a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, 2.4, 0, 7); c.fill(); break; }
          d -= s;
        }
      });
    }
  });

  // Plusieurs couches de vagues se balancent
  FX.register('sea-layers', {
    setup: function (el) { U.ensurePositioned(el); el._fxCv = U.make('canvas', 'fx-gen', el); el._fxCv.setAttribute('aria-hidden', 'true'); },
    tick: function (el, dt, t) {
      var cv = el._fxCv, w = cv.clientWidth, h = cv.clientHeight;
      if (!w) return;
      if (U.reduced && el._fxDone) return;
      el._fxDone = true;
      if (cv.width !== w) { cv.width = w; cv.height = h; }
      var c = cv.getContext('2d'), cols = U.cssVar(el, '--fx-sea', '#9ec4ff,#4d8bff,#0047ff,#002a99').split(',');
      c.clearRect(0, 0, w, h);
      cols.forEach(function (col, i) {
        var base = h * (.42 + i * .14), T = t * .001 * (.5 + i * .25);
        c.fillStyle = col;
        c.beginPath();
        c.moveTo(0, h);
        for (var x = 0; x <= w + 8; x += 8) c.lineTo(x, base + Math.sin(x * .018 + T + i * 1.7) * (10 + i * 3) + Math.sin(x * .007 - T) * 7);
        c.lineTo(w, h);
        c.closePath();
        c.fill();
      });
    }
  });

  // Des poussières flottent dans un rayon de lumière
  FX.register('dust-motes', {
    setup: function (el) {
      U.ensurePositioned(el);
      el._fxCv = U.make('canvas', 'fx-gen', el);
      el._fxCv.setAttribute('aria-hidden', 'true');
      el._fxD = [];
      for (var i = 0; i < U.num(el, 'fxCount', 60); i++) el._fxD.push({ x: Math.random(), y: Math.random(), z: Math.random(), a: U.rand(0, 6) });
      el._fxM = null;
      el.addEventListener('pointermove', function (e) { var r = el.getBoundingClientRect(); el._fxM = [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]; });
      el.addEventListener('pointerleave', function () { el._fxM = null; });
    },
    tick: function (el, dt, t) {
      var cv = el._fxCv, w = cv.clientWidth, h = cv.clientHeight;
      if (!w) return;
      if (U.reduced && el._fxDone) return;
      el._fxDone = true;
      if (cv.width !== w) { cv.width = w; cv.height = h; }
      var c = cv.getContext('2d'), M = el._fxM;
      c.clearRect(0, 0, w, h);
      c.fillStyle = getComputedStyle(cv).color;
      el._fxD.forEach(function (d) {
        d.x += Math.sin(t * .0003 + d.a) * .0004;
        d.y -= (.01 + d.z * .02) * dt;
        if (d.y < -.02) { d.y = 1.02; d.x = Math.random(); }
        if (M) { d.x += (M[0] - d.x) * .002; d.y += (M[1] - d.y) * .002; }
        c.globalAlpha = (.15 + d.z * .6) * (.6 + .4 * Math.sin(t * .001 + d.a));
        c.beginPath();
        c.arc(d.x * w, d.y * h, .5 + d.z * 1.6, 0, 7);
        c.fill();
      });
    }
  });

  // Une grille d'hexagones s'éclaire autour du curseur
  FX.register('hex-glow', {
    setup: function (el) {
      el._fxH = false;
      el.addEventListener('pointermove', function (e) { var r = el.getBoundingClientRect(); el._fxH = true; el.style.setProperty('--fx-mx', (e.clientX - r.left) + 'px'); el.style.setProperty('--fx-my', (e.clientY - r.top) + 'px'); });
      el.addEventListener('pointerleave', function () { el._fxH = false; });
    },
    tick: function (el, dt, t) {
      if (el._fxH || U.reduced) return;
      el.style.setProperty('--fx-mx', (el.offsetWidth * (.5 + Math.cos(t * .0008) * .4)).toFixed(0) + 'px');
      el.style.setProperty('--fx-my', (el.offsetHeight * (.5 + Math.sin(t * .0011) * .4)).toFixed(0) + 'px');
    }
  });

  // Des nuages dérivent à plusieurs profondeurs
  FX.register('cloud-drift', {
    setup: function (el) {
      U.ensurePositioned(el);
      el.classList.add('fx-cl-host');
      var box = U.make('div', 'fx-cl-b', el);
      box.setAttribute('aria-hidden', 'true');
      el._fxC = [];
      for (var i = 0; i < U.num(el, 'fxCount', 7); i++) {
        var c = U.make('i', '', box), z = Math.random();
        c.style.top = U.rand(4, 70) + '%';
        c.style.setProperty('--fx-s', (.4 + z * .9).toFixed(2));
        c.style.opacity = (.45 + z * .55).toFixed(2);
        el._fxC.push({ d: c, x: Math.random() * 120 - 20, v: 1.2 + z * 2.6 });
      }
    },
    tick: function (el, dt) {
      if (U.reduced && el._fxDone) return;
      el._fxDone = true;
      el._fxC.forEach(function (c) {
        c.x += c.v * dt;
        if (c.x > 110) c.x = -30;
        c.d.style.left = c.x.toFixed(2) + '%';
      });
    }
  });

  // Un voyage dans les étoiles, qui s'accélère au survol
  FX.register('star-warp', {
    setup: function (el) {
      U.ensurePositioned(el);
      el._fxCv = U.make('canvas', 'fx-gen', el);
      el._fxCv.setAttribute('aria-hidden', 'true');
      el._fxS = [];
      for (var i = 0; i < U.num(el, 'fxCount', 180); i++) el._fxS.push({ x: U.rand(-1, 1), y: U.rand(-1, 1), z: Math.random() });
      el._fxV = .2;
    },
    tick: function (el, dt) {
      var cv = el._fxCv, w = cv.clientWidth, h = cv.clientHeight;
      if (!w) return;
      if (U.reduced && el._fxDone) return;
      el._fxDone = true;
      if (cv.width !== w) { cv.width = w; cv.height = h; }
      el._fxV = U.lerp(el._fxV, el.matches(':hover') ? .9 : U.num(el, 'fxSpeed', .18), .03);
      var c = cv.getContext('2d'), v = el._fxV;
      c.clearRect(0, 0, w, h);
      c.strokeStyle = getComputedStyle(cv).color;
      el._fxS.forEach(function (s) {
        var oz = s.z;
        s.z -= v * dt;
        if (s.z <= .02) { s.z = 1; s.x = U.rand(-1, 1); s.y = U.rand(-1, 1); return; }
        var k = .4 * Math.min(w, h);
        c.globalAlpha = 1 - s.z;
        c.lineWidth = (1 - s.z) * 1.8;
        c.beginPath();
        c.moveTo(w / 2 + s.x * k / oz, h / 2 + s.y * k / oz);
        c.lineTo(w / 2 + s.x * k / s.z, h / 2 + s.y * k / s.z);
        c.stroke();
      });
    }
  });

  // Des pendules se désynchronisent et dessinent des vagues
  FX.register('pendulum-wave', {
    setup: function (el) {
      el.setAttribute('aria-hidden', 'true');
      var n = U.num(el, 'fxCount', 14);
      el._fxP = [];
      for (var i = 0; i < n; i++) { var d = U.make('i', '', el); el._fxP.push({ d: d, f: 18 + i }); }
    },
    tick: function (el, dt, t) {
      if (U.reduced) return;
      var T = t / U.num(el, 'fxCycle', 42000) * 6.283;
      el._fxP.forEach(function (p) { p.d.style.setProperty('--fx-a', (Math.sin(T * p.f) * 38).toFixed(2) + 'deg'); });
    }
  });

  // Un panneau latéral qui pousse tout le contenu
  FX.register('drawer-push', {
    setup: function (el) {
      var btn = el.querySelector('[data-open]'), pan = el.querySelector('aside');
      if (!btn || !pan) return;
      btn.setAttribute('aria-expanded', 'false');
      pan.setAttribute('inert', '');
      var set = function (on) {
        el.classList.toggle('fx-open', on);
        btn.setAttribute('aria-expanded', on);
        if (on) { pan.removeAttribute('inert'); var f = pan.querySelector('a,button'); if (f) f.focus(); }
        else { pan.setAttribute('inert', ''); btn.focus(); }
      };
      btn.addEventListener('click', function () { set(!el.classList.contains('fx-open')); });
      el.addEventListener('keydown', function (e) { if (e.key === 'Escape' && el.classList.contains('fx-open')) set(false); });
    }
  });

  // Un bouton de remontée qui montre la part lue
  FX.register('back-to-top-progress', {
    setup: function (el) {
      el.setAttribute('aria-label', el.getAttribute('aria-label') || 'Revenir en haut');
      el.innerHTML = '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="18" class="b"/><circle cx="20" cy="20" r="18" pathLength="100" class="o"/></svg><span aria-hidden="true">↑</span>';
      el.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: U.reduced ? 'auto' : 'smooth' }); });
      if (el.dataset.fxDemo) el.classList.add('fx-show');
    },
    scroll: function (el) {
      var max = document.documentElement.scrollHeight - innerHeight, p = max > 0 ? window.scrollY / max : 0;
      el.style.setProperty('--fx-v', (p * 100).toFixed(1));
      if (!el.dataset.fxDemo) el.classList.toggle('fx-show', window.scrollY > U.num(el, 'fxAfter', 400));
    }
  });

  // Une grille filtrable dont les éléments glissent à leur nouvelle place
  FX.register('tag-filter-flip', {
    setup: function (el) {
      var bar = el.querySelector('[data-tags]'), grid = el.querySelector('[data-grid]');
      if (!bar || !grid) return;
      var items = Array.prototype.slice.call(grid.children), tags = ['Tout'];
      items.forEach(function (i) { (i.dataset.tag || '').split(' ').forEach(function (t) { if (t && tags.indexOf(t) < 0) tags.push(t); }); });
      var apply = function (tag) {
        var first = new Map();
        items.forEach(function (i) { if (!i.hidden) first.set(i, i.getBoundingClientRect()); });
        items.forEach(function (i) { i.hidden = !(tag === 'Tout' || (i.dataset.tag || '').split(' ').indexOf(tag) >= 0); });
        items.forEach(function (i) {
          if (i.hidden || U.reduced || !i.animate) return;
          var l = i.getBoundingClientRect(), f = first.get(i);
          if (f) i.animate([{ transform: 'translate(' + (f.left - l.left) + 'px,' + (f.top - l.top) + 'px)' }, { transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.16,1,.3,1)' });
          else i.animate([{ opacity: 0, transform: 'scale(.8)' }, { opacity: 1, transform: 'none' }], { duration: 300 });
        });
      };
      tags.forEach(function (t, k) {
        var b = U.make('button', '', bar);
        b.type = 'button';
        b.textContent = t;
        b.setAttribute('aria-pressed', !k);
        b.addEventListener('click', function () { bar.querySelectorAll('button').forEach(function (o) { o.setAttribute('aria-pressed', o === b); }); apply(t); });
      });
    }
  });

  // Une barre latérale qui se replie sur ses icônes
  FX.register('sidebar-collapse', {
    setup: function (el) {
      var btn = el.querySelector('button[data-toggle]'), key = el.dataset.fxKey;
      var set = function (on) {
        el.classList.toggle('fx-small', on);
        if (btn) { btn.setAttribute('aria-expanded', !on); btn.setAttribute('aria-label', on ? 'Déplier le menu' : 'Replier le menu'); }
        if (key) try { localStorage.setItem(key, on ? '1' : '0'); } catch (err) {}
      };
      var start = false;
      if (key) try { start = localStorage.getItem(key) === '1'; } catch (err) {}
      set(start);
      if (btn) btn.addEventListener('click', function () { set(!el.classList.contains('fx-small')); });
      el.querySelectorAll('a').forEach(function (a) { var s = a.querySelector('span'); if (s) a.title = s.textContent; });
    },
    trigger: function (el) { el.classList.toggle('fx-small'); }
  });

  // Un camembert dont les parts s'ouvrent au survol
  FX.register('pie-explode', {
    entrance: true,
    setup: function (el) {
      var parts = (el.dataset.fxParts || 'Design:40,Code:30,Son:20,Récit:10').split(',').map(function (s) { var p = s.split(':'); return { n: p[0], v: +p[1] }; });
      var sum = parts.reduce(function (a, p) { return a + p.v; }, 0), a = -Math.PI / 2, svg = '<svg viewBox="-60 -60 120 120" aria-hidden="true">';
      parts.forEach(function (p, i) {
        var b = a + p.v / sum * Math.PI * 2, mid = (a + b) / 2, big = b - a > Math.PI ? 1 : 0;
        svg += '<path style="--fx-i:' + i + ';--fx-x:' + (Math.cos(mid) * 6).toFixed(1) + 'px;--fx-y:' + (Math.sin(mid) * 6).toFixed(1) + 'px" d="M0 0 L' + (Math.cos(a) * 50).toFixed(2) + ' ' + (Math.sin(a) * 50).toFixed(2) + ' A50 50 0 ' + big + ' 1 ' + (Math.cos(b) * 50).toFixed(2) + ' ' + (Math.sin(b) * 50).toFixed(2) + ' Z"><title>' + p.n + ' ' + Math.round(p.v / sum * 100) + ' %</title></path>';
        a = b;
      });
      el.setAttribute('role', 'img');
      el.setAttribute('aria-label', parts.map(function (p) { return p.n + ' ' + Math.round(p.v / sum * 100) + ' %'; }).join(', '));
      el.innerHTML = svg + '</svg>';
    }
  });

  // Un entonnoir montre ce qui reste à chaque étape
  FX.register('funnel-steps', {
    entrance: true,
    setup: function (el) {
      var st = (el.dataset.fxSteps || 'Visites:1000,Essais:420,Clients:96').split(',').map(function (s) { var p = s.split(':'); return { n: p[0], v: +p[1] }; }), top = st[0].v;
      st.forEach(function (s, i) {
        var r = U.make('div', 'fx-fn-r', el);
        r.style.setProperty('--fx-w', s.v / top);
        r.style.setProperty('--fx-i', i);
        r.innerHTML = '<i></i><span></span>';
        r.lastChild.textContent = s.n + ' · ' + s.v + (i ? ' (' + Math.round(s.v / st[i - 1].v * 100) + ' %)' : '');
      });
    }
  });

  // Une carte de rectangles proportionnels s'assemble
  FX.register('treemap-grow', {
    entrance: true,
    setup: function (el) {
      var it = (el.dataset.fxItems || 'Vidéo:42,Son:24,Image:18,Texte:10,Autre:6').split(',').map(function (s) { var p = s.split(':'); return { n: p[0], v: +p[1] }; }).sort(function (a, b) { return b.v - a.v; });
      var i = 0;
      var cut = function (list, x, y, w, h, hz) {
        if (list.length === 1) {
          var d = U.make('div', '', el);
          d.textContent = list[0].n;
          d.style.left = x + '%'; d.style.top = y + '%'; d.style.width = w + '%'; d.style.height = h + '%';
          d.style.setProperty('--fx-i', i++);
          d.title = list[0].n + ' : ' + list[0].v;
          return;
        }
        var tot = list.reduce(function (a, c) { return a + c.v; }, 0), acc = 0, k = 0;
        while (k < list.length - 1 && acc + list[k].v <= tot / 2) acc += list[k++].v;
        if (!k) { acc = list[0].v; k = 1; }
        var r = acc / tot;
        if (hz) { cut(list.slice(0, k), x, y, w * r, h, !hz); cut(list.slice(k), x + w * r, y, w * (1 - r), h, !hz); }
        else { cut(list.slice(0, k), x, y, w, h * r, !hz); cut(list.slice(k), x, y + h * r, w, h * (1 - r), !hz); }
      };
      cut(it, 0, 0, 100, 100, true);
    }
  });

  // Des bulles proportionnelles se serrent les unes contre les autres
  FX.register('bubble-pack', {
    entrance: true,
    setup: function (el) {
      var it = (el.dataset.fxItems || 'Paris:50,Lyon:30,Nantes:22,Lille:18,Rennes:14,Metz:9').split(',').map(function (s) { var p = s.split(':'); return { n: p[0], v: +p[1] }; }).sort(function (a, b) { return b.v - a.v; });
      var W = el.clientWidth || 220, H = el.clientHeight || 160, placed = [], mx = it[0].v;
      el.setAttribute('role', 'img');
      el.setAttribute('aria-label', it.map(function (i) { return i.n + ' ' + i.v; }).join(', '));
      it.forEach(function (o, k) {
        var r = Math.sqrt(o.v / mx) * Math.min(W, H) * .26, a = 0, d = 0, x, y;
        do { x = Math.cos(a) * d; y = Math.sin(a) * d * .75; a += .5; d += .7; }
        while (placed.some(function (p) { return Math.hypot(p.x - x, p.y - y) < p.r + r + 2; }) && d < 400);
        placed.push({ x: x, y: y, r: r });
        var b = U.make('span', '', el);
        b.setAttribute('aria-hidden', 'true');
        b.textContent = r > 18 ? o.n : '';
        b.style.cssText = 'width:' + r * 2 + 'px;height:' + r * 2 + 'px;left:' + (W / 2 + x - r) + 'px;top:' + (H / 2 + y - r) + 'px';
        b.style.setProperty('--fx-i', k);
      });
    }
  });

  // Une carte de tâche passe de colonne en colonne
  FX.register('kanban-move', {
    setup: function (el) {
      el._fxCols = Array.prototype.slice.call(el.children);
      el._fxT = 0;
      el._fxStep = function () {
        var col = el._fxCols.filter(function (c) { return c.querySelector('[data-card]'); });
        if (!col.length) return;
        var from = col[Math.floor(Math.random() * col.length)], cards = from.querySelectorAll('[data-card]'), card = cards[cards.length - 1];
        var i = el._fxCols.indexOf(from), to = el._fxCols[(i + 1) % el._fxCols.length];
        var a = card.getBoundingClientRect();
        to.appendChild(card);
        var b = card.getBoundingClientRect();
        if (!U.reduced && card.animate) card.animate([{ transform: 'translate(' + (a.left - b.left) + 'px,' + (a.top - b.top) + 'px) rotate(3deg)' }, { transform: 'none' }], { duration: 600, easing: 'cubic-bezier(.16,1,.3,1)' });
      };
    },
    trigger: function (el) { el._fxStep(); },
    tick: function (el, dt) {
      if (U.reduced) return;
      el._fxT += dt;
      if (el._fxT > U.num(el, 'fxEvery', 1.6)) { el._fxT = 0; el._fxStep(); }
    }
  });

  // Un compte à rebours en anneaux vers une vraie date
  FX.register('countdown-rings', {
    setup: function (el) {
      var end = new Date(el.dataset.fxTo || Date.now() + 3 * 864e5 + 5 * 36e5).getTime();
      var units = [['jours', 864e5, 30], ['heures', 36e5, 24], ['min', 6e4, 60], ['s', 1e3, 60]];
      el.setAttribute('role', 'timer');
      el.innerHTML = units.map(function (u) { return '<div><svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="17" class="b"/><circle cx="20" cy="20" r="17" pathLength="100" class="o"/></svg><b></b><small>' + u[0] + '</small></div>'; }).join('');
      var box = el.children, last = -1;
      el._fxTick = function () {
        var rest = Math.max(0, end - Date.now()), s = Math.floor(rest / 1000);
        if (s === last) return;
        last = s;
        units.forEach(function (u, i) {
          var v = Math.floor(rest / u[1]);
          if (i) v %= u[2];
          box[i].querySelector('b').textContent = v;
          box[i].style.setProperty('--fx-v', Math.min(100, v / u[2] * 100).toFixed(1));
        });
        if (!rest) el.dispatchEvent(new CustomEvent('fx:done', { bubbles: true }));
      };
      el._fxTick();
    },
    tick: function (el) { el._fxTick(); }
  });

  // Le texte s'écrit, se trompe, corrige
  FX.register('typing-correct', {
    entrance: true,
    setup: function (el) {
      el._fxOk = el.textContent.trim();
      el._fxBad = el.dataset.fxWrong || el._fxOk;
      el.setAttribute('aria-label', el._fxOk);
      if (!U.reduced) el.textContent = '';
    },
    reset: function (el) { el._fxK = (el._fxK || 0) + 1; el.textContent = ''; },
    enter: function (el) {
      var run = el._fxK = (el._fxK || 0) + 1, ok = el._fxOk, bad = el._fxBad, i = 0, phase = 0, common = 0;
      if (U.reduced) { el.textContent = ok; return; }
      while (common < ok.length && ok[common] === bad[common]) common++;
      var sp = U.num(el, 'fxSpeed', 60);
      (function step() {
        if (run !== el._fxK) return;
        if (phase === 0) { el.textContent = bad.slice(0, ++i); if (i >= bad.length) { phase = 1; return setTimeout(step, 550); } }
        else if (phase === 1) { el.textContent = bad.slice(0, --i); if (i <= common) phase = 2; }
        else { el.textContent = ok.slice(0, ++i); if (i >= ok.length) return; }
        setTimeout(step, phase === 1 ? sp * .6 : sp * U.rand(.6, 1.5));
      })();
    }
  });

  // Chaque lettre se penche vers le curseur
  FX.register('letter-tilt-cursor', {
    setup: function (el) {
      U.splitChars(el);
      var cs = el.querySelectorAll('.fx-char');
      if (U.reduced) return;
      el.addEventListener('pointermove', function (e) {
        cs.forEach(function (c) {
          var r = c.getBoundingClientRect(), dx = e.clientX - r.left - r.width / 2, dy = e.clientY - r.top - r.height / 2, d = Math.hypot(dx, dy);
          var k = Math.max(0, 1 - d / U.num(el, 'fxRadius', 180));
          c.style.setProperty('--fx-t', (dx / (d || 1) * 22 * k).toFixed(1) + 'deg');
        });
      });
      el.addEventListener('pointerleave', function () { cs.forEach(function (c) { c.style.setProperty('--fx-t', '0deg'); }); });
    }
  });

  // Un mot vertical qui bascule à l'horizontale au survol
  FX.register('vertical-type-flip', {
    setup: function (el) { U.splitChars(el); el.querySelectorAll('.fx-char').forEach(function (c, i) { c.style.setProperty('--fx-i', i); }); }
  });

  // Les mots sont frappés l'un après l'autre sur l'écran
  FX.register('stamp-word', { entrance: true, setup: function (el) { U.splitWords(el); } });

  // Une conversation apparaît bulle après bulle
  FX.register('word-bubbles', {
    entrance: true,
    setup: function (el) {
      var acc = 0;
      Array.prototype.forEach.call(el.children, function (b) {
        b.style.setProperty('--fx-d', acc + 'ms');
        acc += 260 + b.textContent.length * U.num(el, 'fxPerChar', 16);
      });
    }
  });

  // Un texte long qui se déplie jusqu'à sa vraie hauteur
  FX.register('line-clamp-expand', {
    setup: function (el) {
      var box = document.createElement('div');
      box.className = 'fx-lc';
      while (el.firstChild) box.appendChild(el.firstChild);
      el.appendChild(box);
      var lines = U.num(el, 'fxLines', 3), lh = parseFloat(getComputedStyle(box).lineHeight) || 20, min = lh * lines;
      box.style.maxHeight = min + 'px';
      if (box.scrollHeight <= min + 2) { box.style.maxHeight = 'none'; return; }
      el.classList.add('fx-clamped');
      var b = U.make('button', '', el);
      b.type = 'button';
      b.textContent = el.dataset.fxMore || 'Lire la suite';
      b.setAttribute('aria-expanded', 'false');
      b.addEventListener('click', function () {
        var on = !el.classList.contains('fx-open');
        el.classList.toggle('fx-open', on);
        box.style.maxHeight = (on ? box.scrollHeight : min) + 'px';
        b.textContent = on ? (el.dataset.fxLess || 'Réduire') : (el.dataset.fxMore || 'Lire la suite');
        b.setAttribute('aria-expanded', on);
      });
    }
  });
})(window.FX);

/* Pack 23 — Banque et finance */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Un bandeau de cours avec le sens de chaque variation
  FX.register('ticker-tape', {
    setup: function (el) {
      var rows = (el.dataset.fxItems || 'AAA:102,4:1.2|BBB:58,1:-0.6|CCC:230,0:0.4|DDD:14,7:-2.1').split('|');
      var html = rows.map(function (r) {
        var p = r.split(':'), v = parseFloat(p[2]), up = v >= 0;
        return '<span class="' + (up ? 'fx-up' : 'fx-dn') + '"><b>' + p[0] + '</b> ' + p[1] + ' <i>' + (up ? '▲ +' : '▼ ') + p[2] + ' %</i></span>';
      }).join('');
      el.setAttribute('aria-label', 'Cours : ' + rows.join(', ').replace(/:/g, ' '));
      el.innerHTML = '<div class="fx-tt" aria-hidden="true">' + html + html + '</div>';
      el.style.setProperty('--fx-t', (rows.length * U.num(el, 'fxPace', 4)) + 's');
    }
  });

  // Un graphique en chandeliers qui se dessine bougie par bougie
  FX.register('candlestick-draw', {
    entrance: true,
    setup: function (el) {
      var d = (el.dataset.fxData || '20,26,18,24|24,28,22,23|23,25,19,20|20,27,20,26|26,31,25,30|30,32,26,27|27,34,27,33').split('|').map(function (r) { return r.split(',').map(Number); });
      var hi = Math.max.apply(null, d.map(function (c) { return c[1]; })), lo = Math.min.apply(null, d.map(function (c) { return c[2]; })), Y = function (v) { return 96 - (v - lo) / ((hi - lo) || 1) * 92; };
      var w = 100 / d.length, s = '<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">';
      d.forEach(function (c, i) {
        var x = i * w + w / 2, up = c[3] >= c[0], top = Y(Math.max(c[0], c[3])), h = Math.max(1, Math.abs(Y(c[0]) - Y(c[3])));
        s += '<g class="' + (up ? 'fx-up' : 'fx-dn') + '" style="--fx-i:' + i + '"><line x1="' + x + '" x2="' + x + '" y1="' + Y(c[1]) + '" y2="' + Y(c[2]) + '"/><rect x="' + (x - w * .3) + '" y="' + top + '" width="' + w * .6 + '" height="' + h + '"/></g>';
      });
      el.innerHTML = s + '</svg>';
      el.setAttribute('role', 'img');
      el.setAttribute('aria-label', 'Cours de ' + d[0][0] + ' à ' + d[d.length - 1][3] + ' sur ' + d.length + ' périodes');
    }
  });

  // Un solde qu'on masque d'un geste, pour la discrétion
  FX.register('balance-mask', {
    setup: function (el) {
      var v = el.textContent.trim(), key = el.dataset.fxKey, hidden = false;
      el.textContent = '';
      var out = U.make('span', 'fx-bm-v', el), b = U.make('button', 'fx-bm-b', el);
      b.type = 'button';
      var show = function () {
        out.textContent = hidden ? '••••••' : v;
        el.classList.toggle('fx-hid', hidden);
        b.setAttribute('aria-pressed', hidden);
        b.setAttribute('aria-label', hidden ? 'Afficher le montant' : 'Masquer le montant');
        b.textContent = hidden ? '○' : '●';
      };
      if (key) try { hidden = localStorage.getItem(key) === '1'; } catch (err) {}
      show();
      b.addEventListener('click', function () {
        hidden = !hidden;
        if (key) try { localStorage.setItem(key, hidden ? '1' : '0'); } catch (err) {}
        show();
      });
    }
  });

  // Un numéro de carte masqué, révélé quelques secondes
  FX.register('card-number-reveal', {
    setup: function (el) {
      var n = (el.dataset.fxNumber || '4000 0000 0000 0002').split(' '), to;
      el.textContent = '';
      var box = U.make('span', 'fx-cn', el), b = U.make('button', '', el);
      b.type = 'button';
      var groups = n.map(function (g, i) { var s = U.make('span', '', box); s.dataset.real = g; s.textContent = i === n.length - 1 ? g : '••••'; return s; });
      var set = function (on) {
        groups.forEach(function (s, i) { if (i < n.length - 1) { s.textContent = on ? s.dataset.real : '••••'; s.classList.remove('fx-go'); void s.offsetWidth; s.style.setProperty('--fx-i', i); s.classList.add('fx-go'); } });
        b.textContent = on ? 'Masquer' : 'Afficher';
        b.setAttribute('aria-pressed', on);
        clearTimeout(to);
        if (on) to = setTimeout(function () { set(false); }, U.num(el, 'fxHold', 6000));
      };
      b.addEventListener('click', function () { set(b.getAttribute('aria-pressed') !== 'true'); });
      set(false);
    }
  });

  // Deux champs de montant, reliés par un taux
  FX.register('currency-converter', {
    setup: function (el) {
      var rate = U.num(el, 'fxRate', 1.08), A = el.dataset.fxFrom || 'EUR', B = el.dataset.fxTo || 'USD';
      el.innerHTML = '<label><span></span><input type="number" min="0" step="any" value="100"></label><button type="button" aria-label="Inverser les devises">⇄</button><label><span></span><output></output></label><small></small>';
      var la = el.querySelector('label span'), lb = el.querySelectorAll('label span')[1], input = el.querySelector('input'), out = el.querySelector('output'), sw = el.querySelector('button'), note = el.querySelector('small');
      var calc = function () {
        la.textContent = A; lb.textContent = B;
        var v = (parseFloat(input.value) || 0) * rate;
        out.textContent = v.toLocaleString('fr-FR', { maximumFractionDigits: 2 });
        note.textContent = '1 ' + A + ' = ' + rate.toFixed(4) + ' ' + B + ' (taux indicatif)';
      };
      input.addEventListener('input', calc);
      sw.addEventListener('click', function () { var t = A; A = B; B = t; rate = 1 / rate; sw.classList.toggle('fx-flip'); calc(); });
      calc();
    }
  });

  // Un simulateur de crédit qui répond en direct
  FX.register('loan-calculator', {
    setup: function (el) {
      var rate = U.num(el, 'fxRate', 3.4);
      el.innerHTML = '<label>Montant <b class="a"></b><input type="range" min="5000" max="300000" step="1000" value="' + U.num(el, 'fxAmount', 120000) + '"></label><label>Durée <b class="y"></b><input type="range" min="1" max="30" value="' + U.num(el, 'fxYears', 20) + '"></label><output aria-live="polite"><strong></strong><small></small></output>';
      var r = el.querySelectorAll('input'), f = function (n) { return Math.round(n).toLocaleString('fr-FR') + ' €'; };
      var calc = function () {
        var P = +r[0].value, n = +r[1].value * 12, i = rate / 1200;
        var m = i ? P * i / (1 - Math.pow(1 + i, -n)) : P / n;
        el.querySelector('.a').textContent = f(P);
        el.querySelector('.y').textContent = r[1].value + ' ans';
        el.querySelector('strong').textContent = f(m) + ' / mois';
        el.querySelector('small').textContent = 'Coût du crédit : ' + f(m * n - P) + ' à ' + rate + ' % (simulation)';
        el.style.setProperty('--fx-q', Math.min(1, (m * n - P) / (m * n)).toFixed(3));
      };
      r.forEach(function (x) { x.addEventListener('input', calc); });
      calc();
    }
  });

  // Une courbe d'épargne qui montre l'effet du temps
  FX.register('savings-curve', {
    setup: function (el) {
      var rate = U.num(el, 'fxRate', 4) / 100;
      el.innerHTML = '<svg viewBox="0 0 200 90" preserveAspectRatio="none" role="img"><path class="a"/><path class="b"/></svg><label>Par mois <b></b><input type="range" min="10" max="1000" step="10" value="' + U.num(el, 'fxMonthly', 150) + '"></label><p aria-live="polite"></p>';
      var input = el.querySelector('input'), a = el.querySelector('.a'), b = el.querySelector('.b'), Y = U.num(el, 'fxYears', 25), svg = el.querySelector('svg');
      var draw = function () {
        var m = +input.value, cap = 0, pts = [], dep = [];
        for (var y = 0; y <= Y; y++) { pts.push(cap); dep.push(m * 12 * y); cap = (cap + m * 12) * (1 + rate); }
        var max = pts[Y], line = function (l) { return 'M' + l.map(function (v, i) { return (i / Y * 200).toFixed(1) + ' ' + (88 - v / max * 84).toFixed(1); }).join(' L'); };
        a.setAttribute('d', line(pts) + ' L200 90 L0 90 Z');
        b.setAttribute('d', line(dep));
        el.querySelector('label b').textContent = m + ' €';
        var txt = Math.round(pts[Y]).toLocaleString('fr-FR') + ' € au bout de ' + Y + ' ans, dont ' + Math.round(pts[Y] - dep[Y]).toLocaleString('fr-FR') + ' € d\'intérêts (hypothèse : ' + (rate * 100) + ' % par an)';
        el.querySelector('p').textContent = txt;
        svg.setAttribute('aria-label', txt);
      };
      input.addEventListener('input', draw);
      draw();
    }
  });

  // Dans un tableau de taux, la meilleure valeur de chaque colonne est marquée
  FX.register('rate-best-row', {
    entrance: true,
    setup: function (el) {
      var rows = el.tBodies[0] ? el.tBodies[0].rows : [];
      if (!rows.length) return;
      var mode = (el.dataset.fxBest || 'min').split(',');
      for (var c = 1; c < rows[0].cells.length; c++) {
        var best = null, bv = null, m = mode[Math.min(c - 1, mode.length - 1)];
        for (var r = 0; r < rows.length; r++) {
          var v = parseFloat(rows[r].cells[c].textContent.replace(',', '.'));
          if (!isNaN(v) && (bv === null || (m === 'max' ? v > bv : v < bv))) { bv = v; best = rows[r].cells[c]; }
        }
        if (best) { best.classList.add('fx-best'); best.setAttribute('aria-label', best.textContent.trim() + ', meilleure valeur'); best.style.setProperty('--fx-i', c); }
      }
    }
  });

  // Des opérations arrivent en haut de la liste
  FX.register('transaction-feed', {
    setup: function (el) {
      el.setAttribute('role', 'log');
      el.setAttribute('aria-live', 'polite');
      el._fxAdd = function (name, amount) {
        var r = document.createElement('div');
        r.className = 'fx-tf ' + (amount >= 0 ? 'fx-in-m' : 'fx-out-m');
        r.innerHTML = '<span></span><b></b>';
        r.firstChild.textContent = name;
        r.lastChild.textContent = (amount >= 0 ? '+' : '−') + Math.abs(amount).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' €';
        el.insertBefore(r, el.firstChild);
        while (el.children.length > U.num(el, 'fxMax', 4)) el.lastChild.remove();
      };
      var seq = [['Café Rivage', -4.2], ['Salaire', 2150], ['Librairie', -18.9], ['Remboursement', 32], ['Boulangerie', -6.4]];
      el._fxI = 0;
      el._fxSeq = seq;
      seq.slice(0, 3).forEach(function (s) { el._fxAdd(s[0], s[1]); });
      el._fxT = 0;
    },
    trigger: function (el) { var s = el._fxSeq[el._fxI++ % el._fxSeq.length]; el._fxAdd(s[0], s[1]); },
    tick: function (el, dt) {
      if (el.dataset.fxDemo !== 'true' || U.reduced) return;
      el._fxT += dt;
      if (el._fxT > 2.2) { el._fxT = 0; FX.trigger(el); }
    }
  });

  // Une carte bancaire qui suit le curseur et se retourne
  FX.register('bank-card-flip', {
    setup: function (el) {
      el.tabIndex = 0;
      el.setAttribute('role', 'button');
      el.setAttribute('aria-pressed', 'false');
      var flip = function () { var on = el.classList.toggle('fx-back'); el.setAttribute('aria-pressed', on); };
      el.addEventListener('click', flip);
      el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } });
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--fx-ry', (((e.clientX - r.left) / r.width - .5) * 22).toFixed(1) + 'deg');
        el.style.setProperty('--fx-rx', ((.5 - (e.clientY - r.top) / r.height) * 18).toFixed(1) + 'deg');
      });
      el.addEventListener('pointerleave', function () { el.style.setProperty('--fx-rx', '0deg'); el.style.setProperty('--fx-ry', '0deg'); });
    }
  });

  // Une valeur clignote brièvement selon le sens de son changement
  FX.register('price-tick-flash', {
    setup: function (el) {
      el._fxV = parseFloat(el.textContent.replace(',', '.')) || 0;
      el._fxSet = function (v) {
        var up = v >= el._fxV;
        el._fxV = v;
        el.textContent = v.toFixed(U.num(el, 'fxDigits', 2)).replace('.', ',') + (up ? ' ▲' : ' ▼');
        el.classList.remove('fx-tu', 'fx-td');
        void el.offsetWidth;
        el.classList.add(up ? 'fx-tu' : 'fx-td');
      };
      el._fxT = 0;
    },
    trigger: function (el) { el._fxSet(el._fxV + U.rand(-1.5, 1.6)); },
    tick: function (el, dt) {
      if (el.dataset.fxDemo !== 'true' || U.reduced) return;
      el._fxT += dt;
      if (el._fxT > 1.3) { el._fxT = 0; FX.trigger(el); }
    }
  });

  // Des enveloppes de budget qui se remplissent et signalent le dépassement
  FX.register('budget-envelopes', {
    entrance: true,
    setup: function (el) {
      (el.dataset.fxItems || 'Courses:320:400|Sorties:180:150|Transports:60:90').split('|').forEach(function (s, i) {
        var p = s.split(':'), use = +p[1], max = +p[2], over = use > max, r = U.make('div', 'fx-be' + (over ? ' fx-over' : ''), el);
        r.innerHTML = '<span></span><em></em><i><b></b></i>';
        r.children[0].textContent = p[0];
        r.children[1].textContent = over ? 'dépassé de ' + (use - max) + ' €' : 'reste ' + (max - use) + ' €';
        r.style.setProperty('--fx-q', Math.min(1, use / max));
        r.style.setProperty('--fx-i', i);
      });
    }
  });

  // Une addition partagée au centime près
  FX.register('bill-splitter', {
    setup: function (el) {
      el.innerHTML = '<label>Total <input type="number" min="0" step="0.01" value="' + U.num(el, 'fxTotal', 86.5) + '"></label><div class="fx-bs-c" role="group" aria-label="Nombre de personnes"><button type="button" aria-label="Une personne de moins">−</button><span></span><button type="button" aria-label="Une personne de plus">+</button></div><div class="fx-bs-p" aria-live="polite"></div>';
      var input = el.querySelector('input'), n = U.num(el, 'fxPeople', 3), lab = el.querySelector('.fx-bs-c span'), out = el.querySelector('.fx-bs-p');
      var draw = function () {
        var cents = Math.round((parseFloat(input.value) || 0) * 100), base = Math.floor(cents / n), extra = cents - base * n, h = '';
        for (var i = 0; i < n; i++) h += '<i style="--fx-i:' + i + '">' + ((base + (i < extra ? 1 : 0)) / 100).toFixed(2).replace('.', ',') + ' €</i>';
        out.innerHTML = h;
        lab.textContent = n + (n > 1 ? ' personnes' : ' personne');
      };
      var bs = el.querySelectorAll('.fx-bs-c button');
      bs[0].addEventListener('click', function () { n = Math.max(1, n - 1); draw(); });
      bs[1].addEventListener('click', function () { n = Math.min(12, n + 1); draw(); });
      input.addEventListener('input', draw);
      draw();
    }
  });

  // Une tirelire transparente qui se remplit vers un objectif
  FX.register('goal-jar', {
    entrance: true,
    setup: function (el) {
      var v = U.num(el, 'fxValue', 640), g = U.num(el, 'fxGoal', 1000);
      el.setAttribute('role', 'meter');
      el.setAttribute('aria-valuemin', 0); el.setAttribute('aria-valuemax', g); el.setAttribute('aria-valuenow', v);
      el.setAttribute('aria-label', el.dataset.fxLabel || 'Objectif');
      el.innerHTML = '<span class="fx-j"><i></i></span><b>' + v.toLocaleString('fr-FR') + ' € sur ' + g.toLocaleString('fr-FR') + ' €</b>';
      el.style.setProperty('--fx-q', Math.min(1, v / g));
      for (var i = 0; i < 4; i++) { var c = U.make('em', '', el.firstChild); c.setAttribute('aria-hidden', 'true'); c.style.setProperty('--fx-i', i); c.style.left = U.rand(25, 65) + '%'; }
    }
  });

  // Un champ d'IBAN groupé par quatre, qui vérifie sa clé
  FX.register('iban-input', {
    setup: function (el) {
      var input = el.querySelector('input');
      if (!input) return;
      input.setAttribute('inputmode', 'text');
      input.autocomplete = 'off';
      var msg = U.make('small', '', el);
      msg.setAttribute('aria-live', 'polite');
      var valid = function (v) {
        if (v.length < 15) return null;
        var s = (v.slice(4) + v.slice(0, 4)).replace(/[A-Z]/g, function (c) { return c.charCodeAt(0) - 55; }), r = 0;
        for (var i = 0; i < s.length; i++) r = (r * 10 + +s[i]) % 97;
        return r === 1;
      };
      input.addEventListener('input', function () {
        var pos = input.value.slice(0, input.selectionStart).replace(/\s/g, '').length;
        var raw = input.value.replace(/[^0-9a-z]/gi, '').toUpperCase().slice(0, 34);
        input.value = raw.replace(/(.{4})/g, '$1 ').trim();
        var c = pos + Math.floor(Math.max(0, pos - 1) / 4);
        input.setSelectionRange(c, c);
        var ok = valid(raw);
        el.classList.toggle('fx-ok', ok === true);
        el.classList.toggle('fx-ko', ok === false);
        msg.textContent = ok === true ? 'Format et clé corrects' : ok === false ? 'La clé ne correspond pas : vérifiez le numéro' : '';
        input.setAttribute('aria-invalid', ok === false);
      });
    }
  });

  // Un cadenas se ferme quand la connexion est sécurisée
  FX.register('secure-lock', {
    entrance: true,
    setup: function (el) {
      el.setAttribute('role', 'status');
      el.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="s" d="M7 11V8a5 5 0 0 1 10 0v3"/><rect x="4.5" y="11" width="15" height="10" rx="2"/></svg><span></span>';
      el._fxM = el.lastChild;
      el._fxM.textContent = el.dataset.fxWait || 'Vérification…';
    },
    reset: function (el) { clearTimeout(el._fxTo); el.classList.remove('fx-shut'); el._fxM.textContent = el.dataset.fxWait || 'Vérification…'; },
    enter: function (el) {
      el._fxTo = setTimeout(function () {
        el.classList.add('fx-shut');
        el._fxM.textContent = el.dataset.fxDone || 'Paiement chiffré';
        el.dispatchEvent(new CustomEvent('fx:secure', { bubbles: true }));
      }, U.num(el, 'fxWait2', 1200));
    }
  });

  // Un reçu sort de l'imprimante, par petits à-coups
  FX.register('receipt-print', {
    entrance: true,
    setup: function (el) {
      var w = document.createElement('div');
      w.className = 'fx-rp';
      while (el.firstChild) w.appendChild(el.firstChild);
      el.appendChild(w);
      el._fxW = w;
    },
    reset: function (el) { el.style.setProperty('--fx-y', '-100%'); },
    enter: function (el) {
      U.tween(el, U.num(el, 'fxDuration', 1500), function (p) {
        var steps = 12, q = Math.floor(p * steps) / steps;
        el.style.setProperty('--fx-y', ((q - 1) * 100).toFixed(1) + '%');
      }, function () { el.style.setProperty('--fx-y', '0%'); });
    }
  });

  // Des piles de pièces qui grandissent une pièce à la fois
  FX.register('coin-stacks', {
    entrance: true,
    setup: function (el) {
      var items = (el.dataset.fxItems || '2024:12|2025:18|2026:27').split('|');
      el.setAttribute('role', 'img');
      el.setAttribute('aria-label', items.join(', ').replace(/:/g, ' : '));
      items.forEach(function (s) {
        var p = s.split(':'), col = U.make('span', 'fx-cs-col', el), n = Math.min(40, +p[1]);
        for (var i = 0; i < n; i++) U.make('i', '', col).style.setProperty('--fx-i', i);
        U.make('b', '', col).textContent = p[0];
      });
    }
  });

  // Des intérêts qui s'accumulent à la seconde
  FX.register('interest-accrual', {
    setup: function (el) {
      el._fxBase = U.num(el, 'fxCapital', 10000);
      el._fxPerS = el._fxBase * U.num(el, 'fxRate', 3) / 100 / 31536000;
      el._fxStart = Date.now();
      el.setAttribute('role', 'timer');
      el.innerHTML = '<b></b><small>' + U.num(el, 'fxRate', 3) + ' % par an, à titre d\'illustration</small>';
    },
    tick: function (el) {
      var v = el._fxBase + el._fxPerS * (Date.now() - el._fxStart) / 1000;
      el.firstChild.textContent = v.toLocaleString('fr-FR', { minimumFractionDigits: 6, maximumFractionDigits: 6 }) + ' €';
    }
  });

  // Un carnet d'ordres et sa profondeur
  FX.register('order-book', {
    setup: function (el) {
      var mid = U.num(el, 'fxMid', 100), step = U.num(el, 'fxStep', .5), n = U.num(el, 'fxLevels', 4);
      el.setAttribute('role', 'img');
      el.setAttribute('aria-label', 'Carnet d\'ordres autour de ' + mid + ' (données d\'exemple)');
      el._fxR = [];
      ['fx-ask', 'fx-bid'].forEach(function (c) {
        for (var k = 0; k < n; k++) {
          var lvl = c === 'fx-ask' ? n - k : k + 1, r = U.make('div', 'fx-ob ' + c, el), p = c === 'fx-ask' ? mid + lvl * step : mid - lvl * step;
          r.setAttribute('aria-hidden', 'true');
          r.innerHTML = '<i></i><span>' + p.toFixed(2).replace('.', ',') + '</span><b></b>';
          el._fxR.push({ r: r, v: U.rand(10, 100) });
        }
      });
      el._fxDraw = function () { el._fxR.forEach(function (o) { o.r.style.setProperty('--fx-v', o.v.toFixed(0) + '%'); o.r.lastChild.textContent = o.v.toFixed(0); }); };
      el._fxDraw();
      el._fxT = 0;
    },
    tick: function (el, dt) {
      if (U.reduced) return;
      el._fxT += dt;
      if (el._fxT < .6) return;
      el._fxT = 0;
      var o = el._fxR[Math.floor(Math.random() * el._fxR.length)];
      o.v = U.clamp(o.v + U.rand(-30, 30), 5, 100);
      el._fxDraw();
    }
  });

  // Une flèche dont l'angle dit la force de la variation
  FX.register('trend-arrow', {
    entrance: true,
    setup: function (el) {
      var v = U.num(el, 'fxValue', 8.4), max = U.num(el, 'fxMax', 20);
      el.style.setProperty('--fx-a', (-U.clamp(v / max, -1, 1) * 60).toFixed(1) + 'deg');
      el.classList.add(v >= 0 ? 'fx-up' : 'fx-dn');
      el.innerHTML = '<i aria-hidden="true">→</i><span>' + (v > 0 ? '+' : '') + String(v).replace('.', ',') + ' %</span>';
    }
  });

  // Un revenu qui se répartit entre les tranches d'imposition
  FX.register('tax-brackets', {
    setup: function (el) {
      var br = (el.dataset.fxBrackets || '0:10000:0|10000:30000:11|30000:80000:30|80000:999999:41').split('|').map(function (s) { return s.split(':').map(Number); });
      el.innerHTML = '<label>Revenu annuel <b></b><input type="range" min="0" max="150000" step="500" value="' + U.num(el, 'fxIncome', 42000) + '"></label><div class="fx-tb-bar" aria-hidden="true"></div><p aria-live="polite"></p>';
      var input = el.querySelector('input'), bar = el.querySelector('.fx-tb-bar');
      br.forEach(function (b, i) { U.make('i', '', bar).style.setProperty('--fx-i', i); });
      var draw = function () {
        var v = +input.value, tax = 0;
        br.forEach(function (b, i) {
          var part = Math.max(0, Math.min(v, b[1]) - b[0]);
          tax += part * b[2] / 100;
          bar.children[i].style.flexGrow = part;
          bar.children[i].textContent = part > v * .12 ? b[2] + ' %' : '';
        });
        el.querySelector('label b').textContent = v.toLocaleString('fr-FR') + ' €';
        el.querySelector('p').textContent = 'Impôt estimé : ' + Math.round(tax).toLocaleString('fr-FR') + ' €, soit ' + (v ? (tax / v * 100).toFixed(1).replace('.', ',') : 0) + ' % en moyenne (barème d\'exemple).';
      };
      input.addEventListener('input', draw);
      draw();
    }
  });

  // Un graphique en cascade, de l'ouverture au solde final
  FX.register('cashflow-waterfall', {
    entrance: true,
    setup: function (el) {
      var it = (el.dataset.fxItems || 'Début:40|Ventes:65|Salaires:-38|Loyer:-12|Divers:-9').split('|').map(function (s) { var p = s.split(':'); return { n: p[0], v: +p[1] }; });
      var c = 0, min = 0, max = 0, rows = [];
      it.forEach(function (o) { var a = c; c += o.v; rows.push({ n: o.n, a: a, b: c, v: o.v }); min = Math.min(min, c); max = Math.max(max, c, a); });
      rows.push({ n: 'Solde', a: 0, b: c, v: c, end: true });
      var S = max - min || 1, Y = function (v) { return (max - v) / S * 84 + 2; };
      el.setAttribute('role', 'img');
      el.setAttribute('aria-label', rows.map(function (r) { return r.n + ' ' + r.v; }).join(', '));
      rows.forEach(function (r, i) {
        var d = U.make('div', 'fx-wf' + (r.end ? ' fx-end' : r.v < 0 ? ' fx-neg' : ''), el);
        d.setAttribute('aria-hidden', 'true');
        d.style.setProperty('--fx-i', i);
        d.innerHTML = '<i style="top:' + Math.min(Y(r.a), Y(r.b)) + '%;height:' + Math.max(1, Math.abs(Y(r.a) - Y(r.b))) + '%"><b>' + (r.v > 0 && !r.end ? '+' : '') + r.v + '</b></i><span>' + r.n + '</span>';
      });
    }
  });

  // Une barre qui montre le temps restant avant une échéance
  FX.register('due-date-bar', {
    entrance: true,
    setup: function (el) {
      var now = Date.now(), from = new Date(el.dataset.fxFrom || now - 20 * 864e5).getTime(), to = new Date(el.dataset.fxTo || now + 10 * 864e5).getTime();
      var q = U.clamp((now - from) / (to - from), 0, 1), days = Math.ceil((to - now) / 864e5);
      el.setAttribute('role', 'progressbar');
      el.setAttribute('aria-valuenow', Math.round(q * 100)); el.setAttribute('aria-valuemin', 0); el.setAttribute('aria-valuemax', 100);
      var txt = days < 0 ? 'En retard de ' + (-days) + ' jour' + (days < -1 ? 's' : '') : days === 0 ? 'À payer aujourd\'hui' : 'Échéance dans ' + days + ' jour' + (days > 1 ? 's' : '');
      el.setAttribute('aria-label', txt);
      el.innerHTML = '<span>' + txt + '</span><i><b></b></i>';
      el.style.setProperty('--fx-q', q);
      el.classList.toggle('fx-late', days <= U.num(el, 'fxWarn', 3));
    }
  });
})(window.FX);

/* Pack 24 — Assurance */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Des garanties à cocher, et la cotisation qui se recalcule
  FX.register('premium-builder', {
    setup: function (el) {
      var base = U.num(el, 'fxBase', 18), rows = (el.dataset.fxItems || 'Vol:6|Bris de glace:4|Assistance 0 km:5').split('|');
      el.textContent = '';
      var box = U.make('div', 'fx-pb-l', el), out = U.make('output', 'fx-pb-t', el);
      out.setAttribute('aria-live', 'polite');
      var calc = function () {
        var t = base;
        box.querySelectorAll('input').forEach(function (i) { if (i.checked) t += +i.value; });
        out.innerHTML = '<b>' + t + ' €</b> par mois';
        out.classList.remove('fx-go'); void out.offsetWidth; out.classList.add('fx-go');
      };
      rows.forEach(function (r) {
        var p = r.split(':'), l = U.make('label', '', box), i = U.make('input', '', l);
        i.type = 'checkbox'; i.value = p[1];
        l.appendChild(document.createTextNode(p[0]));
        U.make('em', '', l).textContent = '+' + p[1] + ' €';
        i.addEventListener('change', calc);
      });
      calc();
    }
  });

  // Une franchise à régler : ce qu'on paie en cas de sinistre contre chaque mois
  FX.register('deductible-slider', {
    setup: function (el) {
      var min = U.num(el, 'fxMin', 0), max = U.num(el, 'fxMax', 1000), top = U.num(el, 'fxTop', 48), low = U.num(el, 'fxLow', 26);
      el.innerHTML = '<label>Franchise <input type="range" min="' + min + '" max="' + max + '" step="50"></label><div class="fx-ds"><span><b class="a"></b>en cas de sinistre</span><span><b class="c"></b>par mois</span></div>';
      var r = el.querySelector('input'), a = el.querySelector('.a'), c = el.querySelector('.c');
      r.value = U.num(el, 'fxValue', 300);
      var go = function () {
        var q = (r.value - min) / (max - min);
        a.textContent = (+r.value).toLocaleString('fr-FR') + ' €';
        c.textContent = Math.round(top - (top - low) * Math.sqrt(q)) + ' €';
        el.style.setProperty('--fx-q', q);
        r.setAttribute('aria-valuetext', a.textContent + ' de franchise, ' + c.textContent + ' par mois');
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Un tableau de garanties dont on éclaire une formule
  FX.register('coverage-matrix', {
    setup: function (el) {
      var plans = (el.dataset.fxPlans || 'Tiers,Confort,Tous risques').split(','), rows = (el.dataset.fxItems || 'Tiers:1,1,1|Vol:0,1,1|Incendie:0,1,1|Bris:0,0,1').split('|');
      var h = '<table><thead><tr><th scope="col"><span class="fx-sr">Garantie</span></th>' + plans.map(function (p, i) { return '<th scope="col"><button type="button" data-i="' + i + '">' + p + '</button></th>'; }).join('') + '</tr></thead><tbody>';
      rows.forEach(function (r) {
        var p = r.split(':');
        h += '<tr><th scope="row">' + p[0] + '</th>' + p[1].split(',').map(function (v) { return '<td>' + (v === '1' ? '<i aria-label="inclus">✓</i>' : '<i class="fx-no" aria-label="non inclus">–</i>') + '</td>'; }).join('') + '</tr>';
      });
      el.innerHTML = h + '</tbody></table>';
      var pick = function (n) {
        el.querySelectorAll('tr').forEach(function (tr) { Array.prototype.forEach.call(tr.children, function (c, i) { c.classList.toggle('fx-on', i === n + 1); }); });
        el.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', +b.dataset.i === n); });
      };
      el.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) pick(+b.dataset.i); });
      pick(U.num(el, 'fxPick', 1));
    }
  });

  // Un bouclier dont chaque secteur est un risque couvert
  FX.register('peril-shield', {
    entrance: true,
    setup: function (el) {
      var items = (el.dataset.fxItems || 'Incendie,Vol,Dégât des eaux,Tempête,Bris de glace,Catastrophe').split(','), n = items.length, id = 'fxps' + Math.floor(U.rand(1e4, 1e5));
      var s = '<svg viewBox="0 0 100 116" aria-hidden="true"><defs><clipPath id="' + id + '"><path d="M50 2 94 16V56C94 84 74 104 50 114 26 104 6 84 6 56V16Z"/></clipPath></defs><g clip-path="url(#' + id + ')">';
      for (var i = 0; i < n; i++) {
        var a = (i / n) * 6.283 - 1.571, b = ((i + 1) / n) * 6.283 - 1.571;
        s += '<path d="M50 58L' + (50 + 110 * Math.cos(a)).toFixed(1) + ' ' + (58 + 110 * Math.sin(a)).toFixed(1) + 'L' + (50 + 110 * Math.cos(b)).toFixed(1) + ' ' + (58 + 110 * Math.sin(b)).toFixed(1) + 'Z" style="--fx-i:' + i + '"/>';
      }
      s += '</g><path class="fx-o" d="M50 2 94 16V56C94 84 74 104 50 114 26 104 6 84 6 56V16Z"/></svg><div class="fx-pl"></div><output aria-live="polite"></output>';
      el.innerHTML = s;
      var segs = el.querySelectorAll('svg g path'), list = el.querySelector('.fx-pl'), out = el.querySelector('output');
      items.forEach(function (t, i) {
        var l = U.make('label', '', list), c = U.make('input', '', l);
        c.type = 'checkbox'; c.checked = i < (U.num(el, 'fxOn', 4));
        l.appendChild(document.createTextNode(t));
        var up = function () { segs[i].classList.toggle('fx-on', c.checked); out.textContent = list.querySelectorAll(':checked').length + ' risques sur ' + n; };
        c.addEventListener('change', up);
        up();
      });
    }
  });

  // Le suivi d'un dossier : ce qui est fait, ce qui est en cours, ce qui reste
  FX.register('claim-tracker', {
    entrance: true,
    setup: function (el) {
      var rows = (el.dataset.fxItems || 'Déclaré:3 mars|Pièces reçues:5 mars|Expertise:en cours|Indemnisation:à venir').split('|'), cur = U.num(el, 'fxCurrent', 2);
      var ol = U.make('ol', '', el);
      el.dataset.fxRendered = '1';
      rows.forEach(function (r, i) {
        var p = r.split(':'), li = U.make('li', i < cur ? 'fx-done' : i === cur ? 'fx-now' : '', ol);
        li.style.setProperty('--fx-i', i);
        li.innerHTML = '<b>' + p[0] + '</b><span>' + p[1] + '</span>';
        if (i === cur) li.setAttribute('aria-current', 'step');
      });
    }
  });

  // Un schéma de voiture sur lequel on situe les chocs
  FX.register('damage-spots', {
    setup: function (el) {
      var zones = [['Avant', 14, 34, 22, 32], ['Capot', 36, 34, 18, 32], ['Toit', 54, 34, 20, 32], ['Coffre', 74, 34, 14, 32], ['Côté gauche', 14, 14, 74, 18], ['Côté droit', 14, 68, 74, 18]], picked = [];
      var box = U.make('div', 'fx-dsp', el), out = U.make('output', '', el);
      out.setAttribute('aria-live', 'polite');
      var say = function () { out.textContent = picked.length ? 'Touché : ' + picked.join(', ') : 'Touchez les zones abîmées'; };
      zones.forEach(function (z) {
        var b = U.make('button', '', box);
        b.type = 'button'; b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-label', z[0]); b.title = z[0];
        b.style.cssText = 'left:' + z[1] + '%;top:' + z[2] + '%;width:' + z[3] + '%;height:' + z[4] + '%';
        b.addEventListener('click', function () {
          var on = picked.indexOf(z[0]) < 0;
          if (on) picked.push(z[0]); else picked.splice(picked.indexOf(z[0]), 1);
          b.setAttribute('aria-pressed', on);
          say();
        });
      });
      say();
    }
  });

  // Les pièces d'un dossier, avec ce qui manque encore
  FX.register('document-checklist', {
    setup: function (el) {
      var rows = (el.dataset.fxItems || 'Constat amiable|Photos des dégâts|Facture du garage|Pièce d\'identité').split('|');
      el.innerHTML = '<div class="fx-dc-b"><i></i></div><output aria-live="polite"></output>';
      var out = el.querySelector('output');
      var go = function () {
        var all = el.querySelectorAll('input'), n = el.querySelectorAll('input:checked').length, left = all.length - n;
        el.style.setProperty('--fx-q', n / all.length);
        el.classList.toggle('fx-full', !left);
        out.textContent = left ? 'Il manque ' + left + (left > 1 ? ' pièces' : ' pièce') : 'Dossier complet';
      };
      rows.forEach(function (r) {
        var l = U.make('label', '', el), c = U.make('input', '', l);
        c.type = 'checkbox';
        U.make('span', '', l).textContent = r;
        c.addEventListener('change', go);
      });
      go();
    }
  });

  // Une dépense partagée entre la base, la complémentaire et ce qu'il reste à payer
  FX.register('reimbursement-split', {
    entrance: true,
    setup: function (el) {
      var cost = U.num(el, 'fxCost', 60), a = Math.min(cost, U.num(el, 'fxBase', 21)), b = Math.min(cost - a, U.num(el, 'fxTop', 24)), c = cost - a - b;
      var parts = [['Base', a, 'a'], ['Complémentaire', b, 'b'], ['Reste à payer', c, 'c']];
      el.innerHTML = '<p>Dépense : <b>' + cost + ' €</b></p><div class="fx-rs">' + parts.map(function (p, i) { return '<i class="' + p[2] + '" style="--fx-q:' + p[1] / cost + ';--fx-i:' + i + '"></i>'; }).join('') + '</div><ul>' + parts.map(function (p) { return '<li class="' + p[2] + '"><span>' + p[0] + '</span><b>' + p[1] + ' €</b></li>'; }).join('') + '</ul>';
    }
  });

  // Composer le foyer et voir la cotisation : le troisième enfant est offert
  FX.register('family-builder', {
    setup: function (el) {
      var A = U.num(el, 'fxAdult', 42), C = U.num(el, 'fxChild', 18), n = { a: 1, c: 0 };
      el.innerHTML = '<div class="fx-fb" aria-hidden="true"></div>' +
        '<div class="fx-fb-r"><span>Adultes</span><button type="button" data-k="a" data-d="-1" aria-label="Retirer un adulte">−</button><b data-v="a"></b><button type="button" data-k="a" data-d="1" aria-label="Ajouter un adulte">+</button></div>' +
        '<div class="fx-fb-r"><span>Enfants</span><button type="button" data-k="c" data-d="-1" aria-label="Retirer un enfant">−</button><b data-v="c"></b><button type="button" data-k="c" data-d="1" aria-label="Ajouter un enfant">+</button></div><output aria-live="polite"></output>';
      var row = el.firstChild;
      var go = function () {
        el.querySelector('[data-v=a]').textContent = n.a;
        el.querySelector('[data-v=c]').textContent = n.c;
        el.querySelector('output').innerHTML = '<b>' + (n.a * A + Math.min(n.c, 2) * C) + ' €</b> par mois';
        while (row.children.length > n.a + n.c) row.lastChild.remove();
        for (var i = row.children.length; i < n.a + n.c; i++) U.make('i', '', row);
        Array.prototype.forEach.call(row.children, function (p, i) { p.className = i < n.a ? 'fx-big' : ''; });
      };
      el.addEventListener('click', function (e) {
        var b = e.target.closest('button');
        if (!b) return;
        var k = b.dataset.k, lo = k === 'a' ? 1 : 0, hi = k === 'a' ? 2 : 6;
        n[k] = U.clamp(n[k] + +b.dataset.d, lo, hi);
        go();
      });
      go();
    }
  });

  // Un bouton d'appel qui sait si l'on répond en ce moment
  FX.register('open-hours-call', {
    setup: function (el) {
      var tel = el.dataset.fxTel || '0100000000', from = U.num(el, 'fxFrom', 8), to = U.num(el, 'fxTo', 20), always = el.dataset.fxAlways === 'true';
      el.innerHTML = '<a href="tel:' + tel + '"><i aria-hidden="true"></i><span>' + (el.dataset.fxLabel || 'Appeler un conseiller') + '</span></a><small></small>';
      var note = el.querySelector('small');
      var go = function () {
        var d = new Date(), h = d.getHours() + d.getMinutes() / 60, open = always || (h >= from && h < to);
        el.classList.toggle('fx-open', open);
        note.textContent = always ? 'Ouvert jour et nuit' : open ? 'Ouvert jusqu\'à ' + to + ' h' : 'Fermé, ouvre à ' + from + ' h';
      };
      go();
      setInterval(go, 60000);
    }
  });

  // Une échelle qui montre le coefficient selon les années sans accident
  FX.register('bonus-ladder', {
    setup: function (el) {
      var max = U.num(el, 'fxYears', 13);
      el.innerHTML = '<label>Années sans accident <input type="range" min="0" max="' + max + '"></label><div class="fx-bl" aria-hidden="true"></div><output aria-live="polite"></output>';
      var r = el.querySelector('input'), box = el.querySelector('.fx-bl'), out = el.querySelector('output');
      for (var i = 0; i <= max; i++) U.make('i', '', box).style.height = (Math.max(.5, Math.pow(.95, i)) * 100) + '%';
      r.value = U.num(el, 'fxValue', 5);
      var go = function () {
        var n = +r.value, c = Math.max(.5, Math.pow(.95, n));
        Array.prototype.forEach.call(box.children, function (b, i) { b.classList.toggle('fx-on', i === n); b.classList.toggle('fx-past', i < n); });
        out.innerHTML = 'Coefficient <b>' + c.toFixed(2).replace('.', ',') + '</b>, soit −' + Math.round((1 - c) * 100) + ' %';
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Estimer la valeur de ses biens, pièce par pièce
  FX.register('room-inventory', {
    setup: function (el) {
      var rows = (el.dataset.fxItems || 'Salon:4000|Cuisine:3000|Chambres:5000').split('|'), cap = U.num(el, 'fxCap', 10000);
      rows.forEach(function (r) {
        var p = r.split(':'), l = U.make('label', '', el);
        U.make('span', '', l).textContent = p[0];
        var i = U.make('input', '', l);
        i.type = 'range'; i.min = 0; i.max = 12000; i.step = 500; i.value = p[1];
        U.make('b', '', l);
      });
      var bar = U.make('div', 'fx-ri', el), out = U.make('output', '', el);
      U.make('i', '', bar);
      U.make('em', '', bar).setAttribute('title', 'Capital assuré');
      out.setAttribute('aria-live', 'polite');
      var go = function () {
        var t = 0;
        el.querySelectorAll('label').forEach(function (l) { var v = +l.querySelector('input').value; t += v; l.querySelector('b').textContent = (v / 1000).toLocaleString('fr-FR') + ' k€'; });
        var top = Math.max(t, cap) * 1.1;
        bar.style.setProperty('--fx-a', t / top); bar.style.setProperty('--fx-b', cap / top);
        el.classList.toggle('fx-under', t > cap);
        out.textContent = t > cap ? 'Sous-assuré de ' + (t - cap).toLocaleString('fr-FR') + ' €' : 'Capital suffisant : ' + cap.toLocaleString('fr-FR') + ' €';
      };
      el.addEventListener('input', go);
      go();
    }
  });

  // Quelques questions, une formule conseillée
  FX.register('plan-quiz', {
    setup: function (el) {
      var Q = (el.dataset.fxQuestions || 'Votre voiture a :Moins de 3 ans=2,Entre 3 et 8 ans=1,Plus de 8 ans=0|Vous roulez :Tous les jours=2,Souvent=1,Rarement=0').split('|').map(function (s) { var c = s.split(':'); return { t: c[0], a: c[1].split(',').map(function (x) { return x.split('='); }) }; });
      var plans = (el.dataset.fxPlans || 'Tiers,Confort,Tous risques').split(','), i = 0, s = 0, box = U.make('div', 'fx-pq', el), live = U.make('div', 'fx-pq-p', el);
      live.setAttribute('aria-hidden', 'true');
      var show = function () {
        el.style.setProperty('--fx-q', i / Q.length);
        box.innerHTML = '';
        if (i === Q.length) {
          var plan = plans[Math.round(s / (Q.length * 2) * (plans.length - 1))];
          box.innerHTML = '<p role="status">Pour vous : <b>' + plan + '</b></p><button type="button" class="fx-pq-a">Recommencer</button>';
          box.firstChild.nextSibling.addEventListener('click', function () { i = 0; s = 0; show(); });
          return;
        }
        U.make('p', '', box).textContent = Q[i].t;
        Q[i].a.forEach(function (o) {
          var b = U.make('button', '', box);
          b.type = 'button'; b.textContent = o[0];
          b.addEventListener('click', function () { s += +o[1]; i++; show(); });
        });
      };
      show();
    }
  });

  // Une zone de signature : la validation s'ouvre quand le tracé est assez long
  FX.register('signature-pad', {
    setup: function (el) {
      var c = U.make('canvas', '', el), row = U.make('div', 'fx-sg-r', el), clr = U.make('button', '', row), ok = U.make('button', 'fx-sg-ok', row), len = 0, last = null, x;
      c.setAttribute('aria-label', 'Zone de signature, dessinez avec le pointeur');
      clr.type = ok.type = 'button'; clr.textContent = 'Effacer'; ok.textContent = el.dataset.fxLabel || 'Signer'; ok.disabled = true;
      var size = function () {
        var r = c.getBoundingClientRect(), d = window.devicePixelRatio || 1;
        c.width = r.width * d; c.height = r.height * d;
        x = c.getContext('2d'); x.scale(d, d); x.lineWidth = 2; x.lineCap = 'round'; x.strokeStyle = getComputedStyle(el).color;
        len = 0; ok.disabled = true;
      };
      var at = function (e) { var r = c.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
      c.addEventListener('pointerdown', function (e) { if (!x) size(); c.setPointerCapture && e.isTrusted && c.setPointerCapture(e.pointerId); last = at(e); });
      c.addEventListener('pointermove', function (e) {
        if (!last) return;
        var p = at(e);
        x.beginPath(); x.moveTo(last[0], last[1]); x.lineTo(p[0], p[1]); x.stroke();
        len += Math.hypot(p[0] - last[0], p[1] - last[1]);
        last = p;
        ok.disabled = len < U.num(el, 'fxMin', 40);
      });
      ['pointerup', 'pointercancel'].forEach(function (t) { c.addEventListener(t, function () { last = null; }); });
      clr.addEventListener('click', size);
      ok.addEventListener('click', function () {
        el.classList.add('fx-signed');
        el.dispatchEvent(new CustomEvent('fx:signed', { bubbles: true, detail: { image: c.toDataURL() } }));
      });
      U.onResize(function () { if (!len) size(); });
      size();
    }
  });

  // Choisir l'heure à laquelle on veut être rappelé
  FX.register('callback-slots', {
    setup: function (el) {
      var from = U.num(el, 'fxFrom', 9), to = U.num(el, 'fxTo', 19), step = U.num(el, 'fxStep', 2), box = U.make('div', 'fx-cb', el), out = U.make('output', '', el), now = new Date().getHours();
      out.setAttribute('aria-live', 'polite');
      out.textContent = 'Quand vous rappeler ?';
      var today = [];
      for (var h = from; h < to; h += step) today.push([h, h > now]);
      var slots = today.filter(function (s) { return s[1]; }).map(function (s) { return ['Aujourd\'hui', s[0]]; });
      for (h = from; slots.length < U.num(el, 'fxCount', 4) && h < to; h += step) slots.push(['Demain', h]);
      slots.slice(0, U.num(el, 'fxCount', 4)).forEach(function (s) {
        var b = U.make('button', '', box);
        b.type = 'button'; b.setAttribute('aria-pressed', 'false');
        b.innerHTML = '<small>' + s[0] + '</small>' + s[1] + ' h – ' + (s[1] + step) + ' h';
        b.addEventListener('click', function () {
          box.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
          out.textContent = 'Rappel prévu : ' + s[0].toLowerCase() + ', vers ' + s[1] + ' h';
          el.dispatchEvent(new CustomEvent('fx:slot', { bubbles: true, detail: { day: s[0], hour: s[1] } }));
        });
      });
    }
  });

  // Ce qui est couvert et ce qui ne l'est pas, sur le même plan
  FX.register('covered-list', {
    entrance: true,
    setup: function (el) {
      var yes = (el.dataset.fxYes || 'Incendie|Dégât des eaux|Vol').split('|'), no = (el.dataset.fxNo || 'Usure|Défaut d\'entretien').split('|'), n = 0;
      var ul = function (title, a, c, word) {
        var d = U.make('div', c, el);
        U.make('b', '', d).textContent = title;
        var u = U.make('ul', '', d);
        a.forEach(function (t) {
          var li = U.make('li', '', u);
          li.style.setProperty('--fx-i', n++);
          li.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true"><path pathLength="1" d="' + (c === 'fx-y' ? 'M3 8.5 7 12 13 4' : 'M4 4 12 12M12 4 4 12') + '"/></svg><span><span class="fx-sr">' + word + ' : </span>' + t + '</span>';
        });
      };
      ul('Couvert', yes, 'fx-y', 'Couvert');
      ul('Non couvert', no, 'fx-n', 'Non couvert');
    }
  });

  // Payer au mois ou à l'année : ce que ça change vraiment sur l'année
  FX.register('payment-frequency', {
    setup: function (el) {
      var y = U.num(el, 'fxYear', 480), modes = [['Annuel', 1, 0], ['Semestriel', 2, .02], ['Mensuel', 12, .05]];
      var f = U.make('div', 'fx-pf', el), out = U.make('output', '', el);
      f.setAttribute('role', 'radiogroup'); f.setAttribute('aria-label', 'Fréquence de paiement');
      out.setAttribute('aria-live', 'polite');
      var worst = y * (1 + modes[2][2]);
      var pick = function (m, b) {
        f.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-checked', x === b); });
        var tot = y * (1 + m[2]), one = tot / m[1], save = worst - tot;
        el.style.setProperty('--fx-q', tot / worst);
        out.innerHTML = '<b>' + (Math.round(one * 100) / 100).toLocaleString('fr-FR') + ' €</b> × ' + m[1] + '<br>Total ' + Math.round(tot) + ' €' + (save > 0 ? ', soit ' + Math.round(save) + ' € d\'économie' : '');
      };
      modes.forEach(function (m, i) {
        var b = U.make('button', '', f);
        b.type = 'button'; b.setAttribute('role', 'radio'); b.textContent = m[0];
        b.addEventListener('click', function () { pick(m, b); });
        if (i === 2) pick(m, b);
      });
      U.make('div', 'fx-pf-b', el);
    }
  });

  // L'année du contrat, avec la fenêtre pendant laquelle on peut résilier
  FX.register('renewal-window', {
    entrance: true,
    setup: function (el) {
      var end = new Date(el.dataset.fxEnd || Date.now() + 86400000 * 45), now = new Date(), days = Math.ceil((end - now) / 86400000), notice = U.num(el, 'fxNotice', 60), year = 365;
      var q = U.clamp(1 - days / year, 0, 1), w = notice / year, open = days >= 0 && days <= notice;
      el.style.setProperty('--fx-q', q); el.style.setProperty('--fx-w', w);
      el.innerHTML = '<div class="fx-rw" aria-hidden="true"><em></em><i></i></div><p></p>';
      el.classList.toggle('fx-open', open);
      el.querySelector('p').textContent = days < 0 ? 'Contrat renouvelé il y a ' + -days + ' jours' : open ? 'Vous pouvez résilier encore ' + days + ' jours' : 'Résiliation possible dans ' + (days - notice) + ' jours';
    }
  });

  // Une attestation sur écran : valide ou expirée selon la vraie date
  FX.register('attestation-card', {
    entrance: true,
    setup: function (el) {
      var no = el.dataset.fxNumber || 'FICTIF-2027-0042', until = new Date(el.dataset.fxUntil || Date.now() + 86400000 * 120), ok = until >= new Date(), h = 7, cells = '';
      for (var i = 0; i < no.length; i++) h = (h * 31 + no.charCodeAt(i)) >>> 0;
      for (i = 0; i < 49; i++) { h = (h * 1664525 + 1013904223) >>> 0; cells += '<i class="' + (h >> 16 & 1 ? 'fx-k' : '') + '"></i>'; }
      el.innerHTML = '<div class="fx-ac-g" aria-hidden="true">' + cells + '</div><div><strong>' + (el.dataset.fxTitle || 'Attestation') + '</strong><span>' + no + '</span><b>' + (ok ? 'Valide' : 'Expirée') + ' jusqu\'au ' + until.toLocaleDateString('fr-FR') + '</b></div>';
      el.classList.toggle('fx-exp', !ok);
      el.style.setProperty('--fx-rot', U.rand(-1, 1) + 'deg');
    }
  });

  // Un mot technique souligné qui donne sa définition au clic
  FX.register('glossary-tip', {
    setup: function (el) {
      var open = null, close = function () { if (open) { open.setAttribute('aria-expanded', 'false'); open = null; } };
      el.querySelectorAll('[data-def]').forEach(function (w) {
        var b = document.createElement('button');
        b.type = 'button'; b.textContent = w.textContent; b.setAttribute('aria-expanded', 'false');
        var d = document.createElement('span');
        d.className = 'fx-gt'; d.setAttribute('role', 'note'); d.textContent = w.dataset.def;
        w.textContent = ''; w.appendChild(b); w.appendChild(d);
        b.addEventListener('click', function (e) {
          e.stopPropagation();
          var was = open === b;
          close();
          if (!was) { b.setAttribute('aria-expanded', 'true'); open = b; }
        });
      });
      document.addEventListener('click', close);
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    }
  });

  // Un parapluie s'ouvre et écarte la pluie
  FX.register('umbrella-open', {
    entrance: true,
    setup: function (el) {
      var s = '<svg viewBox="0 0 120 120" aria-hidden="true"><g class="fx-u-c">';
      var n = 5, w = 100 / n;
      s += '<path d="M10 60A50 50 0 0 1 110 60';
      for (var i = n - 1; i >= 0; i--) s += 'A' + w / 2 + ' ' + w / 3 + ' 0 0 0 ' + (10 + i * w) + ' 60';
      s += 'Z"/></g><path class="fx-u-h" d="M60 60V102A7 7 0 0 1 46 102"/></svg>';
      el.innerHTML = s;
      for (i = 0; i < 16; i++) {
        var d = U.make('i', '', el), x = U.rand(2, 98);
        d.style.setProperty('--fx-x', x + '%');
        d.style.setProperty('--fx-out', (x < 50 ? -1 : 1) * (Math.max(0, 48 - Math.abs(x - 50)) * .9) + 'px');
        d.style.setProperty('--fx-d', U.rand(0, 1.2).toFixed(2) + 's');
        d.setAttribute('aria-hidden', 'true');
      }
      if (el.dataset.fxLabel) { el.setAttribute('role', 'img'); el.setAttribute('aria-label', el.dataset.fxLabel); }
    }
  });

  // Faire glisser l'âge pour voir quel besoin arrive à ce moment de la vie
  FX.register('life-events-rail', {
    setup: function (el) {
      var ev = (el.dataset.fxItems || '20:Premier logement:Assurance habitation|30:Premier enfant:Garantie famille|45:Achat immobilier:Assurance de prêt|65:Retraite:Complément santé').split('|').map(function (r) { var p = r.split(':'); return { a: +p[0], t: p[1], b: p[2] }; });
      var min = U.num(el, 'fxMin', 18), max = U.num(el, 'fxMax', 75);
      el.innerHTML = '<div class="fx-le" aria-hidden="true"></div><input type="range" min="' + min + '" max="' + max + '" aria-label="Âge"><p aria-live="polite"></p>';
      var rail = el.firstChild, r = el.querySelector('input'), p = el.querySelector('p');
      ev.forEach(function (e) { var i = U.make('i', '', rail); i.style.left = (e.a - min) / (max - min) * 100 + '%'; });
      r.value = U.num(el, 'fxValue', 30);
      var go = function () {
        var a = +r.value, cur = ev[0];
        ev.forEach(function (e) { if (a >= e.a) cur = e; });
        Array.prototype.forEach.call(rail.children, function (d, i) { d.classList.toggle('fx-on', ev[i] === cur); d.classList.toggle('fx-past', ev[i].a <= a); });
        p.innerHTML = '<b>' + a + ' ans</b> · ' + cur.t + '<br><em>' + cur.b + '</em>';
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Un devis qui se reprend là où on l'avait laissé, sur le même appareil
  FX.register('quote-resume', {
    setup: function (el) {
      var key = el.dataset.fxKey || 'fx-quote', bar = document.createElement('div'), saved = null;
      bar.className = 'fx-qr'; bar.setAttribute('role', 'status');
      el.insertBefore(bar, el.firstChild);
      var fields = el.querySelectorAll('input,select,textarea');
      var read = function () { var o = {}; fields.forEach(function (f) { if (f.name) o[f.name] = f.type === 'checkbox' ? f.checked : f.value; }); return o; };
      var write = function (o) { fields.forEach(function (f) { if (f.name in o) { if (f.type === 'checkbox') f.checked = o[f.name]; else f.value = o[f.name]; } }); };
      try { saved = JSON.parse(localStorage.getItem(key)); } catch (err) {}
      var tell = function (t) { bar.textContent = t; bar.classList.remove('fx-go'); void bar.offsetWidth; bar.classList.add('fx-go'); };
      if (saved && saved.d) {
        write(saved.d);
        tell('Devis repris. ');
        var b = U.make('button', '', bar);
        b.type = 'button'; b.textContent = 'Repartir de zéro';
        b.addEventListener('click', function () { fields.forEach(function (f) { if (f.type === 'checkbox') f.checked = false; else f.value = ''; }); try { localStorage.removeItem(key); } catch (err) {} tell('Formulaire vidé.'); });
      }
      el.addEventListener('input', function () {
        try { localStorage.setItem(key, JSON.stringify({ d: read() })); tell('Enregistré sur cet appareil'); } catch (err) {}
      });
    }
  });

  // Ce dont le foyer aurait besoin face à ce qu'il a : l'écart se voit
  FX.register('gap-coverage', {
    entrance: true,
    setup: function (el) {
      var need = U.num(el, 'fxNeed', 2400), rows = (el.dataset.fxItems || 'Pension:900|Épargne:400').split('|').map(function (r) { return r.split(':'); });
      var got = rows.reduce(function (t, r) { return t + +r[1]; }, 0), gap = Math.max(0, need - got), top = Math.max(need, got);
      var col = function (t, a) { return '<div><b>' + t + '</b><span>' + a + '</span></div>'; };
      var h = '<div class="fx-gc" aria-hidden="true"><div class="fx-gc-n" style="--fx-q:' + need / top + '"></div><div class="fx-gc-h">';
      rows.forEach(function (r, i) { h += '<i style="--fx-q:' + r[1] / top + ';--fx-i:' + i + '"></i>'; });
      if (gap) h += '<i class="fx-g" style="--fx-q:' + gap / top + ';--fx-i:' + rows.length + '"></i>';
      h += '</div></div>' + col('Besoin', need.toLocaleString('fr-FR') + ' € / mois') + rows.map(function (r) { return col(r[0], (+r[1]).toLocaleString('fr-FR') + ' €'); }).join('') + col('À couvrir', gap.toLocaleString('fr-FR') + ' €');
      el.innerHTML = h;
    }
  });

  // Après un sinistre, le temps qu'il reste pour déclarer
  FX.register('incident-timer', {
    setup: function (el) {
      var days = U.num(el, 'fxDays', 5), start = el.dataset.fxStart ? new Date(el.dataset.fxStart) : new Date(Date.now() - 86400000 * U.num(el, 'fxAgo', 2));
      var end = +start + days * 86400000;
      el.innerHTML = '<div class="fx-it" role="timer"><b></b><span></span></div><div class="fx-it-b" aria-hidden="true"><i></i></div><small>Délai de déclaration : ' + days + ' jours (à vérifier au contrat)</small>';
      var b = el.querySelector('b'), s = el.querySelector('span'), bar = el.querySelector('i');
      var go = function () {
        var left = end - Date.now(), q = U.clamp(left / (days * 86400000), 0, 1), h = Math.max(0, Math.floor(left / 3600000));
        b.textContent = left <= 0 ? 'Délai dépassé' : Math.floor(h / 24) + ' j ' + h % 24 + ' h';
        s.textContent = left <= 0 ? '' : 'pour déclarer';
        bar.style.width = q * 100 + '%';
        el.classList.toggle('fx-urgent', q < .25);
      };
      go();
      setInterval(go, 60000);
    }
  });
})(window.FX);

/* Pack 25 — Santé */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Une semaine de rendez-vous : on choisit le jour, puis l'heure
  FX.register('appointment-week', {
    setup: function (el) {
      var hours = (el.dataset.fxHours || '9:00,10:30,14:00,16:30').split(','), days = U.make('div', 'fx-aw-d', el), slots = U.make('div', 'fx-aw-s', el), out = U.make('output', '', el);
      out.setAttribute('aria-live', 'polite');
      out.textContent = 'Choisissez un jour';
      for (var i = 1; i <= U.num(el, 'fxDays', 5); i++) (function (i) {
        var d = new Date(Date.now() + i * 86400000), b = U.make('button', '', days);
        b.type = 'button'; b.setAttribute('aria-pressed', 'false');
        b.innerHTML = '<small>' + d.toLocaleDateString('fr-FR', { weekday: 'short' }) + '</small>' + d.getDate();
        b.addEventListener('click', function () {
          days.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
          slots.innerHTML = '';
          hours.forEach(function (h, n) {
            if ((i + n) % 3 === 2) return;
            var s = U.make('button', '', slots);
            s.type = 'button'; s.textContent = h; s.style.setProperty('--fx-i', n);
            s.addEventListener('click', function () {
              slots.querySelectorAll('button').forEach(function (x) { x.classList.toggle('fx-on', x === s); });
              out.textContent = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) + ' à ' + h;
              el.dispatchEvent(new CustomEvent('fx:slot', { bubbles: true, detail: { date: d, hour: h } }));
            });
          });
          out.textContent = 'Choisissez une heure';
        });
      })(i);
    }
  });

  // Une silhouette dont on choisit une zone pour orienter la suite
  FX.register('body-map', {
    setup: function (el) {
      var Z = { Tête: 'M50 4a12 13 0 1 1-.1 0Z', Épaule: 'M28 32h44l6 14H22Z', Dos: 'M34 46h32l-2 34H36Z', Bras: 'M22 46h12l-4 42H14ZM66 46h12l8 42H70Z', Jambes: 'M36 80h13l-2 66H34ZM51 80h13l2 66H53Z' };
      var txt = JSON.parse(el.dataset.fxItems || '{}');
      var s = '<svg viewBox="0 0 100 150" role="group" aria-label="Zones du corps">';
      Object.keys(Z).forEach(function (k) { s += '<path d="' + Z[k] + '" tabindex="0" role="button" aria-label="' + k + '" data-k="' + k + '"/>'; });
      el.innerHTML = s + '</svg><output aria-live="polite">Touchez une zone</output>';
      var out = el.querySelector('output');
      var pick = function (p) {
        el.querySelectorAll('path').forEach(function (x) { x.classList.toggle('fx-on', x === p); });
        out.innerHTML = '<b>' + p.dataset.k + '</b><br>' + (txt[p.dataset.k] || 'Voir les conseils pour cette zone');
        el.dispatchEvent(new CustomEvent('fx:zone', { bubbles: true, detail: { zone: p.dataset.k } }));
      };
      el.addEventListener('click', function (e) { if (e.target.dataset.k) pick(e.target); });
      el.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && e.target.dataset.k) { e.preventDefault(); pick(e.target); } });
    }
  });

  // Une échelle de douleur de 0 à 10, avec un visage qui change
  FX.register('pain-scale', {
    setup: function (el) {
      var W = ['Aucune', 'Très légère', 'Légère', 'Gênante', 'Modérée', 'Forte', 'Très forte'];
      el.innerHTML = '<svg viewBox="0 0 60 60" aria-hidden="true"><circle cx="30" cy="30" r="27"/><circle class="e" cx="21" cy="24" r="3"/><circle class="e" cx="39" cy="24" r="3"/><path d="M18 40Q30 40 42 40"/></svg><label>Votre douleur <input type="range" min="0" max="10"></label><output aria-live="polite"></output>';
      var r = el.querySelector('input'), m = el.querySelector('svg path'), o = el.querySelector('output'), c = el.querySelector('svg circle');
      r.value = U.num(el, 'fxValue', 3);
      var go = function () {
        var v = +r.value, q = v / 10, y = 34 + q * 12;
        m.setAttribute('d', 'M18 ' + y + 'Q30 ' + (46 - q * 22) + ' 42 ' + y);
        c.style.fill = 'hsl(' + (130 - q * 130) + ' 70% 50%)';
        o.innerHTML = '<b>' + v + '</b> / 10 · ' + W[Math.round(q * 6)];
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Des verres à remplir d'un geste, jusqu'à l'objectif du jour
  FX.register('hydration-glasses', {
    setup: function (el) {
      var goal = U.num(el, 'fxGoal', 8), key = el.dataset.fxKey, day = new Date().toDateString(), n = 0;
      if (key) try { var o = JSON.parse(localStorage.getItem(key)); if (o && o.d === day) n = o.n; } catch (err) {}
      var row = U.make('div', 'fx-hg', el), out = U.make('output', '', el);
      out.setAttribute('aria-live', 'polite');
      var show = function () {
        Array.prototype.forEach.call(row.children, function (b, i) { b.classList.toggle('fx-on', i < n); b.setAttribute('aria-pressed', i < n); });
        out.textContent = n >= goal ? 'Objectif atteint' : n + ' verres sur ' + goal;
        if (key) try { localStorage.setItem(key, JSON.stringify({ d: day, n: n })); } catch (err) {}
      };
      for (var i = 0; i < goal; i++) (function (i) {
        var b = U.make('button', '', row);
        b.type = 'button'; b.setAttribute('aria-label', 'Verre ' + (i + 1));
        U.make('i', '', b);
        b.addEventListener('click', function () { n = n === i + 1 ? i : i + 1; show(); });
      })(i);
      show();
    }
  });

  // Un tracé de moniteur cardiaque qui efface devant lui
  FX.register('ecg-line', {
    setup: function (el) {
      var c = U.make('canvas', '', el), x = c.getContext('2d'), bpm = U.num(el, 'fxBpm', 72), px = 0, last = null, phase = 0, W, H;
      el.setAttribute('role', 'img');
      el.setAttribute('aria-label', el.dataset.fxLabel || 'Tracé cardiaque, ' + bpm + ' battements par minute');
      var size = function () { var r = el.getBoundingClientRect(), d = window.devicePixelRatio || 1; W = r.width; H = r.height; c.width = W * d; c.height = H * d; x = c.getContext('2d'); x.scale(d, d); px = 0; last = null; };
      var wave = function (p) {
        if (p < .1) return Math.sin(p / .1 * Math.PI) * .12;
        if (p < .18) return 0;
        if (p < .2) return -(p - .18) / .02 * .15;
        if (p < .23) return -.15 + (p - .2) / .03 * 1.05;
        if (p < .27) return .9 - (p - .23) / .04 * 1.2;
        if (p < .3) return -.3 + (p - .27) / .03 * .3;
        if (p < .55 && p > .38) return Math.sin((p - .38) / .17 * Math.PI) * .22;
        return 0;
      };
      size();
      U.onResize(size);
      el._fxDraw = function (dt) {
        var col = getComputedStyle(el).color, sp = U.num(el, 'fxSpeed', 70);
        for (var i = 0; i < Math.max(1, sp * dt); i++) {
          phase = (phase + bpm / 60 / sp) % 1;
          var y = H / 2 - wave(phase) * H * .42;
          x.clearRect(px, 0, 14, H);
          if (last !== null) { x.strokeStyle = col; x.lineWidth = 2; x.beginPath(); x.moveTo(px - 1, last); x.lineTo(px, y); x.stroke(); }
          last = y;
          px++;
          if (px > W) { px = 0; last = null; }
        }
      };
      if (U.reduced) { for (var k = 0; k < 40; k++) el._fxDraw(1 / 6); }
    },
    tick: function (el, dt) { if (el._fxDraw && !U.reduced) el._fxDraw(dt); }
  });

  // Un résultat d'analyse placé sur sa plage de référence
  FX.register('lab-range', {
    entrance: true,
    setup: function (el) {
      var v = U.num(el, 'fxValue', 5.8), lo = U.num(el, 'fxLo', 4), hi = U.num(el, 'fxHi', 5.6), u = el.dataset.fxUnit || 'mmol/L', name = el.dataset.fxName || 'Analyse fictive';
      var span = hi - lo, a = lo - span * .6, b = hi + span * .6, q = U.clamp((v - a) / (b - a), 0, 1);
      var st = v < lo ? 'Sous la plage' : v > hi ? 'Au-dessus de la plage' : 'Dans la plage';
      var f = function (n) { return String(n).replace('.', ','); };
      el.innerHTML = '<div class="fx-lr-h"><b>' + name + '</b><strong>' + f(v) + ' ' + u + '</strong></div><div class="fx-lr" aria-hidden="true"><em style="left:' + (lo - a) / (b - a) * 100 + '%;width:' + span / (b - a) * 100 + '%"></em><i style="--fx-q:' + q + '"></i></div><div class="fx-lr-f"><span>Référence ' + f(lo) + ' – ' + f(hi) + '</span><span class="fx-st">' + st + '</span></div>';
      el.classList.toggle('fx-out', v < lo || v > hi);
    }
  });

  // Une nuit en marches d'escalier, avec le temps de chaque stade
  FX.register('sleep-stages', {
    entrance: true,
    setup: function (el) {
      var S = ['Éveil', 'Léger', 'Profond', 'Paradoxal'], Y = [8, 44, 80, 26];
      var d = (el.dataset.fxData || '0:10,1:40,2:50,1:25,3:20,1:40,2:30,1:30,3:35,1:40,3:30,0:8').split(',').map(function (r) { return r.split(':').map(Number); });
      var tot = d.reduce(function (t, r) { return t + r[1]; }, 0), t = 0, p = '', sum = [0, 0, 0, 0];
      d.forEach(function (r, i) { var x = t / tot * 200, y = Y[r[0]]; p += (i ? 'L' + x.toFixed(1) + ' ' + y : 'M0 ' + y) + 'L' + ((t + r[1]) / tot * 200).toFixed(1) + ' ' + y; t += r[1]; sum[r[0]] += r[1]; });
      var fm = function (m) { return Math.floor(m / 60) + ' h ' + String(m % 60).padStart(2, '0'); };
      el.innerHTML = '<svg viewBox="0 0 200 90" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="' + p + '"/></svg><ul>' + S.map(function (n, i) { return '<li><span>' + n + '</span><b>' + fm(sum[i]) + '</b></li>'; }).join('') + '</ul><p>Nuit fictive de ' + fm(tot) + '</p>';
    }
  });

  // Une semaine de pas, face à la ligne de l'objectif
  FX.register('steps-week-goal', {
    entrance: true,
    setup: function (el) {
      var d = (el.dataset.fxData || '6400,8200,10400,5300,9100,12800,7600').split(',').map(Number), goal = U.num(el, 'fxGoal', 8000), max = Math.max.apply(null, d.concat(goal)), L = 'LMMJVSD', hits = d.filter(function (v) { return v >= goal; }).length;
      var h = '<div class="fx-sw" style="--fx-g:' + goal / max + '"><em aria-hidden="true"></em>';
      d.forEach(function (v, i) { h += '<span class="' + (v >= goal ? 'fx-ok' : '') + '" title="' + v + ' pas" style="--fx-q:' + v / max + ';--fx-i:' + i + '"><i></i><small>' + L[i % 7] + '</small></span>'; });
      el.innerHTML = h + '</div><p>' + hits + ' jours sur ' + d.length + ' au-dessus de ' + goal.toLocaleString('fr-FR') + ' pas</p>';
    }
  });

  // Un temps d'attente clair, avec l'heure de sa mise à jour
  FX.register('er-wait', {
    setup: function (el) {
      var m = U.num(el, 'fxMinutes', 45), lvl = m < 30 ? 0 : m < 90 ? 1 : 2, names = ['Attente faible', 'Attente moyenne', 'Attente longue'], d = new Date();
      el.dataset.fxLevel = lvl;
      el.innerHTML = '<div class="fx-ew" aria-hidden="true"><i></i><i></i><i></i></div><strong>' + (m >= 60 ? Math.floor(m / 60) + ' h ' + String(m % 60).padStart(2, '0') : m + ' min') + '</strong><span>' + names[lvl] + '</span><small>Estimation mise à jour à ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) + '</small><small class="fx-ew-u">En cas d\'urgence vitale, appelez le 15 ou le 112.</small>';
    }
  });

  // Des questions oui ou non qui orientent vers le bon interlocuteur
  FX.register('triage-flow', {
    setup: function (el) {
      var T = el.dataset.fxTree ? JSON.parse(el.dataset.fxTree) : { q: 'Danger immédiat ?', y: { r: 'Appelez le 15 ou le 112.', u: 1 }, n: { q: 'Le problème est apparu aujourd\'hui ?', y: { r: 'Contactez votre médecin aujourd\'hui.' }, n: { r: 'Prenez rendez-vous cette semaine.' } } };
      var hist = [], cur = T;
      var box = U.make('div', 'fx-tf', el);
      box.setAttribute('aria-live', 'polite');
      var show = function () {
        box.innerHTML = '';
        box.className = 'fx-tf' + (cur.u ? ' fx-u' : '');
        U.make('p', '', box).textContent = cur.q || cur.r;
        if (cur.q) ['y', 'n'].forEach(function (k) {
          var b = U.make('button', '', box);
          b.type = 'button'; b.textContent = k === 'y' ? 'Oui' : 'Non';
          b.addEventListener('click', function () { hist.push(cur); cur = cur[k]; show(); });
        });
        if (hist.length) {
          var bk = U.make('button', 'fx-tf-b', box);
          bk.type = 'button'; bk.textContent = 'Revenir';
          bk.addEventListener('click', function () { cur = hist.pop(); show(); });
        }
      };
      show();
    }
  });

  // Une équipe en pile de pastilles qui s'écarte pour se présenter
  FX.register('care-team', {
    setup: function (el) {
      var rows = (el.dataset.fxItems || 'Camille Roy:Médecin traitant|Sam Lefort:Infirmier·e|Noa Petit:Kinésithérapeute|Inès Faure:Diététicienne').split('|');
      var ul = U.make('ul', '', el), note = U.make('output', '', el);
      note.setAttribute('aria-live', 'polite');
      note.textContent = rows.length + ' personnes vous suivent';
      rows.forEach(function (r, i) {
        var p = r.split(':'), h = 0, li = U.make('li', '', ul), b = U.make('button', '', li);
        for (var k = 0; k < p[0].length; k++) h = (h * 17 + p[0].charCodeAt(k)) % 360;
        b.type = 'button'; b.style.setProperty('--fx-h', h); b.style.setProperty('--fx-i', i);
        b.textContent = p[0].split(' ').map(function (s) { return s[0]; }).join('');
        b.setAttribute('aria-label', p[0] + ', ' + p[1]);
        var say = function () { note.innerHTML = '<b>' + p[0] + '</b> · ' + p[1]; };
        b.addEventListener('mouseenter', say); b.addEventListener('focus', say); b.addEventListener('click', say);
      });
    }
  });

  // Avant une consultation à distance : le navigateur est-il prêt ?
  FX.register('device-check', {
    entrance: true,
    setup: function (el) {
      var C = [['Connexion', function () { return navigator.onLine !== false; }], ['Caméra et micro pris en charge', function () { return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia); }], ['Connexion sécurisée', function () { return window.isSecureContext; }]];
      var ul = U.make('ul', '', el), out = U.make('output', '', el);
      out.setAttribute('aria-live', 'polite');
      var run = function () {
        ul.innerHTML = ''; out.textContent = 'Vérification…'; el.classList.remove('fx-ok', 'fx-ko');
        var ok = 0;
        C.forEach(function (c, i) {
          var li = U.make('li', 'fx-wait', ul);
          li.innerHTML = '<i aria-hidden="true"></i>' + c[0];
          setTimeout(function () {
            var good = c[1]();
            ok += good ? 1 : 0;
            li.className = good ? 'fx-yes' : 'fx-no';
            li.appendChild(document.createTextNode(good ? ' : oui' : ' : non'));
            if (i === C.length - 1) { el.classList.add(ok === C.length ? 'fx-ok' : 'fx-ko'); out.textContent = ok === C.length ? 'Tout est prêt' : 'Un point à régler'; }
          }, U.reduced ? 0 : 500 * (i + 1));
        });
      };
      el._fxRun = run;
      run();
    },
    trigger: function (el) { el._fxRun(); }
  });

  // Des rendez-vous de santé par âge, situés depuis une date de naissance
  FX.register('vaccine-calendar', {
    entrance: true,
    setup: function (el) {
      var rows = (el.dataset.fxItems || '2 mois:2|4 mois:4|11 mois:11|6 ans:72|11 ans:132').split('|'), born = el.dataset.fxBorn ? new Date(el.dataset.fxBorn) : new Date(Date.now() - 86400000 * 30.4 * 10);
      var age = (Date.now() - born) / (86400000 * 30.4), ol = U.make('ol', '', el), done = false;
      rows.forEach(function (r, i) {
        var p = r.split(':'), m = +p[1], li = U.make('li', '', ol), past = age >= m, next = !past && !done;
        if (next) done = true;
        li.className = past ? 'fx-past' : next ? 'fx-next' : '';
        li.style.setProperty('--fx-i', i);
        li.innerHTML = '<b>' + p[0] + '</b><span>' + (past ? 'Date passée' : next ? 'Prochain, dans ' + Math.ceil(m - age) + ' mois' : 'Plus tard') + '</span>';
        if (next) li.setAttribute('aria-current', 'date');
      });
      U.make('small', '', el).textContent = 'Exemple fictif : suivez le calendrier officiel.';
    }
  });

  // Un anneau du cycle, avec le jour en cours et sa phase
  FX.register('cycle-ring', {
    entrance: true,
    setup: function (el) {
      var len = U.num(el, 'fxLength', 28), start = el.dataset.fxStart ? new Date(el.dataset.fxStart) : new Date(Date.now() - 86400000 * 11), day = ((Math.floor((Date.now() - start) / 86400000)) % len + len) % len + 1;
      var ph = [['Règles', 5], ['Folliculaire', 8], ['Ovulation', 3], ['Lutéale', len - 16]], s = '<svg viewBox="0 0 100 100" aria-hidden="true">', t = 0, cur = '';
      ph.forEach(function (p, i) {
        var c = 2 * Math.PI * 40;
        s += '<circle class="p' + i + '" cx="50" cy="50" r="40" stroke-dasharray="' + (p[1] / len * c - 1) + ' ' + c + '" stroke-dashoffset="' + -t / len * c + '"/>';
        if (day > t && day <= t + p[1]) cur = p[0];
        t += p[1];
      });
      var a = (day - .5) / len * 360;
      s += '<circle class="fx-dot" cx="90" cy="50" r="5" style="--fx-a:' + a + 'deg"/></svg><div><b>Jour ' + day + '</b><span>' + cur + '</span></div>';
      el.innerHTML = s;
      U.make('small', '', el).textContent = 'Repères moyens, pas une contraception';
    }
  });

  // Une frise de grossesse, semaine après semaine
  FX.register('pregnancy-week', {
    setup: function (el) {
      el.innerHTML = '<div class="fx-pw" aria-hidden="true"><i></i></div><label>Semaine <input type="range" min="1" max="41"></label><output aria-live="polite"></output>';
      var r = el.querySelector('input'), o = el.querySelector('output');
      r.value = U.num(el, 'fxWeek', 20);
      var go = function () {
        var w = +r.value, tri = w <= 14 ? 1 : w <= 28 ? 2 : 3;
        el.style.setProperty('--fx-q', w / 41);
        o.innerHTML = '<b>' + w + 'ᵉ semaine</b> · ' + tri + (tri === 1 ? 'ᵉʳ' : 'ᵉ') + ' trimestre<br>environ ' + Math.max(0, 41 - w) + ' semaines restantes';
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Une arcade dentaire dont on désigne les dents concernées
  FX.register('dental-chart', {
    setup: function (el) {
      var box = U.make('div', 'fx-dt', el), out = U.make('output', '', el), picked = [], Q = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
      out.setAttribute('aria-live', 'polite');
      var say = function () { out.textContent = picked.length ? 'Dents : ' + picked.sort(function (a, b) { return a - b; }).join(', ') : 'Touchez la dent concernée'; };
      box.setAttribute('role', 'group'); box.setAttribute('aria-label', 'Arcade du haut');
      Q.forEach(function (n, i) {
        var a = Math.PI * (i + .5) / Q.length, b = U.make('button', '', box);
        b.type = 'button'; b.textContent = n; b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-label', 'Dent ' + n);
        b.style.left = 50 - 46 * Math.cos(a) + '%'; b.style.top = 92 - 84 * Math.sin(a) + '%';
        b.style.setProperty('--fx-r', (a * 180 / Math.PI - 90) + 'deg');
        b.addEventListener('click', function () {
          var k = picked.indexOf(n), on = k < 0;
          if (on) picked.push(n); else picked.splice(k, 1);
          b.setAttribute('aria-pressed', on);
          say();
        });
      });
      say();
    }
  });

  // Un message composé comme un tableau d'ophtalmologue
  FX.register('eye-chart', {
    entrance: true,
    setup: function (el) {
      var t = el.textContent.trim().toUpperCase(), n = t.replace(/\s/g, ''), i = 0, row = 1, h = '';
      el.setAttribute('aria-label', el.textContent.trim());
      while (i < n.length) {
        var s = n.slice(i, i + row);
        h += '<span class="fx-ec" style="--fx-z:' + Math.max(.28, 1 - (row - 1) * .19) + ';--fx-i:' + (row - 1) + '" aria-hidden="true">' + s.split('').join(' ') + '</span>';
        i += row; row++;
      }
      el.innerHTML = h;
    }
  });

  // Des gouttes qui montrent les réserves de sang par groupe
  FX.register('blood-level', {
    entrance: true,
    setup: function (el) {
      var rows = (el.dataset.fxItems || 'O−:2|O+:5|A+:9|B−:3').split('|').map(function (r) { var p = r.split(':'); return [p[0], +p[1]]; }), safe = U.num(el, 'fxSafe', 7);
      rows.forEach(function (r, i) {
        var id = 'fxbl' + i + Math.floor(U.rand(1e4, 1e5)), q = Math.min(1, r[1] / (safe * 1.4)), d = U.make('div', '', el);
        d.style.setProperty('--fx-i', i);
        d.innerHTML = '<svg viewBox="0 0 40 52" aria-hidden="true"><defs><clipPath id="' + id + '"><path d="M20 2C20 2 3 22 3 33a17 17 0 0 0 34 0C37 22 20 2 20 2Z"/></clipPath></defs><g clip-path="url(#' + id + ')"><rect x="0" y="' + 52 * (1 - q) + '" width="40" height="52"/></g><path d="M20 2C20 2 3 22 3 33a17 17 0 0 0 34 0C37 22 20 2 20 2Z"/></svg><b>' + r[0] + '</b><small>' + (r[1] < safe / 2 ? 'Urgent' : r[1] < safe ? 'Bas' : 'Correct') + ', ' + r[1] + ' j</small>';
      });
      U.make('p', '', el).textContent = 'Valeurs fictives';
    }
  });

  // Choisir un groupe sanguin et voir à qui il peut donner ses globules rouges
  FX.register('blood-compat', {
    setup: function (el) {
      var G = ['O−', 'O+', 'B−', 'B+', 'A−', 'A+', 'AB−', 'AB+'];
      var can = function (d, r) {
        var dl = d.replace(/[+−]/, ''), rl = r.replace(/[+−]/, '');
        var abo = dl === 'O' || dl === rl || rl === 'AB';
        return abo && (d.slice(-1) === '−' || r.slice(-1) === '+');
      };
      var box = U.make('div', 'fx-bc', el), out = U.make('output', '', el);
      out.setAttribute('aria-live', 'polite');
      out.textContent = 'Choisissez votre groupe';
      G.forEach(function (g) {
        var b = U.make('button', '', box);
        b.type = 'button'; b.textContent = g; b.dataset.g = g;
        b.addEventListener('click', function () {
          var n = [];
          box.querySelectorAll('button').forEach(function (x) {
            var c = can(g, x.dataset.g);
            x.classList.toggle('fx-can', c); x.classList.toggle('fx-me', x === b);
            x.setAttribute('aria-pressed', x === b);
            if (c) n.push(x.dataset.g);
          });
          out.textContent = g + ' peut donner à : ' + n.join(', ');
        });
      });
      U.make('small', '', el).textContent = 'Globules rouges seulement. Le médecin décide.';
    }
  });

  // Chercher un service et voir à quel étage il se trouve
  FX.register('floor-finder', {
    setup: function (el) {
      var rows = (el.dataset.fxItems || 'Radiologie:0|Laboratoire:0|Maternité:2|Cardiologie:3|Pédiatrie:1|Consultations:1').split('|').map(function (r) { return r.split(':'); });
      var top = rows.reduce(function (m, r) { return Math.max(m, +r[1]); }, 0);
      el.innerHTML = '<div class="fx-ff" aria-hidden="true"></div><div><input type="search" placeholder="Un service…" aria-label="Chercher un service"><ul></ul></div>';
      var b = el.firstChild, q = el.querySelector('input'), ul = el.querySelector('ul');
      for (var i = top; i >= 0; i--) U.make('i', '', b).textContent = i === 0 ? 'RDC' : i;
      var light = function (f) { Array.prototype.forEach.call(b.children, function (x, i) { x.classList.toggle('fx-on', top - i === +f); }); };
      var show = function () {
        var v = q.value.toLowerCase(), hit = rows.filter(function (r) { return r[0].toLowerCase().indexOf(v) >= 0; });
        ul.innerHTML = '';
        hit.slice(0, 4).forEach(function (r) {
          var li = U.make('li', '', ul), a = U.make('button', '', li);
          a.type = 'button'; a.textContent = r[0] + ' · ' + (+r[1] ? 'étage ' + r[1] : 'rez-de-chaussée');
          a.addEventListener('mouseenter', function () { light(r[1]); });
          a.addEventListener('focus', function () { light(r[1]); });
          a.addEventListener('click', function () { light(r[1]); });
        });
        light(hit.length ? hit[0][1] : -1);
      };
      q.addEventListener('input', show);
      show();
    }
  });

  // Un historique rangé par année, dont seule la plus récente est ouverte
  FX.register('record-fold', {
    setup: function (el) {
      var rows = (el.dataset.fxItems || '2027:Bilan annuel|2027:Radio du genou|2026:Vaccin|2026:Dentiste|2026:Bilan annuel|2025:Ophtalmologue').split('|'), Y = {};
      rows.forEach(function (r) { var p = r.split(':'); (Y[p[0]] = Y[p[0]] || []).push(p[1]); });
      Object.keys(Y).sort().reverse().forEach(function (y, i) {
        var b = U.make('button', '', el), ul = U.make('ul', '', el), id = 'fxrf' + Math.floor(U.rand(1e5, 1e6));
        b.type = 'button'; ul.id = id; b.setAttribute('aria-controls', id); b.setAttribute('aria-expanded', i === 0);
        b.innerHTML = '<b>' + y + '</b><span>' + Y[y].length + (Y[y].length > 1 ? ' actes' : ' acte') + '</span><i aria-hidden="true"></i>';
        Y[y].forEach(function (t) { U.make('li', '', ul).textContent = t; });
        b.addEventListener('click', function () { b.setAttribute('aria-expanded', b.getAttribute('aria-expanded') !== 'true'); });
      });
    }
  });

  // La case de consentement s'ouvre quand on a lu le texte jusqu'au bout
  FX.register('consent-scroll', {
    setup: function (el) {
      var txt = el.firstElementChild, lab = el.querySelector('label'), box = lab.querySelector('input');
      box.disabled = true; box.checked = false;
      var bar = U.make('div', 'fx-cs-b', el), note = U.make('small', '', el);
      note.textContent = 'Lisez jusqu\'au bout pour continuer';
      note.setAttribute('aria-live', 'polite');
      el.insertBefore(bar, lab);
      txt.tabIndex = 0;
      var go = function () {
        var m = txt.scrollHeight - txt.clientHeight, q = m > 0 ? txt.scrollTop / m : 1;
        el.style.setProperty('--fx-q', q);
        if (q > .97 && box.disabled) { box.disabled = false; el.classList.add('fx-read'); note.textContent = 'Vous pouvez maintenant donner votre accord'; }
      };
      txt.addEventListener('scroll', go, { passive: true });
      go();
    }
  });

  // Une courbe de température avec la zone au-dessus du seuil
  FX.register('fever-curve', {
    entrance: true,
    setup: function (el) {
      var d = (el.dataset.fxData || '37.1,37.6,38.4,38.9,38.5,37.9,37.3').split(',').map(Number), th = U.num(el, 'fxThreshold', 38), lo = Math.min.apply(null, d.concat(th)) - .3, hi = Math.max.apply(null, d.concat(th)) + .3;
      var X = function (i) { return i / (d.length - 1) * 200; }, Y = function (v) { return 80 - (v - lo) / (hi - lo) * 76; };
      var line = d.map(function (v, i) { return (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1); }).join(''), id = 'fxfc' + Math.floor(U.rand(1e4, 1e5)), m = Math.max.apply(null, d);
      el.innerHTML = '<svg viewBox="0 0 200 84" preserveAspectRatio="none" aria-hidden="true"><defs><clipPath id="' + id + '"><rect x="0" y="0" width="200" height="' + Y(th) + '"/></clipPath></defs><path class="fx-a" clip-path="url(#' + id + ')" d="' + line + 'L200 84L0 84Z"/><line x1="0" x2="200" y1="' + Y(th) + '" y2="' + Y(th) + '"/><path class="fx-l" pathLength="1" d="' + line + '"/></svg><p>Maximum <b>' + String(m).replace('.', ',') + ' °C</b>, seuil ' + String(th).replace('.', ',') + ' °C</p>';
    }
  });

  // Tapoter au rythme de son pouls pour l'estimer
  FX.register('pulse-tap', {
    setup: function (el) {
      var times = [];
      el.innerHTML = '<button type="button">Tapotez à chaque battement</button><output aria-live="polite">— /min</output><small>Estimation seulement</small>';
      var b = el.firstChild, o = el.querySelector('output');
      b.addEventListener('click', function () {
        var now = performance.now();
        if (times.length && now - times[times.length - 1] > 2500) times = [];
        times.push(now);
        if (times.length > 9) times.shift();
        b.classList.remove('fx-go'); void b.offsetWidth; b.classList.add('fx-go');
        if (times.length > 3) {
          var avg = (times[times.length - 1] - times[0]) / (times.length - 1);
          o.textContent = Math.round(60000 / avg) + ' /min';
        } else o.textContent = 'Encore ' + (4 - times.length) + '…';
      });
    }
  });

  // Une liste qu'on trie par distance ou par disponibilité, en voyant les lignes bouger
  FX.register('practitioner-sort', {
    setup: function (el) {
      var rows = (el.dataset.fxItems || 'Dr Aubry:1.2:3|Dr Klein:0.4:12|Dr Mora:2.8:1|Dr Sané:1.9:5').split('|').map(function (r) { var p = r.split(':'); return { n: p[0], km: +p[1], d: +p[2] }; });
      var f = U.make('div', 'fx-ps-f', el), ul = U.make('ul', '', el);
      rows.forEach(function (r) { r.li = U.make('li', '', ul); r.li.innerHTML = '<b>' + r.n + '</b><span>' + String(r.km).replace('.', ',') + ' km</span><span>' + (r.d === 1 ? 'demain' : 'sous ' + r.d + ' j') + '</span>'; });
      var sort = function (k) {
        var before = rows.map(function (r) { return r.li.getBoundingClientRect().top; });
        rows.slice().sort(function (a, b) { return a[k] - b[k]; }).forEach(function (r) { ul.appendChild(r.li); });
        rows.forEach(function (r, i) {
          var dy = before[i] - r.li.getBoundingClientRect().top;
          if (!dy || U.reduced) return;
          r.li.animate([{ transform: 'translateY(' + dy + 'px)' }, { transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.16,1,.3,1)' });
        });
      };
      [['km', 'Le plus proche'], ['d', 'Le plus tôt']].forEach(function (c, i) {
        var b = U.make('button', '', f);
        b.type = 'button'; b.textContent = c[1]; b.setAttribute('aria-pressed', i === 0);
        b.addEventListener('click', function () { f.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); sort(c[0]); });
      });
      sort('km');
    }
  });
})(window.FX);

/* Pack 26 — Pharmacie */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Une grille des prises par jour et par moment
  FX.register('dose-grid', {
    setup: function (el) {
      var M = (el.dataset.fxMoments || 'Matin,Midi,Soir').split(','), D = (el.dataset.fxDays || 'Lun,Mar,Mer,Jeu').split(','), g = U.make('div', 'fx-dg', el), out = U.make('output', '', el);
      g.style.setProperty('--fx-c', D.length);
      out.setAttribute('aria-live', 'polite');
      U.make('span', '', g);
      D.forEach(function (d) { U.make('b', '', g).textContent = d; });
      M.forEach(function (m) {
        U.make('b', '', g).textContent = m;
        D.forEach(function (d) {
          var c = U.make('input', '', g);
          c.type = 'checkbox'; c.setAttribute('aria-label', m + ', ' + d);
        });
      });
      var go = function () { out.textContent = g.querySelectorAll(':checked').length + ' prises sur ' + D.length * M.length; };
      g.addEventListener('change', go);
      go();
    }
  });

  // Un pilulier de la semaine dont on ouvre les couvercles
  FX.register('pill-organizer', {
    setup: function (el) {
      var L = ['L', 'M', 'M', 'J', 'V', 'S', 'D'], N = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'], today = (new Date().getDay() + 6) % 7, row = U.make('div', 'fx-po', el), out = U.make('output', '', el);
      out.setAttribute('aria-live', 'polite');
      var go = function () { out.textContent = row.querySelectorAll('[aria-pressed=true]').length + ' jours pris cette semaine'; };
      L.forEach(function (d, i) {
        var b = U.make('button', i === today ? 'fx-now' : '', row);
        b.type = 'button'; b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-label', N[i] + (i === today ? ", aujourd'hui" : ''));
        b.innerHTML = '<u aria-hidden="true"></u><i aria-hidden="true"></i><span>' + d + '</span>';
        b.addEventListener('click', function () { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true'); go(); });
      });
      go();
    }
  });

  // Depuis la dernière prise, le temps qu'il reste avant la prochaine
  FX.register('next-dose', {
    setup: function (el) {
      var H = U.num(el, 'fxHours', 6), last = null;
      el.innerHTML = '<svg viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="35"/><circle class="fx-nd" cx="40" cy="40" r="35" pathLength="1"/></svg><div><b>–</b><span>Pas encore de prise</span></div><button type="button">J\'ai pris ma dose</button>';
      var b = el.querySelector('b'), s = el.querySelector('span');
      var go = function () {
        if (!last) return;
        var left = last + H * 3600000 - Date.now(), q = U.clamp(left / (H * 3600000), 0, 1);
        el.style.setProperty('--fx-q', q);
        if (left <= 0) { b.textContent = 'Maintenant'; s.textContent = 'Dose possible'; return; }
        b.textContent = Math.floor(left / 3600000) + ' h ' + String(Math.floor(left / 60000) % 60).padStart(2, '0');
        s.textContent = 'avant la prochaine';
      };
      el.querySelector('button').addEventListener('click', function () { last = Date.now(); go(); });
      setInterval(go, 30000);
      go();
    }
  });

  // Combien de jours tient la boîte, et quand la renouveler
  FX.register('refill-date', {
    entrance: true,
    setup: function (el) {
      var left = U.num(el, 'fxLeft', 18), per = U.num(el, 'fxPerDay', 2), box = U.num(el, 'fxBox', 60), days = Math.floor(left / per), end = new Date(Date.now() + days * 86400000);
      el.style.setProperty('--fx-q', Math.min(1, left / box));
      el.classList.toggle('fx-low', days <= U.num(el, 'fxWarn', 10));
      el.innerHTML = '<div class="fx-rd" aria-hidden="true"><i></i></div><strong>' + days + ' jours</strong><span>' + left + ' comprimés, ' + per + ' par jour</span><span>Boîte vide le ' + end.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) + '</span>';
    }
  });

  // Une fréquence d'effet indésirable montrée en personnes sur cent
  FX.register('side-effect-scale', {
    setup: function (el) {
      var rows = (el.dataset.fxItems || 'Maux de tête:10|Nausées:5|Vertiges:1').split('|').map(function (r) { return r.split(':'); }), sel = U.make('div', 'fx-se-b', el), dots = U.make('div', 'fx-se', el), out = U.make('output', '', el);
      dots.setAttribute('aria-hidden', 'true');
      out.setAttribute('aria-live', 'polite');
      for (var i = 0; i < 100; i++) U.make('i', '', dots).style.setProperty('--fx-i', i);
      var pick = function (r, b) {
        sel.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
        Array.prototype.forEach.call(dots.children, function (d, i) { d.classList.toggle('fx-on', i < +r[1]); });
        out.textContent = r[0] + ' : environ ' + r[1] + ' personne' + (+r[1] > 1 ? 's' : '') + ' sur 100';
      };
      rows.forEach(function (r, i) {
        var b = U.make('button', '', sel);
        b.type = 'button'; b.textContent = r[0];
        b.addEventListener('click', function () { pick(r, b); });
        if (!i) pick(r, b);
      });
      U.make('small', '', el).textContent = 'Valeurs fictives';
    }
  });

  // Deux éléments à choisir, et ce que dit la table à leur sujet
  FX.register('interaction-check', {
    setup: function (el) {
      var names = (el.dataset.fxNames || 'Produit A,Produit B,Produit C').split(','), tab = JSON.parse(el.dataset.fxTable || '{"Produit A+Produit B":"caution","Produit B+Produit C":"avoid"}');
      var opt = names.map(function (n) { return '<option>' + n + '</option>'; }).join('');
      el.innerHTML = '<label>Premier<select>' + opt + '</select></label><label>Second<select>' + opt + '</select></label><output role="status"></output>';
      var s = el.querySelectorAll('select'), o = el.querySelector('output');
      s[1].selectedIndex = 1;
      var T = { ok: 'Rien de signalé dans cette table', caution: 'Précaution : demandez conseil', avoid: 'À éviter : demandez conseil' };
      var go = function () {
        var a = s[0].value, b = s[1].value, r = a === b ? 'same' : tab[a + '+' + b] || tab[b + '+' + a] || 'ok';
        el.dataset.fxLevel = r;
        o.textContent = r === 'same' ? 'Choisissez deux éléments différents' : T[r];
      };
      el.addEventListener('change', go);
      go();
    }
  });

  // Le même principe actif, deux prix, et l'écart sur l'année
  FX.register('generic-compare', {
    entrance: true,
    setup: function (el) {
      var a = U.num(el, 'fxBrand', 12.4), b = U.num(el, 'fxGeneric', 7.9), n = U.num(el, 'fxPerYear', 12), f = function (v) { return v.toFixed(2).replace('.', ',') + ' €'; };
      el.innerHTML = '<div><span>' + (el.dataset.fxNameA || 'Marque') + '</span><i style="--fx-q:1"></i><b>' + f(a) + '</b></div><div class="fx-g"><span>' + (el.dataset.fxNameB || 'Générique') + '</span><i style="--fx-q:' + b / a + '"></i><b>' + f(b) + '</b></div><p>Soit <strong>' + f((a - b) * n) + '</strong> d\'écart pour ' + n + ' boîtes par an</p>';
    }
  });

  // Qui est ouvert maintenant, en tête de liste
  FX.register('on-duty-list', {
    setup: function (el) {
      var rows = (el.dataset.fxItems || 'Pharmacie du Port:8:20|Pharmacie de la Gare:0:24|Pharmacie des Tilleuls:9:19|Garde de nuit:20:8').split('|').map(function (r) { var p = r.split(':'); return { n: p[0], a: +p[1], b: +p[2] }; });
      var ul = U.make('ul', '', el), note = U.make('small', '', el);
      var h = new Date().getHours() + new Date().getMinutes() / 60;
      rows.forEach(function (r) { r.open = r.a < r.b ? h >= r.a && h < r.b : h >= r.a || h < r.b; });
      rows.sort(function (x, y) { return y.open - x.open; }).forEach(function (r, i) {
        var li = U.make('li', r.open ? 'fx-open' : '', ul);
        li.style.setProperty('--fx-i', i);
        li.innerHTML = '<i aria-hidden="true"></i><b>' + r.n + '</b><span>' + (r.open ? 'Ouvert' : 'Fermé') + ' · ' + r.a + ' h–' + r.b + ' h</span>';
      });
      note.textContent = 'Exemple fictif';
    }
  });

  // Une ordonnance envoyée, préparée, puis prête à retirer
  FX.register('rx-ready', {
    setup: function (el) {
      var S = (el.dataset.fxItems || 'Reçue|En préparation|Prête à retirer').split('|'), ol = U.make('ol', '', el), live = U.make('output', '', el);
      live.setAttribute('aria-live', 'polite');
      S.forEach(function (t) { U.make('li', '', ol).textContent = t; });
      el._fxSet = function (n) {
        n = U.clamp(n, 0, S.length - 1);
        el.style.setProperty('--fx-q', n / (S.length - 1));
        Array.prototype.forEach.call(ol.children, function (li, i) { li.classList.toggle('fx-done', i <= n); });
        el.classList.toggle('fx-ready', n === S.length - 1);
        live.textContent = S[n];
      };
      el._fxN = U.num(el, 'fxStep', 0);
      el._fxSet(el._fxN);
      new MutationObserver(function () { el._fxN = U.num(el, 'fxStep', 0); el._fxSet(el._fxN); }).observe(el, { attributes: true, attributeFilter: ['data-fx-step'] });
    },
    trigger: function (el) { el._fxN = (el._fxN + 1) % 3; el._fxSet(el._fxN); }
  });

  // Une croix de pharmacie en points lumineux, avec ses animations d'enseigne
  FX.register('led-cross', {
    setup: function (el) {
      var N = 15, a = 5, b = 10, cells = [], box = U.make('div', 'fx-lc', el);
      el.setAttribute('role', 'img');
      el.setAttribute('aria-label', el.dataset.fxLabel || 'Croix lumineuse');
      for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) {
        var i = U.make('i', '', box), on = (x >= a && x < b) || (y >= a && y < b);
        if (on) cells.push({ el: i, d: Math.hypot(x - 7, y - 7), a: Math.atan2(y - 7, x - 7) }); else i.style.visibility = 'hidden';
      }
      el._fxCells = cells;
      if (U.reduced) cells.forEach(function (c) { c.el.style.opacity = 1; });
    },
    tick: function (el, dt, t) {
      if (U.reduced) return;
      var mode = Math.floor(t / 4) % 3;
      el._fxCells.forEach(function (c) {
        var v = mode === 0 ? .5 + .5 * Math.sin(c.d * .9 - t * 4) : mode === 1 ? .5 + .5 * Math.sin(c.a * 2 + t * 3) : (Math.sin(t * 5) > 0 ? 1 : .15);
        c.el.style.opacity = (.15 + v * .85).toFixed(2);
      });
    }
  });

  // Un interrupteur en forme de gélule bicolore
  FX.register('capsule-switch', {
    setup: function (el) {
      var i = el.querySelector('input');
      if (!i) { i = document.createElement('input'); i.type = 'checkbox'; el.insertBefore(i, el.firstChild); }
      i.setAttribute('role', 'switch');
      var c = document.createElement('span');
      c.className = 'fx-cp'; c.setAttribute('aria-hidden', 'true');
      c.innerHTML = '<i></i>';
      i.parentNode.insertBefore(c, i.nextSibling);
      i.addEventListener('change', function () { c.classList.remove('fx-go'); void c.offsetWidth; c.classList.add('fx-go'); });
    }
  });

  // Une gélule qui se remplit de granules au fil du chargement
  FX.register('capsule-progress', {
    entrance: true,
    setup: function (el) {
      var v = U.num(el, 'fxValue', 68), N = 120, box = U.make('div', 'fx-cg', el);
      el.setAttribute('role', 'progressbar');
      el.setAttribute('aria-valuemin', 0); el.setAttribute('aria-valuemax', 100); el.setAttribute('aria-valuenow', v);
      el.setAttribute('aria-label', el.dataset.fxLabel || 'Progression');
      for (var i = 0; i < N; i++) {
        var g = U.make('i', '', box), q = i / N;
        g.style.left = q * 92 + 1 + '%';
        g.style.top = U.rand(14, 76) + '%';
        g.style.setProperty('--fx-s', U.rand(5, 9) + 'px');
        g.style.setProperty('--fx-i', i);
        if (q * 100 > v) g.classList.add('fx-off');
      }
      U.make('b', '', el).textContent = v + ' %';
    }
  });

  // Trois gélules qui roulent en attendant
  FX.register('pill-tumble', {
    setup: function (el) {
      el.setAttribute('role', 'status');
      el.setAttribute('aria-label', el.dataset.fxLabel || 'Chargement');
      for (var i = 0; i < 3; i++) U.make('i', '', el).style.setProperty('--fx-i', i);
    }
  });

  // Une plaquette dont on fait sortir les comprimés un par un
  FX.register('blister-pop', {
    setup: function (el) {
      var n = U.num(el, 'fxCount', 10), box = U.make('div', 'fx-bp', el), out = U.make('output', '', el), left = n;
      out.setAttribute('aria-live', 'polite');
      var say = function () { out.textContent = left + ' restant' + (left > 1 ? 's' : '') + ' sur ' + n; };
      for (var i = 0; i < n; i++) (function (i) {
        var b = U.make('button', '', box);
        b.type = 'button'; b.setAttribute('aria-label', 'Comprimé ' + (i + 1));
        U.make('i', '', b);
        b.addEventListener('click', function () {
          b.disabled = true; b.classList.add('fx-pop');
          left--; say();
        });
      })(i);
      say();
    }
  });

  // Un compte-gouttes : chaque geste fait tomber une goutte
  FX.register('dropper-count', {
    setup: function (el) {
      var max = U.num(el, 'fxMax', 12), n = 0;
      el.innerHTML = '<div class="fx-dr" aria-hidden="true"><u></u><div><i></i></div></div><button type="button">Une goutte</button><output aria-live="polite">0 goutte</output>';
      var b = el.querySelector('button'), o = el.querySelector('output'), drop = el.querySelector('u');
      b.addEventListener('click', function () {
        n++;
        drop.classList.remove('fx-go'); void drop.offsetWidth; drop.classList.add('fx-go');
        el.style.setProperty('--fx-q', n / max);
        o.textContent = n + (n > 1 ? ' gouttes' : ' goutte');
        if (n >= max) { b.disabled = true; o.textContent = n + ' gouttes : maximum de la démonstration'; }
      });
    }
  });

  // Un gobelet gradué dont on règle le niveau
  FX.register('measure-cup', {
    setup: function (el) {
      var max = U.num(el, 'fxMax', 30), step = U.num(el, 'fxStep', 5), t = '';
      for (var v = step; v <= max; v += step) t += '<span style="bottom:' + v / max * 92 + '%">' + v + '</span>';
      el.innerHTML = '<div class="fx-mc" aria-hidden="true"><i></i>' + t + '</div><div><label>Volume en ml<input type="range" min="0" max="' + max + '" step="' + step + '"></label><output aria-live="polite"></output></div>';
      var r = el.querySelector('input'), o = el.querySelector('output');
      r.value = U.num(el, 'fxValue', 15);
      var go = function () {
        el.style.setProperty('--fx-q', r.value / max);
        o.innerHTML = '<b>' + r.value + ' ml</b> soit ' + String(Math.round(r.value / 5 * 10) / 10).replace('.', ',') + ' c. à café';
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // L'indice UV du moment, avec le conseil qui va avec
  FX.register('uv-index', {
    setup: function (el) {
      var T = [[3, 'Faible', 'Pas de protection particulière.'], [6, 'Modéré', 'Crème et lunettes.'], [8, 'Élevé', 'Crème, chapeau, ombre à midi.'], [11, 'Très élevé', 'Évitez le soleil de 11 h à 15 h.'], [99, 'Extrême', 'Restez à l\'ombre.']];
      el.innerHTML = '<div class="fx-uv" aria-hidden="true"><i></i></div><label>Indice <input type="range" min="0" max="12"></label><output aria-live="polite"></output>';
      var r = el.querySelector('input'), o = el.querySelector('output');
      r.value = U.num(el, 'fxValue', 7);
      var go = function () {
        var v = +r.value, t = T.filter(function (x) { return v < x[0]; })[0] || T[4];
        el.style.setProperty('--fx-q', v / 12);
        o.innerHTML = '<b>' + v + ' · ' + t[1] + '</b><br>' + t[2];
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Un calendrier des pollens, avec le mois en cours en évidence
  FX.register('pollen-months', {
    entrance: true,
    setup: function (el) {
      var rows = (el.dataset.fxItems || 'Bouleau:0,1,3,3,1,0,0,0,0,0,0,0|Graminées:0,0,0,1,3,3,2,1,0,0,0,0|Ambroisie:0,0,0,0,0,0,1,3,3,1,0,0').split('|').map(function (r) { var p = r.split(':'); return [p[0], p[1].split(',').map(Number)]; }), now = new Date().getMonth(), L = 'JFMAMJJASOND', h = '<span></span>';
      L.split('').forEach(function (m, i) { h += '<b class="' + (i === now ? 'fx-now' : '') + '">' + m + '</b>'; });
      rows.forEach(function (r, y) {
        h += '<span>' + r[0] + '</span>';
        r[1].forEach(function (v, i) { h += '<i class="l' + v + (i === now ? ' fx-now' : '') + '" style="--fx-i:' + (i + y * 2) + '"></i>'; });
      });
      el.innerHTML = '<div class="fx-pm" aria-hidden="true">' + h + '</div>';
      var cur = rows.filter(function (r) { return r[1][now] >= 2; }).map(function (r) { return r[0]; });
      U.make('p', '', el).textContent = cur.length ? 'Ce mois-ci, surtout : ' + cur.join(', ') : 'Ce mois-ci : peu de pollens dans cet exemple';
    }
  });

  // Cocher ses allergies : les produits concernés sortent de la liste
  FX.register('allergen-filter', {
    setup: function (el) {
      var A = (el.dataset.fxAllergens || 'Parfum,Lanoline,Noix').split(','), P = (el.dataset.fxItems || 'Crème douce:Parfum|Baume intense:Lanoline,Noix|Lait neutre:|Huile légère:Noix').split('|').map(function (r) { var p = r.split(':'); return { n: p[0], a: p[1] ? p[1].split(',') : [] }; });
      var f = U.make('div', 'fx-af', el), ul = U.make('ul', '', el), out = U.make('output', '', el);
      out.setAttribute('aria-live', 'polite');
      P.forEach(function (p) { p.li = U.make('li', '', ul); p.li.innerHTML = '<span>' + p.n + '</span><small>' + (p.a.length ? 'Contient : ' + p.a.join(', ') : 'Aucun des trois') + '</small>'; });
      var go = function () {
        var no = Array.prototype.map.call(f.querySelectorAll(':checked'), function (c) { return c.value; }), n = 0;
        P.forEach(function (p) { var off = p.a.some(function (a) { return no.indexOf(a) >= 0; }); p.li.classList.toggle('fx-off', off); p.li.setAttribute('aria-hidden', off); if (!off) n++; });
        out.textContent = n + ' produit' + (n > 1 ? 's' : '') + ' sur ' + P.length;
      };
      A.forEach(function (a) {
        var l = U.make('label', '', f), c = U.make('input', '', l);
        c.type = 'checkbox'; c.value = a;
        l.appendChild(document.createTextNode(a));
      });
      f.addEventListener('change', go);
      go();
      U.make('small', 'fx-af-n', el).textContent = 'Lisez toujours l\'étiquette.';
    }
  });

  // Saisir une date et voir si le produit est encore bon
  FX.register('expiry-check', {
    setup: function (el) {
      el.innerHTML = '<label>Date de péremption <input type="date"></label><output role="status">Saisissez la date</output>';
      var i = el.querySelector('input'), o = el.querySelector('output'), soon = U.num(el, 'fxSoon', 30);
      var go = function () {
        if (!i.value) return;
        var d = Math.ceil((new Date(i.value) - Date.now()) / 86400000);
        el.dataset.fxLevel = d < 0 ? 'out' : d <= soon ? 'soon' : 'ok';
        o.textContent = d < 0 ? 'Périmé depuis ' + -d + ' jours' : d <= soon ? 'À finir sous ' + d + ' jours' : 'Bon encore ' + d + ' jours';
      };
      i.addEventListener('change', go);
      if (el.dataset.fxDate) { i.value = el.dataset.fxDate; go(); }
      else { var t = new Date(Date.now() + 86400000 * U.num(el, 'fxDays', 20)); i.value = t.toISOString().slice(0, 10); go(); }
    }
  });

  // Une bulle de contact qui propose les questions fréquentes
  FX.register('ask-pharmacist', {
    setup: function (el) {
      var Q = (el.dataset.fxItems || 'Un médicament est-il en stock ?|Puis-je envoyer mon ordonnance ?|Quels sont vos horaires ?').split('|');
      el.innerHTML = '<div class="fx-ap" hidden><strong>' + (el.dataset.fxTitle || 'Une question ?') + '</strong></div><button type="button" class="fx-ap-b" aria-expanded="false" aria-label="Poser une question"><i aria-hidden="true"></i></button>';
      var p = el.firstChild, b = el.lastChild;
      Q.forEach(function (q, i) {
        var a = U.make('button', '', p);
        a.type = 'button'; a.textContent = q; a.style.setProperty('--fx-i', i);
        a.addEventListener('click', function () { el.dispatchEvent(new CustomEvent('fx:ask', { bubbles: true, detail: { question: q } })); a.classList.add('fx-sent'); });
      });
      var set = function (o) { p.hidden = !o; b.setAttribute('aria-expanded', o); el.classList.toggle('fx-open', o); if (o && p.querySelector('button')) p.querySelector('button').focus(); };
      b.addEventListener('click', function () { set(p.hidden); });
      el.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !p.hidden) { set(false); b.focus(); } });
    }
  });

  // Un mortier et son pilon qui écrasent en attendant
  FX.register('mortar-grind', {
    setup: function (el) {
      el.setAttribute('role', 'status');
      el.setAttribute('aria-label', el.dataset.fxLabel || 'Préparation en cours');
      el.innerHTML = '<svg viewBox="0 0 100 90" aria-hidden="true"><g class="fx-mg-p"><rect x="-4" y="-38" width="8" height="42" rx="4"/></g><path class="fx-mg-b" d="M14 44H86C86 64 72 78 50 78S14 64 14 44Z"/><rect class="fx-mg-b" x="34" y="78" width="32" height="6" rx="2"/></svg>';
      var g = el.querySelector('svg');
      for (var i = 0; i < 7; i++) {
        var c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        c.setAttribute('cx', 40 + i * 3.4); c.setAttribute('cy', 44); c.setAttribute('r', 1.5);
        c.style.setProperty('--fx-i', i); c.style.setProperty('--fx-x', U.rand(-14, 14) + 'px');
        g.appendChild(c);
      }
    }
  });

  // Chercher un ingrédient dans une composition trop longue
  FX.register('ingredient-lookup', {
    setup: function (el) {
      var words = el.textContent.split(',').map(function (s) { return s.trim(); });
      el.textContent = '';
      var q = U.make('input', '', el), p = U.make('p', '', el), out = U.make('output', '', el);
      q.type = 'search'; q.placeholder = 'Chercher un ingrédient'; q.setAttribute('aria-label', 'Chercher un ingrédient');
      out.setAttribute('aria-live', 'polite');
      var sp = words.map(function (w, i) { var s = U.make('span', '', p); s.textContent = w + (i < words.length - 1 ? ', ' : ''); return s; });
      q.addEventListener('input', function () {
        var v = q.value.trim().toLowerCase(), n = 0;
        sp.forEach(function (s) { var hit = v && s.textContent.toLowerCase().indexOf(v) >= 0; s.classList.toggle('fx-hit', !!hit); if (hit) n++; });
        p.classList.toggle('fx-q', !!v);
        out.textContent = !v ? '' : n ? 'Présent : ' + n + ' mention' + (n > 1 ? 's' : '') : 'Absent de cette liste';
      });
    }
  });

  // Un code de retrait qui reste facile à montrer, avec sa date limite
  FX.register('pickup-code', {
    setup: function (el) {
      var c = el.dataset.fxCode || '4821', days = U.num(el, 'fxDays', 3), end = new Date(Date.now() + days * 86400000), h = '';
      c.split('').forEach(function (d, i) { h += '<i style="--fx-i:' + i + '">' + d + '</i>'; });
      el.innerHTML = '<small>Votre code de retrait</small><div class="fx-pc" aria-label="Code ' + c.split('').join(' ') + '">' + h + '</div><button type="button">Copier</button><small>À retirer avant le ' + end.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) + '</small>';
      var b = el.querySelector('button');
      b.addEventListener('click', function () {
        if (navigator.clipboard) navigator.clipboard.writeText(c).catch(function () {});
        b.textContent = 'Copié';
        setTimeout(function () { b.textContent = 'Copier'; }, 1400);
      });
    }
  });

  // Une tige qui pousse et dont les feuilles s'ouvrent une à une
  FX.register('herb-sprout', {
    entrance: true,
    setup: function (el) {
      var n = U.num(el, 'fxLeaves', 6), s = '<svg viewBox="0 0 100 150" aria-hidden="true"><path class="fx-hs-t" pathLength="1" d="M50 148C46 110 56 70 50 12"/>';
      for (var i = 0; i < n; i++) {
        var q = (i + 1) / (n + 1), y = 148 - q * 136, x = 50 + Math.sin(q * 3) * 3, side = i % 2 ? 1 : -1, size = 1.15 - q * .55;
        s += '<g transform="translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') scale(' + (side * size).toFixed(2) + ' ' + size.toFixed(2) + ') rotate(-28)"><path class="fx-hs-l" style="--fx-i:' + i + '" d="M0 0C10 -14 28 -14 38 0C28 12 10 12 0 0Z"/></g>';
      }
      el.innerHTML = s + '</svg>';
    }
  });
})(window.FX);

/* Pack 27 — Immobilier */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Ce qu'on peut acheter selon son revenu, son apport et la durée
  FX.register('budget-reach', {
    setup: function (el) {
      var rate = U.num(el, 'fxRate', 3.4) / 1200, part = U.num(el, 'fxPart', 35) / 100;
      var R = [['Revenus par mois', 'i', 1000, 8000, 100, 3200], ['Apport', 'a', 0, 100000, 1000, 20000], ['Durée (ans)', 'y', 10, 25, 1, 20]], H = '';
      R.forEach(function (r) { H += '<label>' + r[0] + ' <b data-o="' + r[1] + '"></b><input type="range" data-k="' + r[1] + '" min="' + r[2] + '" max="' + r[3] + '" step="' + r[4] + '" value="' + r[5] + '"></label>'; });
      el.innerHTML = H + '<output aria-live="polite"></output><small>Estimation fictive à ' + String(U.num(el, 'fxRate', 3.4)).replace('.', ',') + ' %, hors frais.</small>';
      var o = el.querySelector('output'), g = function (k) { return +el.querySelector('[data-k=' + k + ']').value; };
      var go = function () {
        var n = g('y') * 12, m = g('i') * part, cap = m * (1 - Math.pow(1 + rate, -n)) / rate, tot = cap + g('a');
        ['i', 'a'].forEach(function (k) { el.querySelector('[data-o=' + k + ']').textContent = g(k).toLocaleString('fr-FR') + ' €'; });
        el.querySelector('[data-o=y]').textContent = g('y') + ' ans';
        o.innerHTML = 'Budget possible <b>' + (Math.round(tot / 1000) * 1000).toLocaleString('fr-FR') + ' €</b>';
        el.style.setProperty('--fx-q', Math.min(1, tot / 600000));
      };
      el.addEventListener('input', go);
      go();
    }
  });

  // Un plan dont les pièces donnent leur nom et leur surface
  FX.register('floorplan-rooms', {
    setup: function (el) {
      var P = (el.dataset.fxItems || 'Séjour:0,0,60,55:28|Cuisine:60,0,40,35:11|Bain:60,35,40,20:6|Chambre:0,55,55,45:14|Bureau:55,55,45,45:9').split('|').map(function (r) { var p = r.split(':'); return { n: p[0], r: p[1].split(',').map(Number), s: +p[2] }; });
      var tot = P.reduce(function (t, p) { return t + p.s; }, 0), box = U.make('div', 'fx-fp', el), out = U.make('output', '', el);
      out.setAttribute('aria-live', 'polite');
      out.textContent = tot + ' m² au total';
      P.forEach(function (p) {
        var b = U.make('button', '', box);
        b.type = 'button'; b.textContent = p.n;
        b.style.cssText = 'left:' + p.r[0] + '%;top:' + p.r[1] + '%;width:' + p.r[2] + '%;height:' + p.r[3] + '%';
        var say = function () { out.innerHTML = '<b>' + p.n + '</b>, ' + p.s + ' m² sur ' + tot + ' m²'; };
        b.addEventListener('mouseenter', say); b.addEventListener('focus', say); b.addEventListener('click', say);
      });
    }
  });

  // Faire tourner le soleil autour du logement pour voir ses façades éclairées
  FX.register('sun-exposure', {
    setup: function (el) {
      var F = (el.dataset.fxWindows || 'S,O').split(',');
      el.innerHTML = '<div class="fx-se2" aria-hidden="true"><em></em><div>' + ['N', 'E', 'S', 'O'].map(function (s) { return '<i data-s="' + s + '">' + s + '</i>'; }).join('') + '</div></div><label>Heure <input type="range" min="6" max="21" step=".5"></label><output aria-live="polite"></output>';
      var r = el.querySelector('input'), o = el.querySelector('output');
      r.value = U.num(el, 'fxHour', 14);
      var go = function () {
        var h = +r.value, az = 90 + (h - 6) / 15 * 180, A = { E: 90, S: 180, O: 270 };
        el.style.setProperty('--fx-a', az + 'deg');
        var lit = [];
        el.querySelectorAll('[data-s]').forEach(function (f) {
          var s = f.dataset.s, on = A[s] !== undefined && Math.abs(az - A[s]) < 70;
          f.classList.toggle('fx-on', on);
          f.classList.toggle('fx-win', F.indexOf(s) >= 0);
          if (on && F.indexOf(s) >= 0) lit.push(s);
        });
        o.textContent = Math.floor(h) + ' h' + (h % 1 ? '30' : '') + ' · ' + (lit.length ? 'Soleil par les fenêtres ' + lit.join(', ') : 'Pas de soleil direct aux fenêtres');
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Une étiquette énergie dont la flèche vient se placer sur sa classe
  FX.register('energy-label', {
    entrance: true,
    setup: function (el) {
      var L = ['A', 'B', 'C', 'D', 'E', 'F', 'G'], lim = [70, 110, 180, 250, 330, 420, 1e9], v = U.num(el, 'fxValue', 210), k = lim.findIndex(function (m) { return v < m; }), col = ['#00853f', '#3fa34d', '#a4c639', '#f2d21f', '#f0a91a', '#e8681e', '#d3172a'];
      el.setAttribute('role', 'img');
      el.setAttribute('aria-label', 'Classe énergie ' + L[k] + ', ' + v + ' kWh par mètre carré et par an');
      var h = '';
      L.forEach(function (c, i) { h += '<div class="' + (i === k ? 'fx-on' : '') + '" style="--fx-c:' + col[i] + ';--fx-w:' + (30 + i * 11) + '%;--fx-i:' + i + '"><span>' + c + '</span>' + (i === k ? '<b>' + v + '</b>' : '') + '</div>'; });
      el.innerHTML = h;
    }
  });

  // Le quartier résumé : à combien de minutes à pied se trouve l'essentiel
  FX.register('walk-score', {
    entrance: true,
    setup: function (el) {
      var rows = (el.dataset.fxItems || 'École:6|Boulangerie:3|Métro:9|Parc:12|Médecin:15').split('|').map(function (r) { var p = r.split(':'); return [p[0], +p[1]]; }), max = 20;
      var score = Math.round(rows.reduce(function (t, r) { return t + Math.max(0, 1 - r[1] / max); }, 0) / rows.length * 100);
      var h = '<div class="fx-ws-s"><b>' + score + '</b><small>/100</small></div><ul>';
      rows.sort(function (a, b) { return a[1] - b[1]; }).forEach(function (r, i) { h += '<li style="--fx-q:' + (1 - r[1] / max) + ';--fx-i:' + i + '"><span>' + r[0] + '</span><i></i><b>' + r[1] + ' min</b></li>'; });
      el.innerHTML = h + '</ul>';
    }
  });

  // Le prix au mètre carré, comparé à celui du quartier
  FX.register('price-per-m2', {
    setup: function (el) {
      var price = U.num(el, 'fxPrice', 285000), area = U.num(el, 'fxArea', 62), ref = U.num(el, 'fxRef', 4300);
      el.innerHTML = '<label>Surface <b></b><input type="range" min="15" max="150" value="' + area + '"></label><div class="fx-m2" aria-hidden="true"><em></em><i></i></div><output aria-live="polite"></output>';
      var r = el.querySelector('input'), b = el.querySelector('b'), o = el.querySelector('output');
      var go = function () {
        var a = +r.value, pm = Math.round(price / a), gap = Math.round((pm / ref - 1) * 100);
        b.textContent = a + ' m²';
        el.style.setProperty('--fx-q', U.clamp(pm / (ref * 2), 0, 1));
        o.innerHTML = '<b>' + pm.toLocaleString('fr-FR') + ' €/m²</b><br>' + (gap === 0 ? 'Au niveau du quartier' : Math.abs(gap) + ' % ' + (gap > 0 ? 'au-dessus' : 'en dessous') + ' du quartier');
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Une photo panoramique qu'on fait tourner, avec sa boussole
  FX.register('panorama-drag', {
    setup: function (el) {
      var img = el.dataset.fxImage || 'assets/city.svg', x = 0, v = 0, down = false, last = 0, W = U.num(el, 'fxWidth', 900);
      el.tabIndex = 0;
      el.setAttribute('role', 'slider'); el.setAttribute('aria-label', el.dataset.fxLabel || 'Vue panoramique'); el.setAttribute('aria-valuemin', 0); el.setAttribute('aria-valuemax', 359);
      el.innerHTML = '<div class="fx-pn"></div><span class="fx-pn-c" aria-hidden="true"><i></i></span>';
      var p = el.firstChild;
      p.style.backgroundImage = 'url(' + img + ')';
      p.style.backgroundSize = W + 'px 100%';
      var put = function () { var c = ((x % W) + W) % W, d = Math.round(c / W * 360) % 360; p.style.backgroundPositionX = -c + 'px'; el.style.setProperty('--fx-a', d + 'deg'); el.setAttribute('aria-valuenow', d); };
      el.addEventListener('pointerdown', function (e) { down = true; last = e.clientX; v = 0; el.classList.add('fx-grab'); });
      window.addEventListener('pointermove', function (e) { if (!down) return; v = last - e.clientX; x += v; last = e.clientX; put(); });
      window.addEventListener('pointerup', function () { down = false; el.classList.remove('fx-grab'); });
      el.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') { x -= 25; put(); e.preventDefault(); } if (e.key === 'ArrowRight') { x += 25; put(); e.preventDefault(); } });
      el._fxStep = function () { if (!down && Math.abs(v) > .1) { x += v; v *= .94; put(); } };
      put();
    },
    tick: function (el) { if (el._fxStep) el._fxStep(); }
  });

  // Une carte à bulles de prix qui s'ouvre sur l'annonce
  FX.register('map-price-pins', {
    setup: function (el) {
      var P = (el.dataset.fxItems || '24:30:285 k€:T3 lumineux, 62 m²|62:22:410 k€:Maison, 98 m²|42:62:198 k€:Studio, 28 m²|76:68:340 k€:T4, 81 m²').split('|').map(function (r) { return r.split(':'); });
      var map = U.make('div', 'fx-mp', el), o = U.make('output', '', el);
      o.setAttribute('aria-live', 'polite');
      o.textContent = P.length + ' annonces fictives sur la carte';
      P.forEach(function (p, i) {
        var b = U.make('button', '', map);
        b.type = 'button'; b.textContent = p[2]; b.style.left = p[0] + '%'; b.style.top = p[1] + '%'; b.style.setProperty('--fx-i', i);
        b.setAttribute('aria-pressed', 'false');
        b.addEventListener('click', function () {
          map.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
          o.innerHTML = '<b>' + p[2] + '</b> · ' + p[3];
        });
      });
    }
  });

  // Une carte d'annonce : passer la souris fait défiler les photos
  FX.register('listing-photos', {
    setup: function (el) {
      var A = (el.dataset.fxImages || 'assets/city.svg,assets/bloom.svg,assets/dune.svg,assets/wave.svg').split(','), n = 0;
      el.innerHTML = '<div class="fx-lp">' + A.map(function (s, i) { return '<img src="' + s + '" alt="Photo ' + (i + 1) + ' sur ' + A.length + '" ' + (i ? 'hidden' : '') + '>'; }).join('') + '<button type="button" aria-label="Photo précédente">‹</button><button type="button" aria-label="Photo suivante">›</button><div aria-hidden="true">' + A.map(function () { return '<i></i>'; }).join('') + '</div></div>';
      var imgs = el.querySelectorAll('img'), d = el.querySelectorAll('i'), bs = el.querySelectorAll('button'), lp = el.firstChild;
      var show = function (k) { n = (k + A.length) % A.length; imgs.forEach(function (m, i) { m.hidden = i !== n; }); d.forEach(function (x, i) { x.classList.toggle('fx-on', i === n); }); };
      bs[0].addEventListener('click', function () { show(n - 1); });
      bs[1].addEventListener('click', function () { show(n + 1); });
      lp.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var r = lp.getBoundingClientRect(); show(Math.min(A.length - 1, Math.floor((e.clientX - r.left) / r.width * A.length))); });
      show(0);
    }
  });

  // Enregistrer une recherche pour recevoir les nouvelles annonces
  FX.register('search-alert', {
    setup: function (el) {
      var c = el.dataset.fxCriteria || 'T3, Lyon, moins de 300 000 €', key = el.dataset.fxKey, on = false;
      if (key) try { on = localStorage.getItem(key) === '1'; } catch (err) {}
      el.innerHTML = '<button type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 17V11a6 6 0 0 1 12 0v6l2 2H4Z"/><path d="M10 21h4"/></svg><span></span></button><small aria-live="polite"></small>';
      var b = el.firstChild, sp = el.querySelector('span'), s = el.querySelector('small');
      var show = function (anim) {
        b.setAttribute('aria-pressed', on);
        el.classList.toggle('fx-on', on);
        sp.textContent = on ? 'Alerte active' : 'Créer une alerte';
        s.textContent = on ? 'Nous vous préviendrons pour : ' + c : c;
        if (anim) { b.classList.remove('fx-go'); void b.offsetWidth; b.classList.add('fx-go'); }
      };
      b.addEventListener('click', function () {
        on = !on;
        if (key) try { localStorage.setItem(key, on ? '1' : '0'); } catch (err) {}
        show(on);
        el.dispatchEvent(new CustomEvent('fx:alert', { bubbles: true, detail: { on: on, criteria: c } }));
      });
      show();
    }
  });

  // Louer ou acheter : deux courbes et l'année où elles se croisent
  FX.register('rent-vs-buy', {
    setup: function (el) {
      el.innerHTML = '<svg viewBox="0 0 200 100" preserveAspectRatio="none" aria-hidden="true"><path class="r" pathLength="1"/><path class="b" pathLength="1"/><line y1="0" y2="100"/></svg><label>Loyer mensuel <b></b><input type="range" min="400" max="2500" step="50"></label><output aria-live="polite"></output><small>Modèle fictif : frais d\'achat et valeur du bien simplifiés.</small>';
      var i = el.querySelector('input'), P = U.num(el, 'fxPrice', 250000), F = P * .08, C = P * .012, Y = 25, o = el.querySelector('output');
      i.value = U.num(el, 'fxRent', 950);
      var go = function () {
        var rent = [], buy = [], cross = null;
        for (var y = 0; y <= Y; y++) { rent.push(+i.value * 12 * y); buy.push(F + C * y); if (cross === null && rent[y] > buy[y]) cross = y; }
        var top = Math.max(rent[Y], buy[Y]), p = function (a) { return a.map(function (v, k) { return (k ? 'L' : 'M') + (k / Y * 200).toFixed(1) + ' ' + (100 - v / top * 96).toFixed(1); }).join(''); };
        el.querySelector('.r').setAttribute('d', p(rent));
        el.querySelector('.b').setAttribute('d', p(buy));
        el.querySelector('b').textContent = (+i.value).toLocaleString('fr-FR') + ' €';
        var ln = el.querySelector('line');
        ln.setAttribute('x1', (cross || 0) / Y * 200); ln.setAttribute('x2', (cross || 0) / Y * 200);
        o.innerHTML = cross === null ? 'Pas de bascule sur 25 ans' : 'Acheter devient avantageux après <b>' + cross + ' ans</b>';
      };
      i.addEventListener('input', go);
      go();
    }
  });

  // Ce que coûte vraiment un achat : le prix plus les frais, en bloc empilé
  FX.register('closing-costs', {
    setup: function (el) {
      var P = U.num(el, 'fxPrice', 250000);
      el.innerHTML = '<div class="fx-cc-t"><button type="button" data-t=".075" aria-pressed="true">Ancien</button><button type="button" data-t=".025" aria-pressed="false">Neuf</button></div><div class="fx-cc" aria-hidden="true"><i class="a"></i><i class="b"></i><i class="c"></i></div><output aria-live="polite"></output><small>Taux approximatifs, à faire confirmer par le notaire.</small>';
      var o = el.querySelector('output');
      var set = function (t) {
        var n = P * t, ag = P * .045, tot = P + n + ag, m = function (v) { return Math.round(v).toLocaleString('fr-FR') + ' €'; };
        el.style.setProperty('--fx-a', P / tot); el.style.setProperty('--fx-b', n / tot); el.style.setProperty('--fx-c', ag / tot);
        o.innerHTML = 'Prix ' + m(P) + '<br>Frais de notaire ' + m(n) + '<br>Agence ' + m(ag) + '<br><b>Total ' + m(tot) + '</b>';
      };
      el.querySelectorAll('button').forEach(function (b) {
        b.addEventListener('click', function () {
          el.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
          set(+b.dataset.t);
        });
      });
      set(.075);
    }
  });

  // Un mètre ruban qui se déroule et compte en s'ouvrant
  FX.register('tape-measure', {
    entrance: true,
    enter: function (el) {
      var v = U.num(el, 'fxValue', 4.2), o = el.querySelector('output');
      U.tween(el, 1200, function (p) { o.textContent = (U.easeOut(p) * v).toFixed(2).replace('.', ',') + ' m'; });
    },
    setup: function (el) {
      var v = U.num(el, 'fxValue', 4.2), t = '';
      for (var i = 0; i <= 40; i++) t += '<i class="' + (i % 10 ? '' : 'fx-b') + '"></i>';
      el.innerHTML = '<div class="fx-tm"><div class="fx-tm-r" aria-hidden="true">' + t + '</div><span class="fx-tm-c" aria-hidden="true"></span></div><output>' + String(v.toFixed(2)).replace('.', ',') + ' m</output>';
      el.setAttribute('aria-label', 'Longueur : ' + v + ' mètres');
      el.setAttribute('role', 'img');
    }
  });

  // Un plan bleu qui se trace mur par mur
  FX.register('blueprint-draw', {
    entrance: true,
    setup: function (el) {
      var W = (el.dataset.fxWalls || '10,10,190,10|190,10,190,110|190,110,10,110|10,110,10,10|110,10,110,60|110,60,80,60|110,85,110,110|10,62,60,62').split('|'), s = '<svg viewBox="0 0 200 120" aria-hidden="true">';
      W.forEach(function (w, i) { var p = w.split(','); s += '<line pathLength="1" x1="' + p[0] + '" y1="' + p[1] + '" x2="' + p[2] + '" y2="' + p[3] + '" style="--fx-i:' + i + '"/>'; });
      s += '<path class="fx-bpd" d="M80 60A20 20 0 0 1 60 40"/><text x="40" y="40">Séjour</text><text x="150" y="60">Chambre</text><text x="55" y="90">Cuisine</text></svg>';
      el.innerHTML = s;
      if (el.dataset.fxLabel) { el.setAttribute('role', 'img'); el.setAttribute('aria-label', el.dataset.fxLabel); }
    }
  });

  // Une clé qui tourne dans la serrure, et la porte qui s'ouvre
  FX.register('key-unlock', {
    entrance: true,
    setup: function (el) {
      var msg = el.textContent.trim() || 'Bienvenue chez vous';
      el.innerHTML = '<div class="fx-ku"><span class="fx-ku-m">' + msg + '</span><div class="fx-ku-d" aria-hidden="true"><i class="fx-ku-h"></i><svg class="fx-ku-k" viewBox="0 0 60 20"><circle cx="9" cy="10" r="7"/><circle cx="9" cy="10" r="3"/><path d="M16 10H56V15H52V12H47V15H43V12H16Z"/></svg></div></div>';
    }
  });

  // Une façade dont les fenêtres s'allument selon l'heure du jour
  FX.register('facade-windows', {
    setup: function (el) {
      var c = U.num(el, 'fxCols', 8), r = U.num(el, 'fxRows', 6), g = U.make('div', 'fx-fw', el);
      g.style.setProperty('--fx-c', c);
      el.setAttribute('aria-hidden', 'true');
      for (var i = 0; i < c * r; i++) U.make('i', '', g);
      var h = new Date().getHours(), p = h >= 22 || h < 6 ? .15 : h >= 18 ? .65 : .25;
      el._fxW = g.children; el._fxP = U.num(el, 'fxDensity', p); el._fxNext = 0;
      Array.prototype.forEach.call(g.children, function (w) { w.classList.toggle('fx-on', Math.random() < el._fxP); });
    },
    tick: function (el, dt, t) {
      if (U.reduced || t < el._fxNext) return;
      el._fxNext = t + U.rand(.25, .8);
      var w = el._fxW[Math.floor(Math.random() * el._fxW.length)];
      w.classList.toggle('fx-on', Math.random() < el._fxP);
    }
  });

  // Une pancarte d'agence qui passe de « à vendre » à « vendu »
  FX.register('sold-sign', {
    setup: function (el) {
      var S = (el.dataset.fxItems || 'À vendre|Sous offre|Vendu').split('|'), n = U.num(el, 'fxStep', 0);
      el.innerHTML = '<div class="fx-ss" aria-hidden="true"><em></em><div class="fx-ss-p"><b></b></div></div><span class="fx-ss-l" aria-live="polite"></span>';
      var b = el.querySelector('b'), l = el.querySelector('.fx-ss-l');
      el._fxSet = function (k) {
        n = k;
        b.textContent = S[n]; l.textContent = 'État : ' + S[n];
        el.classList.toggle('fx-sold', n === S.length - 1);
        var p = el.querySelector('.fx-ss-p');
        p.classList.remove('fx-go'); void p.offsetWidth; p.classList.add('fx-go');
      };
      el._fxLen = S.length; el._fxN = function () { return n; };
      el._fxSet(n);
      el.querySelector('.fx-ss').addEventListener('click', function () { FX.trigger(el); });
    },
    trigger: function (el) { el._fxSet((el._fxN() + 1) % el._fxLen); }
  });

  // Partager le loyer selon la taille des chambres
  FX.register('rent-split', {
    setup: function (el) {
      var rent = U.num(el, 'fxRent', 1500), commonQ = U.num(el, 'fxCommon', 40) / 100, P = (el.dataset.fxItems || 'Aya:18|Léo:12|Sami:9').split('|').map(function (r) { var p = r.split(':'); return { n: p[0], s: +p[1] }; });
      P.forEach(function (p) {
        var l = U.make('label', '', el);
        l.innerHTML = '<span>' + p.n + '</span><input type="range" min="6" max="30" value="' + p.s + '" aria-label="Chambre de ' + p.n + ', en mètres carrés"><em></em><b></b>';
        p.i = l.querySelector('input'); p.b = l.querySelector('b'); p.e = l.querySelector('em');
      });
      var go = function () {
        var tot = P.reduce(function (t, p) { return t + +p.i.value; }, 0);
        P.forEach(function (p) {
          var v = rent * commonQ / P.length + rent * (1 - commonQ) * p.i.value / tot;
          p.b.textContent = Math.round(v) + ' €'; p.e.textContent = p.i.value + ' m²';
        });
      };
      el.addEventListener('input', go);
      U.make('small', '', el).textContent = 'Loyer de ' + rent + ' €, ' + Math.round(commonQ * 100) + ' % partagés à égalité';
      go();
    }
  });

  // Des anneaux de temps de trajet autour d'une adresse
  FX.register('commute-rings', {
    setup: function (el) {
      var P = (el.dataset.fxItems || 'Bureau:18:40|Gare:9:150|École:6:250|Aéroport:42:320').split('|').map(function (r) { var p = r.split(':'); return [p[0], +p[1], +p[2]]; }), Max = 45;
      var box = U.make('div', 'fx-cr', el), l = U.make('label', '', el), o = U.make('output', '', el);
      box.setAttribute('aria-hidden', 'true');
      [15, 30, 45].forEach(function (m) { var r = U.make('u', '', box); r.style.setProperty('--fx-r', m / Max); r.textContent = m; });
      U.make('b', '', box);
      P.forEach(function (p) {
        var d = U.make('i', '', box), q = p[1] / Max, a = p[2] * Math.PI / 180;
        d.style.left = 50 + 50 * q * Math.cos(a) + '%'; d.style.top = 50 + 50 * q * Math.sin(a) + '%'; d.textContent = p[0]; p.d = d;
      });
      l.innerHTML = 'Moins de <b></b><input type="range" min="5" max="45" step="5">';
      o.setAttribute('aria-live', 'polite');
      var r = l.querySelector('input');
      r.value = U.num(el, 'fxMinutes', 20);
      var go = function () {
        var hit = [];
        P.forEach(function (p) { var on = p[1] <= +r.value; p.d.classList.toggle('fx-on', on); if (on) hit.push(p[0]); });
        l.querySelector('b').textContent = r.value + ' min';
        el.style.setProperty('--fx-z', r.value / Max);
        o.textContent = hit.length ? 'Accessible : ' + hit.join(', ') : 'Rien dans ce temps';
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Choisir son étage : la vue change et le prix aussi
  FX.register('floor-view', {
    setup: function (el) {
      var base = U.num(el, 'fxPrice', 240000), add = U.num(el, 'fxStep', 4000), F = U.num(el, 'fxFloors', 8);
      el.innerHTML = '<div class="fx-fv" aria-hidden="true"><i></i><i></i><i></i><b></b></div><label>Étage <input type="range" min="0" max="' + F + '"></label><output aria-live="polite"></output>';
      var r = el.querySelector('input'), o = el.querySelector('output');
      r.value = U.num(el, 'fxFloor', 3);
      var go = function () {
        var f = +r.value, q = f / F;
        el.style.setProperty('--fx-q', q);
        o.innerHTML = '<b>' + (f ? f + (f === 1 ? 'ᵉʳ' : 'ᵉ') + ' étage' : 'Rez-de-chaussée') + '</b> · ' + (base + add * f).toLocaleString('fr-FR') + ' € (fictif)';
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Le dossier passe-t-il la règle du revenu égal à trois fois le loyer ?
  FX.register('rent-ratio', {
    setup: function (el) {
      var need = U.num(el, 'fxRatio', 3);
      el.innerHTML = '<label>Revenus <input type="number" min="0" step="50" value="' + U.num(el, 'fxIncome', 2400) + '"></label><label>Loyer <input type="number" min="0" step="10" value="' + U.num(el, 'fxRent', 900) + '"></label><div class="fx-rr" aria-hidden="true"></div><output aria-live="polite"></output>';
      var I = el.querySelectorAll('input'), box = el.querySelector('.fx-rr'), o = el.querySelector('output');
      for (var i = 0; i < need + 1; i++) U.make('i', '', box);
      var go = function () {
        var a = +I[0].value || 0, b = +I[1].value || 1, q = a / b, ok = q >= need;
        el.classList.toggle('fx-ok', ok);
        Array.prototype.forEach.call(box.children, function (d, k) { d.style.setProperty('--fx-f', U.clamp(q - k, 0, 1)); });
        o.textContent = String(q.toFixed(1)).replace('.', ',') + ' fois le loyer · ' + (ok ? 'Seuil atteint' : 'Il manque ' + Math.ceil(need * b - a) + ' €');
      };
      el.addEventListener('input', go);
      go();
    }
  });

  // Des pastilles de pièces : deux clics font une plage
  FX.register('rooms-range', {
    setup: function (el) {
      var L = (el.dataset.fxItems || 'Studio,2,3,4,5+').split(','), a = null, b = null, g = U.make('div', 'fx-rg', el), o = U.make('output', '', el);
      g.setAttribute('role', 'group'); g.setAttribute('aria-label', 'Nombre de pièces');
      o.setAttribute('aria-live', 'polite');
      var show = function () {
        var lo = a === null ? -1 : (b === null ? a : Math.min(a, b)), hi = a === null ? -1 : (b === null ? a : Math.max(a, b));
        Array.prototype.forEach.call(g.children, function (x, i) {
          var on = i >= lo && i <= hi;
          x.setAttribute('aria-pressed', on);
          x.classList.toggle('fx-s', i === lo); x.classList.toggle('fx-e', i === hi);
        });
        o.textContent = a === null ? 'Toutes les tailles' : lo === hi ? L[lo] : L[lo] + ' à ' + L[hi] + ' pièces';
      };
      L.forEach(function (t, i) {
        var x = U.make('button', '', g);
        x.type = 'button'; x.textContent = t;
        x.addEventListener('click', function () {
          if (a === null || b !== null) { a = i; b = null; } else if (a === i) { a = null; } else b = i;
          show();
          el.dispatchEvent(new CustomEvent('fx:range', { bubbles: true, detail: { from: a, to: b } }));
        });
      });
      show();
    }
  });

  // Une surface rendue concrète : un carré à l'échelle et des repères connus
  FX.register('area-square', {
    entrance: true,
    setup: function (el) {
      var a = U.num(el, 'fxArea', 62), side = Math.sqrt(a), ref = [['places de parking', 12.5], ['terrains de pétanque', 60]], max = U.num(el, 'fxMax', 150);
      el.style.setProperty('--fx-q', Math.sqrt(a / max));
      el.innerHTML = '<div class="fx-as"><i></i><u title="Une place de parking"></u></div><p><b>' + a + ' m²</b>, soit un carré de ' + side.toFixed(1).replace('.', ',') + ' m de côté<br>≈ ' + (a / ref[0][1]).toFixed(1).replace('.', ',') + ' ' + ref[0][0] + '</p>';
      el.style.setProperty('--fx-u', Math.sqrt(12.5 / max));
    }
  });

  // Une pièce vide qui se meuble d'un geste
  FX.register('staging-toggle', {
    setup: function (el) {
      el.innerHTML = '<div class="fx-st" aria-hidden="true"><i class="s"></i><i class="t"></i><i class="l"></i><i class="p"></i><i class="r"></i></div><button type="button" aria-pressed="false"></button><small>Ameublement simulé</small>';
      var b = el.querySelector('button');
      var set = function (on) { el.classList.toggle('fx-on', on); b.setAttribute('aria-pressed', on); b.textContent = on ? 'Voir la pièce vide' : 'Voir meublé'; };
      b.addEventListener('click', function () { set(!el.classList.contains('fx-on')); });
      el._fxSet = set;
      set(el.dataset.fxOn === 'true');
    },
    trigger: function (el) { el._fxSet(!el.classList.contains('fx-on')); }
  });

  // Une liste de déménagement : chaque tâche finie empile un carton
  FX.register('moving-boxes', {
    setup: function (el) {
      var T = (el.dataset.fxItems || 'Prévenir le propriétaire|Transférer le courrier|Résilier la box|Réserver le camion|Faire l\'état des lieux').split('|'), s = U.make('div', 'fx-mb', el), l = U.make('div', 'fx-mb-l', el), o = U.make('output', '', el);
      s.setAttribute('aria-hidden', 'true');
      o.setAttribute('aria-live', 'polite');
      T.forEach(function (t, i) {
        var r = U.make('label', '', l), c = U.make('input', '', r);
        c.type = 'checkbox';
        r.appendChild(document.createTextNode(t));
        var b = U.make('i', '', s);
        b.style.setProperty('--fx-x', (i % 2 ? 4 : -4) + 'px');
      });
      var go = function () {
        var n = l.querySelectorAll(':checked').length;
        Array.prototype.forEach.call(s.children, function (b, i) { b.classList.toggle('fx-on', i < n); });
        o.textContent = n === T.length ? 'Tout est prêt, bon déménagement !' : n + ' sur ' + T.length;
      };
      l.addEventListener('change', go);
      go();
    }
  });
})(window.FX);

/* Pack 28 — Architecture */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Un curseur coupe le bâtiment et montre ce qu'il y a dedans
  FX.register('section-cut', {
    setup: function (el) {
      var n = U.num(el, 'fxFloors', 4), h = '', w = '';
      for (var i = 0; i < n; i++) { h += '<div><i></i><i></i><i></i></div>'; w += '<div><em></em><em></em></div>'; }
      el.innerHTML = '<div class="fx-sc"><div class="fx-sc-i" aria-hidden="true">' + h + '</div><div class="fx-sc-o" aria-hidden="true">' + w + '</div><span class="fx-sc-l" aria-hidden="true"></span></div><input type="range" min="0" max="100" value="' + U.num(el, 'fxValue', 55) + '" aria-label="Position de la coupe">';
      var r = el.querySelector('input'), go = function () { el.style.setProperty('--fx-q', r.value + '%'); };
      r.addEventListener('input', go);
      go();
    }
  });

  // Des étages en axonométrie qui s'écartent pour se présenter
  FX.register('axo-explode', {
    setup: function (el) {
      var L = (el.dataset.fxItems || 'Toiture|Logements|Bureaux|Socle').split('|'), box = U.make('div', 'fx-ax', el), o = U.make('output', '', el);
      o.setAttribute('aria-live', 'polite');
      o.textContent = L.length + ' niveaux';
      L.slice().reverse().forEach(function (t, i) {
        var b = U.make('button', '', box);
        b.type = 'button'; b.setAttribute('aria-label', t); b.style.setProperty('--fx-i', i);
        var say = function () { o.textContent = t; box.querySelectorAll('button').forEach(function (x) { x.classList.toggle('fx-on', x === b); }); };
        b.addEventListener('mouseenter', say); b.addEventListener('focus', say); b.addEventListener('click', say);
      });
    }
  });

  // Choisir un matériau et voir la façade changer
  FX.register('material-swatch', {
    setup: function (el) {
      var M = { Béton: 'linear-gradient(#a3a5a7,#8d8f91)', Bois: 'repeating-linear-gradient(92deg,#a06a39 0 8px,#8b5a2d 8px 13px,#b47a44 13px 22px)', Brique: 'repeating-linear-gradient(0deg,#e8dbcb 0 2px,transparent 2px 13px),repeating-linear-gradient(90deg,#b0502d 0 26px,#a34827 26px 28px)', Zinc: 'repeating-linear-gradient(90deg,#6a7680 0 22px,#3f4850 22px 24px)' };
      var box = U.make('div', 'fx-ms', el), row = U.make('div', 'fx-ms-r', el), o = U.make('output', '', el);
      o.setAttribute('aria-live', 'polite');
      Object.keys(M).forEach(function (k, i) {
        var b = U.make('button', '', row);
        b.type = 'button'; b.setAttribute('aria-label', k); b.title = k; b.style.background = M[k];
        b.addEventListener('click', function () {
          row.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
          var f = U.make('i', '', box);
          f.style.background = M[k];
          setTimeout(function () { while (box.children.length > 1) box.firstChild.remove(); }, U.reduced ? 0 : 750);
          o.textContent = k;
        });
        if (!i) b.click();
      });
    }
  });

  // Un index de projets dont une seule ligne s'ouvre sur son image
  FX.register('project-index', {
    setup: function (el) {
      var rows = (el.dataset.fxItems || 'Halle des Sources:2026:Lille:assets/city.svg|École des Pins:2025:Nantes:assets/bloom.svg|Maison Blanche:2024:Sète:assets/dune.svg').split('|').map(function (r) { return r.split(':'); });
      rows.sort(function (a, b) { return b[1] - a[1]; }).forEach(function (r) {
        var b = U.make('button', '', el), p = U.make('div', 'fx-pi', el);
        b.type = 'button'; b.setAttribute('aria-expanded', 'false');
        b.innerHTML = '<span>' + r[0] + '</span><small>' + r[2] + '</small><small>' + r[1] + '</small>';
        p.innerHTML = '<img alt="" loading="lazy" src="' + r[3] + '">';
        b.addEventListener('click', function () {
          var was = b.getAttribute('aria-expanded') === 'true';
          el.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-expanded', 'false'); });
          b.setAttribute('aria-expanded', !was);
        });
      });
      el.querySelector('button').setAttribute('aria-expanded', 'true');
    }
  });

  // Une barre d'échelle qui reste juste quand on zoome
  FX.register('scale-bar', {
    setup: function (el) {
      el.innerHTML = '<div class="fx-sb"><div class="fx-sb-p"></div></div><label>Zoom <input type="range" min="1" max="8" step=".1"></label><div class="fx-sb-m"><i></i><b></b></div>';
      var r = el.querySelector('input'), p = el.querySelector('.fx-sb-p'), bar = el.querySelector('.fx-sb-m i'), b = el.querySelector('.fx-sb-m b'), base = U.num(el, 'fxPxPerM', 6), S = [1, 2, 5, 10, 20, 50, 100];
      r.value = U.num(el, 'fxZoom', 2);
      var go = function () {
        var z = +r.value, ppm = base * z, m = S.filter(function (s) { return s * ppm >= 40; })[0] || 100;
        p.style.transform = 'scale(' + z + ')';
        bar.style.width = m * ppm + 'px';
        b.textContent = m + ' m';
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Un titre qui se remplit, depuis une hachure de plan
  FX.register('hatch-reveal', {
    entrance: true,
    setup: function (el) {
      var t = el.textContent;
      el.setAttribute('aria-label', t);
      el.innerHTML = '<span class="fx-hr-a" aria-hidden="true">' + t + '</span><span class="fx-hr-b" aria-hidden="true">' + t + '</span>';
    }
  });

  // Une flèche de nord qui tourne en descendant la page
  FX.register('north-arrow', {
    setup: function (el) {
      el.setAttribute('aria-hidden', 'true');
      el.innerHTML = '<svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="26"/><path d="M30 6 38 34 30 28 22 34Z"/><text x="30" y="52">N</text></svg>';
    },
    scroll: function (el, info) { el.style.setProperty('--fx-a', (info.pass * U.num(el, 'fxTurn', 360)).toFixed(1) + 'deg'); }
  });

  // Afficher la grille modulaire derrière une mise en page
  FX.register('modular-grid', {
    setup: function (el) {
      var cols = U.num(el, 'fxCols', 6), g = U.make('div', 'fx-mg', el), b = U.make('button', 'fx-mg-b', el);
      g.setAttribute('aria-hidden', 'true');
      g.style.setProperty('--fx-c', cols);
      for (var i = 0; i < cols; i++) U.make('i', '', g).style.setProperty('--fx-i', i);
      U.ensurePositioned(el);
      b.type = 'button'; b.setAttribute('aria-pressed', 'false'); b.textContent = 'Grille';
      b.addEventListener('click', function () { var o = !el.classList.contains('fx-on'); el.classList.toggle('fx-on', o); b.setAttribute('aria-pressed', o); b.textContent = o ? cols + ' colonnes' : 'Grille'; });
    }
  });

  // Un papier calque à faire glisser sur une image
  FX.register('tracing-overlay', {
    setup: function (el) {
      var img = el.dataset.fxImage || 'assets/orbit.svg', x = 20, y = 20, st = null;
      el.innerHTML = '<div class="fx-to" style="background-image:url(' + img + ')"><div class="fx-to-c" tabindex="0" role="application" aria-label="Calque à déplacer avec les flèches"><span>Calque</span></div></div>';
      var c = el.querySelector('.fx-to-c');
      var put = function () { c.style.transform = 'translate(' + x + 'px,' + y + 'px)'; };
      c.addEventListener('pointerdown', function (e) { st = [e.clientX - x, e.clientY - y]; e.target.setPointerCapture && e.isTrusted && e.target.setPointerCapture(e.pointerId); });
      c.addEventListener('pointermove', function (e) { if (!st) return; x = e.clientX - st[0]; y = e.clientY - st[1]; put(); });
      c.addEventListener('pointerup', function () { st = null; });
      c.addEventListener('keydown', function (e) { var k = { ArrowLeft: [-8, 0], ArrowRight: [8, 0], ArrowUp: [0, -8], ArrowDown: [0, 8] }[e.key]; if (k) { x += k[0]; y += k[1]; put(); e.preventDefault(); } });
      put();
    }
  });

  // Une image qui passe de l'esquisse à la vue finale en descendant
  FX.register('sketch-render', {
    setup: function (el) {
      var img = el.querySelector('img');
      if (!img) return;
      var sk = img.cloneNode();
      sk.setAttribute('alt', ''); sk.setAttribute('aria-hidden', 'true');
      sk.className = 'fx-skr';
      el.appendChild(sk);
      U.ensurePositioned(el);
    },
    scroll: function (el, info) { el.style.setProperty('--fx-q', U.clamp(info.pass * 1.8 - .25, 0, 1).toFixed(3)); },
    trigger: function (el) { var on = el.style.getPropertyValue('--fx-q') === '1'; U.tween(el, 900, function (p) { el.style.setProperty('--fx-q', on ? 1 - p : p); }); }
  });

  // Un bâtiment qui se construit phase après phase
  FX.register('construction-phases', {
    setup: function (el) {
      var P = (el.dataset.fxItems || 'Terrassement:2026|Structure:2026|Enveloppe:2027|Livraison:2028').split('|').map(function (r) { return r.split(':'); });
      el.innerHTML = '<div class="fx-cp2" aria-hidden="true"><b class="p0"></b><b class="p1"></b><b class="p1 u"></b><b class="p2"></b><b class="p3"></b></div><input type="range" min="0" max="' + (P.length - 1) + '" aria-label="Phase du chantier"><output aria-live="polite"></output>';
      var r = el.querySelector('input'), o = el.querySelector('output');
      r.value = U.num(el, 'fxPhase', 1);
      var go = function () {
        var n = +r.value;
        el.dataset.fxPhase = n;
        o.innerHTML = '<b>' + P[n][0] + '</b> · ' + P[n][1];
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Une grue dépose le contenu à sa place
  FX.register('crane-lift', {
    entrance: true,
    setup: function (el) {
      var t = el.innerHTML;
      el.innerHTML = '<div class="fx-cl-c" aria-hidden="true"><i class="m"></i><i class="b"></i><i class="h"></i></div><div class="fx-cl-l">' + t + '</div>';
    }
  });

  // Une silhouette à côté d'une hauteur pour la rendre concrète
  FX.register('scale-figure', {
    setup: function (el) {
      el.innerHTML = '<div class="fx-sf" aria-hidden="true"><em></em><i></i></div><label>Hauteur <input type="range" min="2.2" max="12" step=".1"></label><output aria-live="polite"></output>';
      var r = el.querySelector('input'), o = el.querySelector('output');
      r.value = U.num(el, 'fxHeight', 5.2);
      var go = function () {
        var h = +r.value;
        el.style.setProperty('--fx-q', 1.75 / h);
        o.innerHTML = '<b>' + String(h.toFixed(1)).replace('.', ',') + ' m</b>, soit ' + String((h / 1.75).toFixed(1)).replace('.', ',') + ' personnes debout l\'une sur l\'autre';
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Une rangée de colonnes dont on traverse le rythme en descendant
  FX.register('colonnade', {
    setup: function (el) {
      var n = U.num(el, 'fxCols', 9), box = U.make('div', 'fx-co', el);
      box.setAttribute('aria-hidden', 'true');
      for (var i = 0; i < n; i++) { var c = U.make('i', '', box), d = Math.abs(i - (n - 1) / 2) / ((n - 1) / 2); c.style.setProperty('--fx-d', d.toFixed(3)); }
    },
    scroll: function (el, info) { el.style.setProperty('--fx-o', info.pass.toFixed(3)); }
  });

  // Un mur qui se monte brique après brique
  FX.register('brick-lay', {
    entrance: true,
    setup: function (el) {
      var R = U.num(el, 'fxRows', 7), C = U.num(el, 'fxCols', 8), box = U.make('div', 'fx-bl2', el), t = el.dataset.fxText;
      box.setAttribute('aria-hidden', 'true');
      for (var y = 0; y < R; y++) {
        var row = U.make('div', y % 2 ? 'fx-off' : '', box);
        for (var x = 0; x < C + (y % 2); x++) {
          var b = U.make('i', '', row);
          b.style.setProperty('--fx-i', (R - 1 - y) * 4 + x * .55);
          b.style.setProperty('--fx-t', U.rand(-3, 3).toFixed(1) + '%');
        }
      }
      if (t) { var s = U.make('strong', '', el); s.textContent = t; }
    }
  });

  // Des arches emboîtées qu'on traverse en descendant la page
  FX.register('arch-tunnel', {
    setup: function (el) {
      var n = U.num(el, 'fxCount', 7), box = U.make('div', 'fx-at', el);
      box.setAttribute('aria-hidden', 'true');
      for (var i = 0; i < n; i++) { var a = U.make('i', '', box); a.style.setProperty('--fx-i', i / (n - 1)); a.style.zIndex = i; }
    },
    scroll: function (el, info) { el.style.setProperty('--fx-z', (info.pass * .9).toFixed(3)); }
  });

  // Une silhouette qui monte l'escalier au fil de la lecture
  FX.register('stair-climb', {
    setup: function (el) {
      var n = U.num(el, 'fxSteps', 10), s = '';
      for (var i = 0; i < n; i++) s += '<i style="height:' + (i + 1) / n * 88 + '%"></i>';
      el.innerHTML = '<div class="fx-sc2" aria-hidden="true">' + s + '<b></b></div>';
      el.style.setProperty('--fx-n', n);
      el._fxN = n;
    },
    scroll: function (el, info) {
      var s = Math.min(el._fxN - 1, Math.floor(info.pass * el._fxN));
      el.style.setProperty('--fx-s', s);
      var l = el.querySelectorAll('i');
      l.forEach(function (x, i) { x.classList.toggle('fx-on', i <= s); });
    }
  });

  // Des lames de façade qui s'ouvrent quand on descend vers elles
  FX.register('louver-facade', {
    setup: function (el) {
      var n = U.num(el, 'fxBlades', 11), b = U.make('div', 'fx-lf', el);
      b.setAttribute('aria-hidden', 'true');
      U.ensurePositioned(el);
      for (var i = 0; i < n; i++) U.make('i', '', b);
    },
    scroll: function (el, info) { el.style.setProperty('--fx-q', U.clamp(info.enter * 1.5, 0, 1).toFixed(3)); },
    trigger: function (el) { var on = el.classList.toggle('fx-open'); el.style.setProperty('--fx-q', on ? 1 : 0); }
  });

  // Des étiquettes reliées à des points de l'image par des lignes de renvoi
  FX.register('leader-labels', {
    entrance: true,
    setup: function (el) {
      var P = (el.dataset.fxItems || '30:25:Toiture végétalisée|62:52:Brise-soleil en bois|38:82:Socle en pierre').split('|').map(function (r) { return r.split(':'); });
      el.innerHTML = '<div class="fx-ll-i"></div><svg aria-hidden="true"></svg><ul></ul>';
      var i = el.firstChild, ul = el.querySelector('ul'), svg = el.querySelector('svg');
      var img = el.dataset.fxImage || 'assets/prism.svg';
      i.style.backgroundImage = 'url(' + img + ')';
      P.forEach(function (p, k) { var li = U.make('li', '', ul); li.textContent = p[2]; li.style.setProperty('--fx-i', k); });
      var draw = function () {
        var R = el.getBoundingClientRect(), I = i.getBoundingClientRect(), s = '';
        svg.setAttribute('viewBox', '0 0 ' + R.width + ' ' + R.height);
        ul.querySelectorAll('li').forEach(function (l, k) {
          var r = l.getBoundingClientRect(), x = I.left - R.left + I.width * P[k][0] / 100, y = I.top - R.top + I.height * P[k][1] / 100, tx = r.left - R.left - 3, ty = r.top - R.top + r.height / 2;
          s += '<circle cx="' + x + '" cy="' + y + '" r="3" style="--fx-i:' + k + '"/><path pathLength="1" d="M' + x + ' ' + y + 'L' + (tx - 8) + ' ' + ty + 'H' + tx + '" style="--fx-i:' + k + '"/>';
        });
        svg.innerHTML = s;
      };
      draw();
      U.onResize(draw);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
    }
  });

  // Des lignes de cote qui mesurent vraiment l'élément
  FX.register('dimension-lines', {
    entrance: true,
    setup: function (el) {
      var W = U.make('span', 'fx-dl fx-dl-w', el), H = U.make('span', 'fx-dl fx-dl-h', el);
      W.setAttribute('aria-hidden', 'true'); H.setAttribute('aria-hidden', 'true');
      U.ensurePositioned(el);
      var f = U.num(el, 'fxScale', 0), u = el.dataset.fxUnit || 'px';
      var go = function () {
        var r = el.getBoundingClientRect(), v = function (n) { return f ? (n * f).toFixed(1).replace('.', ',') + ' ' + u : Math.round(n) + ' ' + u; };
        W.textContent = v(r.width); H.textContent = v(r.height);
      };
      go();
      U.onResize(go);
    }
  });

  // Un fond de béton brut, généré sans image
  FX.register('concrete-grain', {
    setup: function (el) {
      var id = 'fxcg' + Math.floor(U.rand(1e4, 1e5)), seed = Math.floor(U.rand(1, 90));
      var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      s.setAttribute('class', 'fx-cg'); s.setAttribute('aria-hidden', 'true');
      s.innerHTML = '<filter id="' + id + '"><feTurbulence type="fractalNoise" baseFrequency="' + U.num(el, 'fxScale', .85) + '" numOctaves="3" seed="' + seed + '"/><feColorMatrix values="0 0 0 0 .1 0 0 0 0 .1 0 0 0 0 .1 0 0 0 .55 -.1"/></filter><rect width="100%" height="100%" filter="url(#' + id + ')"/>';
      el.insertBefore(s, el.firstChild);
      U.ensurePositioned(el);
      var c = U.num(el, 'fxHoles', 6);
      for (var i = 0; i < c; i++) { var h = U.make('i', '', el); h.setAttribute('aria-hidden', 'true'); h.style.left = (8 + i * (84 / Math.max(1, c - 1))) + '%'; h.style.top = i % 2 ? '84%' : '14%'; }
    }
  });

  // La lumière d'une fenêtre qui glisse lentement sur le mur
  FX.register('window-light', {
    setup: function (el) {
      el.setAttribute('aria-hidden', 'true');
      el.innerHTML = '<div class="fx-wl"><i></i><i></i><i></i><i></i></div>';
      if (U.reduced) el.style.setProperty('--fx-x', '20%');
    },
    tick: function (el, dt, t) {
      if (U.reduced) return;
      var q = (Math.sin(t / U.num(el, 'fxPace', 12)) + 1) / 2;
      el.style.setProperty('--fx-x', (q * 60 - 10).toFixed(2) + '%');
      el.style.setProperty('--fx-o', (.55 + q * .35).toFixed(2));
    }
  });

  // Une fiche technique dont les lignes se tracent une à une
  FX.register('project-sheet', {
    entrance: true,
    setup: function (el) {
      var R = (el.dataset.fxItems || 'Programme:12 logements|Surface:1 480 m²|Lieu:Bordeaux|Livraison:2027|Maîtrise d\'ouvrage:Fictive').split('|'), dl = U.make('dl', '', el);
      R.forEach(function (r, i) {
        var k = r.indexOf(':'), d = U.make('div', '', dl);
        d.style.setProperty('--fx-i', i);
        d.innerHTML = '<dt>' + r.slice(0, k) + '</dt><dd>' + r.slice(k + 1) + '</dd>';
      });
    }
  });

  // Une ville dont les tours montent au fil du défilement
  FX.register('skyline-rise', {
    setup: function (el) {
      var n = U.num(el, 'fxTowers', 18), s = U.num(el, 'fxSeed', 7), box = U.make('div', 'fx-sr', el), R = function () { s = (s * 16807) % 2147483647; return s / 2147483647; };
      box.setAttribute('aria-hidden', 'true');
      for (var i = 0; i < n; i++) {
        var t = U.make('i', '', box);
        t.style.setProperty('--fx-t', (.25 + R() * .75).toFixed(3));
        t.style.setProperty('--fx-d', R().toFixed(3));
        t.style.flex = (1 + R() * 1.5).toFixed(2) + ' 1 0';
      }
    },
    scroll: function (el, info) { el.style.setProperty('--fx-q', U.clamp(info.enter * 1.3, 0, 1).toFixed(3)); },
    trigger: function (el) { U.tween(el, 1400, function (p) { el.style.setProperty('--fx-q', U.easeOut(p)); }); }
  });

  // Régler la pente d'un toit et lire sa hauteur
  FX.register('roof-pitch', {
    setup: function (el) {
      var W = U.num(el, 'fxWidth', 8);
      el.innerHTML = '<svg viewBox="0 0 120 92" aria-hidden="true"><path class="fx-rp-t"/><rect x="24" y="52" width="72" height="38"/><rect class="fx-rp-w" x="52" y="62" width="16" height="28"/></svg><label>Angle <input type="range" min="10" max="55"></label><output aria-live="polite"></output>';
      var r = el.querySelector('input'), o = el.querySelector('output'), t = el.querySelector('.fx-rp-t');
      r.value = U.num(el, 'fxAngle', 35);
      var go = function () {
        var a = +r.value * Math.PI / 180, h = Math.tan(a) * W / 2, py = Math.tan(a) * 44;
        t.setAttribute('d', 'M14 54 60 ' + (52 - py).toFixed(1) + ' 106 54Z');
        o.innerHTML = '<b>' + r.value + '°</b> · ' + Math.round(Math.tan(a) * 100) + ' % · faîtage à ' + h.toFixed(1).replace('.', ',') + ' m';
      };
      r.addEventListener('input', go);
      go();
    }
  });
})(window.FX);

/* Pack 29 — Automobile */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Choisir une peinture : la voiture se repeint et le prix suit
  FX.register('car-colorizer', {
    setup: function (el) {
      var base = U.num(el, 'fxPrice', 24900), P = (el.dataset.fxItems || 'Blanc nacré:#eef0f2:0|Rouge vif:#c8102e:550|Bleu nuit:#16284f:750|Vert sapin:#1f4d3c:750').split('|').map(function (r) { return r.split(':'); });
      el.innerHTML = '<svg viewBox="0 0 200 80" aria-hidden="true"><path class="fx-cc-b" d="M8 58C8 46 18 44 34 42L62 22C70 16 84 14 104 14C128 14 142 20 154 38C176 40 192 44 192 58V62H8Z"/><path class="fx-cc-g" d="M70 25C76 20 86 19 100 19V38H52ZM106 19C122 19 134 23 144 38H106Z"/><circle cx="52" cy="62" r="14"/><circle cx="52" cy="62" r="6" class="fx-cc-h"/><circle cx="150" cy="62" r="14"/><circle cx="150" cy="62" r="6" class="fx-cc-h"/></svg><div class="fx-cc-s"></div><output aria-live="polite"></output>';
      var s = el.querySelector('.fx-cc-s'), o = el.querySelector('output');
      P.forEach(function (p, i) {
        var b = U.make('button', '', s);
        b.type = 'button'; b.style.background = p[1]; b.setAttribute('aria-label', p[0]);
        b.addEventListener('click', function () {
          s.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
          el.style.setProperty('--fx-paint', p[1]);
          o.innerHTML = '<b>' + (base + +p[2]).toLocaleString('fr-FR') + ' €</b> · ' + p[0] + (+p[2] ? ' (+' + p[2] + ' €)' : '');
        });
        if (!i) b.click();
      });
    }
  });

  // Une voiture qui avance en descendant la page, ses roues tournent juste
  FX.register('wheel-roll', {
    setup: function (el) {
      el.setAttribute('aria-hidden', 'true');
      el.innerHTML = '<div class="fx-wr"><i></i><i></i></div>';
    },
    scroll: function (el, info) {
      var w = el.clientWidth - 110, x = info.pass * w, r = 13;
      el.style.setProperty('--fx-x', x.toFixed(1) + 'px');
      el.style.setProperty('--fx-a', (x / r * 57.3).toFixed(1) + 'deg');
    }
  });

  // L'autonomie selon la température et la vitesse
  FX.register('range-conditions', {
    setup: function (el) {
      var base = U.num(el, 'fxRange', 420);
      el.innerHTML = '<label>Température <b data-o="t"></b><input data-k="t" type="range" min="-10" max="30" value="10"></label><label>Vitesse <b data-o="v"></b><input data-k="v" type="range" min="50" max="130" step="10" value="110"></label><div class="fx-rc" aria-hidden="true"><i></i></div><output aria-live="polite"></output><small>Modèle fictif pour illustrer l\'écart.</small>';
      var T = el.querySelector('[data-k=t]'), V = el.querySelector('[data-k=v]'), o = el.querySelector('output');
      var go = function () {
        var t = +T.value, v = +V.value, ct = t < 20 ? 1 - (20 - t) * .012 : 1, cv = 1 - Math.max(0, v - 70) * .0045, r = Math.round(base * ct * cv);
        el.querySelector('[data-o=t]').textContent = t + ' °C'; el.querySelector('[data-o=v]').textContent = v + ' km/h';
        el.style.setProperty('--fx-q', r / base);
        o.innerHTML = '<b>' + r + ' km</b> sur ' + base + ' km annoncés';
      };
      el.addEventListener('input', go);
      go();
    }
  });

  // Combien de temps pour recharger, selon la borne
  FX.register('charge-time', {
    setup: function (el) {
      var kwh = U.num(el, 'fxBattery', 60), P = [['Prise', 2.3], ['Wallbox', 7.4], ['Rapide', 50], ['Ultra', 150]];
      el.innerHTML = '<div class="fx-ct-p" role="radiogroup" aria-label="Type de borne"></div><label><span>De <b data-a></b> à <b data-b></b></span><input type="range" min="10" max="100" step="5" value="80" aria-label="Niveau visé"></label><div class="fx-ct" aria-hidden="true"><i></i></div><output aria-live="polite"></output>';
      var box = el.querySelector('.fx-ct-p'), r = el.querySelector('input'), o = el.querySelector('output'), kw = 7.4, from = 20;
      var go = function () {
        var to = Math.max(from, +r.value), fast = Math.max(0, Math.min(to, 80) - from) / 100 * kwh, slow = Math.max(0, to - 80) / 100 * kwh, h = fast / kw + slow / (kw > 11 ? kw * .4 : kw);
        el.querySelector('[data-a]').textContent = from + ' %'; el.querySelector('[data-b]').textContent = to + ' %';
        el.style.setProperty('--fx-q', to / 100);
        o.innerHTML = '<b>' + (h >= 1 ? Math.floor(h) + ' h ' : '') + String(Math.round(h % 1 * 60)).padStart(2, '0') + ' min</b> sur ' + kw + ' kW';
      };
      P.forEach(function (p, i) {
        var b = U.make('button', '', box);
        b.type = 'button'; b.setAttribute('role', 'radio'); b.textContent = p[0]; b.setAttribute('aria-checked', i === 1);
        b.addEventListener('click', function () { box.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-checked', x === b); }); kw = p[1]; go(); });
      });
      r.addEventListener('input', go);
      go();
    }
  });

  // Le coût d'énergie sur l'année : essence contre électrique
  FX.register('fuel-vs-electric', {
    setup: function (el) {
      var L = U.num(el, 'fxLitre', 1.85), C = U.num(el, 'fxCons', 6.5), K = U.num(el, 'fxKwh', .21), E = U.num(el, 'fxElec', 17);
      el.innerHTML = '<label>Km par an <b></b><input type="range" min="5000" max="40000" step="1000"></label><div class="fx-fe"><span>Essence</span><i class="a"></i><em data-a></em><span>Électrique</span><i class="b"></i><em data-b></em></div><output aria-live="polite"></output><small>Tarifs d\'exemple modifiables.</small>';
      var r = el.querySelector('input'), o = el.querySelector('output');
      r.value = U.num(el, 'fxKm', 15000);
      var go = function () {
        var km = +r.value, a = km / 100 * C * L, b = km / 100 * E * K, m = function (v) { return Math.round(v).toLocaleString('fr-FR') + ' €'; };
        el.querySelector('label b').textContent = km.toLocaleString('fr-FR');
        el.querySelector('[data-a]').textContent = m(a); el.querySelector('[data-b]').textContent = m(b);
        el.style.setProperty('--fx-a', Math.min(1, a / 3000)); el.style.setProperty('--fx-b', Math.min(1, b / 3000));
        o.innerHTML = '<b>' + m(a - b) + '</b> d\'écart par an';
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Un compte-tours qu'on fait monter en maintenant le bouton
  FX.register('rev-meter', {
    setup: function (el) {
      el.innerHTML = '<svg viewBox="0 0 120 80" aria-hidden="true"><path class="fx-rv-b" pathLength="1" d="M12 70A52 52 0 0 1 108 70"/><path class="fx-rv-r" pathLength="1" d="M92 26A52 52 0 0 1 108 70"/><line class="fx-rv-n" x1="60" y1="70" x2="60" y2="24"/></svg><output></output><button type="button">Accélérer</button>';
      var b = el.querySelector('button'), o = el.querySelector('output');
      el._fxR = 800; el._fxHold = false;
      b.addEventListener('pointerdown', function () { el._fxHold = true; });
      ['pointerup', 'pointerleave', 'blur'].forEach(function (t) { b.addEventListener(t, function () { el._fxHold = false; }); });
      b.addEventListener('keydown', function (e) { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); el._fxHold = true; } });
      b.addEventListener('keyup', function () { el._fxHold = false; });
      el._fxO = o;
    },
    tick: function (el, dt) {
      var top = U.num(el, 'fxMax', 8000), r = el._fxR;
      r += el._fxHold ? 4200 * dt : -2600 * dt;
      r = U.clamp(r, 800, top);
      if (r >= top * .985) r -= U.rand(150, 500);
      el._fxR = r;
      el.style.setProperty('--fx-a', ((r / top) * 150 - 75).toFixed(1) + 'deg');
      el._fxO.textContent = Math.round(r / 50) * 50 + ' tr/min';
      el.classList.toggle('fx-red', r > top * .8);
    },
    trigger: function (el) { el._fxR = 7600; }
  });

  // Un sélecteur P R N D qui fonctionne comme un groupe de boutons radio
  FX.register('gear-selector', {
    setup: function (el) {
      var G = (el.dataset.fxItems || 'P:Parking|R:Marche arrière|N:Point mort|D:Marche avant').split('|').map(function (r) { return r.split(':'); }), n = 0;
      var box = U.make('div', 'fx-gs', el), o = U.make('output', '', el);
      box.setAttribute('role', 'radiogroup'); box.setAttribute('aria-label', 'Rapport');
      U.make('i', '', box).setAttribute('aria-hidden', 'true');
      o.setAttribute('aria-live', 'polite');
      box.style.setProperty('--fx-n', G.length);
      var set = function (k, f) {
        n = (k + G.length) % G.length;
        box.style.setProperty('--fx-k', n);
        box.querySelectorAll('button').forEach(function (b, i) { b.setAttribute('aria-checked', i === n); b.tabIndex = i === n ? 0 : -1; if (i === n && f) b.focus(); });
        o.textContent = G[n][1];
        el.dispatchEvent(new CustomEvent('fx:gear', { bubbles: true, detail: { gear: G[n][0] } }));
      };
      G.forEach(function (g, i) {
        var b = U.make('button', '', box);
        b.type = 'button'; b.setAttribute('role', 'radio'); b.textContent = g[0]; b.setAttribute('aria-label', g[1]);
        b.addEventListener('click', function () { set(i); });
      });
      box.addEventListener('keydown', function (e) { var d = { ArrowUp: -1, ArrowLeft: -1, ArrowDown: 1, ArrowRight: 1 }[e.key]; if (d) { e.preventDefault(); set(n + d, true); } });
      set(0);
    }
  });

  // Des phares qui s'allument et balaient le texte dans le noir
  FX.register('headlight-sweep', {
    setup: function (el) {
      var t = el.innerHTML;
      el.innerHTML = '<div class="fx-hl-t">' + t + '</div><div class="fx-hl-m" aria-hidden="true"></div><button type="button" aria-pressed="false">Allumer les phares</button>';
      var b = el.querySelector('button');
      b.addEventListener('click', function () { var o = !el.classList.contains('fx-on'); el.classList.toggle('fx-on', o); b.setAttribute('aria-pressed', o); b.textContent = o ? 'Éteindre les phares' : 'Allumer les phares'; });
      el.addEventListener('pointermove', function (e) { var r = el.getBoundingClientRect(); el.style.setProperty('--fx-x', (e.clientX - r.left) + 'px'); el.style.setProperty('--fx-y', (e.clientY - r.top) + 'px'); });
      U.ensurePositioned(el);
    }
  });

  // Une voiture vue de dessus qu'on fait tourner sur un plateau
  FX.register('turntable-top', {
    setup: function (el) {
      var a = -18, v = 0, last = null;
      el.tabIndex = 0;
      el.setAttribute('role', 'slider'); el.setAttribute('aria-label', 'Rotation du plateau'); el.setAttribute('aria-valuemin', 0); el.setAttribute('aria-valuemax', 359);
      el.innerHTML = '<div class="fx-tt2" aria-hidden="true"><div class="fx-tt2-c"><i></i><i></i><i></i><i></i><u></u></div></div>';
      var p = el.firstChild;
      var put = function () { p.style.transform = 'rotate(' + a + 'deg)'; el.setAttribute('aria-valuenow', ((Math.round(a) % 360) + 360) % 360); };
      el.addEventListener('pointerdown', function (e) { last = e.clientX; v = 0; el.classList.add('fx-grab'); });
      window.addEventListener('pointermove', function (e) { if (last === null) return; v = (e.clientX - last) * .8; a += v; last = e.clientX; put(); });
      window.addEventListener('pointerup', function () { last = null; el.classList.remove('fx-grab'); });
      el.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') { a -= 12; put(); e.preventDefault(); } if (e.key === 'ArrowRight') { a += 12; put(); e.preventDefault(); } });
      el._fxStep = function () { if (last === null && Math.abs(v) > .05) { a += v; v *= .95; put(); } };
      put();
    },
    tick: function (el) { if (el._fxStep) el._fxStep(); }
  });

  // Un loyer de location selon la durée, les kilomètres et l'apport
  FX.register('lease-monthly', {
    setup: function (el) {
      var P = U.num(el, 'fxPrice', 32000);
      el.innerHTML = '<div class="fx-lm" role="radiogroup" aria-label="Durée"></div><label>Km par an <b data-k></b><input data-r="k" type="range" min="5000" max="30000" step="5000" value="15000"></label><label>Apport <b data-a></b><input data-r="a" type="range" min="0" max="8000" step="500" value="2000"></label><output aria-live="polite"></output><small>Estimation fictive, hors assurance.</small>';
      var box = el.querySelector('.fx-lm'), K = el.querySelector('[data-r=k]'), A = el.querySelector('[data-r=a]'), o = el.querySelector('output'), M = 36;
      var go = function () {
        var km = +K.value, ap = +A.value, residual = P * Math.max(.2, .72 - M / 120 - km / 150000), loyer = (P - residual - ap) / M + P * .0028;
        el.querySelector('[data-k]').textContent = km.toLocaleString('fr-FR');
        el.querySelector('[data-a]').textContent = ap.toLocaleString('fr-FR') + ' €';
        o.innerHTML = '<b>' + Math.round(loyer) + ' €</b> par mois sur ' + M + ' mois';
      };
      [24, 36, 48, 60].forEach(function (m) {
        var b = U.make('button', '', box);
        b.type = 'button'; b.setAttribute('role', 'radio'); b.textContent = m; b.setAttribute('aria-label', m + ' mois'); b.setAttribute('aria-checked', m === 36);
        b.addEventListener('click', function () { box.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-checked', x === b); }); M = m; go(); });
      });
      el.addEventListener('input', go);
      go();
    }
  });

  // La valeur d'un véhicule au fil des années, avec un repère
  FX.register('resale-curve', {
    setup: function (el) {
      var P = U.num(el, 'fxPrice', 28000), Y = 12, pts = [];
      for (var i = 0; i <= Y; i++) pts.push(P * Math.pow(.84, i));
      var p = pts.map(function (v, i) { return (i ? 'L' : 'M') + (i / Y * 200).toFixed(1) + ' ' + (92 - v / P * 86).toFixed(1); }).join('');
      el.innerHTML = '<svg viewBox="0 0 200 96" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="' + p + '"/></svg><span class="fx-rv2" aria-hidden="true"></span><label>Âge <input type="range" min="0" max="' + Y + '"></label><output aria-live="polite"></output><small>Décote fictive de 16 % par an.</small>';
      var r = el.querySelector('input'), o = el.querySelector('output');
      r.value = U.num(el, 'fxYear', 4);
      var go = function () {
        var y = +r.value, v = pts[y];
        el.style.setProperty('--fx-x', y / Y); el.style.setProperty('--fx-y', 1 - v / P * .9);
        o.innerHTML = '<b>' + (Math.round(v / 100) * 100).toLocaleString('fr-FR') + ' €</b> à ' + y + ' an' + (y > 1 ? 's' : '') + ', soit ' + Math.round(v / P * 100) + ' % de sa valeur';
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Ce qui arrive bientôt à l'entretien, selon le compteur
  FX.register('service-odometer', {
    setup: function (el) {
      var km = U.num(el, 'fxKm', 47200), O = (el.dataset.fxItems || 'Vidange:20000|Pneus:40000|Freins:60000|Courroie:120000').split('|').map(function (r) { var p = r.split(':'); return { n: p[0], e: +p[1] }; });
      el.innerHTML = '<div class="fx-so" aria-label="' + km + ' kilomètres">' + String(km).padStart(6, '0').split('').map(function (d) { return '<i>' + d + '</i>'; }).join('') + '</div><ul></ul>';
      var ul = el.querySelector('ul');
      O.forEach(function (o) { o.left = o.e - km % o.e; o.q = 1 - o.left / o.e; });
      O.sort(function (a, b) { return a.left - b.left; }).forEach(function (o, i) {
        var li = U.make('li', o.left < 5000 ? 'fx-soon' : '', ul);
        li.style.setProperty('--fx-q', o.q); li.style.setProperty('--fx-i', i);
        li.innerHTML = '<span>' + o.n + '</span><em></em><b>' + o.left.toLocaleString('fr-FR') + ' km</b>';
      });
    }
  });

  // La pression des quatre pneus, vue de dessus
  FX.register('tire-pressure', {
    setup: function (el) {
      var V = (el.dataset.fxData || '2.4,2.4,1.9,2.3').split(',').map(Number), N = ['Avant gauche', 'Avant droit', 'Arrière gauche', 'Arrière droit'], lo = U.num(el, 'fxLow', 2.1), h = '', bad = [];
      V.forEach(function (v, i) {
        var low = v < lo;
        if (low) bad.push(N[i]);
        h += '<div class="fx-p' + i + (low ? ' fx-low' : '') + '"><i></i><b>' + String(v.toFixed(1)).replace('.', ',') + '</b></div>';
      });
      el.innerHTML = '<div class="fx-tp" aria-hidden="true"><u></u>' + h + '</div><p>' + (bad.length ? 'À regonfler : ' + bad.join(', ') : 'Pression correcte partout') + '</p>';
      el.classList.toggle('fx-bad', bad.length > 0);
    }
  });

  // Un bouton dont la route défile au survol, et la petite voiture arrive au bout
  FX.register('road-cta', {
    setup: function (el) {
      var d = U.make('span', 'fx-rd', el), c = U.make('span', 'fx-rd-c', el);
      d.setAttribute('aria-hidden', 'true'); c.setAttribute('aria-hidden', 'true');
      U.ensurePositioned(el);
    }
  });

  // Une route qui défile en perspective vers l'horizon
  FX.register('road-dashes', {
    setup: function (el) {
      var c = U.make('canvas', '', el), x, W, H;
      el.setAttribute('aria-hidden', 'true');
      var size = function () { var r = el.getBoundingClientRect(), d = window.devicePixelRatio || 1; W = r.width; H = r.height; c.width = W * d; c.height = H * d; x = c.getContext('2d'); x.scale(d, d); };
      size(); U.onResize(size);
      el._fxDraw = function (t) {
        var hz = H * .32, sp = U.num(el, 'fxSpeed', 1), g = x.createLinearGradient(0, 0, 0, hz);
        g.addColorStop(0, '#16213f'); g.addColorStop(1, '#f28a6a');
        x.fillStyle = g; x.fillRect(0, 0, W, hz);
        x.fillStyle = '#1c1d22'; x.fillRect(0, hz, W, H - hz);
        x.fillStyle = '#34363d';
        x.beginPath(); x.moveTo(W * .47, hz); x.lineTo(W * .53, hz); x.lineTo(W * 1.1, H); x.lineTo(-W * .1, H); x.closePath(); x.fill();
        x.fillStyle = '#ffe9a8';
        for (var i = 0; i < 8; i++) {
          var z = ((i / 8 + t * .35 * sp) % 1), z2 = z + .045, y1 = hz + (H - hz) * z * z, y2 = hz + (H - hz) * z2 * z2, w1 = 1 + z * z * 7, w2 = 1 + z2 * z2 * 7;
          x.beginPath(); x.moveTo(W / 2 - w1, y1); x.lineTo(W / 2 + w1, y1); x.lineTo(W / 2 + w2, y2); x.lineTo(W / 2 - w2, y2); x.fill();
        }
      };
      el._fxDraw(0);
    },
    tick: function (el, dt, t) { if (el._fxDraw && !U.reduced) el._fxDraw(t); }
  });

  // Un champ d'immatriculation qui ressemble à la plaque
  FX.register('plate-input', {
    setup: function (el) {
      el.innerHTML = '<div class="fx-pl2"><span class="fx-pl2-e" aria-hidden="true">F</span><input type="text" inputmode="text" autocomplete="off" maxlength="9" placeholder="AB-123-CD" aria-label="Plaque d\'immatriculation" aria-describedby=""><span class="fx-pl2-e" aria-hidden="true"></span></div><output aria-live="polite"></output>';
      var i = el.querySelector('input'), o = el.querySelector('output');
      i.addEventListener('input', function () {
        var c = i.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7), s = c.slice(0, 2) + (c.length > 2 ? '-' + c.slice(2, 5) : '') + (c.length > 5 ? '-' + c.slice(5) : '');
        i.value = s;
        var ok = /^[A-HJ-NP-TV-Z]{2}-(?!000)[0-9]{3}-[A-HJ-NP-TV-Z]{2}$/.test(s);
        el.classList.toggle('fx-ok', ok);
        el.classList.toggle('fx-ko', s.length === 9 && !ok);
        o.textContent = s.length < 9 ? '' : ok ? 'Format valide' : 'Format incorrect';
        if (ok) el.dispatchEvent(new CustomEvent('fx:plate', { bubbles: true, detail: { plate: s } }));
      });
    }
  });

  // Deux modèles côte à côte : le meilleur de chaque ligne ressort
  FX.register('spec-duel', {
    entrance: true,
    setup: function (el) {
      var N = (el.dataset.fxNames || 'Modèle A,Modèle B').split(','), R = (el.dataset.fxItems || 'Autonomie (km):420:510:+|0 à 100 km/h (s):7.8:6.4:-|Coffre (L):470:380:+|Prix (k€):34:41:-').split('|').map(function (r) { return r.split(':'); }), score = [0, 0];
      var h = '<thead><tr><th><span class="fx-sr">Caractéristique</span></th><th>' + N[0] + '</th><th>' + N[1] + '</th></tr></thead><tbody>';
      R.forEach(function (r, i) {
        var a = +r[1], b = +r[2], w = a === b ? -1 : ((a > b) === (r[3] === '+') ? 0 : 1);
        if (w >= 0) score[w]++;
        h += '<tr style="--fx-i:' + i + '"><th scope="row">' + r[0] + '</th><td class="' + (w === 0 ? 'fx-w' : '') + '">' + r[1].replace('.', ',') + '</td><td class="' + (w === 1 ? 'fx-w' : '') + '">' + r[2].replace('.', ',') + '</td></tr>';
      });
      el.innerHTML = '<table>' + h + '</tbody></table><p>' + N[0] + ' ' + score[0] + ' · ' + N[1] + ' ' + score[1] + '</p>';
    }
  });

  // Un radar de recul : plus l'obstacle approche, plus les arcs rougissent
  FX.register('parking-sensor', {
    setup: function (el) {
      el.innerHTML = '<svg viewBox="0 0 120 64" aria-hidden="true"><path d="M20 62A40 40 0 0 1 100 62"/><path d="M34 62A26 26 0 0 1 86 62"/><path d="M46 62A14 14 0 0 1 74 62"/><rect x="50" y="58" width="20" height="6" rx="2"/></svg><label>Distance <input type="range" min="10" max="150" step="5"></label><output aria-live="polite"></output>';
      var r = el.querySelector('input'), o = el.querySelector('output'), A = el.querySelectorAll('svg path');
      r.value = U.num(el, 'fxCm', 60);
      var go = function () {
        var d = +r.value, n = d > 100 ? 0 : d > 60 ? 1 : d > 30 ? 2 : 3;
        A.forEach(function (a, i) { a.classList.toggle('fx-on', 2 - i < n); });
        el.dataset.fxLevel = n;
        o.textContent = d + ' cm · ' + ['Voie libre', 'Attention', 'Approche', 'Stop'][n];
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Une trace de pneu qui traverse le titre et le révèle
  FX.register('tire-track', {
    entrance: true,
    setup: function (el) {
      el.innerHTML = '<span class="fx-tk-x">' + el.innerHTML + '</span>';
      var t = U.make('span', 'fx-tk', el);
      t.setAttribute('aria-hidden', 'true');
      U.ensurePositioned(el);
    }
  });

  // Un ordinateur de bord à écrans qu'on fait défiler
  FX.register('trip-computer', {
    setup: function (el) {
      var km = U.num(el, 'fxKm', 312), h = U.num(el, 'fxHours', 3.6), c = U.num(el, 'fxUse', 16.4), left = U.num(el, 'fxLeft', 184);
      var S = [['Parcouru', km + ' km'], ['Vitesse moyenne', Math.round(km / h) + ' km/h'], ['Consommation', String(c).replace('.', ',') + ' kWh/100'], ['Autonomie', left + ' km']], n = 0;
      el.innerHTML = '<div class="fx-tc"><small></small><b></b></div><button type="button">Écran suivant</button>';
      var s = el.querySelector('small'), b = el.querySelector('b'), box = el.querySelector('.fx-tc');
      box.setAttribute('aria-live', 'polite');
      el._fxNext = function () {
        n = (n + 1) % S.length;
        s.textContent = S[n][0]; b.textContent = S[n][1];
        box.classList.remove('fx-go'); void box.offsetWidth; box.classList.add('fx-go');
      };
      n = -1; el._fxNext();
      el.querySelector('button').addEventListener('click', el._fxNext);
    },
    trigger: function (el) { el._fxNext(); }
  });

  // Les bornes d'une station : libres, occupées ou en panne
  FX.register('charger-status', {
    setup: function (el) {
      var S = (el.dataset.fxData || 'f,o,f,o,x,o').split(','), box = U.make('div', 'fx-cs2', el), o = U.make('output', '', el), W = { f: 'Libre', o: 'Occupée', x: 'En panne' };
      o.setAttribute('aria-live', 'polite');
      S.forEach(function (s, i) { var c = U.make('i', '', box); c.textContent = i + 1; c.title = ''; });
      el._fxShow = function () {
        var free = 0;
        Array.prototype.forEach.call(box.children, function (c, i) { c.dataset.s = S[i]; c.setAttribute('aria-label', 'Borne ' + (i + 1) + ', ' + W[S[i]]); c.setAttribute('role', 'img'); if (S[i] === 'f') free++; });
        o.textContent = free + ' borne' + (free > 1 ? 's' : '') + ' libre' + (free > 1 ? 's' : '') + ' sur ' + S.length;
      };
      el._fxFlip = function () {
        var k = Math.floor(Math.random() * S.length);
        if (S[k] !== 'x') { S[k] = S[k] === 'f' ? 'o' : 'f'; el._fxShow(); }
      };
      el._fxShow();
      if (el.dataset.fxLive !== 'false' && !U.reduced) setInterval(el._fxFlip, U.num(el, 'fxEvery', 3500));
    },
    trigger: function (el) { el._fxFlip(); }
  });

  // Rabattre les sièges pour voir le coffre s'agrandir
  FX.register('seat-fold', {
    setup: function (el) {
      var B = U.num(el, 'fxBoot', 480), S = (el.dataset.fxItems || 'Gauche:240|Centre:120|Droit:240').split('|').map(function (r) { return r.split(':'); });
      var box = U.make('div', 'fx-sf2', el), o = U.make('output', '', el);
      o.setAttribute('aria-live', 'polite');
      U.make('i', 'fx-sf2-c', box).setAttribute('aria-hidden', 'true');
      S.forEach(function (s) {
        var b = U.make('button', '', box);
        b.type = 'button'; b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-label', 'Rabattre le siège ' + s[0]);
        U.make('span', '', b);
        b.addEventListener('click', function () { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true'); go(); });
      });
      var go = function () {
        var extra = 0;
        box.querySelectorAll('button').forEach(function (b, i) { if (b.getAttribute('aria-pressed') === 'true') extra += +S[i][1]; });
        el.style.setProperty('--fx-q', extra / 600);
        o.innerHTML = '<b>' + (B + extra).toLocaleString('fr-FR') + ' L</b> de coffre';
      };
      go();
    }
  });

  // Une télécommande : la voiture répond en faisant clignoter ses feux
  FX.register('key-fob', {
    setup: function (el) {
      el.innerHTML = '<div class="fx-kf-c" aria-hidden="true"><i></i><i></i></div><div class="fx-kf"><button type="button" data-a="lock">Verrouiller</button><button type="button" data-a="open">Ouvrir</button></div><output aria-live="polite">Voiture verrouillée</output>';
      var c = el.firstChild, o = el.querySelector('output');
      el.classList.add('fx-locked');
      el.addEventListener('click', function (e) {
        var b = e.target.closest('button');
        if (!b) return;
        var lock = b.dataset.a === 'lock';
        el.classList.toggle('fx-locked', lock);
        c.classList.remove('fx-one', 'fx-two'); void c.offsetWidth;
        c.classList.add(lock ? 'fx-one' : 'fx-two');
        o.textContent = lock ? 'Voiture verrouillée' : 'Voiture ouverte';
      });
    }
  });

  // Une note de sécurité en étoiles, avec le détail par catégorie
  FX.register('safety-stars', {
    entrance: true,
    setup: function (el) {
      var n = U.num(el, 'fxStars', 4), R = (el.dataset.fxItems || 'Adultes:91|Enfants:85|Piétons:68|Assistance:77').split('|').map(function (r) { return r.split(':'); }), h = '';
      for (var i = 0; i < 5; i++) h += '<i class="' + (i < n ? 'fx-on' : '') + '" style="--fx-i:' + i + '">★</i>';
      el.innerHTML = '<div class="fx-ss2" role="img" aria-label="' + n + ' étoiles sur 5">' + h + '</div><ul>' + R.map(function (r, i) { return '<li style="--fx-q:' + r[1] / 100 + ';--fx-i:' + i + '"><span>' + r[0] + '</span><em></em><b>' + r[1] + ' %</b></li>'; }).join('') + '</ul><small>Résultats fictifs</small>';
    }
  });

  // Une voiture passe dans l'angle mort, et le témoin s'allume
  FX.register('blind-spot', {
    setup: function (el) {
      el.innerHTML = '<div class="fx-bs" aria-hidden="true"><i class="fx-bs-z"></i><i class="fx-bs-m"></i><i class="fx-bs-o"></i><u></u></div><output aria-live="off"></output>';
      el._fxO = el.querySelector('.fx-bs-o'); el._fxOut = el.querySelector('output');
      el._fxOut.textContent = 'Voie libre';
    },
    tick: function (el, dt, t) {
      var q = ((t / U.num(el, 'fxPace', 5)) % 1), y = 130 - q * 180;
      if (U.reduced) y = 40;
      el._fxO.style.transform = 'translateY(' + y + 'px)';
      var near = y > 10 && y < 80;
      if (near !== el._fxNear) { el._fxNear = near; el.classList.toggle('fx-alert', near); el._fxOut.textContent = near ? 'Véhicule dans l\'angle mort' : 'Voie libre'; }
    }
  });
})(window.FX);

/* Pack 30 — Mobilité */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Une ligne de métro : on touche un arrêt pour lire le temps de trajet
  FX.register('metro-line', {
    setup: function (el) {
      var S = (el.dataset.fxItems || 'Gare:0|Marché:3|Université:2|Parc:4|Stade:3').split('|').map(function (r) { var p = r.split(':'); return { n: p[0], m: +p[1] }; }), box = U.make('ol', 'fx-ml', el), o = U.make('output', '', el);
      o.setAttribute('aria-live', 'polite');
      var from = U.num(el, 'fxFrom', 0);
      var pick = function (k) {
        var a = Math.min(from, k), b = Math.max(from, k), t = 0;
        for (var i = a + 1; i <= b; i++) t += S[i].m;
        Array.prototype.forEach.call(box.children, function (li, i) { li.classList.toggle('fx-on', i >= a && i <= b); li.classList.toggle('fx-to', i === k); });
        o.innerHTML = k === from ? 'Vous êtes à <b>' + S[from].n + '</b>' : S[from].n + ' → <b>' + S[k].n + '</b>, ' + t + ' min, ' + (b - a) + ' arrêt' + (b - a > 1 ? 's' : '');
      };
      S.forEach(function (s, i) {
        var li = U.make('li', '', box), b = U.make('button', '', li);
        b.type = 'button'; b.innerHTML = '<i></i><span>' + s.n + '</span>';
        b.addEventListener('click', function () { pick(i); });
      });
      pick(from);
    }
  });

  // Les prochains passages, avec leurs minutes qui descendent
  FX.register('next-departures', {
    setup: function (el) {
      var T = (el.dataset.fxItems || '12:Gare centrale:2|4:Stade:5|12:Gare centrale:9|7:Hôpital:14').split('|').map(function (r) { var p = r.split(':'); return { l: p[0], d: p[1], at: Date.now() + p[2] * 60000 }; }), ul = U.make('ul', '', el);
      var draw = function () {
        ul.innerHTML = '';
        T = T.filter(function (x) { return x.at > Date.now(); });
        T.slice(0, 4).forEach(function (x) {
          var m = Math.max(0, Math.round((x.at - Date.now()) / 60000)), li = U.make('li', m < 2 ? 'fx-now' : '', ul);
          li.innerHTML = '<b>' + x.l + '</b><span>' + x.d + '</span><em>' + (m < 1 ? 'À l\'approche' : m + ' min') + '</em>';
        });
        if (!T.length) ul.innerHTML = '<li>Plus de passage annoncé</li>';
      };
      draw();
      setInterval(draw, 15000);
    }
  });

  // Vélo, bus ou voiture : qui gagne selon la distance et le critère
  FX.register('mode-compare', {
    setup: function (el) {
      var M = [['À pied', 5, 0, 0], ['Vélo', 16, 0, 0], ['Bus', 20, 1.7, 8], ['Voiture', 28, .25, 6]];
      el.innerHTML = '<label>Distance <b></b><input type="range" min="1" max="20" step="1"></label><ul></ul>';
      var r = el.querySelector('input'), ul = el.querySelector('ul'), lab = el.querySelector('b'), L = M.map(function (m) { var li = U.make('li', '', ul); li.innerHTML = '<span>' + m[0] + '</span><i></i><em></em>'; return li; });
      r.value = U.num(el, 'fxKm', 5);
      var go = function () {
        var d = +r.value, res = M.map(function (m, i) { return { i: i, t: Math.round(d / m[1] * 60 + m[3]), c: i === 2 ? m[2] : d * m[2] }; }), best = Math.min.apply(null, res.map(function (x) { return x.t; })), max = Math.max.apply(null, res.map(function (x) { return x.t; }));
        lab.textContent = d + ' km';
        res.forEach(function (x) {
          var li = L[x.i];
          li.style.setProperty('--fx-q', x.t / max);
          li.classList.toggle('fx-best', x.t === best);
          li.querySelector('em').textContent = (x.t >= 60 ? Math.floor(x.t / 60) + ' h ' + String(x.t % 60).padStart(2, '0') : x.t + ' min') + (x.c ? ' · ' + x.c.toFixed(2).replace('.', ',') + ' €' : '');
        });
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Les émissions d'un trajet selon le moyen de transport
  FX.register('co2-per-mode', {
    setup: function (el) {
      var F = (el.dataset.fxItems || 'Train:3|Vélo:0|Bus:100|Voiture seule:190|Avion:230').split('|').map(function (r) { var p = r.split(':'); return [p[0], +p[1]]; });
      el.innerHTML = '<label>Trajet <b></b><input type="range" min="10" max="1000" step="10"></label><ul></ul><small>Ordres de grandeur en g de CO₂ par km : à remplacer par une source officielle.</small>';
      var r = el.querySelector('input'), ul = el.querySelector('ul'), lab = el.querySelector('label b');
      var L = F.map(function (f) { var li = U.make('li', '', ul); li.innerHTML = '<span>' + f[0] + '</span><i></i><b></b>'; return li; });
      r.value = U.num(el, 'fxKm', 500);
      var top = Math.max.apply(null, F.map(function (f) { return f[1]; }));
      var go = function () {
        var d = +r.value;
        lab.textContent = d + ' km';
        F.forEach(function (f, i) {
          var kg = f[1] * d / 1000;
          L[i].style.setProperty('--fx-q', f[1] / top * (d / 1000 + .15));
          L[i].querySelector('b').textContent = (kg < 10 ? kg.toFixed(1).replace('.', ',') : Math.round(kg)) + ' kg';
        });
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Des zones en anneaux : le tarif change selon celles qu'on traverse
  FX.register('zone-fare', {
    setup: function (el) {
      var P = (el.dataset.fxPrices || '1.9,2.8,3.9,5.1,6.4').split(',').map(Number), n = P.length, box = U.make('div', 'fx-zf', el), o = U.make('output', '', el), sel = [];
      o.setAttribute('aria-live', 'polite');
      for (var i = n; i >= 1; i--) (function (i) {
        var b = U.make('button', '', box);
        b.type = 'button'; b.textContent = i; b.setAttribute('aria-label', 'Zone ' + i); b.dataset.z = i; b.style.setProperty('--fx-z', i / n);
        b.addEventListener('click', function () { sel.push(i); if (sel.length > 2) sel = [i]; show(); });
      })(i);
      var show = function () {
        if (!sel.length) { o.textContent = 'Touchez deux zones'; return; }
        var a = Math.min.apply(null, sel), c = Math.max.apply(null, sel), k = c - a;
        box.querySelectorAll('button').forEach(function (x) { var z = +x.dataset.z; x.setAttribute('aria-pressed', z >= a && z <= c); });
        o.innerHTML = sel.length === 1 ? 'Zone ' + a : 'Zones ' + a + ' à ' + c;
        o.innerHTML += ' : <b>' + P[k].toFixed(2).replace('.', ',') + ' €</b>';
      };
      show();
    }
  });

  // Un billet numérique avec sa durée de validité qui s'écoule
  FX.register('transit-ticket', {
    setup: function (el) {
      var min = U.num(el, 'fxMinutes', 90), end = 0;
      el.innerHTML = '<div class="fx-tk2"><strong>' + (el.dataset.fxTitle || 'Ticket 1 zone') + '</strong><span class="fx-tk2-t">Non activé</span><i aria-hidden="true"></i></div><button type="button">Activer</button>';
      var b = el.querySelector('button'), t = el.querySelector('.fx-tk2-t'), bar = el.querySelector('.fx-tk2 i');
      var show = function () {
        if (!end) return;
        var left = end - Date.now();
        if (left <= 0) { el.classList.remove('fx-live'); el.classList.add('fx-off'); t.textContent = 'Billet expiré'; bar.style.width = 0; end = 0; return; }
        t.textContent = 'Valable encore ' + Math.ceil(left / 60000) + ' min';
        bar.style.width = left / (min * 60000) * 100 + '%';
      };
      b.addEventListener('click', function () { end = Date.now() + min * 60000; el.classList.add('fx-live'); el.classList.remove('fx-off'); b.disabled = true; b.textContent = 'Activé'; show(); });
      setInterval(show, 20000);
    },
    trigger: function (el) { el.querySelector('button').click(); }
  });

  // Un trajet en cours : le temps et le montant avancent ensemble
  FX.register('ride-timer', {
    setup: function (el) {
      var unlock = U.num(el, 'fxUnlock', 1), rate = U.num(el, 'fxRate', .2), start = 0, stop = 0, iv;
      el.innerHTML = '<div class="fx-rdt"><b class="t">0:00</b><b class="p"></b></div><button type="button">Démarrer</button>';
      var t = el.querySelector('.t'), p = el.querySelector('.p'), b = el.querySelector('button');
      var show = function () {
        var s = Math.floor(((stop || Date.now()) - start) / 1000) * (start ? 1 : 0), m = Math.ceil(s / 60);
        t.textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
        p.textContent = (start ? (unlock + m * rate) : 0).toFixed(2).replace('.', ',') + ' €';
      };
      b.addEventListener('click', function () {
        if (!start || stop) { start = Date.now(); stop = 0; iv = setInterval(show, 1000); b.textContent = 'Terminer'; el.classList.add('fx-go'); }
        else { stop = Date.now(); clearInterval(iv); b.textContent = 'Nouveau trajet'; el.classList.remove('fx-go'); }
        show();
      });
      show();
    }
  });

  // Combien coûte un trajet quand on le partage en voiture
  FX.register('carpool-split', {
    setup: function (el) {
      var cost = U.num(el, 'fxCost', 48), seats = U.num(el, 'fxSeats', 4), box = U.make('div', 'fx-cs3', el), o = U.make('output', '', el), n = 1;
      o.setAttribute('aria-live', 'polite');
      box.setAttribute('role', 'group'); box.setAttribute('aria-label', 'Nombre de personnes');
      for (var i = 1; i <= seats; i++) (function (i) {
        var b = U.make('button', '', box);
        b.type = 'button'; b.setAttribute('aria-label', i + ' personne' + (i > 1 ? 's' : ''));
        U.make('i', '', b);
        b.addEventListener('click', function () { n = i; show(); });
      })(i);
      var show = function () {
        box.querySelectorAll('button').forEach(function (b, i) { b.setAttribute('aria-pressed', i < n); b.classList.toggle('fx-pop', i === n - 1); });
        o.innerHTML = '<b>' + (cost / n).toFixed(2).replace('.', ',') + ' €</b> par personne' + (n > 1 ? ', soit ' + Math.round(cost - cost / n) + ' € de moins' : '');
      };
      show();
    }
  });

  // Un itinéraire en bande : le rouge explique le retard
  FX.register('traffic-strip', {
    entrance: true,
    setup: function (el) {
      var S = (el.dataset.fxItems || '8:60:0|3:15:2|6:50:0|2:10:2|5:30:1').split('|').map(function (r) { return r.split(':').map(Number); }), km = 0, time = 0, free = 0, h = '';
      S.forEach(function (s) { km += s[0]; time += s[0] / s[1] * 60; free += s[0] / 60 * 60; });
      S.forEach(function (s, i) { h += '<i class="l' + s[2] + '" style="flex:' + s[0] + ' 1 0;--fx-i:' + i + '"></i>'; });
      el.innerHTML = '<div class="fx-ts" aria-hidden="true">' + h + '<u></u></div><p><b>' + Math.round(time) + ' min</b> pour ' + km + ' km, soit ' + Math.max(0, Math.round(time - free)) + ' min de retard</p>';
    }
  });

  // Le profil d'un parcours : suivre la pente du doigt
  FX.register('elevation-profile', {
    setup: function (el) {
      var d = (el.dataset.fxData || '120,160,240,310,290,380,520,480,420,360,300,280').split(',').map(Number), km = U.num(el, 'fxKm', 22), lo = Math.min.apply(null, d) - 30, hi = Math.max.apply(null, d) + 20, up = 0;
      d.forEach(function (v, i) { if (i && v > d[i - 1]) up += v - d[i - 1]; });
      var X = function (i) { return i / (d.length - 1) * 200; }, Y = function (v) { return 80 - (v - lo) / (hi - lo) * 74; };
      var p = d.map(function (v, i) { return (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1); }).join('');
      el.innerHTML = '<svg viewBox="0 0 200 80" preserveAspectRatio="none" aria-hidden="true"><path class="fx-ep-a" d="' + p + 'L200 80L0 80Z"/><path class="fx-ep-l" d="' + p + '"/></svg><i aria-hidden="true"></i><input type="range" min="0" max="' + (d.length - 1) + '" value="3" aria-label="Position sur le parcours"><output aria-live="polite"></output>';
      var r = el.querySelector('input'), o = el.querySelector('output'), seg = km / (d.length - 1);
      var go = function () {
        var k = +r.value, n = Math.min(k + 1, d.length - 1), g = n === k ? 0 : (d[n] - d[k]) / (seg * 1000) * 100;
        el.style.setProperty('--fx-x', k / (d.length - 1)); el.style.setProperty('--fx-y', Y(d[k]) / 80);
        o.innerHTML = '<b>' + d[k] + ' m</b> au km ' + Math.round(k * seg) + ', pente ' + (g > 0 ? '+' : '') + g.toFixed(1).replace('.', ',') + ' %. D+ total ' + up + ' m';
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Un plan d'itinéraire qui évite les escaliers à la demande
  FX.register('step-free-route', {
    setup: function (el) {
      var A = { d: 'M12 74H60V24H126', t: '8 min, 2 escaliers' }, B = { d: 'M12 74H96V50H126V24', t: '11 min, ascenseur et rampe' };
      el.innerHTML = '<svg viewBox="0 0 140 90" aria-hidden="true"><path class="fx-sfr-w" d="M58 66H70V24H58ZM92 50H104V58H92Z"/><path class="fx-sfr-p" pathLength="1"/><circle cx="12" cy="74" r="4"/><circle cx="126" cy="24" r="4"/></svg><label><input type="checkbox" role="switch"> Sans marche</label><output aria-live="polite"></output>';
      var c = el.querySelector('input'), p = el.querySelector('.fx-sfr-p'), o = el.querySelector('output');
      var go = function () {
        var r = c.checked ? B : A;
        p.setAttribute('d', r.d);
        p.style.animation = 'none'; void p.getBoundingClientRect(); p.style.animation = '';
        el.classList.toggle('fx-on', c.checked);
        o.textContent = r.t;
      };
      c.addEventListener('change', go);
      go();
    },
    trigger: function (el) { el.querySelector('input').click(); }
  });

  // Un train dont chaque voiture montre son affluence
  FX.register('train-crowding', {
    entrance: true,
    setup: function (el) {
      var C = (el.dataset.fxData || '90,70,35,55,20,60').split(',').map(Number), min = Math.min.apply(null, C), k = C.indexOf(min), box = U.make('div', 'fx-tc2', el), o = U.make('p', '', el), W = function (v) { return v > 75 ? 'pleine' : v > 45 ? 'chargée' : 'calme'; };
      box.setAttribute('role', 'img');
      box.setAttribute('aria-label', C.map(function (v, i) { return 'voiture ' + (i + 1) + ' ' + W(v); }).join(', '));
      C.forEach(function (v, i) {
        var d = U.make('div', i === k ? 'fx-best' : '', box), f = Math.round(v / 100 * 6);
        for (var n = 0; n < f; n++) U.make('i', '', d).style.setProperty('--fx-i', i * 2 + n);
        d.dataset.n = i + 1;
      });
      o.innerHTML = 'Plus de place en <b>voiture ' + (k + 1) + '</b>';
    }
  });

  // Où se placer sur le quai selon la sortie voulue
  FX.register('platform-guide', {
    setup: function (el) {
      var E = (el.dataset.fxItems || 'Hôpital:1|Centre-ville:4|Correspondance B:6').split('|').map(function (r) { return r.split(':'); }), N = U.num(el, 'fxCars', 6);
      el.innerHTML = '<select aria-label="Votre sortie">' + E.map(function (e, i) { return '<option value="' + i + '">' + e[0] + '</option>'; }).join('') + '</select><div class="fx-pg" aria-hidden="true"></div><output aria-live="polite"></output>';
      var s = el.querySelector('select'), box = el.querySelector('.fx-pg'), o = el.querySelector('output');
      for (var i = 0; i < N; i++) U.make('i', '', box).textContent = i + 1;
      var go = function () {
        var c = +E[s.value][1];
        Array.prototype.forEach.call(box.children, function (x, i) { x.classList.toggle('fx-on', i + 1 === c); });
        o.innerHTML = 'Montez en <b>voiture ' + c + '</b> pour sortir au plus près';
      };
      s.addEventListener('change', go);
      go();
    }
  });

  // À partir de combien de trajets l'abonnement est-il rentable ?
  FX.register('pass-or-ticket', {
    setup: function (el) {
      var T = U.num(el, 'fxTicket', 2.1), P = U.num(el, 'fxPass', 42);
      el.innerHTML = '<label>Trajets par mois <b></b><input type="range" min="0" max="60"></label><div class="fx-pt" aria-hidden="true"><em></em><i></i></div><output aria-live="polite"></output>';
      var r = el.querySelector('input'), o = el.querySelector('output'), seuil = Math.ceil(P / T);
      r.value = U.num(el, 'fxTrips', 16);
      el.style.setProperty('--fx-s', seuil / 60);
      var go = function () {
        var n = +r.value, tick = n * T, best = tick > P;
        el.querySelector('label b').textContent = n;
        el.style.setProperty('--fx-q', n / 60);
        el.classList.toggle('fx-pass', best);
        o.innerHTML = '<b>' + (best ? 'L\'abonnement' : 'Les tickets') + '</b> : ' + Math.round(Math.min(tick, P)) + ' € ce mois-ci. Bascule à ' + seuil + ' trajets.';
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Un plan de réseau où l'on isole une ou plusieurs lignes
  FX.register('network-lines', {
    setup: function (el) {
      var L = [['A', '#e4322b', 'M8 60H60L100 20H152'], ['B', '#1d6fe0', 'M8 20H50L100 70H152'], ['C', '#2eaf63', 'M80 4V86']];
      el.innerHTML = '<svg viewBox="0 0 160 90" aria-hidden="true">' + L.map(function (l, i) { return '<path data-i="' + i + '" pathLength="1" d="' + l[2] + '" stroke="' + l[1] + '"/>'; }).join('') + '<circle cx="80" cy="40" r="4"/></svg><div class="fx-nl"></div>';
      var f = el.querySelector('.fx-nl'), P = el.querySelectorAll('path'), on = [true, true, true];
      L.forEach(function (l, i) {
        var b = U.make('button', '', f);
        b.type = 'button'; b.textContent = l[0]; b.style.setProperty('--fx-c', l[1]); b.setAttribute('aria-label', 'Ligne ' + l[0]); b.setAttribute('aria-pressed', 'true');
        b.addEventListener('click', function () {
          on[i] = !on[i];
          b.setAttribute('aria-pressed', on[i]);
          P[i].classList.toggle('fx-off', !on[i]);
        });
      });
    }
  });

  // Une roue de vélo qui tourne en attendant
  FX.register('wheel-loader', {
    setup: function (el) {
      el.setAttribute('role', 'status');
      el.setAttribute('aria-label', el.dataset.fxLabel || 'Chargement');
      var s = '<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="44"/><g class="fx-wl2">';
      for (var i = 0; i < 16; i++) { var a = i / 16 * 6.283; s += '<line x1="' + (50 + 5 * Math.cos(a)).toFixed(1) + '" y1="' + (50 + 5 * Math.sin(a)).toFixed(1) + '" x2="' + (50 + 42 * Math.cos(a + .5)).toFixed(1) + '" y2="' + (50 + 42 * Math.sin(a + .5)).toFixed(1) + '"/>'; }
      el.innerHTML = s + '<circle class="fx-wl2-v" cx="50" cy="8" r="3"/></g><circle class="fx-wl2-h" cx="50" cy="50" r="6"/></svg>';
    }
  });

  // Un feu tricolore qui donne l'état de quelque chose
  FX.register('traffic-light', {
    setup: function (el) {
      var W = (el.dataset.fxItems || 'Attendez|Préparez-vous|C\'est parti').split('|');
      el.innerHTML = '<div class="fx-tl" aria-hidden="true"><i></i><i></i><i></i></div><output aria-live="polite"></output>';
      var o = el.querySelector('output'), L = el.querySelectorAll('i');
      el._fxSet = function (n) { L.forEach(function (x, i) { x.classList.toggle('fx-on', i === n); }); o.textContent = W[n]; el._fxN = n; };
      el._fxSet(U.num(el, 'fxState', 0));
      new MutationObserver(function () { el._fxSet(U.num(el, 'fxState', 0)); }).observe(el, { attributes: true, attributeFilter: ['data-fx-state'] });
    },
    trigger: function (el) { el._fxSet((el._fxN + 1) % 3); }
  });

  // Un bus qui approche, arrêt après arrêt
  FX.register('live-bus', {
    setup: function (el) {
      var S = (el.dataset.fxItems || 'Mairie|Marché|Lycée|Vous|Stade').split('|'), me = S.indexOf('Vous'), step = U.num(el, 'fxStep', 2), k = 0, ol = U.make('ol', '', el), o = U.make('output', '', el);
      o.setAttribute('aria-live', 'polite');
      S.forEach(function (s, i) { U.make('li', i === me ? 'fx-me' : '', ol).innerHTML = '<i></i><span>' + s + '</span>'; });
      el._fxGo = function () {
        Array.prototype.forEach.call(ol.children, function (li, i) { li.classList.toggle('fx-bus', i === k); li.classList.toggle('fx-past', i < k); });
        var left = me - k;
        o.textContent = left > 0 ? 'Arrive dans ' + left * step + ' min' : left === 0 ? 'Le bus est là' : 'Bus passé';
        k = k >= S.length - 1 ? 0 : k + 1;
      };
      el._fxGo();
      setInterval(el._fxGo, U.reduced ? 60000 : U.num(el, 'fxEvery', 2800));
    },
    trigger: function (el) { el._fxGo(); }
  });

  // Des pas qui avancent vers le contenu
  FX.register('footsteps', {
    entrance: true,
    setup: function (el) {
      var n = U.num(el, 'fxSteps', 10), box = U.make('div', 'fx-fs', el);
      box.setAttribute('aria-hidden', 'true');
      for (var i = 0; i < n; i++) {
        var f = U.make('i', i % 2 ? 'r' : 'l', box);
        f.style.left = (i + .5) / n * 100 + '%';
        f.style.setProperty('--fx-i', i);
      }
      if (el.dataset.fxText) U.make('strong', '', el).textContent = el.dataset.fxText;
    }
  });

  // Un bateau qui traverse selon l'heure réelle du trajet
  FX.register('ferry-crossing', {
    setup: function (el) {
      var dur = U.num(el, 'fxMinutes', 40), start = Date.now() - U.num(el, 'fxPast', 12) * 60000;
      el.innerHTML = '<div class="fx-fc" aria-hidden="true"><i class="fx-fc-w"></i><i class="fx-fc-b"></i></div><p></p>';
      var p = el.querySelector('p');
      el._fxShow = function () {
        var q = U.clamp((Date.now() - start) / (dur * 60000), 0, 1);
        el.style.setProperty('--fx-q', q);
        p.textContent = q >= 1 ? 'Arrivé au port' : 'Arrivée dans ' + Math.ceil((1 - q) * dur) + ' min';
      };
      el._fxShow();
      setInterval(el._fxShow, 30000);
    }
  });

  // Deux pignons liés : leur vitesse dépend du nombre de dents
  FX.register('gear-cogs', {
    setup: function (el) {
      var A = U.num(el, 'fxFront', 40);
      var cog = function (t, r, c) { var s = ''; for (var i = 0; i < t; i++) { var a = i / t * 360; s += '<rect x="-2" y="' + (-r - 3) + '" width="4" height="6" transform="rotate(' + a + ')"/>'; } return '<g class="' + c + '"><circle r="' + r + '"/>' + s + '<circle r="3" class="fx-gc-h"/></g>'; };
      el.innerHTML = '<svg viewBox="0 0 170 90" aria-hidden="true"><g transform="translate(58 45)"><g class="fx-gc-a"></g></g><g transform="translate(130 45)"><g class="fx-gc-b"></g></g></svg><label>Pignon arrière <b></b><input type="range" min="11" max="34"></label><output aria-live="polite"></output>';
      var r = el.querySelector('input'), oa = el.querySelector('.fx-gc-a'), ob = el.querySelector('.fx-gc-b'), o = el.querySelector('output');
      oa.innerHTML = cog(A, 34, 'x');
      r.value = U.num(el, 'fxRear', 18);
      var B = +r.value;
      var go = function () {
        B = +r.value;
        ob.innerHTML = cog(B, 34 * B / A, 'y');
        el.querySelector('label b').textContent = B + ' dents';
        o.innerHTML = 'Rapport <b>' + (A / B).toFixed(2).replace('.', ',') + '</b> : un tour de pédale, ' + (A / B * 2.1).toFixed(1).replace('.', ',') + ' m';
      };
      r.addEventListener('input', go);
      go();
      el._fxA = 0; el._fxGear = function () { return A / B; };
    },
    tick: function (el, dt) {
      if (U.reduced) return;
      el._fxA += dt * 60;
      el.style.setProperty('--fx-a', el._fxA + 'deg');
      el.style.setProperty('--fx-b', (-el._fxA * el._fxGear()) + 'deg');
    }
  });

  // Jusqu'où on peut aller avec la batterie qui reste
  FX.register('battery-radius', {
    setup: function (el) {
      var max = U.num(el, 'fxRange', 40), back = el.dataset.fxBack !== 'false';
      el.innerHTML = '<div class="fx-br" aria-hidden="true"><i></i><u></u></div><label>Batterie <input type="range" min="5" max="100" step="5"></label><output aria-live="polite"></output>';
      var r = el.querySelector('input'), o = el.querySelector('output');
      r.value = U.num(el, 'fxValue', 60);
      var go = function () {
        var q = r.value / 100, km = max * q, reach = back ? km / 2 : km;
        el.style.setProperty('--fx-q', q);
        o.innerHTML = '<b>' + r.value + ' %</b> · ' + Math.round(km) + ' km au total, soit ' + Math.round(reach) + ' km avec retour';
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Une alerte de perturbation, selon sa gravité
  FX.register('disruption-banner', {
    setup: function (el) {
      var lvl = el.dataset.fxLevel || 'warn', key = el.dataset.fxKey, text = el.textContent.trim(), N = { info: 'Information', warn: 'Perturbation', stop: 'Trafic interrompu' };
      el.textContent = '';
      el.setAttribute('role', lvl === 'stop' ? 'alert' : 'status');
      el.innerHTML = '<i aria-hidden="true"></i><div><b>' + N[lvl] + '</b><span>' + text + '</span></div><button type="button" aria-label="Fermer">×</button>';
      if (key) try { if (localStorage.getItem(key)) el.hidden = true; } catch (err) {}
      el.querySelector('button').addEventListener('click', function () {
        el.classList.add('fx-out');
        setTimeout(function () { el.hidden = true; }, U.reduced ? 0 : 350);
        if (key) try { localStorage.setItem(key, '1'); } catch (err) {}
      });
    }
  });

  // Une grille horaire dont le prochain passage ressort
  FX.register('timetable-grid', {
    setup: function (el) {
      var R = (el.dataset.fxItems || '6:15,45|7:05,20,35,50|8:05,20,35,50|9:15,45|12:15,45|17:05,20,35,50|18:05,35|21:15').split('|').map(function (r) { var p = r.split(':'); return [+p[0], p[1].split(',')]; }), d = new Date(), now = d.getHours() * 60 + d.getMinutes(), next = false, h = '';
      R.forEach(function (r) {
        h += '<tr><th scope="row">' + r[0] + ' h</th><td>';
        r[1].forEach(function (m) {
          var t = r[0] * 60 + +m, isN = !next && t >= now;
          if (isN) next = [r[0], m];
          h += '<span class="' + (t < now ? 'fx-gone' : isN ? 'fx-next' : '') + '">' + m + '</span>';
        });
        h += '</td></tr>';
      });
      el.innerHTML = '<table>' + h + '</table><p></p>';
      el.querySelector('p').textContent = next ? 'Prochain : ' + next[0] + ' h ' + next[1] : 'Plus de passage aujourd\'hui';
    }
  });

  // Aura-t-on le temps de changer de train ?
  FX.register('transfer-check', {
    setup: function (el) {
      var walk = U.num(el, 'fxWalk', 7);
      el.innerHTML = '<label>Correspondance <b></b><input type="range" min="2" max="40"></label><div class="fx-tr2" aria-hidden="true"><i></i><em></em></div><output aria-live="polite"></output>';
      var r = el.querySelector('input'), o = el.querySelector('output');
      r.value = U.num(el, 'fxMinutes', 10);
      el.style.setProperty('--fx-w2', walk / 40);
      var go = function () {
        var m = +r.value, gap = m - walk, l = gap < 1 ? 'bad' : gap < 5 ? 'mid' : 'ok';
        el.dataset.fxLevel = l;
        el.querySelector('label b').textContent = m + ' min';
        el.style.setProperty('--fx-q', m / 40);
        o.textContent = l === 'bad' ? 'Risqué : marche de ' + walk + ' min' : l === 'mid' ? 'Serré, mais faisable : ' + gap + ' min de marge' : 'Large : ' + gap + ' min de marge';
      };
      r.addEventListener('input', go);
      go();
    }
  });
})(window.FX);

/* Pack 31 — Logistique */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Un colis qui avance sur son trajet, avec un camion sur la ligne
  FX.register('parcel-journey', {
    entrance: true,
    setup: function (el) {
      var S = (el.dataset.fxItems || 'Préparé:lun. 9 h|Expédié:lun. 18 h|En transit:mar. 7 h|En livraison:—|Livré:—').split('|').map(function (r) { var k = r.indexOf(':'); return [r.slice(0, k), r.slice(k + 1)]; }), cur = U.num(el, 'fxCurrent', 2), rail = U.make('div', 'fx-pj', el), o = U.make('p', '', el);
      rail.setAttribute('aria-hidden', 'true');
      S.forEach(function (s, i) { U.make('i', i <= cur ? 'fx-done' : '', rail).style.left = i / (S.length - 1) * 100 + '%'; });
      el.style.setProperty('--fx-q', cur / (S.length - 1));
      U.make('u', '', rail);
      o.innerHTML = '<b>' + S[cur][0] + '</b> · ' + S[cur][1] + '<br>Étape ' + (cur + 1) + ' sur ' + S.length;
    }
  });

  // Le créneau de livraison sur la journée, et l'heure qu'il est
  FX.register('delivery-window', {
    setup: function (el) {
      var a = U.num(el, 'fxFrom', 14), b = U.num(el, 'fxTo', 16), s = U.num(el, 'fxStart', 7), e = U.num(el, 'fxEnd', 21), W = e - s;
      el.innerHTML = '<div class="fx-dw" aria-hidden="true"><em style="left:' + (a - s) / W * 100 + '%;width:' + (b - a) / W * 100 + '%"></em><i></i></div><div class="fx-dw-h" aria-hidden="true"><span>' + s + ' h</span><span>' + e + ' h</span></div><output aria-live="polite"></output>';
      var o = el.querySelector('output'), bar = el.querySelector('.fx-dw i');
      var go = function () {
        var d = new Date(), h = d.getHours() + d.getMinutes() / 60;
        bar.style.left = U.clamp((h - s) / W, 0, 1) * 100 + '%';
        el.classList.toggle('fx-now', h >= a && h < b);
        o.innerHTML = h < a ? 'Livraison entre <b>' + a + ' h et ' + b + ' h</b>, dans ' + Math.ceil(a - h) + ' h' : h < b ? '<b>Votre livreur arrive</b>, avant ' + b + ' h' : 'Créneau passé : suivez votre colis';
      };
      go();
      setInterval(go, 60000);
    }
  });

  // Trouver le carton le plus petit qui contient l'objet
  FX.register('box-finder', {
    setup: function (el) {
      var B = (el.dataset.fxItems || 'S:25,20,10|M:35,30,20|L:50,40,30|XL:70,50,40').split('|').map(function (r) { var p = r.split(':'); return { n: p[0], d: p[1].split(',').map(Number) }; });
      el.innerHTML = '<div class="fx-bf-i">' + ['Longueur', 'Largeur', 'Hauteur'].map(function (t, i) { return '<label>' + t + '<input type="number" min="1" max="200" value="' + [30, 22, 12][i] + '"></label>'; }).join('') + '</div><div class="fx-bf" aria-hidden="true"></div><output aria-live="polite"></output>';
      var I = el.querySelectorAll('input'), box = el.querySelector('.fx-bf'), o = el.querySelector('output');
      B.forEach(function (b, i) { var x = U.make('i', '', box); x.textContent = b.n; x.style.setProperty('--fx-s', .55 + i * .15); });
      var sort = function (a) { return a.slice().sort(function (x, y) { return y - x; }); };
      var go = function () {
        var d = sort(Array.prototype.map.call(I, function (i) { return +i.value || 0; })), fit = -1;
        B.some(function (b, i) { var s = sort(b.d); if (d.every(function (v, k) { return v <= s[k]; })) { fit = i; return true; } return false; });
        Array.prototype.forEach.call(box.children, function (x, i) { x.classList.toggle('fx-on', i === fit); });
        o.innerHTML = fit < 0 ? 'Trop grand pour nos cartons' : 'Carton <b>' + B[fit].n + '</b> : ' + B[fit].d.join(' × ') + ' cm';
      };
      el.addEventListener('input', go);
      go();
    }
  });

  // Le poids facturé : le plus grand du réel et du volumétrique
  FX.register('volumetric-weight', {
    setup: function (el) {
      var div = U.num(el, 'fxDivisor', 5000);
      el.innerHTML = '<label>Longueur, largeur, hauteur (cm)<span><input type="number" value="60"><input type="number" value="40"><input type="number" value="30"></span></label><label>Poids réel (kg)<input class="w" type="number" value="6" step=".5"></label><div class="fx-vw" aria-hidden="true"><div><i class="a"></i><small>Réel</small></div><div><i class="b"></i><small>Volume</small></div></div><output aria-live="polite"></output>';
      var D = el.querySelectorAll('span input'), W = el.querySelector('.w'), o = el.querySelector('output');
      var go = function () {
        var v = 1;
        D.forEach(function (i) { v *= +i.value || 0; });
        var vw = v / div, w = +W.value || 0, top = Math.max(w, vw, .1);
        el.style.setProperty('--fx-a', w / top); el.style.setProperty('--fx-b', vw / top);
        o.innerHTML = 'Facturé <b>' + Math.max(w, vw).toFixed(1).replace('.', ',') + ' kg</b>' + (vw > w ? ', à cause du volume' : ', au poids réel');
      };
      el.addEventListener('input', go);
      go();
    }
  });

  // Combien de cartons sur une palette, couche après couche
  FX.register('pallet-stack', {
    setup: function (el) {
      var L = 120, W = 80, H = 180, cols = 3;
      el.innerHTML = '<div class="fx-pl3" aria-hidden="true"></div><label>Hauteur d\'un carton <b></b><input type="range" min="15" max="60" step="5"></label><output aria-live="polite"></output>';
      var box = el.querySelector('.fx-pl3'), r = el.querySelector('input'), o = el.querySelector('output');
      r.value = U.num(el, 'fxHeight', 30);
      var go = function () {
        var h = +r.value, rows = Math.floor((H - 15) / h), per = cols * 2, tot = rows * per;
        box.innerHTML = '';
        for (var y = 0; y < rows; y++) {
          var row = U.make('div', '', box);
          row.style.height = 100 / Math.floor((H - 15) / 15) * h / 15 + '%';
          for (var x = 0; x < cols; x++) U.make('i', '', row).style.setProperty('--fx-i', y * 2 + x);
        }
        el.querySelector('label b').textContent = h + ' cm';
        o.innerHTML = '<b>' + tot + ' cartons</b> : ' + per + ' par couche, ' + rows + ' couches';
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Un conteneur vu de dessus, rempli par un calcul de rangées
  FX.register('container-fill', {
    entrance: true,
    setup: function (el) {
      var CW = U.num(el, 'fxLength', 590), CH = U.num(el, 'fxWidth', 235), I = (el.dataset.fxItems || '180x120|180x120|120x100|120x100|120x80|120x80|100x80|80x60|80x60|60x40').split('|').map(function (s) { var p = s.split('x'); return { w: +p[0], h: +p[1] }; }).sort(function (a, b) { return b.h - a.h || b.w - a.w; });
      var x = 0, y = 0, rowH = 0, used = 0, box = U.make('div', 'fx-cf', el), out = 0;
      box.setAttribute('aria-hidden', 'true');
      I.forEach(function (b, i) {
        if (x + b.w > CW) { x = 0; y += rowH; rowH = 0; }
        if (y + b.h > CH) { out++; return; }
        var d = U.make('i', '', box);
        d.style.cssText = 'left:' + x / CW * 100 + '%;top:' + y / CH * 100 + '%;width:' + b.w / CW * 100 + '%;height:' + b.h / CH * 100 + '%;--fx-i:' + i;
        x += b.w; rowH = Math.max(rowH, b.h); used += b.w * b.h;
      });
      var q = used / (CW * CH) * 100;
      U.make('p', '', el).innerHTML = '<b>' + Math.round(q) + ' %</b> de la surface' + (out ? ', ' + out + ' caisse' + (out > 1 ? 's' : '') + ' en attente' : ', tout tient');
    }
  });

  // Taper un emplacement et le voir s'allumer dans l'entrepôt
  FX.register('warehouse-slot', {
    setup: function (el) {
      var A = U.num(el, 'fxAisles', 4), B = U.num(el, 'fxBays', 8);
      el.innerHTML = '<input type="text" maxlength="4" value="' + (el.dataset.fxCode || 'B-5') + '" aria-label="Emplacement, par exemple B-5"><div class="fx-wh" aria-hidden="true"></div><output aria-live="polite"></output>';
      var i = el.querySelector('input'), g = el.querySelector('.fx-wh'), o = el.querySelector('output');
      g.style.setProperty('--fx-c', B);
      for (var a = 0; a < A; a++) for (var b = 0; b < B; b++) U.make('i', '', g);
      var go = function () {
        var m = i.value.toUpperCase().match(/^([A-Z])-?(\d+)$/), hit = -1;
        if (m) { var a2 = m[1].charCodeAt(0) - 65, b2 = +m[2] - 1; if (a2 >= 0 && a2 < A && b2 >= 0 && b2 < B) hit = a2 * B + b2; }
        Array.prototype.forEach.call(g.children, function (c, k) { c.classList.toggle('fx-on', k === hit); });
        o.textContent = hit >= 0 ? 'Allée ' + m[1] + ', travée ' + m[2] : 'Emplacement inconnu';
      };
      i.addEventListener('input', go);
      go();
    }
  });

  // Un code-barres généré qu'un laser vient lire
  FX.register('barcode-scan', {
    setup: function (el) {
      var c = el.dataset.fxCode || 'FICTIF-48210', h = 13, bars = '';
      for (var k = 0; k < c.length; k++) h = (h * 33 + c.charCodeAt(k)) >>> 0;
      for (var i = 0; i < 46; i++) { h = (h * 1664525 + 1013904223) >>> 0; bars += '<i style="flex:' + (1 + (h >> 13) % 3) + ' 1 0"></i>'; }
      el.innerHTML = '<div class="fx-bc2" role="img" aria-label="Code-barres ' + c + '">' + bars + '<u aria-hidden="true"></u></div><small>' + c + '</small><button type="button">Scanner</button><output aria-live="polite"></output>';
      el.querySelector('button').addEventListener('click', function () { FX.trigger(el); });
    },
    trigger: function (el) {
      var o = el.querySelector('output'), u = el.querySelector('u');
      el.classList.remove('fx-ok');
      o.textContent = 'Lecture…';
      u.classList.remove('fx-go'); void u.offsetWidth; u.classList.add('fx-go');
      setTimeout(function () { el.classList.add('fx-ok'); o.textContent = 'Lu : ' + (el.dataset.fxCode || 'FICTIF-48210'); }, U.reduced ? 0 : 950);
    }
  });

  // Une tournée en désordre qui se réorganise, avec les kilomètres gagnés
  FX.register('route-optimize', {
    setup: function (el) {
      var P = (el.dataset.fxData || '10,70|80,20|25,20|70,80|45,50|15,35|88,55|55,15').split('|').map(function (s) { var p = s.split(','); return [+p[0], +p[1]]; }), d = function (a, b) { return Math.hypot(a[0] - b[0], a[1] - b[1]); };
      var len = function (o) { var t = 0; for (var i = 1; i < o.length; i++) t += d(P[o[i - 1]], P[o[i]]); return t; };
      var a = P.map(function (_, i) { return i; }), b = [0], left = a.slice(1);
      while (left.length) { var last = P[b[b.length - 1]], best = 0; left.forEach(function (k, i) { if (d(P[k], last) < d(P[left[best]], last)) best = i; }); b.push(left.splice(best, 1)[0]); }
      var path = function (o) { return o.map(function (k, i) { return (i ? 'L' : 'M') + P[k][0] + ' ' + P[k][1]; }).join(''); };
      el.innerHTML = '<svg viewBox="0 0 100 100" aria-hidden="true"><path class="fx-ro-l"/>' + P.map(function (p, i) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + (i ? 2.6 : 4) + '"/>'; }).join('') + '</svg><button type="button">Optimiser</button><output aria-live="polite"></output>';
      var L = el.querySelector('path'), o = el.querySelector('output'), btn = el.querySelector('button'), on = false, u = U.num(el, 'fxScale', .6);
      el._fxSet = function (v) {
        on = v;
        L.setAttribute('d', path(on ? b : a));
        L.style.stroke = on ? 'var(--fx-up, #2eaf63)' : '';
        L.setAttribute('pathLength', 1);
        L.classList.remove('fx-go'); void L.getBoundingClientRect(); L.classList.add('fx-go');
        btn.textContent = on ? 'Revenir à l\'ordre initial' : 'Optimiser';
        o.innerHTML = '<b>' + Math.round((on ? len(b) : len(a)) * u) + ' km</b>' + (on ? ', soit ' + Math.round((len(a) - len(b)) * u) + ' km de moins' : ' dans l\'ordre de saisie');
      };
      btn.addEventListener('click', function () { el._fxSet(!on); });
      el._fxSet(false);
    },
    trigger: function (el) { el.querySelector('button').click(); }
  });

  // Une flotte sur un plan : ceux qui roulent, ceux qui sont arrêtés
  FX.register('fleet-dots', {
    setup: function (el) {
      var n = U.num(el, 'fxCount', 14), box = U.make('div', 'fx-fd', el), o = U.make('output', '', el), V = [];
      box.setAttribute('aria-hidden', 'true');
      for (var i = 0; i < n; i++) V.push({ el: U.make('i', '', box), x: U.rand(0, 100), y: U.rand(0, 100), a: U.rand(0, 6.28), stop: Math.random() < .25 });
      el._fxV = V; el._fxO = o; el._fxT = 0;
      var show = function () { var s = V.filter(function (v) { return v.stop; }).length; o.textContent = (V.length - s) + ' en route, ' + s + ' à l\'arrêt'; };
      el._fxShow = show;
      V.forEach(function (v) { v.el.classList.toggle('fx-stop', v.stop); v.el.style.left = v.x + '%'; v.el.style.top = v.y + '%'; });
      show();
    },
    tick: function (el, dt, t) {
      if (U.reduced) return;
      el._fxV.forEach(function (v) {
        if (v.stop) return;
        v.x += Math.cos(v.a) * dt * 7; v.y += Math.sin(v.a) * dt * 7;
        if (v.x < 0 || v.x > 100) v.a = Math.PI - v.a;
        if (v.y < 0 || v.y > 100) v.a = -v.a;
        v.el.style.left = v.x + '%'; v.el.style.top = v.y + '%';
      });
      if (t - el._fxT > 3) {
        el._fxT = t;
        var w = el._fxV[Math.floor(Math.random() * el._fxV.length)];
        w.stop = !w.stop; w.el.classList.toggle('fx-stop', w.stop); el._fxShow();
      }
    }
  });

  // Ce qu'un colis peut coûter en plus à l'arrivée
  FX.register('customs-fee', {
    setup: function (el) {
      var R = U.num(el, 'fxDuty', 6) / 100, V = U.num(el, 'fxVat', 20) / 100, Fr = U.num(el, 'fxFree', 150);
      el.innerHTML = '<label>Valeur du colis <b></b><input type="range" min="20" max="1000" step="10"></label><ul><li><span>Droits</span><b data-d></b></li><li><span>TVA</span><b data-v></b></li><li class="fx-t"><span>Total à payer</span><b data-t></b></li></ul><small>Taux d\'exemple, à vérifier selon le produit et le pays.</small>';
      var r = el.querySelector('input');
      r.value = U.num(el, 'fxValue', 220);
      var m = function (x) { return x.toFixed(2).replace('.', ',') + ' €'; };
      var go = function () {
        var a = +r.value, d = a > Fr ? a * R : 0, v = (a + d) * V;
        el.querySelector('label b').textContent = a + ' €';
        el.querySelector('[data-d]').textContent = m(d); el.querySelector('[data-v]').textContent = m(v); el.querySelector('[data-t]').textContent = m(a + d + v);
        el.classList.toggle('fx-free', a <= Fr);
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Une grille de tarifs où le palier du poids choisi s'allume
  FX.register('weight-tier', {
    setup: function (el) {
      var T = (el.dataset.fxItems || '1:4.95|2:6.5|5:9.2|10:13.4|20:19.9').split('|').map(function (r) { var p = r.split(':'); return [+p[0], +p[1]]; });
      el.innerHTML = '<label>Poids <b></b><input type="range" min="0.5" max="' + T[T.length - 1][0] + '" step="0.5"></label><ol></ol><output aria-live="polite"></output>';
      var r = el.querySelector('input'), ol = el.querySelector('ol'), o = el.querySelector('output'), prev = 0;
      T.forEach(function (t) { var li = U.make('li', '', ol); li.innerHTML = '<span>' + prev + ' à ' + t[0] + ' kg</span><b>' + t[1].toFixed(2).replace('.', ',') + ' €</b>'; prev = t[0]; });
      r.value = U.num(el, 'fxKg', 3);
      var go = function () {
        var w = +r.value, k = T.findIndex(function (t) { return w <= t[0]; });
        el.querySelector('label b').textContent = String(w).replace('.', ',') + ' kg';
        Array.prototype.forEach.call(ol.children, function (li, i) { li.classList.toggle('fx-on', i === k); });
        o.textContent = T[k + 1] ? 'Le palier suivant commence après ' + T[k][0] + ' kg' : 'Dernier palier';
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Qui paie quoi selon l'Incoterm choisi, étape par étape
  FX.register('incoterm-bar', {
    setup: function (el) {
      var S = ['Usine', 'Transport local', 'Douane départ', 'Bateau', 'Douane arrivée', 'Livraison'], T = { EXW: 0, FCA: 1, FOB: 3, CIF: 4, DDP: 6 };
      el.innerHTML = '<div class="fx-ib" role="radiogroup" aria-label="Incoterm"></div><ol></ol><div class="fx-ib-l" aria-hidden="true"><span class="s">Vendeur</span><span class="a">Acheteur</span></div>';
      var box = el.querySelector('.fx-ib'), ol = el.querySelector('ol');
      S.forEach(function (t, i) { var li = U.make('li', '', ol); li.style.setProperty('--fx-i', i); li.textContent = t; });
      var set = function (k) {
        var n = T[k];
        box.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-checked', b.textContent === k); });
        Array.prototype.forEach.call(ol.children, function (li, i) {
          li.className = i < n ? 'fx-s' : 'fx-a2';
          li.setAttribute('aria-label', S[i] + ' : ' + (i < n ? 'vendeur' : 'acheteur'));
        });
      };
      Object.keys(T).forEach(function (k) {
        var b = U.make('button', '', box);
        b.type = 'button'; b.setAttribute('role', 'radio'); b.textContent = k;
        b.addEventListener('click', function () { set(k); });
      });
      set(el.dataset.fxTerm || 'FOB');
      U.make('small', '', el).textContent = 'Simplifié : le partage du risque suit des règles plus fines.';
    }
  });

  // Un tapis roulant qui déplace ses colis en boucle
  FX.register('conveyor-belt', {
    setup: function (el) {
      var n = U.num(el, 'fxCount', 6), box = U.make('div', 'fx-cb2', el);
      box.setAttribute('aria-hidden', 'true');
      for (var i = 0; i < n; i++) {
        var c = U.make('i', '', box);
        c.style.setProperty('--fx-w2', U.rand(22, 42) + 'px');
        c.style.setProperty('--fx-h2', U.rand(18, 36) + 'px');
        c.style.setProperty('--fx-d', -i * (U.num(el, 'fxSpeed', 9) / n) + 's');
      }
      box.style.setProperty('--fx-sp', U.num(el, 'fxSpeed', 9) + 's');
      U.make('u', '', box);
    }
  });

  // Un chariot élévateur qui soulève un chiffre
  FX.register('forklift-raise', {
    entrance: true,
    enter: function (el) {
      var v = U.num(el, 'fxValue', 12400), o = el.querySelector('.fx-fk-v');
      U.tween(el, 1400, function (p) { o.textContent = Math.round(v * U.easeOut(p)).toLocaleString('fr-FR'); });
    },
    setup: function (el) {
      var v = U.num(el, 'fxValue', 12400);
      el.setAttribute('aria-label', v + ' ' + (el.dataset.fxUnit || 'colis'));
      el.setAttribute('role', 'img');
      el.innerHTML = '<div class="fx-fk" aria-hidden="true"><div class="fx-fk-p"><span class="fx-fk-v">' + v.toLocaleString('fr-FR') + '</span><small>' + (el.dataset.fxUnit || 'colis') + '</small></div><i class="fx-fk-m"></i><i class="fx-fk-c"></i><i class="fx-fk-w"></i></div>';
    }
  });

  // Une liste de préparation où l'on compte chaque article prélevé
  FX.register('pick-counter', {
    setup: function (el) {
      var R = (el.dataset.fxItems || 'Vis M4:3|Boîte S:1|Câble 2 m:2').split('|').map(function (r) { var p = r.split(':'); return { n: p[0], q: +p[1], d: 0 }; }), ul = U.make('ul', '', el), o = U.make('output', '', el);
      o.setAttribute('aria-live', 'polite');
      var total = R.reduce(function (t, r) { return t + r.q; }, 0);
      var show = function () {
        var d = 0;
        R.forEach(function (r) { d += r.d; r.t.textContent = r.d + ' / ' + r.q; r.li.classList.toggle('fx-full', r.d === r.q); r.b.disabled = r.d === r.q; });
        el.style.setProperty('--fx-q', d / total);
        o.textContent = d === total ? 'Commande complète' : (total - d) + ' article' + (total - d > 1 ? 's' : '') + ' à prendre';
      };
      R.forEach(function (r) {
        r.li = U.make('li', '', ul);
        r.li.innerHTML = '<span>' + r.n + '</span><b></b><button type="button" aria-label="Prendre un ' + r.n + '">+1</button>';
        r.t = r.li.querySelector('b'); r.b = r.li.querySelector('button');
        r.b.addEventListener('click', function () { r.d++; show(); });
      });
      show();
    }
  });

  // Une heure d'arrivée avec sa vraie marge d'incertitude
  FX.register('eta-range', {
    entrance: true,
    setup: function (el) {
      var c = U.num(el, 'fxMinutes', 45), m = U.num(el, 'fxMargin', 15), now = Date.now(), f = function (mm) { return new Date(now + mm * 60000).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }); }, tot = (c + m) * 1.15;
      el.style.setProperty('--fx-a', (c - m) / tot); el.style.setProperty('--fx-b', (c + m) / tot); el.style.setProperty('--fx-c', c / tot);
      el.innerHTML = '<div class="fx-er" aria-hidden="true"><em></em><i></i></div><p>Arrivée vers <b>' + f(c) + '</b><br>Entre ' + f(c - m) + ' et ' + f(c + m) + '</p>';
    }
  });

  // Un relevé de température : la chaîne du froid a-t-elle tenu ?
  FX.register('cold-chain', {
    entrance: true,
    setup: function (el) {
      var d = (el.dataset.fxData || '3.1,3.4,3.8,4.2,5.9,7.1,5.4,4.0,3.6,3.2,3.5,3.3').split(',').map(Number), lo = U.num(el, 'fxLow', 2), hi = U.num(el, 'fxHigh', 6), step = U.num(el, 'fxStep', 30), a = Math.min.apply(null, d.concat(lo)) - 1, b = Math.max.apply(null, d.concat(hi)) + 1;
      var Y = function (v) { return 80 - (v - a) / (b - a) * 76; }, out = d.filter(function (v) { return v < lo || v > hi; }).length;
      var p = d.map(function (v, i) { return (i ? 'L' : 'M') + (i / (d.length - 1) * 200).toFixed(1) + ' ' + Y(v).toFixed(1); }).join('');
      el.innerHTML = '<svg viewBox="0 0 200 84" preserveAspectRatio="none" aria-hidden="true"><rect x="0" y="' + Y(hi) + '" width="200" height="' + (Y(lo) - Y(hi)) + '"/><path pathLength="1" d="' + p + '"/>' + d.map(function (v, i) { return v < lo || v > hi ? '<circle cx="' + (i / (d.length - 1) * 200) + '" cy="' + Y(v) + '" r="3"/>' : ''; }).join('') + '</svg><p></p>';
      el.classList.toggle('fx-bad', out > 0);
      el.querySelector('p').textContent = out ? 'Hors plage pendant environ ' + out * step + ' min' : 'Plage respectée sur tout le trajet';
    }
  });

  // Un retour de colis en trois gestes, l'un après l'autre
  FX.register('return-flow', {
    setup: function (el) {
      var S = (el.dataset.fxItems || 'Choisir le motif|Imprimer l\'étiquette|Déposer le colis').split('|'), n = 0, ol = U.make('ol', '', el), o = U.make('output', '', el);
      o.setAttribute('aria-live', 'polite');
      var show = function () {
        Array.prototype.forEach.call(ol.children, function (li, i) {
          li.className = i < n ? 'fx-done' : i === n ? 'fx-cur' : '';
          li.querySelector('button').disabled = i !== n;
        });
        o.textContent = n >= S.length ? 'Retour enregistré, remboursement sous peu' : 'Étape ' + (n + 1) + ' sur ' + S.length;
        el.classList.toggle('fx-end', n >= S.length);
      };
      S.forEach(function (t, i) {
        var li = U.make('li', '', ol);
        li.innerHTML = '<i aria-hidden="true">' + (i + 1) + '</i><span>' + t + '</span><button type="button" aria-label="Terminer : ' + t + '">OK</button>';
        li.querySelector('button').addEventListener('click', function () { n++; show(); });
      });
      show();
    }
  });

  // Une consigne : le bon code ouvre le bon casier
  FX.register('locker-grid', {
    setup: function (el) {
      var C = el.dataset.fxCode || '4821', K = U.num(el, 'fxLocker', 7), n = U.num(el, 'fxCount', 12);
      el.innerHTML = '<div class="fx-lg" aria-hidden="true"></div><div class="fx-lg-f"><input inputmode="numeric" maxlength="4" placeholder="Code" aria-label="Code de retrait"><button type="button">Ouvrir</button></div><output aria-live="polite">Code de démonstration : ' + C + '</output>';
      var g = el.querySelector('.fx-lg'), o = el.querySelector('output'), i = el.querySelector('input');
      for (var k = 1; k <= n; k++) U.make('i', '', g).textContent = k;
      el.querySelector('button').addEventListener('click', function () {
        var ok = i.value === C;
        Array.prototype.forEach.call(g.children, function (x, j) { x.classList.toggle('fx-open', ok && j + 1 === K); });
        el.classList.toggle('fx-no', !ok);
        o.textContent = ok ? 'Casier ' + K + ' ouvert' : 'Code incorrect';
        if (!ok) { g.classList.remove('fx-shake'); void g.offsetWidth; g.classList.add('fx-shake'); }
      });
    }
  });

  // Un drone apporte le contenu et repart
  FX.register('drone-drop', {
    entrance: true,
    setup: function (el) {
      var t = el.innerHTML;
      el.innerHTML = '<div class="fx-dd" aria-hidden="true"><i class="fx-dd-l"></i><i class="fx-dd-r"></i><i class="fx-dd-b"></i></div><div class="fx-dd-c">' + t + '</div>';
    }
  });

  // Un champ de suivi qui reconnaît le format du numéro
  FX.register('tracking-detect', {
    setup: function (el) {
      var T = JSON.parse(el.dataset.fxPatterns || '[["Postal national","^[0-9A-Z]{13}$"],["Express international","^[0-9]{10}$"],["Colis Europe","^[A-Z]{2}[0-9]{9}[A-Z]{2}$"]]');
      el.innerHTML = '<input type="text" spellcheck="false" autocomplete="off" placeholder="Votre numéro de suivi" aria-label="Numéro de suivi"><div class="fx-td" aria-live="polite"></div>';
      var i = el.querySelector('input'), b = el.querySelector('.fx-td');
      i.addEventListener('input', function () {
        var v = i.value.replace(/\s/g, '').toUpperCase(), hit = T.filter(function (t) { return new RegExp(t[1]).test(v); })[0];
        el.classList.toggle('fx-hit', !!hit);
        b.textContent = !v ? '' : hit ? hit[0] + ' reconnu' : 'Format encore inconnu';
      });
    }
  });

  // Choisir un jour de livraison : celui où le livreur passe déjà
  FX.register('eco-delivery-day', {
    setup: function (el) {
      var eco = U.num(el, 'fxEco', 3), box = U.make('div', 'fx-ed', el), o = U.make('output', '', el);
      o.setAttribute('aria-live', 'polite');
      o.textContent = 'Choisissez un jour';
      for (var i = 1; i <= 5; i++) (function (i) {
        var d = new Date(Date.now() + i * 86400000), b = U.make('button', i === eco ? 'fx-eco' : '', box);
        b.type = 'button'; b.setAttribute('aria-pressed', 'false');
        b.innerHTML = '<small>' + d.toLocaleDateString('fr-FR', { weekday: 'short' }) + '</small><b>' + d.getDate() + '</b>' + (i === eco ? '<i aria-label="Livraison regroupée">●</i>' : '');
        b.addEventListener('click', function () {
          box.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
          o.textContent = i === eco ? 'Jour regroupé : le livreur passe déjà chez vos voisins' : 'Livraison du ' + d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
        });
      })(i);
    }
  });

  // Où poser la charge pour ne pas surcharger un essieu
  FX.register('axle-load', {
    setup: function (el) {
      var M = U.num(el, 'fxLoad', 8), F = U.num(el, 'fxFrontMax', 7), R = U.num(el, 'fxRearMax', 8), E = 3;
      el.innerHTML = '<div class="fx-al" aria-hidden="true"><u></u><i class="a"></i><i class="b"></i></div><label>Position de la charge <input type="range" min="5" max="95"></label><div class="fx-al-v"><span><b data-f></b> à l\'avant</span><span><b data-r></b> à l\'arrière</span></div><output aria-live="polite"></output>';
      var r = el.querySelector('input'), o = el.querySelector('output');
      r.value = U.num(el, 'fxPos', 55);
      var go = function () {
        var q = r.value / 100, rear = E + M * q, front = E + M * (1 - q);
        el.style.setProperty('--fx-q', q);
        el.querySelector('[data-f]').textContent = front.toFixed(1).replace('.', ',') + ' t';
        el.querySelector('[data-r]').textContent = rear.toFixed(1).replace('.', ',') + ' t';
        var bad = front > F ? 'avant' : rear > R ? 'arrière' : '';
        el.classList.toggle('fx-bad', !!bad);
        o.textContent = bad ? 'Essieu ' + bad + ' surchargé' : 'Répartition correcte';
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Le planning des quais de chargement, avec le trait de l'heure actuelle
  FX.register('dock-schedule', {
    setup: function (el) {
      var R = (el.dataset.fxItems || 'Quai 1:7-9,11-13,15-17|Quai 2:8-12,14-16|Quai 3:9-10,13-18').split('|').map(function (r) { var p = r.split(':'); return [p[0], p[1].split(',').map(function (s) { return s.split('-').map(Number); })]; }), a = U.num(el, 'fxStart', 6), b = U.num(el, 'fxEnd', 20), W = b - a;
      var box = U.make('div', 'fx-dk', el), o = U.make('output', '', el);
      box.setAttribute('aria-hidden', 'true');
      R.forEach(function (r) {
        U.make('b', '', box).textContent = r[0];
        var t = U.make('div', '', box);
        r[1].forEach(function (s, i) { var c = U.make('i', '', t); c.style.cssText = 'left:' + (s[0] - a) / W * 100 + '%;width:' + (s[1] - s[0]) / W * 100 + '%;--fx-i:' + i; });
      });
      var now = U.make('u', '', box);
      var go = function () {
        var d = new Date(), h = d.getHours() + d.getMinutes() / 60, free = R.filter(function (r) { return !r[1].some(function (s) { return h >= s[0] && h < s[1]; }); }).map(function (r) { return r[0]; });
        now.style.setProperty('--fx-q', U.clamp((h - a) / W, 0, 1));
        o.textContent = free.length ? 'Libre maintenant : ' + free.join(', ') : 'Tous les quais sont occupés';
      };
      go();
      setInterval(go, 60000);
    }
  });
})(window.FX);

/* Pack 32 — Énergie */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Des panneaux à poser sur un toit, et ce qu'ils produisent
  FX.register('solar-roof', {
    setup: function (el) {
      var kwp = .42, yld = U.num(el, 'fxYield', 1200), price = U.num(el, 'fxKwh', .21), cost = U.num(el, 'fxCost', 650), max = 15;
      el.innerHTML = '<div class="fx-sr2" aria-hidden="true"></div><label>Panneaux <b></b><input type="range" min="2" max="' + max + '"></label><output aria-live="polite"></output><small>Calcul fictif avec 50 % d\'autoconsommation.</small>';
      var box = el.querySelector('.fx-sr2'), r = el.querySelector('input'), o = el.querySelector('output');
      for (var i = 0; i < max; i++) U.make('i', '', box);
      r.value = U.num(el, 'fxCount', 8);
      var go = function () {
        var n = +r.value, prod = n * kwp * yld, gain = prod * .5 * price, invest = n * cost, y = invest / gain;
        Array.prototype.forEach.call(box.children, function (p, i) { p.classList.toggle('fx-on', i < n); });
        el.querySelector('label b').textContent = n + ' · ' + (n * kwp).toFixed(1).replace('.', ',') + ' kWc';
        o.innerHTML = '<b>' + Math.round(prod).toLocaleString('fr-FR') + ' kWh/an</b><br>' + Math.round(gain) + ' € d\'économie, rentable en ' + Math.round(y) + ' ans';
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Une facture découpée : ce que l'on paie vraiment
  FX.register('bill-slices', {
    entrance: true,
    setup: function (el) {
      var R = (el.dataset.fxItems || 'Énergie:42:Ce que vous consommez|Réseau:28:Le transport jusqu\'à chez vous|Taxes:24:Taxes et contributions|Abonnement:6:Part fixe').split('|').map(function (r) { return r.split(':'); }), tot = R.reduce(function (t, r) { return t + +r[1]; }, 0);
      var bar = U.make('div', 'fx-bl3', el), o = U.make('output', '', el);
      o.setAttribute('aria-live', 'polite');
      R.forEach(function (r, i) {
        var b = U.make('button', '', bar);
        b.type = 'button'; b.style.flex = r[1] + ' 1 0'; b.style.setProperty('--fx-i', i); b.setAttribute('aria-label', r[0] + ', ' + Math.round(r[1] / tot * 100) + ' %');
        b.textContent = Math.round(r[1] / tot * 100) >= 15 ? Math.round(r[1] / tot * 100) + ' %' : '';
        b.addEventListener('click', function () { bar.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); o.innerHTML = '<b>' + r[0] + ' : ' + r[1] + ' €</b><br>' + r[2]; });
        if (!i) b.click();
      });
    }
  });

  // Une horloge de 24 h : heures creuses, heures pleines et maintenant
  FX.register('peak-clock', {
    setup: function (el) {
      var Z = (el.dataset.fxOff || '0-6,14-16').split(',').map(function (s) { return s.split('-').map(Number); });
      var deg = function (h) { return h / 24 * 360; }, grad = Z.map(function (z) { return 'var(--fx-off, #2d9c7f) ' + deg(z[0]) + 'deg ' + deg(z[1]) + 'deg'; });
      var st = [], pos = 0;
      Z.forEach(function (z, i) { if (z[0] > pos) st.push('color-mix(in srgb, currentColor 20%, transparent) ' + deg(pos) + 'deg ' + deg(z[0]) + 'deg'); st.push(grad[i]); pos = z[1]; });
      st.push('color-mix(in srgb, currentColor 20%, transparent) ' + deg(pos) + 'deg 360deg');
      el.innerHTML = '<div class="fx-pk" aria-hidden="true" style="background:conic-gradient(' + st.join(',') + ')"><i></i><span>0</span><span>6</span><span>12</span><span>18</span></div><output></output>';
      var o = el.querySelector('output'), hand = el.querySelector('i');
      var go = function () {
        var d = new Date(), h = d.getHours() + d.getMinutes() / 60, off = Z.some(function (z) { return h >= z[0] && h < z[1]; });
        hand.style.transform = 'rotate(' + deg(h) + 'deg)';
        el.classList.toggle('fx-now-off', off);
        if (off) { o.textContent = 'Heure creuse en ce moment'; return; }
        var nx = Z.map(function (z) { return z[0] > h ? z[0] - h : z[0] + 24 - h; }).sort(function (a, b) { return a - b; })[0];
        o.textContent = 'Heure pleine, creuse dans ' + Math.ceil(nx) + ' h';
      };
      go();
      setInterval(go, 60000);
    }
  });

  // La composition de l'électricité en ce moment, qui varie doucement
  FX.register('grid-mix', {
    setup: function (el) {
      var M = (el.dataset.fxItems || 'Nucléaire:62:1|Hydraulique:12:1|Éolien:9:1|Solaire:6:1|Gaz:11:0').split('|').map(function (r) { var p = r.split(':'); return { n: p[0], v: +p[1], g: +p[2] }; }), bar = U.make('div', 'fx-gm', el), ul = U.make('ul', '', el), o = U.make('p', '', el);
      bar.setAttribute('aria-hidden', 'true');
      M.forEach(function (m, i) { m.b = U.make('i', 'c' + i, bar); m.l = U.make('li', 'c' + i, ul); });
      el._fxShow = function () {
        var t = M.reduce(function (s, m) { return s + m.v; }, 0), g = 0;
        M.forEach(function (m) { var q = m.v / t * 100; m.b.style.flexGrow = q; m.l.textContent = m.n + ' ' + Math.round(q) + ' %'; if (m.g) g += q; });
        o.innerHTML = '<b>' + Math.round(g) + ' %</b> décarboné. Données fictives.';
      };
      el._fxM = M;
      el._fxShow();
      if (!U.reduced) setInterval(function () { M.forEach(function (m) { m.v = Math.max(1, m.v + U.rand(-1.2, 1.2)); }); el._fxShow(); }, 1800);
    }
  });

  // Une éolienne : quand le vent double, la puissance est multipliée par huit
  FX.register('wind-turbine', {
    setup: function (el) {
      el.innerHTML = '<svg viewBox="0 0 100 120" aria-hidden="true"><path d="M48 118 49 50H51L52 118Z"/><g class="fx-wt"><path d="M50 48 47 8Q50 4 53 8Z"/><path d="M50 48 47 8Q50 4 53 8Z" transform="rotate(120 50 48)"/><path d="M50 48 47 8Q50 4 53 8Z" transform="rotate(240 50 48)"/><circle cx="50" cy="48" r="4"/></g></svg><label>Vent <b></b><input type="range" min="0" max="30"></label><output aria-live="polite"></output>';
      var r = el.querySelector('input'), o = el.querySelector('output');
      el._fxA = 0;
      r.value = U.num(el, 'fxWind', 10);
      var go = function () {
        var v = +r.value, stop = v < 3 || v > 25, p = stop ? 0 : Math.min(3000, .22 * Math.pow(v, 3) * 8);
        el._fxS = stop ? 0 : Math.min(200, v * 14);
        el.querySelector('label b').textContent = v + ' m/s';
        o.innerHTML = v > 25 ? 'Tempête : <b>arrêt de sécurité</b>' : v < 3 ? 'Trop peu de vent' : '<b>' + Math.round(p).toLocaleString('fr-FR') + ' kW</b> (modèle fictif)';
      };
      r.addEventListener('input', go);
      go();
    },
    tick: function (el, dt) {
      if (U.reduced) return;
      el._fxA = (el._fxA + el._fxS * dt) % 360;
      el.style.setProperty('--fx-a', el._fxA + 'deg');
    }
  });

  // Une pompe à chaleur : 1 kWh d'électricité, combien de chaleur ?
  FX.register('heat-pump-flow', {
    setup: function (el) {
      el.innerHTML = '<div class="fx-hp" aria-hidden="true"><div class="in"><b>1 kWh</b><i></i></div><div class="pm"></div><div class="out"><i></i><b data-o></b></div></div><label>Dehors <b data-t></b><input type="range" min="-15" max="15"></label><output aria-live="polite"></output>';
      var r = el.querySelector('input'), o = el.querySelector('output');
      r.value = U.num(el, 'fxTemp', 7);
      var go = function () {
        var t = +r.value, cop = U.clamp(3.3 + t * .09, 1.3, 5);
        el.querySelector('[data-t]').textContent = t + ' °C';
        el.querySelector('[data-o]').textContent = cop.toFixed(1).replace('.', ',') + ' kWh';
        el.style.setProperty('--fx-q', cop / 5);
        o.textContent = 'COP de ' + cop.toFixed(1).replace('.', ',') + ' à cette température (modèle fictif)';
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Une maison qui perd sa chaleur : isoler, poste après poste
  FX.register('insulation-loss', {
    setup: function (el) {
      var P = (el.dataset.fxItems || 'Toit:30|Murs:25|Fenêtres:15|Sol:10').split('|').map(function (r) { var p = r.split(':'); return { n: p[0], v: +p[1] }; }), bill = U.num(el, 'fxBill', 1800);
      el.innerHTML = '<div class="fx-il" aria-hidden="true"><i class="r"></i><i class="w"></i><i class="f"></i><i class="s"></i></div><div class="fx-il-c"></div><output aria-live="polite"></output>';
      var c = el.querySelector('.fx-il-c'), o = el.querySelector('output'), parts = el.querySelectorAll('.fx-il i');
      P.forEach(function (p, i) {
        var l = U.make('label', '', c), k = U.make('input', '', l);
        k.type = 'checkbox';
        l.appendChild(document.createTextNode(p.n + ' (−' + p.v + ' %)'));
        p.c = k; p.part = parts[i];
      });
      var go = function () {
        var g = 0;
        P.forEach(function (p) { if (p.c.checked) g += p.v; p.part.classList.toggle('fx-ok', p.c.checked); });
        o.innerHTML = '<b>' + (g ? '−' : '') + g + ' %</b> de pertes, ' + Math.round(bill * g / 100).toLocaleString('fr-FR') + ' € par an (estimation)';
      };
      c.addEventListener('change', go);
      go();
    }
  });

  // Un thermostat rond : chaque degré se voit sur la facture
  FX.register('thermostat-dial', {
    setup: function (el) {
      var min = 15, max = 25, ref = U.num(el, 'fxRef', 19), step = 7;
      el.innerHTML = '<div class="fx-td2" role="slider" tabindex="0" aria-label="Température de consigne" aria-valuemin="' + min + '" aria-valuemax="' + max + '"><i></i><b></b></div><div class="fx-td2-b"><button type="button" aria-label="Baisser">−</button><button type="button" aria-label="Monter">+</button></div><output aria-live="polite"></output>';
      var d = el.querySelector('.fx-td2'), b = el.querySelector('b'), o = el.querySelector('output'), v = U.num(el, 'fxValue', 20);
      var set = function (x) {
        v = U.clamp(x, min, max);
        var q = (v - min) / (max - min), diff = (v - ref) * step;
        el.style.setProperty('--fx-q', q);
        el.style.setProperty('--fx-h', 210 - q * 210);
        b.textContent = v + ' °C';
        d.setAttribute('aria-valuenow', v);
        o.textContent = diff === 0 ? 'Référence' : (diff > 0 ? '+' : '−') + Math.abs(diff) + ' % sur la dépense de chauffage (ordre de grandeur)';
      };
      el.querySelectorAll('button').forEach(function (x, i) { x.addEventListener('click', function () { set(v + (i ? 1 : -1)); }); });
      d.addEventListener('keydown', function (e) { var k = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1 }[e.key]; if (k) { e.preventDefault(); set(v + k); } });
      d.addEventListener('wheel', function (e) { e.preventDefault(); set(v + (e.deltaY < 0 ? 1 : -1)); }, { passive: false });
      set(v);
    }
  });

  // Allumer des appareils et regarder tourner le compteur
  FX.register('appliance-meter', {
    setup: function (el) {
      var A = (el.dataset.fxItems || 'Four:2400|Lave-linge:2000|Télé:100|Frigo:150|Bouilloire:2200').split('|').map(function (r) { var p = r.split(':'); return [p[0], +p[1]]; }), price = U.num(el, 'fxKwh', .21), a = 0;
      el.innerHTML = '<div class="fx-am" aria-hidden="true"><i></i></div><div class="fx-am-c"></div><output aria-live="polite"></output>';
      var c = el.querySelector('.fx-am-c'), o = el.querySelector('output');
      A.forEach(function (x) {
        var l = U.make('label', '', c), k = U.make('input', '', l);
        k.type = 'checkbox'; k.value = x[1];
        l.appendChild(document.createTextNode(x[0]));
      });
      var go = function () {
        var w = 0;
        c.querySelectorAll(':checked').forEach(function (k) { w += +k.value; });
        el._fxW = w;
        o.innerHTML = '<b>' + w.toLocaleString('fr-FR') + ' W</b> · ' + (w / 1000 * price).toFixed(2).replace('.', ',') + ' € par heure';
      };
      c.addEventListener('change', go);
      el._fxA = 0;
      c.querySelectorAll('input')[3].checked = true;
      go();
    },
    tick: function (el, dt) {
      if (U.reduced) return;
      el._fxA = (el._fxA + el._fxW * dt * .15) % 360;
      el.style.setProperty('--fx-a', el._fxA + 'deg');
    }
  });

  // Les flux de la maison : du soleil vers la batterie, le réseau et les pièces
  FX.register('energy-flow', {
    setup: function (el) {
      el.innerHTML = '<svg viewBox="0 0 200 110" aria-hidden="true"><path id="a" d="M40 24H100V55"/><path id="b" d="M100 55H160V24"/><path id="c" d="M100 55H40V90"/><path id="d" d="M100 55H160V90"/><circle cx="100" cy="55" r="6"/></svg><span class="s">Soleil</span><span class="h">Maison</span><span class="g">Réseau</span><span class="b2">Batterie</span><label>Heure <input type="range" min="0" max="23"></label><output aria-live="polite"></output>';
      var r = el.querySelector('input'), o = el.querySelector('output'), g = function (s) { return el.querySelector('#' + s); };
      r.value = U.num(el, 'fxHour', 13);
      var go = function () {
        var h = +r.value, sun = h > 7 && h < 19 ? Math.sin((h - 7) / 12 * Math.PI) * 4 : 0, use = h >= 18 && h <= 22 ? 2.2 : .7, net = sun - use;
        g('a').setAttribute('class', sun > 0 ? 'fx-on' : '');
        g('b').setAttribute('class', 'fx-on');
        g('c').setAttribute('class', net > 1.5 ? 'fx-on fx-back' : net < -.6 ? 'fx-on' : '');
        g('d').setAttribute('class', net > 0 ? 'fx-on' : net < 0 ? 'fx-on fx-back' : '');
        o.textContent = h + ' h : ' + sun.toFixed(1).replace('.', ',') + ' kW produits, ' + use.toFixed(1).replace('.', ',') + ' kW consommés. ' + (net > 0 ? 'La batterie charge.' : 'La batterie alimente.');
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Un compteur communicant : l'index monte, la puissance varie
  FX.register('smart-meter', {
    setup: function (el) {
      var kwh = U.num(el, 'fxIndex', 18492.3), p = U.num(el, 'fxPower', 1.4);
      el.innerHTML = '<div class="fx-smm"><small>Index kWh</small><b class="i"></b><small>Puissance</small><b class="p"></b></div>';
      el._fxOut = function () {
        el.querySelector('.i').textContent = kwh.toFixed(3).replace('.', ',');
        el.querySelector('.p').textContent = p.toFixed(2).replace('.', ',') + ' kW';
      };
      el._fxStep = function (dt) {
        p = U.clamp(p + U.rand(-.04, .04), .2, 6);
        kwh += p * dt / 3600 * U.num(el, 'fxSpeed', 40);
        el._fxOut();
      };
      el._fxOut();
      if (el.dataset.fxLabel) el.setAttribute('aria-label', el.dataset.fxLabel);
    },
    tick: function (el, dt) { if (!U.reduced) el._fxStep(dt); }
  });

  // Production solaire contre consommation : la part utilisée sur place
  FX.register('self-consumption', {
    entrance: true,
    setup: function (el) {
      var H = 24, s = [], c = (el.dataset.fxUse || '.3,.3,.3,.3,.3,.4,.9,1.2,.8,.5,.5,.6,.9,.6,.5,.5,.7,1.2,1.8,2,1.6,1,.6,.4').split(',').map(Number), peak = U.num(el, 'fxPeak', 3);
      for (var i = 0; i < H; i++) s.push(i > 6 && i < 20 ? Math.pow(Math.sin((i - 6) / 14 * Math.PI), 1.3) * peak : 0);
      var used = 0, made = 0, Y = function (v) { return 80 - v / peak * 72; }, X = function (i) { return i / (H - 1) * 200; };
      s.forEach(function (v, i) { used += Math.min(v, c[i]); made += v; });
      var ln = function (a) { return a.map(function (v, i) { return (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1); }).join(''); }, over = s.map(function (v, i) { return Math.min(v, c[i]); });
      el.innerHTML = '<svg viewBox="0 0 200 84" preserveAspectRatio="none" aria-hidden="true"><path class="o" d="' + ln(over) + 'L200 80L0 80Z"/><path class="s" pathLength="1" d="' + ln(s) + '"/><path class="c" pathLength="1" d="' + ln(c) + '"/></svg><p><b>' + Math.round(used / made * 100) + ' %</b> du solaire utilisé sur place. Journée fictive.</p>';
    }
  });

  // Option base ou heures creuses : qui gagne selon ses habitudes
  FX.register('tariff-choice', {
    setup: function (el) {
      var Y = U.num(el, 'fxYear', 5000), B = U.num(el, 'fxBase', .2), H = U.num(el, 'fxHigh', .22), L = U.num(el, 'fxLow', .17), S = U.num(el, 'fxExtra', 20);
      el.innerHTML = '<label>Part en heures creuses <b></b><input type="range" min="0" max="80"></label><div class="fx-tc3" aria-hidden="true"><i class="a"></i><i class="b"></i></div><output aria-live="polite"></output><small>Tarifs d\'exemple, à remplacer.</small>';
      var r = el.querySelector('input'), o = el.querySelector('output');
      r.value = U.num(el, 'fxShare', 35);
      var go = function () {
        var q = r.value / 100, a = Y * B, b = Y * (q * L + (1 - q) * H) + S, top = Math.max(a, b);
        el.querySelector('label b').textContent = r.value + ' %';
        el.style.setProperty('--fx-a', a / top); el.style.setProperty('--fx-b', b / top);
        o.innerHTML = b < a ? '<b>Heures creuses</b> : ' + Math.round(a - b) + ' € de moins par an' : '<b>Option base</b> : ' + Math.round(b - a) + ' € de moins par an';
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Taper son code postal pour savoir s'il y a une coupure
  FX.register('outage-check', {
    setup: function (el) {
      var D = JSON.parse(el.dataset.fxData || '{"69003":"vers 18 h 30","31000":"vers 21 h"}');
      el.innerHTML = '<form><input inputmode="numeric" maxlength="5" placeholder="Code postal" aria-label="Code postal"><button>Vérifier</button></form><output aria-live="polite"></output>';
      var i = el.querySelector('input'), o = el.querySelector('output');
      el.querySelector('form').addEventListener('submit', function (e) {
        e.preventDefault();
        var v = i.value.trim();
        el.classList.remove('fx-ok', 'fx-cut');
        if (!/^\d{5}$/.test(v)) { o.textContent = 'Saisissez 5 chiffres'; return; }
        if (D[v]) { el.classList.add('fx-cut'); o.innerHTML = '<b>Coupure signalée</b> · retour ' + D[v]; }
        else { el.classList.add('fx-ok'); o.innerHTML = '<b>Aucune coupure signalée</b>'; }
      });
      U.make('small', '', el).textContent = 'Exemple fictif : essayez 69003.';
    }
  });

  // Une flamme de brûleur dont on règle la puissance
  FX.register('burner-flame', {
    setup: function (el) {
      var n = 7, box = U.make('div', 'fx-bf2', el), lab = U.make('label', '', el), o = U.make('output', '', el);
      box.setAttribute('aria-hidden', 'true');
      for (var i = 0; i < n; i++) { var f = U.make('i', '', box); f.style.setProperty('--fx-d', -U.rand(0, 1).toFixed(2) + 's'); f.style.setProperty('--fx-t', U.rand(.75, 1).toFixed(2)); }
      lab.innerHTML = 'Puissance <input type="range" min="0" max="100">';
      o.setAttribute('aria-live', 'polite');
      var r = lab.querySelector('input'), P = U.num(el, 'fxPower', 24);
      r.value = U.num(el, 'fxValue', 55);
      var go = function () { el.style.setProperty('--fx-q', r.value / 100); o.textContent = r.value == 0 ? 'Veilleuse' : Math.round(r.value / 100 * P) + ' kW'; };
      r.addEventListener('input', go);
      go();
    }
  });

  // Trouver les heures les moins chères pour lancer une longue tâche
  FX.register('cheapest-window', {
    setup: function (el) {
      var P = (el.dataset.fxData || '18,16,14,13,12,13,17,24,29,31,27,24,22,21,22,24,28,34,38,36,31,27,23,20').split(',').map(Number), n = P.length, max = Math.max.apply(null, P);
      el.innerHTML = '<div class="fx-cw" aria-hidden="true"></div><label>Durée <b></b><input type="range" min="1" max="8"></label><output aria-live="polite"></output>';
      var box = el.querySelector('.fx-cw'), r = el.querySelector('input'), o = el.querySelector('output');
      P.forEach(function (v) { U.make('i', '', box).style.height = v / max * 100 + '%'; });
      r.value = U.num(el, 'fxHours', 4);
      var go = function () {
        var d = +r.value, best = 0, cost = Infinity;
        for (var s = 0; s + d <= n; s++) { var t = 0; for (var k = s; k < s + d; k++) t += P[k]; if (t < cost) { cost = t; best = s; } }
        Array.prototype.forEach.call(box.children, function (b, i) { b.classList.toggle('fx-on', i >= best && i < best + d); });
        el.querySelector('label b').textContent = d + ' h';
        o.innerHTML = 'Lancez à <b>' + best + ' h</b>, finie à ' + (best + d) + ' h. Moyenne de ' + Math.round(cost / d) + ' cts/kWh';
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // L'intensité carbone de l'électricité, heure par heure
  FX.register('co2-by-hour', {
    entrance: true,
    setup: function (el) {
      var D = (el.dataset.fxData || '58,52,48,46,46,52,70,92,108,96,72,58,50,48,52,62,84,118,132,124,102,86,74,64').split(',').map(Number), max = Math.max.apply(null, D), now = new Date().getHours(), best = D.indexOf(Math.min.apply(null, D)), avg = D.reduce(function (a, b) { return a + b; }, 0) / D.length;
      var h = '';
      D.forEach(function (v, i) { h += '<i class="' + (i === now ? 'fx-now' : '') + (i === best ? ' fx-best' : '') + '" style="--fx-q:' + v / max + ';--fx-c:' + (120 - (v / max) * 120) + ';--fx-i:' + i + '"></i>'; });
      el.innerHTML = '<div class="fx-c2h" aria-hidden="true">' + h + '</div><p>Maintenant : <b>' + D[now] + ' g/kWh</b>, ' + (D[now] < avg ? 'sous' : 'au-dessus de') + ' la moyenne.<br>Meilleure heure : ' + best + ' h. Données fictives.</p>';
    }
  });

  // Une prise se branche et le texte s'allume
  FX.register('plug-connect', {
    entrance: true,
    setup: function (el) {
      var t = el.innerHTML;
      el.innerHTML = '<div class="fx-pc2" aria-hidden="true"><i class="fx-pc2-w"></i><i class="fx-pc2-p"></i><i class="fx-pc2-s"></i></div><div class="fx-pc2-t">' + t + '</div>';
    }
  });

  // Une ampoule LED contre une ampoule classique : coût à l'année
  FX.register('bulb-compare', {
    setup: function (el) {
      var K = U.num(el, 'fxKwh', .21), A = U.num(el, 'fxOld', 60), B = U.num(el, 'fxLed', 8);
      el.innerHTML = '<div class="fx-bc3" aria-hidden="true"><div><i class="o"></i><small>' + A + ' W</small></div><div><i class="l"></i><small>' + B + ' W</small></div></div><label>Heures par jour <b></b><input type="range" min="1" max="16"></label><output aria-live="polite"></output>';
      var r = el.querySelector('input'), o = el.querySelector('output');
      r.value = U.num(el, 'fxHours', 4);
      var go = function () {
        var h = +r.value, y = h * 365, a = A / 1000 * y * K, b = B / 1000 * y * K;
        el.querySelector('label b').textContent = h + ' h';
        el.style.setProperty('--fx-q', h / 16);
        o.innerHTML = '<b>' + (a - b).toFixed(2).replace('.', ',') + ' €</b> d\'écart par an et par lampe';
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Les appareils qui consomment en veille, et ce que cela coûte à l'année
  FX.register('standby-drain', {
    setup: function (el) {
      var D = (el.dataset.fxItems || 'Box internet:12|Télévision:5|Console:8|Enceinte:3|Micro-ondes:2').split('|').map(function (r) { var p = r.split(':'); return [p[0], +p[1]]; }), k = U.num(el, 'fxKwh', .21), ul = U.make('ul', '', el), o = U.make('output', '', el);
      o.setAttribute('aria-live', 'polite');
      D.forEach(function (d) {
        var li = U.make('li', '', ul), b = U.make('button', '', li);
        b.type = 'button'; b.setAttribute('aria-pressed', 'true');
        b.innerHTML = '<i></i><span>' + d[0] + '</span><em>' + d[1] + ' W</em>';
        b.addEventListener('click', function () { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true'); go(); });
      });
      var go = function () {
        var w = 0;
        ul.querySelectorAll('button').forEach(function (b, i) { if (b.getAttribute('aria-pressed') === 'true') w += D[i][1]; });
        var kwh = w * 24 * 365 / 1000;
        o.innerHTML = '<b>' + Math.round(kwh * k) + ' € par an</b> en veille · ' + Math.round(kwh) + ' kWh';
      };
      go();
    }
  });

  // Un barrage : le niveau d'eau et l'énergie qui y dort
  FX.register('reservoir-level', {
    entrance: true,
    setup: function (el) {
      var v = U.num(el, 'fxValue', 62), lo = U.num(el, 'fxLow', 35), cap = U.num(el, 'fxCapacity', 480), q = v / 100;
      el.style.setProperty('--fx-q', q); el.style.setProperty('--fx-low', lo / 100);
      el.classList.toggle('fx-low', v < lo);
      el.innerHTML = '<div class="fx-rl" aria-hidden="true"><i></i><em></em></div><p><b>' + v + ' %</b> · ' + Math.round(cap * q) + ' MWh stockés<br>' + (v < lo ? 'Sous le seuil de vigilance' : 'Niveau normal') + '</p>';
    }
  });

  // Une aide aux travaux, selon le revenu et le chantier choisi
  FX.register('aid-estimate', {
    setup: function (el) {
      var W = JSON.parse(el.dataset.fxWorks || '{"Isolation du toit":[3000,2200,1200,0],"Pompe à chaleur":[5000,4000,3000,0],"Fenêtres":[800,600,400,0]}'), T = ['Très modeste', 'Modeste', 'Intermédiaire', 'Élevé'];
      el.innerHTML = '<label>Revenus<select class="r">' + T.map(function (t, i) { return '<option value="' + i + '">' + t + '</option>'; }).join('') + '</select></label><div class="fx-ae"></div><output aria-live="polite"></output><small>Barème fictif, renseignez-vous auprès du service officiel.</small>';
      var s = el.querySelector('.r'), box = el.querySelector('.fx-ae'), o = el.querySelector('output');
      Object.keys(W).forEach(function (k) {
        var l = U.make('label', '', box), c = U.make('input', '', l);
        c.type = 'checkbox'; c.value = k;
        l.appendChild(document.createTextNode(k));
      });
      var go = function () {
        var r = +s.value, t = 0;
        box.querySelectorAll(':checked').forEach(function (c) { t += W[c.value][r]; });
        o.innerHTML = 'Aide estimée : <b>' + t.toLocaleString('fr-FR') + ' €</b>';
      };
      el.addEventListener('change', go);
      box.querySelector('input').checked = true;
      go();
    }
  });

  // Comparer des chauffages par coût ou par CO₂
  FX.register('heating-compare', {
    setup: function (el) {
      var M = (el.dataset.fxItems || 'Gaz:1700:2900|Fioul:2300:4200|Pompe à chaleur:1050:500|Granulés:1200:400|Radiateurs:2100:900').split('|').map(function (r) { var p = r.split(':'); return { n: p[0], c: +p[1], e: +p[2] }; }), f = U.make('div', 'fx-hc', el), ul = U.make('ul', '', el);
      M.forEach(function (m) { m.li = U.make('li', '', ul); m.li.innerHTML = '<span>' + m.n + '</span><i></i><b></b>'; });
      var sort = function (k, u) {
        var top = Math.max.apply(null, M.map(function (m) { return m[k]; })), before = M.map(function (m) { return m.li.getBoundingClientRect().top; });
        M.slice().sort(function (a, b) { return a[k] - b[k]; }).forEach(function (m) { ul.appendChild(m.li); m.li.style.setProperty('--fx-q', m[k] / top); m.li.querySelector('b').textContent = m[k].toLocaleString('fr-FR') + ' ' + u; });
        M.forEach(function (m, i) { var dy = before[i] - m.li.getBoundingClientRect().top; if (dy && !U.reduced) m.li.animate([{ transform: 'translateY(' + dy + 'px)' }, { transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.16,1,.3,1)' }); });
      };
      [['c', '€/an', 'Coût'], ['e', 'kg CO₂', 'Émissions']].forEach(function (x, i) {
        var b = U.make('button', '', f);
        b.type = 'button'; b.textContent = x[2]; b.setAttribute('aria-pressed', !i);
        b.addEventListener('click', function () { f.querySelectorAll('button').forEach(function (y) { y.setAttribute('aria-pressed', y === b); }); sort(x[0], x[1]); });
      });
      sort('c', '€/an');
      U.make('small', '', el).textContent = 'Ordres de grandeur fictifs, pour une maison type.';
    }
  });

  // Une rose des vents : la direction dominante se voit tout de suite
  FX.register('wind-rose', {
    entrance: true,
    setup: function (el) {
      var D = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'], V = (el.dataset.fxData || '6,5,4,6,10,24,26,19').split(',').map(Number), max = Math.max.apply(null, V), k = V.indexOf(max), s = '<svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="50"/><circle cx="60" cy="60" r="25"/>';
      V.forEach(function (v, i) {
        var a = (i * 45 - 90 - 18) * Math.PI / 180, b = (i * 45 - 90 + 18) * Math.PI / 180, r = v / max * 48;
        s += '<path class="' + (i === k ? 'fx-top' : '') + '" style="--fx-i:' + i + '" d="M60 60L' + (60 + r * Math.cos(a)).toFixed(1) + ' ' + (60 + r * Math.sin(a)).toFixed(1) + 'A' + r.toFixed(1) + ' ' + r.toFixed(1) + ' 0 0 1 ' + (60 + r * Math.cos(b)).toFixed(1) + ' ' + (60 + r * Math.sin(b)).toFixed(1) + 'Z"/>';
      });
      D.filter(function (_, i) { return i % 2 === 0; }).forEach(function (t, i) { var a = i * 90 * Math.PI / 180 - Math.PI / 2; s += '<text x="' + (60 + 56 * Math.cos(a)) + '" y="' + (62 + 56 * Math.sin(a)) + '">' + t + '</text>'; });
      el.innerHTML = s + '</svg><p>Vent dominant : <b>' + D[k] + '</b>, ' + V[k] + ' % du temps. Données fictives.</p>';
    }
  });

  // Incliner un panneau pour voir la perte de rendement
  FX.register('solar-tilt', {
    setup: function (el) {
      var best = U.num(el, 'fxBest', 33);
      el.innerHTML = '<div class="fx-sl" aria-hidden="true"><i class="s"></i><i class="p"></i></div><label>Inclinaison <b></b><input type="range" min="0" max="90"></label><output aria-live="polite"></output>';
      var r = el.querySelector('input'), o = el.querySelector('output');
      r.value = U.num(el, 'fxAngle', 20);
      var go = function () {
        var a = +r.value, q = Math.max(.55, 1 - Math.pow((a - best) / 75, 2));
        el.style.setProperty('--fx-a', -a + 'deg');
        el.style.setProperty('--fx-g', q);
        el.querySelector('label b').textContent = a + '°';
        o.innerHTML = '<b>' + Math.round(q * 100) + ' %</b> du rendement maximal (optimum à ' + best + '°)';
      };
      r.addEventListener('input', go);
      go();
    }
  });
})(window.FX);

/* Pack 33 — Industrie */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Le rendement d'une ligne : trois taux, un seul chiffre
  FX.register('oee-gauge', {
    setup: function (el) {
      var R = [['Disponibilité', U.num(el, 'fxAvail', 88)], ['Performance', U.num(el, 'fxPerf', 92)], ['Qualité', U.num(el, 'fxQual', 97)]];
      el.innerHTML = '<div class="fx-oe" aria-hidden="true"><i></i><b></b></div><div class="fx-oe-s"></div><output aria-live="polite"></output>';
      var box = el.querySelector('.fx-oe-s'), o = el.querySelector('output');
      R.forEach(function (r) {
        var l = U.make('label', '', box);
        l.innerHTML = r[0] + ' <em></em><input type="range" min="40" max="100" value="' + r[1] + '">';
        r.i = l.querySelector('input'); r.e = l.querySelector('em');
      });
      var go = function () {
        var v = 1, low = R[0];
        R.forEach(function (r) { v *= r.i.value / 100; r.e.textContent = r.i.value + ' %'; if (+r.i.value < +low.i.value) low = r; });
        var pc = Math.round(v * 100);
        el.style.setProperty('--fx-q', v);
        el.querySelector('.fx-oe b').textContent = pc + ' %';
        o.textContent = 'À améliorer d\'abord : ' + low[0].toLowerCase();
      };
      box.addEventListener('input', go);
      go();
    }
  });

  // Une ligne d'assemblage : la pièce se complète à chaque poste
  FX.register('assembly-line', {
    setup: function (el) {
      var S = (el.dataset.fxItems || 'Châssis|Moteur|Capot|Contrôle').split('|'), box = U.make('div', 'fx-as2', el), o = U.make('output', '', el), n = 0, done = U.num(el, 'fxStart', 0);
      box.style.setProperty('--fx-n', S.length);
      S.forEach(function (t) { U.make('span', '', box).textContent = t; });
      var p = U.make('i', 'fx-as2-p', box);
      for (var i = 0; i < S.length; i++) U.make('u', '', p).style.setProperty('--fx-i', i);
      el._fxStep = function () {
        n = (n + 1) % (S.length + 1);
        if (n === S.length) { done++; }
        box.style.setProperty('--fx-k', Math.min(n, S.length - 1));
        p.querySelectorAll('u').forEach(function (u, i) { u.classList.toggle('fx-on', i < n); });
        Array.prototype.forEach.call(box.querySelectorAll('span'), function (s, i) { s.classList.toggle('fx-now', i === Math.min(n, S.length - 1)); });
        o.textContent = done + ' pièce' + (done > 1 ? 's' : '') + ' terminée' + (done > 1 ? 's' : '');
      };
      el._fxStep();
      if (!U.reduced) setInterval(el._fxStep, U.num(el, 'fxPace', 1100));
    },
    trigger: function (el) { el._fxStep(); }
  });

  // Le mur de supervision : chaque machine, son état et depuis quand
  FX.register('machine-wall', {
    setup: function (el) {
      var M = (el.dataset.fxItems || 'P1:run|P2:run|P3:stop|P4:run|S1:warn|S2:run|S3:run|R1:run').split('|').map(function (r) { var p = r.split(':'); return { n: p[0], s: p[1], at: Date.now() - U.rand(4, 80) * 60000 }; }), W = { run: 'En marche', warn: 'À surveiller', stop: 'À l\'arrêt' }, box = U.make('div', 'fx-mw', el), o = U.make('output', '', el);
      o.setAttribute('aria-live', 'polite');
      M.forEach(function (m) { m.d = U.make('div', '', box); });
      el._fxShow = function () {
        var bad = 0;
        M.forEach(function (m) {
          var min = Math.round((Date.now() - m.at) / 60000);
          m.d.dataset.s = m.s;
          m.d.innerHTML = '<b>' + m.n + '</b><small>' + W[m.s] + '</small><small>' + min + ' min</small>';
          if (m.s === 'stop') bad++;
        });
        o.textContent = bad ? bad + ' machine' + (bad > 1 ? 's' : '') + ' à l\'arrêt' : 'Tout tourne';
      };
      el._fxFlip = function () {
        var m = M[Math.floor(Math.random() * M.length)];
        m.s = { run: 'warn', warn: 'stop', stop: 'run' }[m.s]; m.at = Date.now();
        el._fxShow();
      };
      el._fxShow();
      setInterval(el._fxShow, 30000);
    },
    trigger: function (el) { el._fxFlip(); }
  });

  // Les quatre temps d'un moteur, avec une vraie bielle
  FX.register('piston-cycle', {
    setup: function (el) {
      var S = ['Admission', 'Compression', 'Combustion', 'Échappement'];
      el.innerHTML = '<svg viewBox="0 0 80 120" aria-hidden="true"><rect class="fx-pi2-c" x="20" y="4" width="40" height="72"/><rect class="fx-pi2-g" x="22" y="6" width="36" height="0"/><rect class="fx-pi2-p" x="22" y="0" width="36" height="16"/><line class="fx-pi2-r" x1="40" y1="0" x2="40" y2="0"/><circle class="fx-pi2-w" cx="40" cy="96" r="20"/><circle class="fx-pi2-h" cx="40" cy="96" r="4"/></svg><output aria-live="off"></output>';
      el._fxP = el.querySelector('.fx-pi2-p'); el._fxR = el.querySelector('.fx-pi2-r'); el._fxG = el.querySelector('.fx-pi2-g'); el._fxH = el.querySelector('.fx-pi2-h'); el._fxO = el.querySelector('output'); el._fxS = S;
      el._fxA = 0;
      el._fxDraw = function (a) {
        var r = 18, L = 52, x = 40 + r * Math.sin(a), y = 96 - r * Math.cos(a), py = y - Math.sqrt(L * L - Math.pow(x - 40, 2)), k = Math.floor((a / (Math.PI * 4)) % 1 * 4);
        el._fxP.setAttribute('y', py - 12);
        el._fxR.setAttribute('x1', 40); el._fxR.setAttribute('y1', py); el._fxR.setAttribute('x2', x); el._fxR.setAttribute('y2', y);
        el._fxH.setAttribute('cx', x); el._fxH.setAttribute('cy', y);
        el._fxG.setAttribute('height', Math.max(0, py - 18));
        el._fxG.setAttribute('class', 'fx-pi2-g k' + k);
        el._fxO.textContent = S[k];
      };
      el._fxDraw(0);
    },
    tick: function (el, dt) { if (U.reduced) return; el._fxA = (el._fxA + dt * U.num(el, 'fxSpeed', 3)) % (Math.PI * 4); el._fxDraw(el._fxA); }
  });

  // Un diagramme de Pareto : les quelques causes qui comptent le plus
  FX.register('defect-pareto', {
    entrance: true,
    setup: function (el) {
      var R = (el.dataset.fxItems || 'Rayures:48|Soudure:31|Cote:12|Couleur:6|Emballage:3').split('|').map(function (r) { var p = r.split(':'); return [p[0], +p[1]]; }).sort(function (a, b) { return b[1] - a[1]; }), tot = R.reduce(function (t, r) { return t + r[1]; }, 0), max = R[0][1], c = 0, line = '', hits = [], h = '';
      R.forEach(function (r, i) {
        c += r[1];
        var q = c / tot, x = (i + .5) / R.length * 100;
        line += (i ? 'L' : 'M') + x + ' ' + (100 - q * 100);
        if (c - r[1] < tot * .8) hits.push(r[0]);
        h += '<div class="' + (c - r[1] < tot * .8 ? 'fx-hit' : '') + '" style="--fx-q:' + r[1] / max + ';--fx-i:' + i + '"><i></i><small>' + r[0] + '</small></div>';
      });
      el.innerHTML = '<div class="fx-dp" aria-hidden="true">' + h + '<svg viewBox="0 0 100 100" preserveAspectRatio="none"><path pathLength="1" d="' + line + '"/></svg></div><p><b>' + hits.join(', ') + '</b> : 80 % des défauts</p>';
    }
  });

  // Une mesure contre sa tolérance : conforme ou non conforme
  FX.register('tolerance-gauge', {
    setup: function (el) {
      var n = U.num(el, 'fxNominal', 25), t = U.num(el, 'fxTol', .05), v = U.num(el, 'fxValue', 25.03);
      el.innerHTML = '<div class="fx-tg2" aria-hidden="true"><i></i><em></em></div><label>Mesure (mm)<input type="number" step=".01" value="' + v + '"></label><output aria-live="polite"></output>';
      var i = el.querySelector('input'), o = el.querySelector('output');
      var go = function () {
        var x = +i.value, d = x - n, ok = Math.abs(d) <= t, q = U.clamp(.5 + d / (t * 4), 0, 1);
        el.style.setProperty('--fx-q', q);
        el.classList.toggle('fx-bad', !ok);
        o.innerHTML = '<b>' + (ok ? 'Conforme' : 'Non conforme') + '</b> · écart ' + (d > 0 ? '+' : '') + d.toFixed(2).replace('.', ',') + ' mm, tolérance ±' + String(t).replace('.', ',') + ' mm';
      };
      i.addEventListener('input', go);
      go();
    }
  });

  // Retrouver le chemin d'un lot, à partir de son numéro
  FX.register('lot-trace', {
    setup: function (el) {
      var D = JSON.parse(el.dataset.fxData || '{"L-2048":["Bois du Jura, 3 mars","Découpe, atelier 2, 5 mars","Assemblage, 9 mars","Contrôle, lot conforme, 10 mars","Expédié à Lyon, 12 mars"]}');
      el.innerHTML = '<form><input placeholder="Numéro de lot" aria-label="Numéro de lot" value="L-2048"><button>Tracer</button></form><ol></ol><output aria-live="polite"></output>';
      var i = el.querySelector('input'), ol = el.querySelector('ol'), o = el.querySelector('output');
      var go = function () {
        var c = D[i.value.trim().toUpperCase()];
        ol.innerHTML = '';
        if (!c) { o.textContent = 'Lot inconnu'; return; }
        c.forEach(function (t, k) { var li = U.make('li', '', ol); li.textContent = t; li.style.setProperty('--fx-i', k); });
        o.textContent = c.length + ' étapes retrouvées (exemple fictif)';
      };
      el.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); go(); });
      go();
    }
  });

  // Le panneau de sécurité : jours sans accident et record
  FX.register('safety-days', {
    entrance: true,
    setup: function (el) {
      var since = el.dataset.fxSince ? new Date(el.dataset.fxSince) : new Date(Date.now() - 86400000 * 412), days = Math.floor((Date.now() - since) / 86400000), rec = Math.max(days, U.num(el, 'fxRecord', 530));
      el.innerHTML = '<small>' + (el.dataset.fxTitle || 'Jours sans accident') + '</small><div class="fx-sd">' + String(days).padStart(4, '0').split('').map(function (d, i) { return '<i style="--fx-i:' + i + '">' + d + '</i>'; }).join('') + '</div><small>Record : ' + rec + ' jours</small>';
      el.setAttribute('aria-label', days + ' jours sans accident, record ' + rec);
      el.setAttribute('role', 'img');
    }
  });

  // Une trajectoire d'outil qui usine une forme, ligne après ligne
  FX.register('cnc-toolpath', {
    entrance: true,
    setup: function (el) {
      var n = U.num(el, 'fxPasses', 14), W = 100, H = 70, d = '', r = 32;
      for (var i = 0; i <= n; i++) {
        var y = 35 - r + (i / n) * r * 2, half = Math.sqrt(Math.max(0, r * r - Math.pow(y - 35, 2))) * 1.3;
        d += (i ? 'L' : 'M') + (i % 2 ? 50 + half : 50 - half).toFixed(1) + ' ' + y.toFixed(1) + 'L' + (i % 2 ? 50 - half : 50 + half).toFixed(1) + ' ' + y.toFixed(1);
      }
      el.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true"><path class="fx-cn-b" d="' + d + '"/><path class="fx-cn-l" pathLength="1" d="' + d + '"/></svg>';
      if (el.dataset.fxLabel) { el.setAttribute('role', 'img'); el.setAttribute('aria-label', el.dataset.fxLabel); }
    }
  });

  // Une pièce qui s'imprime couche après couche
  FX.register('print-layers', {
    setup: function (el) {
      var N = U.num(el, 'fxLayers', 22), H = U.num(el, 'fxHours', 6);
      el.innerHTML = '<div class="fx-pl4" aria-hidden="true"><u></u></div><label>Avancement <input type="range" min="0" max="' + N + '"></label><output aria-live="polite"></output>';
      var box = el.querySelector('.fx-pl4'), r = el.querySelector('input'), o = el.querySelector('output'), head = box.firstChild;
      for (var i = 0; i < N; i++) { var w = Math.sin(i / (N - 1) * Math.PI * .85 + .25); var l = U.make('i', '', box); l.style.width = 30 + w * 65 + '%'; }
      r.value = U.num(el, 'fxValue', 13);
      var go = function () {
        var v = +r.value, L = box.querySelectorAll('i');
        L.forEach(function (x, k) { x.classList.toggle('fx-on', k < v); });
        box.style.setProperty('--fx-q', v / N);
        var h = (N - v) / N * H;
        o.innerHTML = '<b>' + Math.round(v / N * 100) + ' %</b> · ' + (h >= 1 ? Math.floor(h) + ' h ' : '') + String(Math.round(h % 1 * 60)).padStart(2, '0') + ' min restantes';
      };
      r.addEventListener('input', go);
      go();
    },
    trigger: function (el) { var r = el.querySelector('input'); r.value = 0; U.tween(el, 1600, function (p) { r.value = Math.round(p * r.max); r.dispatchEvent(new Event('input')); }); }
  });

  // Un titre soudé : un point lumineux avance et projette des étincelles
  FX.register('weld-sparks', {
    entrance: true,
    setup: function (el) {
      var c = U.make('canvas', '', el), x = c.getContext('2d'), P = [];
      c.setAttribute('aria-hidden', 'true');
      U.ensurePositioned(el);
      var size = function () { var r = el.getBoundingClientRect(), d = window.devicePixelRatio || 1; c.width = r.width * d; c.height = (r.height + 50) * d; c.style.height = (r.height + 50) + 'px'; x = c.getContext('2d'); x.scale(d, d); el._fxW = r.width; el._fxH = r.height; };
      size(); U.onResize(size);
      el._fxP = P;
      el._fxDraw = function (dt) {
        x.clearRect(0, 0, el._fxW, el._fxH + 50);
        if (el._fxQ < 1) {
          el._fxQ = Math.min(1, el._fxQ + dt / 1.5);
          el.style.setProperty('--fx-q', el._fxQ);
          for (var i = 0; i < 5; i++) P.push({ x: el._fxQ * el._fxW, y: el._fxH - 2, vx: U.rand(-110, 110), vy: U.rand(-140, 20), l: U.rand(.2, .7) });
        }
        for (var k = P.length - 1; k >= 0; k--) {
          var p = P[k];
          p.l -= dt; p.vy += 420 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
          if (p.l <= 0) { P.splice(k, 1); continue; }
          x.strokeStyle = 'rgba(255,' + Math.round(150 + p.l * 150) + ',80,' + Math.min(1, p.l * 2) + ')';
          x.beginPath(); x.moveTo(p.x, p.y); x.lineTo(p.x - p.vx * .025, p.y - p.vy * .025); x.stroke();
        }
      };
      el._fxQ = 1;
    },
    enter: function (el) { if (U.reduced) { el.style.setProperty('--fx-q', 1); return; } el._fxQ = 0; },
    tick: function (el, dt) { if (el._fxDraw && !U.reduced) el._fxDraw(dt); },
    trigger: function (el) { el._fxQ = 0; }
  });

  // Une plaque d'acier dont les rivets se posent un à un
  FX.register('rivet-frame', {
    entrance: true,
    setup: function (el) {
      var build = function () {
        el.querySelectorAll('.fx-rvt').forEach(function (r) { r.remove(); });
        var r = el.getBoundingClientRect(), gap = U.num(el, 'fxGap', 34), nx = Math.max(2, Math.round(r.width / gap)), ny = Math.max(2, Math.round(r.height / gap)), k = 0;
        var add = function (x, y) { var i = U.make('i', 'fx-rvt', el); i.setAttribute('aria-hidden', 'true'); i.style.cssText = 'left:' + x + '%;top:' + y + '%;--fx-i:' + k++; };
        for (var a = 0; a <= nx; a++) add(a / nx * 96 + 2, 4);
        for (var b = 1; b <= ny; b++) add(98, b / ny * 92 + 4);
        for (var c = nx - 1; c >= 0; c--) add(c / nx * 96 + 2, 96);
        for (var d = ny - 1; d >= 1; d--) add(2, d / ny * 92 + 4);
      };
      U.ensurePositioned(el);
      build();
      U.onResize(build);
    }
  });

  // Maintenir pour descendre la presse et marquer la pièce
  FX.register('press-stamp', {
    setup: function (el) {
      var F = U.num(el, 'fxForce', 120), T = el.dataset.fxText || 'CE';
      el.innerHTML = '<div class="fx-ps2" aria-hidden="true"><i></i><div><b>' + T + '</b></div></div><button type="button">Maintenir</button><output aria-live="polite"></output>';
      var b = el.querySelector('button'), o = el.querySelector('output'), q = 0, hold = false;
      el._fxTick = function (dt) {
        q = U.clamp(q + (hold ? dt * .9 : -dt * .8), 0, 1);
        el.style.setProperty('--fx-q', q);
        if (q >= 1 && !el.classList.contains('fx-done')) { el.classList.add('fx-done'); o.textContent = 'Pièce marquée'; }
        else if (q < 1 && hold) o.textContent = Math.round(q * F) + ' tonnes';
      };
      var on = function () { hold = true; el.classList.remove('fx-done'); }, off = function () { hold = false; };
      b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointerleave', off);
      b.addEventListener('keydown', function (e) { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); on(); } });
      b.addEventListener('keyup', off);
      el._fxOn = on; el._fxOff = off;
    },
    tick: function (el, dt) { el._fxTick(dt); },
    trigger: function (el) { el._fxOn(); setTimeout(el._fxOff, 1300); }
  });

  // Une cuve et ses deux vannes : le niveau monte ou descend en continu
  FX.register('tank-valve', {
    setup: function (el) {
      var lv = U.num(el, 'fxLevel', 40) / 100;
      el.innerHTML = '<button type="button" class="in" aria-pressed="true">Vanne d\'entrée</button><div class="fx-tv" aria-hidden="true"><i></i></div><button type="button" class="out" aria-pressed="false">Vanne de sortie</button><output aria-live="polite"></output>';
      var bi = el.querySelector('.in'), bo = el.querySelector('.out'), o = el.querySelector('output');
      [bi, bo].forEach(function (b) { b.addEventListener('click', function () { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true'); }); });
      var last = -1;
      el._fxStep = function (dt) {
        var a = bi.getAttribute('aria-pressed') === 'true', c = bo.getAttribute('aria-pressed') === 'true';
        lv = U.clamp(lv + ((a ? .1 : 0) - (c ? .14 : 0)) * dt, 0, 1);
        el.style.setProperty('--fx-q', lv);
        el.classList.toggle('fx-a', a); el.classList.toggle('fx-c', c);
        var v = Math.round(lv * 100);
        if (Math.floor(v / 5) !== last) { last = Math.floor(v / 5); o.textContent = v + ' %' + (v >= 95 ? ', cuve pleine' : v <= 5 ? ', cuve vide' : ''); }
      };
    },
    tick: function (el, dt) { if (el._fxStep) el._fxStep(dt); }
  });

  // Une trieuse : chaque pièce part vers le bon bac
  FX.register('sort-gate', {
    setup: function (el) {
      var T = (el.dataset.fxItems || 'Rouge:#e4432c|Bleu:#2d82d6|Jaune:#e8b71f').split('|').map(function (r) { var p = r.split(':'); return { n: p[0], c: p[1], k: 0 }; }), box = U.make('div', 'fx-sg', el), bins = U.make('div', 'fx-sg-b', el);
      T.forEach(function (t) { t.d = U.make('div', '', bins); t.d.innerHTML = '<b style="color:' + t.c + '">●</b> ' + t.n + ' <em>0</em>'; });
      el._fxGo = function () {
        var t = T[Math.floor(Math.random() * T.length)], i = T.indexOf(t), p = U.make('i', '', box);
        p.style.background = t.c;
        p.style.setProperty('--fx-x', ((i + .5) / T.length * 100) + '%');
        setTimeout(function () { p.remove(); t.k++; t.d.querySelector('em').textContent = t.k; }, U.reduced ? 0 : 1100);
      };
      el._fxGo();
      if (!U.reduced) setInterval(el._fxGo, U.num(el, 'fxEvery', 700));
    },
    trigger: function (el) { el._fxGo(); }
  });

  // Une roue de trois-huit : quelle équipe est en poste maintenant
  FX.register('shift-wheel', {
    setup: function (el) {
      var T = (el.dataset.fxTeams || 'A,B,C').split(','), S = [[6, 14, 'Matin'], [14, 22, 'Après-midi'], [22, 30, 'Nuit']];
      el.innerHTML = '<div class="fx-sw2" aria-hidden="true"><i></i><span>6</span><span>14</span><span>22</span></div><output></output>';
      var o = el.querySelector('output'), hand = el.querySelector('i');
      var go = function () {
        var d = new Date(), h = d.getHours() + d.getMinutes() / 60, h2 = h < 6 ? h + 24 : h, k = S.findIndex(function (s) { return h2 >= s[0] && h2 < s[1]; }), day = Math.floor(d / 86400000), team = T[(k + day) % T.length], left = S[k][1] - h2;
        hand.style.transform = 'rotate(' + h / 24 * 360 + 'deg)';
        o.innerHTML = 'Équipe <b>' + team + '</b>, poste du ' + S[k][2].toLowerCase() + '<br>Relève dans ' + Math.floor(left) + ' h ' + String(Math.round(left % 1 * 60)).padStart(2, '0');
      };
      go();
      setInterval(go, 60000);
    }
  });

  // Un capteur de vibration : le signal dépasse-t-il le seuil ?
  FX.register('vibration-monitor', {
    setup: function (el) {
      var th = U.num(el, 'fxThreshold', .7), c = U.make('canvas', '', el), o = U.make('output', '', el), lv = .32, buf = [], W, H, x;
      o.setAttribute('aria-live', 'polite');
      var size = function () { var r = c.getBoundingClientRect(), d = window.devicePixelRatio || 1; W = r.width; H = r.height; c.width = W * d; c.height = H * d; x = c.getContext('2d'); x.scale(d, d); };
      size(); U.onResize(size);
      var state = '';
      el._fxBoost = function () { lv = .85; };
      el._fxDraw = function (t, dt) {
        lv = U.clamp(lv + U.rand(-.02, .025) * dt * 30, .15, 1);
        var v = Math.sin(t * 34) * lv * U.rand(.5, 1);
        buf.push(v);
        if (buf.length > W) buf.shift();
        x.clearRect(0, 0, W, H);
        x.strokeStyle = '#ffffff33'; x.setLineDash([3, 3]);
        [-1, 1].forEach(function (s) { x.beginPath(); x.moveTo(0, H / 2 - s * th * H / 2); x.lineTo(W, H / 2 - s * th * H / 2); x.stroke(); });
        x.setLineDash([]);
        x.strokeStyle = lv > th ? '#ff5147' : '#45e08b';
        x.beginPath();
        buf.forEach(function (b, i) { var y = H / 2 - b * H / 2; if (i) x.lineTo(i, y); else x.moveTo(i, y); });
        x.stroke();
        var s = lv > th ? 'Alerte : au-dessus du seuil' : 'Niveau normal';
        if (s !== state) { state = s; o.textContent = s; el.classList.toggle('fx-al', lv > th); }
      };
    },
    tick: function (el, dt, t) { if (el._fxDraw && !U.reduced) el._fxDraw(t, dt); },
    trigger: function (el) { el._fxBoost(); }
  });

  // Le stock en dents de scie : le seuil de commande fait tout
  FX.register('reorder-point', {
    setup: function (el) {
      el.innerHTML = '<svg viewBox="0 0 200 80" preserveAspectRatio="none" aria-hidden="true"><line x1="0" x2="200"/><path/></svg><label>Seuil de commande <b></b><input type="range" min="0" max="60"></label><output aria-live="polite"></output>';
      var r = el.querySelector('input'), P = el.querySelector('path'), L = el.querySelector('line'), o = el.querySelector('output'), U2 = U.num(el, 'fxUse', 4), lead = U.num(el, 'fxLead', 6), top = 100;
      r.value = U.num(el, 'fxPoint', 28);
      var go = function () {
        var th = +r.value, s = top, wait = -1, zero = 0, d = 'M0 ' + (80 - s * .78);
        for (var i = 1; i <= 60; i++) {
          s = Math.max(0, s - U2);
          if (s === 0) zero++;
          if (wait === 0) { s = Math.min(100, s + 70); wait = -1; }
          else if (wait > 0) wait--;
          else if (s <= th) wait = lead;
          d += 'L' + (i / 60 * 200).toFixed(1) + ' ' + (80 - s * .78).toFixed(1);
        }
        P.setAttribute('d', d);
        L.setAttribute('y1', 80 - th * .78); L.setAttribute('y2', 80 - th * .78);
        el.querySelector('label b').textContent = th;
        el.classList.toggle('fx-out', zero > 0);
        o.textContent = zero ? 'Rupture sur ' + zero + ' jours' : 'Pas de rupture avec ce seuil';
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Une nomenclature en arbre : les coûts remontent vers le produit
  FX.register('bom-tree', {
    setup: function (el) {
      var T = el.dataset.fxTree ? JSON.parse(el.dataset.fxTree) : { n: 'Lampe', c: [{ n: 'Tête', c: [{ n: 'Ampoule', v: 4 }, { n: 'Abat-jour', v: 9 }] }, { n: 'Pied', c: [{ n: 'Tube', v: 6 }, { n: 'Socle', v: 7 }] }, { n: 'Câble', v: 3 }] };
      var cost = function (x) { return x.c ? x.c.reduce(function (t, y) { return t + cost(y); }, 0) : x.v; };
      var draw = function (x, p, top) {
        var li = U.make('li', '', p), val = cost(x);
        if (x.c) {
          var b = U.make('button', '', li), ul = U.make('ul', '', li);
          b.type = 'button'; b.setAttribute('aria-expanded', top);
          b.innerHTML = '<i aria-hidden="true"></i><span>' + x.n + '</span><b>' + val + ' €</b>';
          b.addEventListener('click', function () { b.setAttribute('aria-expanded', b.getAttribute('aria-expanded') !== 'true'); });
          x.c.forEach(function (y) { draw(y, ul, false); });
        } else li.innerHTML = '<div><span>' + x.n + '</span><b>' + val + ' €</b></div>';
      };
      draw(T, U.make('ul', 'fx-bt', el), true);
    }
  });

  // Des certifications sous forme de sceaux, avec leur vraie validité
  FX.register('cert-badges', {
    entrance: true,
    setup: function (el) {
      var C = (el.dataset.fxItems || 'Norme A:2028-06-30|Norme B:2027-02-01|Norme C:2026-01-15').split('|').map(function (r) { var p = r.split(':'); return [p[0], new Date(p[1])]; }), now = Date.now();
      C.forEach(function (c, i) {
        var left = (c[1] - now) / 86400000, d = U.make('div', left < 0 ? 'fx-exp' : left < 90 ? 'fx-soon' : '', el);
        d.style.setProperty('--fx-i', i);
        d.innerHTML = '<i aria-hidden="true"></i><b>' + c[0] + '</b><small>' + (left < 0 ? 'Expirée' : 'Valide jusqu\'au ' + c[1].toLocaleDateString('fr-FR')) + '</small>';
      });
      U.make('p', '', el).textContent = 'Noms fictifs : affichez vos vraies certifications.';
    }
  });

  // La couleur de l'acier selon sa température
  FX.register('steel-glow', {
    setup: function (el) {
      var T = [[400, '#3a3a3e', 'Pas de couleur visible'], [600, '#54201a', 'Rouge sombre'], [750, '#b52a16', 'Rouge cerise'], [900, '#ee5a18', 'Orange'], [1100, '#ffb030', 'Jaune'], [1300, '#fff0b8', 'Blanc jaune']];
      el.innerHTML = '<div class="fx-sg2" aria-hidden="true"></div><label>Température <b></b><input type="range" min="400" max="1300" step="10"></label><output aria-live="polite"></output>';
      var r = el.querySelector('input'), o = el.querySelector('output');
      r.value = U.num(el, 'fxTemp', 850);
      var mix = function (a, b, q) { var p = function (h, i) { return parseInt(h.slice(i, i + 2), 16); }, f = function (i) { return Math.round(p(a, i) + (p(b, i) - p(a, i)) * q); }; return 'rgb(' + f(1) + ',' + f(3) + ',' + f(5) + ')'; };
      var go = function () {
        var v = +r.value, k = 0;
        while (k < T.length - 2 && v > T[k + 1][0]) k++;
        var q = (v - T[k][0]) / (T[k + 1][0] - T[k][0]);
        el.style.setProperty('--fx-c', mix(T[k][1], T[k + 1][1], U.clamp(q, 0, 1)));
        el.querySelector('label b').textContent = v + ' °C';
        o.textContent = T[q > .5 ? k + 1 : k][2];
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Une clé dynamométrique : serrer jusqu'au clic, sans dépasser
  FX.register('torque-click', {
    setup: function (el) {
      var target = U.num(el, 'fxTarget', 60);
      el.innerHTML = '<div class="fx-tq" aria-hidden="true"><i></i><em></em></div><button type="button">Serrer</button><output aria-live="polite">Réglage : ' + target + ' N·m</output>';
      var b = el.querySelector('button'), o = el.querySelector('output'), v = 0, hold = false, clicked = false;
      el.style.setProperty('--fx-t', target / 100);
      el._fxStep = function (dt) {
        if (!hold) return;
        v = Math.min(100, v + dt * 28);
        el.style.setProperty('--fx-q', v / 100);
        if (!clicked && v >= target) { clicked = true; el.classList.add('fx-click'); o.textContent = 'Clic : ' + target + ' N·m atteints'; }
        if (v > target + 8) { el.classList.add('fx-over'); o.textContent = 'Trop serré : ' + Math.round(v) + ' N·m'; }
      };
      var on = function () { hold = true; v = 0; clicked = false; el.classList.remove('fx-click', 'fx-over'); }, off = function () { hold = false; };
      b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointerleave', off);
      b.addEventListener('keydown', function (e) { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); on(); } });
      b.addEventListener('keyup', off);
      el._fxOn = on; el._fxOff = off;
    },
    tick: function (el, dt) { if (el._fxStep) el._fxStep(dt); },
    trigger: function (el) { el._fxOn(); setTimeout(el._fxOff, 2300); }
  });

  // Une pièce qui s'éclate en composants nommés
  FX.register('part-explode', {
    setup: function (el) {
      var P = (el.dataset.fxItems || 'Vis|Rondelle|Ressort|Corps|Joint|Écrou').split('|'), box = U.make('div', 'fx-pe', el), b = U.make('button', 'fx-pe-t', el), o = U.make('output', '', el);
      o.setAttribute('aria-live', 'polite');
      o.textContent = P.length + ' composants';
      P.forEach(function (t, i) {
        var p = U.make('button', 'p' + (i % 3), box);
        p.type = 'button'; p.setAttribute('aria-label', t); p.title = t;
        p.style.setProperty('--fx-i', i - (P.length - 1) / 2);
        var say = function () { o.textContent = t; };
        p.addEventListener('mouseenter', say); p.addEventListener('focus', say); p.addEventListener('click', say);
      });
      b.type = 'button'; b.setAttribute('aria-pressed', 'false'); b.textContent = 'Vue éclatée';
      var set = function (v) { el.classList.toggle('fx-on', v); b.setAttribute('aria-pressed', v); b.textContent = v ? 'Vue assemblée' : 'Vue éclatée'; };
      b.addEventListener('click', function () { set(!el.classList.contains('fx-on')); });
      el._fxSet = set;
      set(el.dataset.fxOn !== 'false');
    },
    trigger: function (el) { el._fxSet(!el.classList.contains('fx-on')); }
  });

  // Le rythme d'une ligne : temps disponible divisé par la demande
  FX.register('takt-time', {
    setup: function (el) {
      el.innerHTML = '<div class="fx-tk3" aria-hidden="true"><i></i></div><label>Demande par jour <b></b><input type="range" min="100" max="2000" step="50"></label><output aria-live="polite"></output>';
      var r = el.querySelector('input'), o = el.querySelector('output'), M = U.num(el, 'fxMinutes', 450) * 60;
      r.value = U.num(el, 'fxDemand', 600);
      var go = function () {
        var d = +r.value, t = M / d;
        el.style.setProperty('--fx-sp', Math.max(.25, t / 12) + 's');
        el.querySelector('label b').textContent = d;
        o.innerHTML = 'Une pièce toutes les <b>' + t.toFixed(1).replace('.', ',') + ' s</b>';
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Un bras robotisé qui cherche à atteindre le pointeur
  FX.register('robot-arm', {
    setup: function (el) {
      el.setAttribute('aria-hidden', 'true');
      var A = 62, B = 52, cx = 90, cy = 120;
      el.innerHTML = '<svg viewBox="0 0 180 130"><rect x="70" y="118" width="40" height="10" rx="2"/><line class="u"/><line class="v"/><circle class="j1" r="7"/><circle class="j2" r="5"/><path class="g"/></svg>';
      var s = el.querySelector('svg'), lu = el.querySelector('.u'), lv = el.querySelector('.v'), j1 = el.querySelector('.j1'), j2 = el.querySelector('.j2'), g = el.querySelector('.g'), tx = 140, ty = 40, x = tx, y = ty;
      j1.setAttribute('cx', cx); j1.setAttribute('cy', cy);
      el._fxPlace = function (px, py) { tx = px; ty = py; };
      s.addEventListener('pointermove', function (e) { var r = s.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width * 180; ty = (e.clientY - r.top) / r.height * 130; });
      el._fxStep = function () {
        x += (tx - x) * .12; y += (ty - y) * .12;
        var dx = x - cx, dy = y - cy, d = U.clamp(Math.hypot(dx, dy), Math.abs(A - B) + 2, A + B - 2), base = Math.atan2(dy, dx), a = Math.acos((A * A + d * d - B * B) / (2 * A * d)), t = base - a, ex = cx + A * Math.cos(t), ey = cy + A * Math.sin(t), fx = cx + d * Math.cos(base), fy = cy + d * Math.sin(base);
        lu.setAttribute('x1', cx); lu.setAttribute('y1', cy); lu.setAttribute('x2', ex); lu.setAttribute('y2', ey);
        lv.setAttribute('x1', ex); lv.setAttribute('y1', ey); lv.setAttribute('x2', fx); lv.setAttribute('y2', fy);
        j2.setAttribute('cx', ex); j2.setAttribute('cy', ey);
        g.setAttribute('d', 'M' + (fx - 6) + ' ' + (fy + 8) + 'L' + fx + ' ' + fy + 'L' + (fx + 6) + ' ' + (fy + 8));
      };
      el._fxStep();
    },
    tick: function (el, dt, t) {
      if (U.reduced) return;
      if (!el.matches(':hover')) el._fxPlace(90 + Math.sin(t * .9) * 60, 54 + Math.cos(t * 1.3) * 26);
      el._fxStep();
    }
  });
})(window.FX);

/* Pack 34 — Agriculture */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Un calendrier de cultures : ce qu'on sème et récolte ce mois-ci
  FX.register('crop-calendar', {
    entrance: true,
    setup: function (el) {
      var R = (el.dataset.fxItems || 'Tomate:3-5:7-9|Carotte:2-6:6-10|Courge:4-5:9-10|Ail:10-11:6-7|Blé:9-10:6-7').split('|').map(function (r) { var p = r.split(':'); return [p[0], p[1].split('-').map(Number), p[2].split('-').map(Number)]; }), now = new Date().getMonth() + 1, L = 'JFMAMJJASOND', h = '<span></span>', todo = [];
      L.split('').forEach(function (m, i) { h += '<b class="' + (i + 1 === now ? 'fx-now' : '') + '">' + m + '</b>'; });
      R.forEach(function (r, y) {
        h += '<span>' + r[0] + '</span>';
        for (var i = 1; i <= 12; i++) {
          var s = i >= r[1][0] && i <= r[1][1], c = i >= r[2][0] && i <= r[2][1];
          h += '<i class="' + (s ? 's' : c ? 'c' : '') + (i === now ? ' fx-now' : '') + '" style="--fx-i:' + (i + y) + '"></i>';
          if (i === now && s) todo.push('semer ' + r[0].toLowerCase());
          if (i === now && c) todo.push('récolter ' + r[0].toLowerCase());
        }
      });
      el.innerHTML = '<div class="fx-cc2" aria-hidden="true">' + h + '</div><p class="fx-cc2-l"><i class="s"></i> Semis <i class="c"></i> Récolte</p><p>' + (todo.length ? 'Ce mois-ci : ' + todo.join(', ') : 'Rien à faire ce mois-ci dans cet exemple') + '</p>';
    }
  });

  // Des parcelles dont les cultures tournent d'année en année
  FX.register('field-rotation', {
    setup: function (el) {
      var C = (el.dataset.fxItems || 'Blé:#d6b34a|Colza:#e6d928|Maïs:#e2a22e|Trèfle:#5aa35c').split('|').map(function (r) { return r.split(':'); }), box = U.make('div', 'fx-fr', el), cur = new Date().getFullYear();
      el.insertAdjacentHTML('beforeend', '<label>Année <input type="range" min="' + cur + '" max="' + (cur + 7) + '"></label><output aria-live="polite"></output>');
      C.forEach(function () { U.make('i', '', box); });
      var r = el.querySelector('input'), o = el.querySelector('output');
      r.value = cur;
      var go = function () {
        var y = +r.value - cur, names = [];
        Array.prototype.forEach.call(box.children, function (p, i) {
          var c = C[(i + y) % C.length];
          p.textContent = c[0]; p.style.background = c[1];
          names.push('parcelle ' + (i + 1) + ' : ' + c[0].toLowerCase());
        });
        o.textContent = r.value + ' · ' + names.join(', ');
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Une grille de capteurs : quelles zones ont besoin d'eau ?
  FX.register('moisture-grid', {
    setup: function (el) {
      var D = (el.dataset.fxData || '62,48,22,35,70,28,18,55,41,66,30,25').split(',').map(Number), th = U.num(el, 'fxMin', 35), box = U.make('div', 'fx-mg2', el), b = U.make('button', '', el), o = U.make('output', '', el);
      o.setAttribute('aria-live', 'polite');
      b.type = 'button'; b.textContent = 'Arroser les zones sèches';
      D.forEach(function (v, i) { var c = U.make('i', '', box); c.setAttribute('role', 'img'); });
      var show = function () {
        var dry = 0;
        Array.prototype.forEach.call(box.children, function (c, i) {
          var v = D[i];
          c.style.setProperty('--fx-q', v / 100);
          c.textContent = v;
          c.setAttribute('aria-label', 'Zone ' + (i + 1) + ', ' + v + ' %');
          c.classList.toggle('fx-dry', v < th);
          if (v < th) dry++;
        });
        o.textContent = dry ? dry + ' zones sous ' + th + ' %' : 'Sol bien hydraté partout';
        b.disabled = !dry;
      };
      b.addEventListener('click', function () {
        box.classList.add('fx-rain');
        D.forEach(function (v, i) { if (v < th) D[i] = th + U.rand(10, 24) | 0; });
        show();
        setTimeout(function () { box.classList.remove('fx-rain'); }, U.reduced ? 0 : 900);
      });
      show();
    }
  });

  // Un pluviomètre : la semaine de pluie face à la normale
  FX.register('rain-gauge', {
    entrance: true,
    setup: function (el) {
      var D = (el.dataset.fxData || '2,0,6,14,3,0,8').split(',').map(Number), norm = U.num(el, 'fxNormal', 22), tot = D.reduce(function (a, b) { return a + b; }, 0), max = Math.max(tot, norm) * 1.2, L = 'LMMJVSD', h = '';
      D.forEach(function (v, i) { h += '<span><i style="--fx-q:' + v / Math.max.apply(null, D) + ';--fx-i:' + i + '"></i><small>' + L[i] + '</small></span>'; });
      el.style.setProperty('--fx-t', tot / max); el.style.setProperty('--fx-n', norm / max);
      el.innerHTML = '<div class="fx-rg2" aria-hidden="true"><i></i><em></em></div><div class="fx-rg2-w" aria-hidden="true">' + h + '</div><p><b>' + tot + ' mm</b> cette semaine, ' + (tot >= norm ? '+' : '') + (tot - norm) + ' mm par rapport à la normale</p>';
    }
  });

  // Surface, rendement, prix : ce que donnera la récolte
  FX.register('harvest-yield', {
    setup: function (el) {
      var P = U.num(el, 'fxPrice', 230), R = [['Surface', 'a', 5, 200, 5, 40, 'ha'], ['Rendement', 'y', 20, 110, 5, 70, 'q/ha']], h = '';
      R.forEach(function (r) { h += '<label>' + r[0] + ' <b data-o="' + r[1] + '"></b><input data-k="' + r[1] + '" type="range" min="' + r[2] + '" max="' + r[3] + '" step="' + r[4] + '" value="' + r[5] + '"></label>'; });
      el.innerHTML = h + '<div class="fx-hy" aria-hidden="true"></div><output aria-live="polite"></output><small>Prix d\'exemple : ' + P + ' €/t.</small>';
      var box = el.querySelector('.fx-hy'), o = el.querySelector('output');
      for (var i = 0; i < 30; i++) U.make('i', '', box).style.setProperty('--fx-i', i);
      var g = function (k) { return +el.querySelector('[data-k=' + k + ']').value; };
      var go = function () {
        var a = g('a'), y = g('y'), t = a * y / 10;
        el.querySelector('[data-o=a]').textContent = a + ' ha'; el.querySelector('[data-o=y]').textContent = y + ' q/ha';
        var n = Math.round(Math.min(1, t / 800) * 30);
        Array.prototype.forEach.call(box.children, function (e, i) { e.classList.toggle('fx-on', i < n); });
        o.innerHTML = '<b>' + Math.round(t).toLocaleString('fr-FR') + ' t</b> · environ ' + Math.round(t * P).toLocaleString('fr-FR') + ' €';
      };
      el.addEventListener('input', go);
      go();
    }
  });

  // Un tracteur traverse le titre et le fait apparaître dans ses sillons
  FX.register('tractor-plow', {
    entrance: true,
    setup: function (el) {
      var t = el.innerHTML;
      el.innerHTML = '<span class="fx-tw" aria-hidden="true">' + t + '</span><span class="fx-tw-s">' + t + '</span><i class="fx-tw-t" aria-hidden="true"><b></b><u></u></i>';
      U.ensurePositioned(el);
    }
  });

  // Du grain à la plante : faire avancer les jours
  FX.register('sprout-stages', {
    setup: function (el) {
      var S = (el.dataset.fxItems || '0:Graine|7:Germination|14:Plantule|30:Croissance|60:Fleur|80:Récolte').split('|').map(function (r) { var p = r.split(':'); return [+p[0], p[1]]; });
      el.innerHTML = '<svg viewBox="0 0 80 100" aria-hidden="true"><rect x="0" y="74" width="80" height="26"/><ellipse class="seed" cx="40" cy="80" rx="5" ry="3.5"/><path class="st" d="M40 78V74"/><path class="l l1" d="M40 58C30 56 26 50 26 46C34 46 40 52 40 58Z"/><path class="l l2" d="M40 46C50 44 54 38 54 34C46 34 40 40 40 46Z"/><circle class="fl" cx="40" cy="16" r="9"/></svg><label>Jour <b></b><input type="range" min="0" max="' + S[S.length - 1][0] + '"></label><output aria-live="polite"></output>';
      var r = el.querySelector('input'), o = el.querySelector('output'), st = el.querySelector('.st');
      r.value = U.num(el, 'fxDay', 18);
      var go = function () {
        var d = +r.value, k = 0, q = d / S[S.length - 1][0];
        S.forEach(function (s, i) { if (d >= s[0]) k = i; });
        st.setAttribute('d', 'M40 78V' + (74 - q * 56).toFixed(1));
        el.dataset.fxK = k;
        el.querySelector('label b').textContent = d;
        o.textContent = S[k][1];
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Composer son panier de saison, avec le poids de ce qu'on y met
  FX.register('veg-basket', {
    setup: function (el) {
      var P = (el.dataset.fxItems || 'Carottes:1:2.5|Poireaux:1:3|Courge:1.5:3.2|Pommes:1:2.8|Œufs:0.4:2.6').split('|').map(function (r) { var p = r.split(':'); return { n: p[0], w: +p[1], e: +p[2], q: 0 }; }), max = U.num(el, 'fxMax', 5), ul = U.make('ul', '', el), v = U.make('div', 'fx-vb', el), o = U.make('output', '', el);
      v.setAttribute('aria-hidden', 'true');
      o.setAttribute('aria-live', 'polite');
      var show = function () {
        var w = 0, e = 0;
        P.forEach(function (p) { w += p.w * p.q; e += p.e * p.q; p.t.textContent = p.q; p.b.disabled = !p.q; });
        el.style.setProperty('--fx-q', Math.min(1, w / max));
        el.classList.toggle('fx-full', w > max);
        o.innerHTML = '<b>' + e.toFixed(2).replace('.', ',') + ' €</b> · ' + String(w.toFixed(1)).replace('.', ',') + ' kg sur ' + max + ' kg' + (w > max ? ' : panier trop lourd' : '');
      };
      P.forEach(function (p) {
        var li = U.make('li', '', ul);
        li.innerHTML = '<span>' + p.n + '</span><button type="button" aria-label="Retirer ' + p.n + '">−</button><b></b><button type="button" aria-label="Ajouter ' + p.n + '">+</button>';
        var B = li.querySelectorAll('button');
        p.t = li.querySelector('b'); p.b = B[0];
        B[0].addEventListener('click', function () { p.q--; show(); });
        B[1].addEventListener('click', function () { p.q++; show(); });
      });
      show();
    }
  });

  // La distance parcourue par un aliment : à côté ou depuis l'autre bout du monde
  FX.register('food-miles', {
    entrance: true,
    setup: function (el) {
      var R = (el.dataset.fxItems || 'Ferme voisine:35:0.1|Région:220:0.25|Espagne:1500:0.9|Autre continent:9800:3.2').split('|').map(function (r) { var p = r.split(':'); return [p[0], +p[1], +p[2]]; }), max = Math.max.apply(null, R.map(function (r) { return r[1]; })), ul = U.make('ul', '', el);
      R.forEach(function (r, i) {
        var li = U.make('li', '', ul);
        li.style.setProperty('--fx-q', Math.max(.015, Math.log(r[1] + 1) / Math.log(max + 1)));
        li.style.setProperty('--fx-i', i);
        li.innerHTML = '<span>' + r[0] + '</span><i></i><b>' + r[1].toLocaleString('fr-FR') + ' km</b><small>' + String(r[2]).replace('.', ',') + ' kg CO₂</small>';
      });
      U.make('p', '', el).textContent = 'Valeurs fictives. Échelle logarithmique : les grandes distances sont compressées.';
    }
  });

  // Descendre dans le sol pour lire chacune de ses couches
  FX.register('soil-layers', {
    setup: function (el) {
      var L = (el.dataset.fxItems || 'Litière:5:#3a2a18:Feuilles et débris|Humus:25:#2c1c0f:Riche en vers de terre|Terre arable:45:#6b4a2d:Racines des cultures|Sous-sol:80:#a77c4e:Argile et minéraux|Roche:120:#7b7b78:Roche mère').split('|').map(function (r) { return r.split(':'); }), max = 120;
      el.innerHTML = '<div class="fx-sl2" aria-hidden="true"><u></u></div><label>Profondeur <b></b><input type="range" min="0" max="' + max + '" step="5"></label><output aria-live="polite"></output>';
      var box = el.firstChild, r = el.querySelector('input'), o = el.querySelector('output'), prev = 0;
      L.forEach(function (l) { var i = U.make('i', '', box); i.style.flex = (l[1] - prev) + ' 1 0'; i.style.background = l[2]; prev = +l[1]; });
      r.value = U.num(el, 'fxDepth', 30);
      var go = function () {
        var d = +r.value, cur = L.filter(function (l) { return d <= +l[1]; })[0] || L[L.length - 1];
        box.style.setProperty('--fx-q', d / max);
        el.querySelector('label b').textContent = d + ' cm';
        o.innerHTML = '<b>' + cur[0] + '</b><br>' + cur[3];
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Un pH de sol : la couleur et les plantes qui s'y plaisent
  FX.register('ph-meter', {
    setup: function (el) {
      var C = (el.dataset.fxItems || 'Myrtille:4.5:5.5|Pomme de terre:5:6|Tomate:6:6.8|Carotte:6:7|Chou:6.5:7.5|Lavande:6.5:8').split('|').map(function (r) { var p = r.split(':'); return [p[0], +p[1], +p[2]]; });
      el.innerHTML = '<div class="fx-ph" aria-hidden="true"><i></i></div><label>pH <input type="range" min="4" max="9" step=".1"></label><output aria-live="polite"></output>';
      var r = el.querySelector('input'), o = el.querySelector('output');
      r.value = U.num(el, 'fxValue', 6.4);
      var go = function () {
        var v = +r.value, ok = C.filter(function (c) { return v >= c[1] && v <= c[2]; }).map(function (c) { return c[0]; }), w = v < 6 ? 'Sol acide' : v > 7.5 ? 'Sol basique' : 'Sol neutre';
        el.style.setProperty('--fx-q', (v - 4) / 5);
        o.innerHTML = '<b>' + String(v.toFixed(1)).replace('.', ',') + ' · ' + w + '</b><br>' + (ok.length ? ok.join(', ') : 'Peu de cultures de cet exemple');
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Un rayon de ruche qui se remplit de miel, alvéole par alvéole
  FX.register('honeycomb-fill', {
    entrance: true,
    setup: function (el) {
      var R = U.num(el, 'fxRows', 5), C = U.num(el, 'fxCols', 6), v = U.num(el, 'fxValue', 64), box = U.make('div', 'fx-hc2', el), A = [];
      box.setAttribute('aria-hidden', 'true');
      for (var y = 0; y < R; y++) {
        var row = U.make('div', y % 2 ? 'fx-odd' : '', box);
        for (var x = 0; x < C; x++) { var c = U.make('i', '', row); A.push({ e: c, d: Math.hypot(x - C / 2, y - R / 2) }); }
      }
      A.sort(function (a, b) { return a.d - b.d; });
      var n = Math.round(A.length * v / 100);
      A.forEach(function (a, i) { a.e.style.setProperty('--fx-i', i); if (i < n) a.e.classList.add('fx-on'); });
      var o = U.make('p', '', el);
      o.textContent = el.dataset.fxText || v + ' % de la récolte';
    }
  });

  // Un troupeau qui rentre à l'enclos d'un geste
  FX.register('flock-gather', {
    setup: function (el) {
      var n = U.num(el, 'fxCount', 22), box = U.make('div', 'fx-fg', el), b = U.make('button', '', el), S = [];
      box.setAttribute('aria-hidden', 'true');
      U.make('em', '', box);
      for (var i = 0; i < n; i++) { var s = U.make('i', '', box); S.push({ e: s, x: U.rand(5, 92), y: U.rand(10, 86), h: U.rand(0, 6.28) }); }
      b.type = 'button'; b.textContent = 'Rentrer le troupeau'; b.setAttribute('aria-pressed', 'false');
      el._fxIn = false;
      b.addEventListener('click', function () { el._fxIn = !el._fxIn; b.setAttribute('aria-pressed', el._fxIn); b.textContent = el._fxIn ? 'Sortir le troupeau' : 'Rentrer le troupeau'; });
      el._fxS = S;
      el._fxDraw = function (dt) {
        S.forEach(function (s, i) {
          if (el._fxIn) { var tx = 78 + (i % 5) * 4, ty = 66 + (i % 4) * 7; s.x += (tx - s.x) * dt * 2; s.y += (ty - s.y) * dt * 2; }
          else { s.h += U.rand(-.5, .5) * dt * 3; s.x = U.clamp(s.x + Math.cos(s.h) * dt * 3, 3, 96); s.y = U.clamp(s.y + Math.sin(s.h) * dt * 3, 8, 90); }
          s.e.style.left = s.x + '%'; s.e.style.top = s.y + '%';
        });
      };
      el._fxDraw(0);
    },
    tick: function (el, dt) { if (!U.reduced) el._fxDraw(dt); else el._fxDraw(0); },
    trigger: function (el) { el.querySelector('button').click(); }
  });

  // Un verger qui pousse rang après rang
  FX.register('orchard-grow', {
    entrance: true,
    setup: function (el) {
      var C = U.num(el, 'fxCols', 8), R = U.num(el, 'fxRows', 4), v = U.num(el, 'fxValue', 0) || C * R, box = U.make('div', 'fx-og', el);
      box.style.setProperty('--fx-c', C);
      box.setAttribute('aria-hidden', 'true');
      for (var y = 0; y < R; y++) for (var x = 0; x < C; x++) {
        var t = U.make('i', '', box);
        t.style.setProperty('--fx-i', x + y * 1.5);
        t.style.setProperty('--fx-s', U.rand(.78, 1.05).toFixed(2));
      }
      U.make('p', '', el).textContent = el.dataset.fxText || v + ' arbres plantés';
    }
  });

  // Les prochaines nuits : y a-t-il un risque de gel ?
  FX.register('frost-alert', {
    setup: function (el) {
      var D = (el.dataset.fxData || '4,2,-1,-3,0,3,5').split(',').map(Number), th = U.num(el, 'fxMin', 0), box = U.make('div', 'fx-fa', el), cold = [], now = Date.now();
      D.forEach(function (v, i) {
        var d = new Date(now + i * 86400000), c = U.make('div', v < th ? 'fx-f' : '', box);
        c.innerHTML = '<small>' + d.toLocaleDateString('fr-FR', { weekday: 'short' }) + '</small><b>' + v + '°</b><i aria-hidden="true"></i>';
        c.style.setProperty('--fx-i', i);
        if (v < th) cold.push(v);
      });
      var o = U.make('p', '', el);
      o.setAttribute('role', cold.length ? 'alert' : 'status');
      o.textContent = cold.length ? cold.length + ' nuits sous ' + th + ' °C, jusqu\'à ' + Math.min.apply(null, cold) + ' °C : protégez les jeunes plants.' : 'Pas de gel annoncé.';
      U.make('small', '', el).textContent = 'Prévisions fictives';
    }
  });

  // Des degrés qui s'accumulent jusqu'à la récolte
  FX.register('degree-days', {
    entrance: true,
    setup: function (el) {
      var base = U.num(el, 'fxBase', 10), need = U.num(el, 'fxNeed', 2200), D = (el.dataset.fxData || '14,17,20,23,24,26,27,26,24,20').split(',').map(Number), per = 15, tot = 0, h = '';
      D.forEach(function (t, i) { var g = Math.max(0, t - base) * per; tot += g; h += '<i style="--fx-q:' + Math.min(1, tot / need) + ';--fx-i:' + i + '"></i>'; });
      var last = Math.max(1, D[D.length - 1] - base), left = Math.max(0, need - tot), d = new Date(Date.now() + left / last * 86400000);
      el.innerHTML = '<div class="fx-dd2" aria-hidden="true">' + h + '</div><p><b>' + Math.round(tot) + '</b> degrés-jours sur ' + need + '<br>' + (left ? 'Récolte estimée vers le ' + d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) : 'Maturité atteinte') + '</p>';
    }
  });

  // Un champ de blé qui ondule au vent et s'écarte sous le pointeur
  FX.register('wheat-field', {
    setup: function (el) {
      var c = U.make('canvas', '', el), x, W, H, S = [], mx = -999;
      el.setAttribute('aria-hidden', 'true');
      var size = function () {
        var r = el.getBoundingClientRect(), d = window.devicePixelRatio || 1;
        W = r.width; H = r.height; c.width = W * d; c.height = H * d;
        x = c.getContext('2d'); x.scale(d, d); S = [];
        for (var i = 0; i < Math.round(W / 2.4); i++) S.push({ x: U.rand(0, W), h: U.rand(H * .5, H * .9), t: U.rand(0, 6) });
        S.sort(function (a, b) { return a.h - b.h; });
      };
      size(); U.onResize(size);
      el.addEventListener('pointermove', function (e) { mx = e.clientX - el.getBoundingClientRect().left; });
      el.addEventListener('pointerleave', function () { mx = -999; });
      el._fxDraw = function (t) {
        x.clearRect(0, 0, W, H);
        S.forEach(function (s) {
          var l = Math.sin(s.x * .03 + t * 1.6 + s.t * .1) * 9, dx = s.x - mx;
          if (Math.abs(dx) < 34) l += (dx > 0 ? 1 : -1) * (34 - Math.abs(dx)) * .55;
          var top = H - s.h, c1 = s.x + l * .4;
          x.strokeStyle = '#c2a03f'; x.lineWidth = 1.1;
          x.beginPath(); x.moveTo(s.x, H); x.quadraticCurveTo(c1, top + s.h * .4, s.x + l, top); x.stroke();
          x.fillStyle = '#e5c66a';
          x.beginPath(); x.ellipse(s.x + l, top - 3, 1.8, 5, l * .03, 0, 6.3); x.fill();
        });
      };
      el._fxDraw(0);
    },
    tick: function (el, dt, t) { if (!U.reduced) el._fxDraw(t); }
  });

  // Des oiseaux posés qui s'envolent quand on approche
  FX.register('crow-scatter', {
    setup: function (el) {
      var n = U.num(el, 'fxCount', 9), box = U.make('div', 'fx-cw2', el), B = [];
      box.setAttribute('aria-hidden', 'true');
      U.make('em', '', box);
      for (var i = 0; i < n; i++) {
        var o = U.make('i', '', box);
        o.style.left = (i + .5) / n * 100 + '%';
        o.style.setProperty('--fx-x', U.rand(-90, 90) + 'px');
        o.style.setProperty('--fx-y', U.rand(-140, -70) + 'px');
        o.style.setProperty('--fx-d', U.rand(0, 140).toFixed(0) + 'ms');
        B.push(o);
      }
      var fly = function () {
        el.classList.add('fx-fly');
        clearTimeout(el._fxTo);
        el._fxTo = setTimeout(function () { el.classList.remove('fx-fly'); }, U.num(el, 'fxBack', 2400));
      };
      box.addEventListener('pointerenter', fly);
      el._fxFly = fly;
    },
    trigger: function (el) { el._fxFly(); }
  });

  // Une ardoise de marché qui s'écrit à la craie
  FX.register('chalk-board', {
    entrance: true,
    setup: function (el) {
      var R = (el.dataset.fxItems || 'Pommes:2,80 €|Carottes:1,90 €|Miel:9,50 €').split('|').map(function (r) { var k = r.lastIndexOf(':'); return [r.slice(0, k), r.slice(k + 1)]; }), box = U.make('div', 'fx-cb3', el), n = 0, wrap = function (t) { return t.split('').map(function (c) { return '<span style="--fx-i:' + n++ + '">' + (c === ' ' ? '&nbsp;' : c) + '</span>'; }).join(''); };
      if (el.dataset.fxTitle) { var T = U.make('h4', '', box); T.innerHTML = wrap(el.dataset.fxTitle); }
      R.forEach(function (r) { var d = U.make('div', 'fx-cb3-r', box); d.innerHTML = '<span>' + wrap(r[0]) + '</span><span>' + wrap(r[1]) + '</span>'; d.setAttribute('aria-label', r[0] + ', ' + r[1]); });
      el.style.setProperty('--fx-pace', U.num(el, 'fxPace', 34) + 'ms');
    }
  });

  // Un composteur : le bon mélange de brun et de vert
  FX.register('compost-ratio', {
    setup: function (el) {
      var G = 3, B = 3;
      el.innerHTML = '<div class="fx-cm" aria-hidden="true"></div><div class="fx-cm-c"><button type="button" class="g">+ Vert (épluchures)</button><button type="button" class="b">+ Brun (carton)</button><button type="button" class="r">Vider</button></div><output aria-live="polite"></output>';
      var box = el.querySelector('.fx-cm'), o = el.querySelector('output');
      var add = function (cls) { var l = U.make('i', cls, box); l.style.width = U.rand(82, 100) + '%'; };
      var show = function () {
        var q = B / Math.max(1, G), W = q < 1 ? 'Trop humide : ajoutez du brun' : q > 2.5 ? 'Trop sec : ajoutez du vert' : 'Bon équilibre';
        el.classList.toggle('fx-ok', q >= 1 && q <= 2.5);
        o.innerHTML = '<b>' + G + ' vert · ' + B + ' brun</b><br>' + W;
      };
      el.querySelector('.g').addEventListener('click', function () { G++; add('v'); show(); });
      el.querySelector('.b').addEventListener('click', function () { B++; add('w'); show(); });
      el.querySelector('.r').addEventListener('click', function () { G = 0; B = 0; box.innerHTML = ''; show(); });
      for (var i = 0; i < 6; i++) add(i % 2 ? 'w' : 'v');
      show();
    }
  });

  // Une serre : plus il fait chaud, plus les vantaux s'ouvrent
  FX.register('greenhouse-vent', {
    setup: function (el) {
      var aim = U.num(el, 'fxAim', 24);
      el.innerHTML = '<svg viewBox="0 0 120 80" aria-hidden="true"><path class="w" d="M10 76V40L60 10L110 40V76Z"/><path class="fx-gv-a" d="M60 10L34 25.6"/><path class="fx-gv-b" d="M60 10L86 25.6"/></svg><label>Dedans <b></b><input type="range" min="10" max="42"></label><output aria-live="polite"></output>';
      var r = el.querySelector('input'), o = el.querySelector('output');
      r.value = U.num(el, 'fxTemp', 30);
      var go = function () {
        var t = +r.value, q = U.clamp((t - aim) / 12, 0, 1);
        el.style.setProperty('--fx-a', q * 42 + 'deg'); el.style.setProperty('--fx-b', -q * 42 + 'deg');
        el.style.setProperty('--fx-h', 210 - U.clamp((t - 10) / 32, 0, 1) * 210);
        el.querySelector('label b').textContent = t + ' °C';
        o.innerHTML = '<b>Vantaux à ' + Math.round(q * 100) + ' %</b>, consigne ' + aim + ' °C';
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Un sachet de graines qui se retourne pour montrer ses conseils
  FX.register('seed-packet', {
    setup: function (el) {
      var n = el.dataset.fxName || 'Radis rose', I = (el.dataset.fxItems || 'Semis:mars à août|Profondeur:1 cm|Récolte:4 semaines').split('|').map(function (r) { return r.split(':'); });
      el.innerHTML = '<button type="button" aria-pressed="false" aria-label="Voir les conseils de ' + n + '"><span class="fx-sp-c"><span class="fx-sp-f"><i></i><b>' + n + '</b></span><span class="fx-sp-b">' + I.map(function (x) { return '<em><u>' + x[0] + '</u>' + x[1] + '</em>'; }).join('') + '</span></span></button>';
      var b = el.firstChild;
      b.addEventListener('click', function () { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true'); });
    },
    trigger: function (el) { el.firstChild.click(); }
  });

  // Les jours favorables pour semer, selon les prévisions
  FX.register('sow-window', {
    setup: function (el) {
      var D = (el.dataset.fxData || '12:8|15:0|16:1|9:6|14:0|17:0|13:12').split('|').map(function (r) { return r.split(':').map(Number); }), box = U.make('div', 'fx-so2', el), best = [];
      D.forEach(function (d, i) {
        var day = new Date(Date.now() + i * 86400000), good = d[0] >= 12 && d[1] <= 2, c = U.make('div', good ? 'fx-good' : '', box), label = day.toLocaleDateString('fr-FR', { weekday: 'short' });
        c.style.setProperty('--fx-i', i);
        c.innerHTML = '<small>' + label + '</small><b>' + d[0] + '°</b><i>' + d[1] + ' mm</i>';
        if (good) best.push(label);
      });
      U.make('p', '', el).innerHTML = best.length ? 'À semer : <b>' + best.join(', ') + '</b>' : 'Pas de bonne fenêtre cette semaine';
      U.make('small', 'fx-so2-n', el).textContent = 'Prévisions fictives. Règle : 12 °C ou plus, 2 mm de pluie au plus.';
    }
  });

  // Azote, phosphore, potassium : où se situe l'engrais
  FX.register('npk-triangle', {
    setup: function (el) {
      var V = [U.num(el, 'fxN', 10), U.num(el, 'fxP', 5), U.num(el, 'fxK', 15)], N = ['N azote', 'P phosphore', 'K potassium'], h = '';
      N.forEach(function (n, i) { h += '<label>' + n + ' <b data-o="' + i + '"></b><input data-i="' + i + '" type="range" min="0" max="30" value="' + V[i] + '"></label>'; });
      el.innerHTML = '<svg viewBox="0 0 120 108" aria-hidden="true"><path d="M60 6 114 100H6Z"/><circle r="6"/><text x="60" y="4">N</text><text x="2" y="108">P</text><text x="118" y="108">K</text></svg><div class="fx-np">' + h + '</div><output aria-live="polite"></output>';
      var c = el.querySelector('circle'), o = el.querySelector('output');
      var go = function () {
        V = Array.prototype.map.call(el.querySelectorAll('input'), function (i) { return +i.value; });
        var t = V[0] + V[1] + V[2] || 1, a = V[0] / t, b = V[1] / t, k = V[2] / t;
        c.setAttribute('cx', a * 60 + b * 6 + k * 114);
        c.setAttribute('cy', a * 6 + b * 100 + k * 100);
        V.forEach(function (v, i) { el.querySelector('[data-o="' + i + '"]').textContent = v; });
        var top = V.indexOf(Math.max.apply(null, V));
        o.innerHTML = '<b>' + V.join('-') + '</b> · ' + ['pousse des feuilles', 'racines et floraison', 'fruits et résistance'][top];
      };
      el.addEventListener('input', go);
      go();
    }
  });

  // Compter les cernes d'un arbre, avec ses années sèches
  FX.register('tree-rings', {
    setup: function (el) {
      var max = U.num(el, 'fxMax', 60), seed = U.num(el, 'fxSeed', 5), R = function () { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }, W = [];
      for (var i = 0; i < max; i++) W.push(R() < .14 ? .35 : .6 + R() * .7);
      var y0 = new Date().getFullYear();
      el.innerHTML = '<svg viewBox="-60 -60 120 120" aria-hidden="true"></svg><label>Âge <input type="range" min="3" max="' + max + '"></label><output aria-live="polite"></output>';
      var s = el.querySelector('svg'), r = el.querySelector('input'), o = el.querySelector('output');
      r.value = U.num(el, 'fxAge', 30);
      var go = function () {
        var a = +r.value, t = 0, H = '', dry = [], tot = W.slice(0, a).reduce(function (x, y) { return x + y; }, 0), sc = 56 / tot;
        for (var i = 0; i < a; i++) {
          t += W[i] * sc;
          H = '<circle r="' + t.toFixed(2) + '" class="' + (W[i] < .4 ? 'fx-d' : '') + '" style="stroke-width:' + Math.max(.4, W[i] * sc * .5) + '"/>' + H;
          if (W[i] < .4) dry.push(y0 - a + i + 1);
        }
        s.innerHTML = H;
        o.innerHTML = '<b>' + a + ' cernes</b><br>' + (dry.length ? 'Années sèches : ' + dry.slice(0, 4).join(', ') : 'Pas d\'année sèche') + ' (fictif)';
      };
      r.addEventListener('input', go);
      go();
    }
  });
})(window.FX);

/* Pack 35 — Restauration */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Une carte qu'on filtre selon son régime
  FX.register('menu-diet-filter', {
    setup: function (el) {
      var T = { v: 'Végétarien', g: 'Sans gluten', l: 'Sans lactose' }, P = (el.dataset.fxItems || 'Velouté de courge:12:vgl|Risotto aux cèpes:18:vg|Tarte fine aux poireaux:15:v|Poulet rôti:21:gl|Mousse au chocolat:8:vg').split('|').map(function (r) { var p = r.split(':'); return { n: p[0], e: p[1], t: p[2] }; });
      var f = U.make('div', 'fx-mf', el), ul = U.make('ul', '', el), o = U.make('output', '', el);
      o.setAttribute('aria-live', 'polite');
      Object.keys(T).forEach(function (k) {
        var b = U.make('button', '', f);
        b.type = 'button'; b.textContent = T[k]; b.dataset.k = k; b.setAttribute('aria-pressed', 'false');
        b.addEventListener('click', function () { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true'); go(); });
      });
      P.forEach(function (p) { p.li = U.make('li', '', ul); p.li.innerHTML = '<span>' + p.n + '</span><b>' + p.e + ' €</b>'; });
      var go = function () {
        var on = Array.prototype.filter.call(f.children, function (b) { return b.getAttribute('aria-pressed') === 'true'; }).map(function (b) { return b.dataset.k; }), n = 0;
        P.forEach(function (p) { var ok = on.every(function (k) { return p.t.indexOf(k) >= 0; }); p.li.classList.toggle('fx-off', !ok); p.li.setAttribute('aria-hidden', !ok); if (ok) n++; });
        o.textContent = n + ' plat' + (n > 1 ? 's' : '') + ' sur ' + P.length;
      };
      go();
    }
  });

  // Réserver une table : combien, et à quelle heure
  FX.register('table-booking', {
    setup: function (el) {
      var S = (el.dataset.fxItems || '19:00:8|19:30:4|20:00:2|20:30:6|21:00:10').split('|').map(function (r) { var p = r.split(':'); return { h: p[0] + ':' + p[1], left: +p[2] }; }), n = U.num(el, 'fxParty', 2);
      el.innerHTML = '<div class="fx-tb"><button type="button" aria-label="Moins de couverts">−</button><span aria-live="polite"></span><button type="button" aria-label="Plus de couverts">+</button></div><div class="fx-tb-s"></div><output aria-live="polite"></output>';
      var B = el.querySelectorAll('.fx-tb button'), c = el.querySelector('.fx-tb span'), box = el.querySelector('.fx-tb-s'), o = el.querySelector('output');
      var show = function () {
        c.textContent = n + ' couvert' + (n > 1 ? 's' : '');
        box.innerHTML = '';
        S.forEach(function (s, i) {
          var b = U.make('button', '', box);
          b.type = 'button'; b.textContent = s.h; b.disabled = s.left < n; b.style.setProperty('--fx-i', i);
          b.addEventListener('click', function () {
            box.querySelectorAll('button').forEach(function (x) { x.classList.toggle('fx-on', x === b); });
            o.innerHTML = 'Table pour <b>' + n + '</b> à <b>' + s.h + '</b>';
            el.dispatchEvent(new CustomEvent('fx:booking', { bubbles: true, detail: { party: n, time: s.h } }));
          });
        });
        o.textContent = 'Choisissez une heure';
      };
      B[0].addEventListener('click', function () { n = Math.max(1, n - 1); show(); });
      B[1].addEventListener('click', function () { n = Math.min(12, n + 1); show(); });
      show();
    }
  });

  // Un plan de salle pour choisir sa table
  FX.register('floor-tables', {
    setup: function (el) {
      var T = (el.dataset.fxItems || '12:18:2:o|38:18:2:f|66:18:4:f|12:62:4:f|40:62:6:o|72:64:2:f').split('|').map(function (r) { var p = r.split(':'); return { x: +p[0], y: +p[1], s: +p[2], st: p[3] }; }), box = U.make('div', 'fx-ft', el), o = U.make('output', '', el);
      o.setAttribute('aria-live', 'polite');
      o.textContent = 'Touchez une table libre';
      T.forEach(function (t, i) {
        var b = U.make('button', 's' + t.s, box);
        b.type = 'button'; b.textContent = t.s;
        b.style.left = t.x + '%'; b.style.top = t.y + '%';
        b.setAttribute('aria-label', 'Table ' + (i + 1) + ', ' + t.s + ' places, ' + (t.st === 'o' ? 'occupée' : 'libre'));
        if (t.st === 'o') b.disabled = true;
        b.addEventListener('click', function () {
          box.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
          o.innerHTML = '<b>Table ' + (i + 1) + '</b>, ' + t.s + ' places';
        });
      });
    }
  });

  // Un bon de cuisine : plat à plat, avec son temps écoulé
  FX.register('kitchen-ticket', {
    setup: function (el) {
      var I = (el.dataset.fxItems || '2 Burgers|1 Salade César|1 Frites').split('|'), start = Date.now(), lim = U.num(el, 'fxLimit', 15);
      el.innerHTML = '<div class="fx-kt"><header><b>Table ' + U.num(el, 'fxTable', 12) + '</b><time></time></header><ul></ul></div><output aria-live="polite"></output>';
      var ul = el.querySelector('ul'), t = el.querySelector('time'), o = el.querySelector('output');
      I.forEach(function (x) {
        var b = U.make('button', '', U.make('li', '', ul));
        b.type = 'button'; b.textContent = x; b.setAttribute('aria-pressed', 'false');
        b.addEventListener('click', function () { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true'); count(); });
      });
      var count = function () {
        var left = ul.querySelectorAll('[aria-pressed=false]').length;
        el.classList.toggle('fx-done', !left);
        o.textContent = left ? left + ' à envoyer' : 'Bon complet, envoyé en salle';
      };
      var tick = function () {
        var m = (Date.now() - start) / 60000 + U.num(el, 'fxPast', 7);
        t.textContent = Math.floor(m) + ' min';
        el.classList.toggle('fx-late', m > lim);
      };
      count(); tick();
      setInterval(tick, 15000);
    }
  });
})(window.FX);

window.FX._boot();
