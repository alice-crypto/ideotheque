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
})(window.FX);
