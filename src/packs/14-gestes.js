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
})(window.FX);
