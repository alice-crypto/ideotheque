/* Pack 10 — Présentation */
(function (FX) {
  'use strict';
  var U = FX.util;
  var NS = 'http://www.w3.org/2000/svg';

  ['scroll-cue', 'peel', 'expand-panels'].forEach(function (n) { FX.register(n, {}); });

  // Répète une action tant que l'élément est dans la page
  function every(el, ms, fn) {
    if (U.reduced) return;
    var timer = setInterval(function () {
      if (!el.isConnected) { clearInterval(timer); return; }
      fn();
    }, ms);
  }

  // --- band-loader ----------------------------------------------------------

  FX.register('band-loader', {
    entrance: true,
    setup: function (el) {
      var quips = (el.dataset.fxMessages || 'On met la table…|Ça arrive, patience…|Dernière touche…').split('|');
      el.innerHTML = '<div class="fx-bands"><i></i><i></i><i></i><i></i><i></i></div>' +
        '<div class="fx-band-ui"><span class="fx-band-msg"></span><div class="fx-band-bar"></div></div>';
      el.querySelectorAll('.fx-bands i').forEach(function (b, i) { b.style.setProperty('--fx-i', i); });
      el.setAttribute('role', 'status');
      el._fxQuips = quips;
    },
    enter: function (el) {
      el.classList.remove('fx-done');
      var msg = el.querySelector('.fx-band-msg');
      if (U.reduced) { el.classList.add('fx-done'); return; }
      U.tween(el, U.num(el, 'fxDuration', 2600), function (p) {
        el.style.setProperty('--fx-p', p.toFixed(3));
        var q = el._fxQuips[Math.min(el._fxQuips.length - 1, Math.floor(p * el._fxQuips.length))];
        if (msg.textContent !== q) msg.textContent = q;
      }, function () {
        el.classList.add('fx-done');
        el.dispatchEvent(new CustomEvent('fx:done', { bubbles: true }));
      });
    }
  });

  // --- bars-grow ------------------------------------------------------------

  FX.register('bars-grow', {
    entrance: true,
    setup: function (el) {
      var bars = Array.prototype.slice.call(el.children);
      var max = Math.max.apply(null, bars.map(function (b) { return parseFloat(b.dataset.fxValue) || 0; })) || 1;
      bars.forEach(function (b, i) {
        b.style.setProperty('--fx-i', i);
        b.style.setProperty('--fx-v', ((parseFloat(b.dataset.fxValue) || 0) / max * 100).toFixed(1));
        if (!b.getAttribute('aria-label') && b.dataset.fxValue) b.setAttribute('aria-label', (b.dataset.fxLabel || '') + ' ' + b.dataset.fxValue);
      });
    }
  });

  // --- marquee-vertical -----------------------------------------------------

  FX.register('marquee-vertical', {
    setup: function (el) {
      var track = U.make('div', 'fx-vtrack');
      while (el.firstChild) track.appendChild(el.firstChild);
      Array.prototype.slice.call(track.children).forEach(function (k) {
        var c = k.cloneNode(true);
        c.setAttribute('aria-hidden', 'true');
        track.appendChild(c);
      });
      el.appendChild(track);
    }
  });

  // --- timeline -------------------------------------------------------------

  FX.register('timeline', {
    scroll: function (el, info) {
      var p = U.reduced ? 1 : U.clamp((info.vh * 0.6 - info.rect.top) / info.rect.height, 0, 1);
      el.style.setProperty('--fx-tl', p.toFixed(3));
      var line = info.rect.top + p * info.rect.height;
      Array.prototype.forEach.call(el.children, function (k) {
        k.classList.toggle('fx-on', k.getBoundingClientRect().top + 8 <= line);
      });
    }
  });

  // --- spotlight-focus ------------------------------------------------------

  function spotStep(el) {
    var s = el._fxSpot;
    if (!s || !s.steps.length) return;
    s.i = (s.i + 1) % s.steps.length;
    var target = s.steps[s.i];
    var pad = U.num(el, 'fxPad', 8);
    s.box.style.width = (target.offsetWidth + pad * 2) + 'px';
    s.box.style.height = (target.offsetHeight + pad * 2) + 'px';
    s.box.style.transform = 'translate(' + (target.offsetLeft - pad) + 'px,' + (target.offsetTop - pad) + 'px)';
    s.tip.textContent = target.dataset.fxTip || '';
    s.tip.style.display = target.dataset.fxTip ? '' : 'none';
  }

  FX.register('spotlight-focus', {
    setup: function (el) {
      var steps = Array.prototype.slice.call(el.querySelectorAll('[data-fx-step]'));
      steps.sort(function (a, b) { return (parseFloat(a.dataset.fxStep) || 0) - (parseFloat(b.dataset.fxStep) || 0); });
      var box = U.make('div', 'fx-spot', el);
      box.setAttribute('aria-hidden', 'true');
      var tip = U.make('span', 'fx-spot-tip', box);
      el._fxSpot = { steps: steps, box: box, tip: tip, i: -1 };
      U.raf(function () { spotStep(el); });
      every(el, U.num(el, 'fxInterval', 2600), function () { spotStep(el); });
      U.onResize(function () { el._fxSpot.i--; spotStep(el); });
    },
    trigger: spotStep
  });

  // --- logo-cycle -----------------------------------------------------------

  FX.register('logo-cycle', {
    setup: function (el) {
      var pool = Array.prototype.slice.call(el.children);
      var n = Math.min(U.num(el, 'fxSlots', 3), pool.length);
      el.style.setProperty('--fx-slots', n);
      el.innerHTML = '';
      var slots = [];
      for (var i = 0; i < n; i++) {
        var s = U.make('div', 'fx-slot', el);
        s.appendChild(pool[i]);
        slots.push(s);
      }
      var next = n;
      var turn = 0;
      every(el, U.num(el, 'fxInterval', 1800), function () {
        if (pool.length <= n) return;
        var slot = slots[turn++ % n];
        var old = slot.firstElementChild;
        var fresh = pool[next++ % pool.length];
        // Le logo choisi ne doit pas être déjà affiché ailleurs
        while (fresh.parentNode && fresh.parentNode.className === 'fx-slot') fresh = pool[next++ % pool.length];
        fresh.classList.add('fx-enter');
        slot.appendChild(fresh);
        void fresh.offsetWidth;
        fresh.classList.remove('fx-enter');
        old.classList.add('fx-leave');
        setTimeout(function () { old.classList.remove('fx-leave'); old.remove(); }, 650);
      });
    }
  });

  // --- quote-rotator --------------------------------------------------------

  FX.register('quote-rotator', {
    setup: function (el) {
      var quotes = Array.prototype.slice.call(el.children);
      var i = 0;
      quotes[0].classList.add('fx-cur');
      el.setAttribute('aria-live', 'polite');
      el.addEventListener('pointerenter', function () { el._fxPause = true; });
      el.addEventListener('pointerleave', function () { el._fxPause = false; });
      every(el, U.num(el, 'fxInterval', 4500), function () {
        if (el._fxPause || quotes.length < 2) return;
        quotes[i].classList.remove('fx-cur');
        i = (i + 1) % quotes.length;
        quotes[i].classList.add('fx-cur');
      });
    }
  });

  // --- circle-text ----------------------------------------------------------

  FX.register('circle-text', {
    setup: function (el) {
      var text = el.textContent.trim();
      // Un séparateur en fin de texte pour boucler proprement
      if (!/[✳•·*]\s*$/.test(text)) text += ' • ';
      el.setAttribute('aria-label', el.textContent.trim());
      el.textContent = '';
      // Chaque caractère, espaces compris, occupe une position sur le cercle
      Array.from(text).forEach(function (ch, i) {
        var s = U.make('span', 'fx-char', el);
        s.textContent = ch === ' ' ? ' ' : ch;
        s.setAttribute('aria-hidden', 'true');
        s.style.setProperty('--fx-i', i);
      });
      el.style.setProperty('--fx-n', Array.from(text).length);
    }
  });

  // --- split-flap -----------------------------------------------------------

  FX.register('split-flap', {
    setup: function (el) {
      var words = (el.dataset.fxWords || el.textContent).split('|').map(function (w) { return w.trim().toUpperCase(); });
      var len = Math.max.apply(null, words.map(function (w) { return w.length; }));
      el.setAttribute('aria-label', words.join(', '));
      el.textContent = '';
      var cells = [];
      for (var i = 0; i < len; i++) {
        var c = U.make('span', 'fx-flap', el);
        c.setAttribute('aria-hidden', 'true');
        cells.push(c);
      }
      var w = 0;
      var abc = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      function show(word) {
        word = word.padEnd(len, ' ');
        cells.forEach(function (c, i) {
          var target = word[i];
          if (U.reduced) { c.textContent = target; return; }
          var steps = 4 + ((Math.random() * 8) | 0) + i;
          var k = 0;
          (function flip() {
            c.textContent = k >= steps ? target : abc[(Math.random() * abc.length) | 0];
            if (k++ < steps) setTimeout(flip, 45);
          })();
        });
      }
      show(words[0]);
      every(el, U.num(el, 'fxInterval', 2600), function () { w = (w + 1) % words.length; show(words[w]); });
    }
  });

  // --- line-chart -----------------------------------------------------------

  FX.register('line-chart', {
    entrance: true,
    setup: function (el) {
      var values = (el.dataset.fxValues || '12,18,15,26,22,34,30,42').split(',').map(Number);
      var W = 300, H = 120, pad = 8;
      var max = Math.max.apply(null, values);
      var min = Math.min.apply(null, values);
      var pts = values.map(function (v, i) {
        return [pad + i * (W - pad * 2) / (values.length - 1), H - pad - (v - min) / ((max - min) || 1) * (H - pad * 2)];
      });
      var d = pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' ');
      el.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      el.setAttribute('role', 'img');
      if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', 'Graphique : ' + values.join(', '));
      el.innerHTML = '<path class="fx-area" d="' + d + ' L' + pts[pts.length - 1][0] + ' ' + H + ' L' + pts[0][0] + ' ' + H + 'Z"/>' +
        '<path class="fx-line" d="' + d + '"/>' +
        pts.map(function (p, i) { return '<circle class="fx-point" cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="4" style="--fx-i:' + i + '"/>'; }).join('');
      var line = el.querySelector('.fx-line');
      var len = line.getTotalLength();
      line.style.strokeDasharray = len;
      line.style.strokeDashoffset = U.reduced ? 0 : len;
      el._fxLine = { line: line, len: len };
    },
    reset: function (el) { el._fxLine.line.style.strokeDashoffset = el._fxLine.len; },
    enter: function (el) { el._fxLine.line.style.strokeDashoffset = 0; }
  });

  // --- holo-card ------------------------------------------------------------

  FX.register('holo-card', {
    setup: function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width;
        var y = (e.clientY - r.top) / r.height;
        el.style.setProperty('--fx-mx', (x * 100).toFixed(1) + '%');
        el.style.setProperty('--fx-my', (y * 100).toFixed(1) + '%');
        el.style.setProperty('--fx-hx', (x * 100).toFixed(1) + '%');
        el.style.setProperty('--fx-hy', (y * 100).toFixed(1) + '%');
        if (U.reduced) return;
        el.style.setProperty('--fx-ry', ((x - 0.5) * 16).toFixed(2) + 'deg');
        el.style.setProperty('--fx-rx', (-(y - 0.5) * 16).toFixed(2) + 'deg');
      });
      el.addEventListener('pointerleave', function () {
        el.style.setProperty('--fx-rx', '0deg');
        el.style.setProperty('--fx-ry', '0deg');
      });
    }
  });

  // --- donut ----------------------------------------------------------------

  FX.register('donut', {
    entrance: true,
    setup: function (el) {
      var values = (el.dataset.fxValues || '45,25,20,10').split(',').map(Number);
      var colors = (el.dataset.fxColors || '#ff5b2e,#b9a7ff,#20c7a5,#ffcf4d,#f4f1ea').split(',');
      var total = values.reduce(function (a, b) { return a + b; }, 0) || 1;
      var r = 40;
      var c = 2 * Math.PI * r;
      var offset = 0;
      var label = el.textContent.trim();
      el.innerHTML = '<svg viewBox="0 0 100 100" aria-hidden="true"></svg><span class="fx-donut-label"></span>';
      el.querySelector('.fx-donut-label').textContent = label;
      var svg = el.querySelector('svg');
      el._fxArcs = values.map(function (v, i) {
        var len = v / total * c;
        var circle = document.createElementNS(NS, 'circle');
        circle.setAttribute('cx', 50);
        circle.setAttribute('cy', 50);
        circle.setAttribute('r', r);
        circle.style.stroke = colors[i % colors.length];
        circle.style.strokeDashoffset = (-offset).toFixed(2);
        circle.style.strokeDasharray = U.reduced ? len + ' ' + c : '0 ' + c;
        circle.style.setProperty('--fx-i', i);
        svg.appendChild(circle);
        offset += len;
        return { el: circle, len: len, c: c };
      });
      el.setAttribute('role', 'img');
      if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', 'Répartition : ' + values.join(', '));
    },
    reset: function (el) { el._fxArcs.forEach(function (a) { a.el.style.strokeDasharray = '0 ' + a.c; }); },
    enter: function (el) { el._fxArcs.forEach(function (a) { a.el.style.strokeDasharray = (a.len - 1.2).toFixed(2) + ' ' + a.c; }); }
  });
})(window.FX);
