/* Pack 18 — Données et présentation */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Des barres rayonnent autour d'un centre
  FX.register('radial-bars', {
    entrance: true,
    setup: function (el) {
      var v = (el.dataset.fxValues || '40,70,55,90,35,65,80,50,75,45,60,85').split(',').map(Number), max = Math.max.apply(null, v);
      el.setAttribute('role', 'img');
      el.setAttribute('aria-label', 'Valeurs : ' + v.join(', '));
      v.forEach(function (n, i) {
        var b = U.make('i', '', el);
        b.style.setProperty('--fx-a', (i / v.length * 360) + 'deg');
        b.style.setProperty('--fx-v', n / max);
        b.style.setProperty('--fx-i', i);
      });
    }
  });

  // Une petite courbe se dessine à l'entrée
  FX.register('sparkline-draw', {
    entrance: true,
    setup: function (el) {
      var v = (el.dataset.fxValues || '12,18,14,22,19,28,24,33').split(',').map(Number);
      var mn = Math.min.apply(null, v), mx = Math.max.apply(null, v), W = 100, H = 30;
      var pt = v.map(function (n, i) { return [i / (v.length - 1) * W, H - 3 - (n - mn) / ((mx - mn) || 1) * (H - 6)]; });
      var line = 'M' + pt.map(function (p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' L');
      var last = pt[pt.length - 1];
      el.setAttribute('role', 'img');
      el.setAttribute('aria-label', 'Tendance, de ' + v[0] + ' à ' + v[v.length - 1]);
      el.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" aria-hidden="true"><path class="fx-sl-area" d="' + line + ' L' + W + ' ' + H + ' L0 ' + H + ' Z"/><path class="fx-sl-line" pathLength="1" d="' + line + '"/></svg><i style="left:' + last[0] + '%;top:' + (last[1] / H * 100) + '%"></i>';
    }
  });

  // Un calendrier d'activité qui s'allume en vague
  FX.register('heat-calendar', {
    entrance: true,
    setup: function (el) {
      var w = U.num(el, 'fxWeeks', 16), vals = el.dataset.fxValues ? el.dataset.fxValues.split(',').map(Number) : null;
      el.setAttribute('role', 'img');
      el.setAttribute('aria-label', el.getAttribute('aria-label') || 'Activité sur ' + w + ' semaines');
      el.style.setProperty('--fx-w', w);
      for (var i = 0; i < w * 7; i++) {
        var c = U.make('i', '', el);
        var col = Math.floor(i / 7);
        var v = vals ? (vals[i] || 0) : Math.pow(Math.random(), 2.2);
        c.style.setProperty('--fx-v', v.toFixed(2));
        c.style.setProperty('--fx-d', (col * 28 + (i % 7) * 12) + 'ms');
      }
    }
  });

  // Une barre répartie en segments avec sa légende
  FX.register('stacked-progress', {
    entrance: true,
    setup: function (el) {
      var parts = (el.dataset.fxParts || 'Design:40,Code:35,Son:25').split(',').map(function (s) { var p = s.split(':'); return { n: p[0], v: parseFloat(p[1]) }; });
      var sum = parts.reduce(function (a, p) { return a + p.v; }, 0);
      var bar = U.make('div', 'fx-sp-bar', el), leg = U.make('ul', 'fx-sp-leg', el);
      bar.setAttribute('aria-hidden', 'true');
      parts.forEach(function (p, i) {
        var s = U.make('i', '', bar);
        s.style.setProperty('--fx-w', p.v / sum);
        s.style.setProperty('--fx-i', i);
        var li = U.make('li', '', leg);
        li.style.setProperty('--fx-i', i);
        li.textContent = p.n + ' ' + Math.round(p.v / sum * 100) + ' %';
      });
    }
  });
})(window.FX);
