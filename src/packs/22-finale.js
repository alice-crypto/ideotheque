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
})(window.FX);
