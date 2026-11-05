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
})(window.FX);
