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
})(window.FX);
