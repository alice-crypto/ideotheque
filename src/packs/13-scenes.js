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
})(window.FX);
