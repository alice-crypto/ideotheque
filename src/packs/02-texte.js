/* Pack 02 — Texte */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Garde le texte d'origine pour les pseudo-éléments (::before / ::after)
  function copyText(el) { el.dataset.fxCopy = el.textContent.trim(); }

  FX.register('typewriter', {
    entrance: true,
    setup: function (el) {
      el.dataset.fxText = el.textContent.trim();
      el.setAttribute('aria-label', el.dataset.fxText);
      el.style.minHeight = el.offsetHeight + 'px';
      if (!U.reduced) el.textContent = '';
    },
    reset: function (el) { el.textContent = ''; },
    enter: function (el) {
      var text = el.dataset.fxText;
      var speed = U.num(el, 'fxSpeed', 45);
      U.tween(el, text.length * speed, function (p) {
        el.textContent = text.slice(0, Math.round(p * text.length));
      });
    }
  });

  FX.register('word-rise', { entrance: true, setup: U.splitWords });
  FX.register('wave-text', { setup: U.splitChars });
  FX.register('glitch-text', { setup: copyText });
  FX.register('slice-hover', { setup: copyText });
  ['gradient-flow', 'stroke-fill', 'neon-flicker', 'wavy-underline', 'image-text'].forEach(function (n) {
    FX.register(n, {});
  });
  ['highlight-sweep', 'strike-draw', 'track-in', 'long-shadow'].forEach(function (n) {
    FX.register(n, { entrance: true });
  });
  FX.register('char-flip', { entrance: true, setup: U.splitChars });

  FX.register('letter-focus', {
    entrance: true,
    setup: function (el) {
      U.splitChars(el);
      el.querySelectorAll('.fx-char').forEach(function (c) {
        c.style.setProperty('--fx-r', Math.random().toFixed(2));
      });
    }
  });

  // --- proximity-weight -----------------------------------------------------

  FX.register('proximity-weight', {
    setup: function (el) {
      U.splitChars(el);
      var chars = Array.prototype.slice.call(el.querySelectorAll('.fx-char'));
      var reach = U.num(el, 'fxReach', 120);
      var queued = null;
      function update(x, y) {
        chars.forEach(function (c) {
          var r = c.getBoundingClientRect();
          var d = Math.hypot(r.left + r.width / 2 - x, r.top + r.height / 2 - y);
          c.style.setProperty('--fx-k', Math.max(0, 1 - d / reach).toFixed(2));
        });
      }
      el.addEventListener('pointermove', function (e) {
        if (U.reduced) return;
        if (queued) return;
        queued = U.raf(function () { queued = null; update(e.clientX, e.clientY); });
      });
      el.addEventListener('pointerleave', function () { update(-1e4, -1e4); });
    }
  });

  // --- word-rotator ---------------------------------------------------------

  FX.register('word-rotator', {
    setup: function (el) {
      var words = (el.dataset.fxWords || el.textContent).split('|').map(function (w) { return w.trim(); });
      el.setAttribute('aria-label', words.join(', '));
      el.textContent = '';
      var spans = words.map(function (w) {
        var s = U.make('span', '', el);
        s.textContent = w;
        s.setAttribute('aria-hidden', 'true');
        return s;
      });
      var i = 0;
      spans[0].classList.add('fx-cur');
      function fit() { el.style.width = spans[i].offsetWidth + 'px'; }
      fit();
      U.onResize(fit);
      if (U.reduced || spans.length < 2) return;
      var timer = setInterval(function () {
        if (!el.isConnected) { clearInterval(timer); return; }
        var prev = spans[i];
        i = (i + 1) % spans.length;
        spans.forEach(function (s) { s.classList.remove('fx-prev'); });
        prev.classList.remove('fx-cur');
        prev.classList.add('fx-prev');
        spans[i].classList.add('fx-cur');
        fit();
      }, U.num(el, 'fxInterval', 2200));
    }
  });

  // --- odometer -------------------------------------------------------------

  FX.register('odometer', {
    entrance: true,
    setup: function (el) {
      var text = el.textContent.trim();
      el.setAttribute('aria-label', text);
      el.textContent = '';
      var col = 0;
      Array.from(text).forEach(function (ch) {
        if (!/\d/.test(ch)) {
          var s = U.make('span', '', el);
          s.textContent = ch;
          s.setAttribute('aria-hidden', 'true');
          return;
        }
        var c = U.make('span', 'fx-odo-col', el);
        c.setAttribute('aria-hidden', 'true');
        var strip = U.make('span', '', c);
        strip.textContent = '0\n1\n2\n3\n4\n5\n6\n7\n8\n9';
        strip.style.setProperty('--fx-d', ch);
        strip.style.setProperty('--fx-i', col++);
      });
    }
  });

  // --- scroll-ink -----------------------------------------------------------

  FX.register('scroll-ink', {
    setup: U.splitWords,
    scroll: function (el, info) {
      var words = el._fxWords || (el._fxWords = el.querySelectorAll('.fx-word'));
      var r = info.rect;
      var p = U.reduced ? 1 : U.clamp((info.vh * 0.85 - r.top) / (r.height + info.vh * 0.45), 0, 1);
      var on = Math.round(p * words.length);
      if (on === el._fxOn) return;
      el._fxOn = on;
      for (var i = 0; i < words.length; i++) words[i].classList.toggle('fx-on', i < on);
    }
  });

  // --- velocity-stretch -----------------------------------------------------

  FX.register('velocity-stretch', {
    tick: function (el) {
      if (U.reduced) return;
      var v = U.velocity();
      var k = U.clamp(Math.abs(v) / 50, 0, 0.7);
      el._fxK = U.lerp(el._fxK || 0, k, 0.15);
      el.style.transform = 'scaleY(' + (1 + el._fxK).toFixed(3) + ') skewX(' + (-U.clamp(v, -40, 40) / 4).toFixed(2) + 'deg)';
    }
  });

  FX.register('edge-label', { scroll: true });
})(window.FX);
