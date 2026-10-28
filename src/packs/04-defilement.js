/* Pack 04 — Défilement */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Effets entièrement pilotés par --fx-p / --fx-pass (posés par le moteur)
  [
    'parallax', 'scroll-rotate', 'scale-on-scroll', 'fade-exit', 'hero-shrink', 'scroll-unveil',
    'perspective-scroll', 'split-columns', 'blur-exit', 'fill-scroll'
  ].forEach(function (n) { FX.register(n, { scroll: true }); });

  // --- Défilement dans une boîte ou dans la page --------------------------

  // Premier ancêtre déclaré défilant (sinon la page). On ne teste pas s'il déborde déjà :
  // certains effets (pin-horizontal) ne le font déborder qu'après leur mise en place.
  function scrollParent(el) {
    for (var p = el.parentElement; p && p !== document.body && p !== document.documentElement; p = p.parentElement) {
      var o = getComputedStyle(p).overflowY;
      if (o === 'auto' || o === 'scroll') return p;
    }
    return null;
  }

  function view(parent) {
    if (!parent) return { top: 0, h: window.innerHeight, w: window.innerWidth };
    var r = parent.getBoundingClientRect();
    return { top: r.top, h: parent.clientHeight, w: parent.clientWidth };
  }

  // Appelle update à chaque défilement de la page ou de la boîte qui contient l'élément
  function bindScroll(el, update) {
    var parent = scrollParent(el);
    var queued = false;
    function run() {
      if (queued) return;
      queued = true;
      U.raf(function () { queued = false; update(view(parent), parent); });
    }
    (parent || window).addEventListener('scroll', run, { passive: true });
    if (parent) window.addEventListener('scroll', run, { passive: true });
    U.onResize(run);
    run();
    return parent;
  }

  // Partagés avec les packs suivants (navigation…)
  U.scrollParent = scrollParent;
  U.bindScroll = bindScroll;

  // --- progress-bar ---------------------------------------------------------

  FX.register('progress-bar', {
    setup: function (el) {
      bindScroll(el, function () {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        el.style.setProperty('--fx-page', max > 0 ? (window.scrollY / max).toFixed(4) : 0);
      });
    }
  });

  // --- stack-cards ----------------------------------------------------------

  FX.register('stack-cards', {
    setup: function (el) {
      var kids = Array.prototype.slice.call(el.children);
      kids.forEach(function (k, i) { k.style.setProperty('--fx-i', i); });
      bindScroll(el, function () {
        if (U.reduced) return;
        kids.forEach(function (k, i) {
          var next = kids[i + 1];
          if (!next) return;
          var a = k.getBoundingClientRect();
          var b = next.getBoundingClientRect();
          var cover = U.clamp(1 - (b.top - a.top) / a.height, 0, 1);
          k.style.setProperty('--fx-s', (1 - cover * 0.08).toFixed(3));
          k.style.setProperty('--fx-shade', (1 - cover * 0.35).toFixed(3));
        });
      });
    }
  });

  // --- pin-horizontal -------------------------------------------------------

  FX.register('pin-horizontal', {
    setup: function (el) {
      var pin = U.make('div', 'fx-pin');
      var track = U.make('div', 'fx-track', pin);
      while (el.firstChild) track.appendChild(el.firstChild);
      el.appendChild(pin);
      bindScroll(el, function (v) {
        pin.style.height = v.h + 'px';
        var distance = Math.max(0, track.scrollWidth - v.w);
        el.style.height = (v.h + distance) + 'px';
        var r = el.getBoundingClientRect();
        var p = distance ? U.clamp((v.top - r.top) / distance, 0, 1) : 0;
        track.style.transform = 'translate3d(' + (-p * distance).toFixed(1) + 'px,0,0)';
      });
    }
  });

  // --- bg-shift -------------------------------------------------------------

  FX.register('bg-shift', {
    setup: function (el) {
      var scope = el.closest('[data-fx-bg-scope]') || document.body;
      bindScroll(el, function (v) {
        var r = el.getBoundingClientRect();
        var mid = v.top + v.h / 2;
        if (r.top <= mid && r.bottom > mid) {
          scope.style.backgroundColor = el.dataset.fxBg || '';
          if (el.dataset.fxColor) scope.style.color = el.dataset.fxColor;
        }
      });
    }
  });

  // --- scroll-count ---------------------------------------------------------

  FX.register('scroll-count', {
    setup: function (el) {
      el.dataset.fxTo = el.dataset.fxTo || el.textContent.replace(/[^\d.-]/g, '');
      el.setAttribute('aria-label', el.textContent.trim());
    },
    scroll: function (el, info) {
      var to = parseFloat(el.dataset.fxTo) || 0;
      var v = U.reduced ? to : Math.round(to * info.enter);
      if (v === el._fxV) return;
      el._fxV = v;
      el.textContent = v.toLocaleString(document.documentElement.lang || undefined);
    }
  });

  // --- path-scroll ----------------------------------------------------------

  FX.register('path-scroll', {
    setup: function (el) {
      el._fxPaths = Array.prototype.map.call(el.querySelectorAll('path'), function (p) {
        var len = p.getTotalLength();
        p.style.strokeDasharray = len;
        p.style.strokeDashoffset = len;
        return { p: p, len: len };
      });
    },
    scroll: function (el, info) {
      var k = U.reduced ? 1 : U.clamp(info.pass * 1.4 - 0.15, 0, 1);
      el._fxPaths.forEach(function (o) { o.p.style.strokeDashoffset = (o.len * (1 - k)).toFixed(1); });
    }
  });

  // --- skew-scroll ----------------------------------------------------------

  FX.register('skew-scroll', {
    tick: function (el) {
      if (U.reduced) return;
      var target = U.clamp(U.velocity() * 0.18, -10, 10);
      el._fxK = U.lerp(el._fxK || 0, target, 0.12);
      if (Math.abs(el._fxK) < 0.01 && !el.style.transform) return;
      el.style.transform = 'skewY(' + el._fxK.toFixed(2) + 'deg)';
    }
  });

  // --- scatter-scroll -------------------------------------------------------

  FX.register('scatter-scroll', {
    scroll: true,
    setup: function (el) {
      U.splitChars(el);
      var spread = U.num(el, 'fxSpread', 160);
      el.querySelectorAll('.fx-char').forEach(function (c) {
        c.style.setProperty('--fx-rx', U.rand(-spread, spread).toFixed(0) + 'px');
        c.style.setProperty('--fx-ry', U.rand(-spread, spread * 0.4).toFixed(0) + 'px');
        c.style.setProperty('--fx-rr', U.rand(-120, 120).toFixed(0) + 'deg');
      });
    }
  });
})(window.FX);
