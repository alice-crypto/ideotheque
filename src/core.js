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
