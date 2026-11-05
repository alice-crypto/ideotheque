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
