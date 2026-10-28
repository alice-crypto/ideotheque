/* Pack 03 — Micro-interactions (survol, clic) */
(function (FX) {
  'use strict';
  var U = FX.util;

  [
    'fill-up', 'border-trace', 'shine-sweep', 'press-squash', 'lift-hover', 'jelly', 'conic-border',
    'underline-fill', 'zoom-frame', 'tooltip-pop', 'switch-morph', 'blob-morph', 'pulse-ring', 'invert-sweep'
  ].forEach(function (n) { FX.register(n, {}); });

  FX.register('ripple-click', {
    setup: function (el) {
      el.addEventListener('pointerdown', function (e) {
        if (U.reduced) return;
        var r = el.getBoundingClientRect();
        var size = Math.max(r.width, r.height) * 2.2;
        var s = U.make('span', 'fx-ripple', el);
        s.style.width = s.style.height = size + 'px';
        s.style.left = (e.clientX - r.left - size / 2) + 'px';
        s.style.top = (e.clientY - r.top - size / 2) + 'px';
        setTimeout(function () { s.remove(); }, 700);
      });
    }
  });

  FX.register('spotlight-card', {
    setup: function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--fx-mx', (e.clientX - r.left) + 'px');
        el.style.setProperty('--fx-my', (e.clientY - r.top) + 'px');
      });
    }
  });

  FX.register('icon-nudge', {
    setup: function (el) { if (!el.dataset.fxIcon) el.dataset.fxIcon = '→'; }
  });

  FX.register('swap-text', {
    setup: function (el) {
      var text = el.textContent.trim();
      var alt = el.dataset.fxAlt || text;
      el.textContent = '';
      var box = U.make('span', 'fx-swap', el);
      var a = U.make('span', '', box);
      a.textContent = text;
      var b = U.make('span', '', box);
      b.textContent = alt;
      b.setAttribute('aria-hidden', 'true');
    }
  });

  FX.register('click-burst', {
    triggerOn: 'click',
    trigger: function (el) {
      if (U.reduced) return;
      var n = U.num(el, 'fxCount', 12);
      var reach = U.num(el, 'fxReach', 70);
      for (var i = 0; i < n; i++) {
        var s = U.make('span', 'fx-spark', el);
        var a = (i / n) * Math.PI * 2 + U.rand(-0.2, 0.2);
        var d = reach * U.rand(0.6, 1.1);
        s.style.setProperty('--dx', (Math.cos(a) * d).toFixed(1) + 'px');
        s.style.setProperty('--dy', (Math.sin(a) * d).toFixed(1) + 'px');
        setTimeout(s.remove.bind(s), 700);
      }
    }
  });

  FX.register('shake', {
    trigger: function (el) {
      el.classList.remove('fx-shaking');
      void el.offsetWidth;
      el.classList.add('fx-shaking');
      if (navigator.vibrate && el.dataset.fxVibrate === 'true') navigator.vibrate(80);
    }
  });

  FX.register('fan-out', {
    setup: function (el) {
      var kids = el.children;
      Array.prototype.forEach.call(kids, function (k, i) { k.style.setProperty('--fx-i', i); });
      el.style.setProperty('--fx-mid', (kids.length - 1) / 2);
    }
  });

  FX.register('depth-hover', {
    setup: function (el) {
      var range = U.num(el, 'fxRange', 24);
      var layers = Array.prototype.slice.call(el.querySelectorAll('[data-fx-depth]'));
      el.addEventListener('pointermove', function (e) {
        if (U.reduced) return;
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        layers.forEach(function (l) {
          var d = parseFloat(l.dataset.fxDepth) || 0;
          l.style.transform = 'translate(' + (px * range * d * 2).toFixed(1) + 'px,' + (py * range * d * 2).toFixed(1) + 'px)';
        });
      });
      el.addEventListener('pointerleave', function () {
        layers.forEach(function (l) { l.style.transform = ''; });
      });
    }
  });
})(window.FX);
