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
})(window.FX);
