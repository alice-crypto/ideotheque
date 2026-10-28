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
