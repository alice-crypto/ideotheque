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

  // Deux valeurs face à face, chacune pousse depuis son côté
  FX.register('versus-bars', {
    entrance: true,
    setup: function (el) {
      var a = U.num(el, 'fxA', 62), b = U.num(el, 'fxB', 38), na = el.dataset.fxNameA || 'Avant', nb = el.dataset.fxNameB || 'Après';
      el.innerHTML = '<div class="fx-vs-l"><b>' + a + '</b><span>' + na + '</span></div><div class="fx-vs-r"><span>' + nb + '</span><b>' + b + '</b></div><div class="fx-vs-bar"><i class="a"></i><i class="b"></i></div>';
      el.style.setProperty('--fx-a', a / (a + b));
      el.classList.add(a >= b ? 'fx-a-wins' : 'fx-b-wins');
    }
  });

  // Un cadran dont l'aiguille monte et oscille un instant
  FX.register('gauge-needle', {
    entrance: true,
    setup: function (el) {
      el.setAttribute('role', 'meter');
      var v = U.num(el, 'fxValue', 72), max = U.num(el, 'fxMax', 100);
      el.setAttribute('aria-valuenow', v); el.setAttribute('aria-valuemin', 0); el.setAttribute('aria-valuemax', max);
      el.innerHTML = '<svg viewBox="0 0 120 70" aria-hidden="true"><path class="bg" pathLength="1" d="M10 62 A50 50 0 0 1 110 62"/><path class="on" pathLength="1" d="M10 62 A50 50 0 0 1 110 62"/><g class="nd"><line x1="60" y1="62" x2="60" y2="20"/><circle cx="60" cy="62" r="4"/></g></svg><b>' + v + '</b>';
      el._fxQ = v / max;
    },
    reset: function (el) { el.style.setProperty('--fx-q', 0); },
    enter: function (el) {
      var q = el._fxQ;
      U.tween(el, 1100, function (p) {
        var o = 1 - Math.pow(1 - p, 3), wob = Math.sin(p * 12) * (1 - p) * .05;
        el.style.setProperty('--fx-q', (q * o + wob * q).toFixed(4));
      });
    }
  });

  // Un classement dont les lignes se dépassent
  FX.register('rank-race', {
    setup: function (el) {
      var rows = (el.dataset.fxItems || 'Atlas:40,Brume:55,Halo:30,Ocre:65,Verdure:48').split(',').map(function (s) {
        var p = s.split(':'), r = U.make('div', 'fx-rr', el);
        r.innerHTML = '<span></span><i></i><b></b>';
        r.firstChild.textContent = p[0];
        return { el: r, v: parseFloat(p[1]) };
      });
      el.style.setProperty('--fx-count', rows.length);
      var draw = function () {
        var mx = Math.max.apply(null, rows.map(function (r) { return r.v; }));
        rows.slice().sort(function (a, b) { return b.v - a.v; }).forEach(function (r, i) {
          r.el.style.setProperty('--fx-rank', i);
          r.el.style.setProperty('--fx-w', r.v / mx);
          r.el.lastChild.textContent = Math.round(r.v);
        });
      };
      draw();
      el._fxRows = rows; el._fxDraw = draw; el._fxT = 0;
    },
    tick: function (el, dt) {
      if (U.reduced) return;
      el._fxT += dt;
      if (el._fxT < U.num(el, 'fxEvery', 1.1)) return;
      el._fxT = 0;
      el._fxRows.forEach(function (r) { r.v = Math.max(5, r.v + U.rand(-4, 12)); });
      el._fxDraw();
    }
  });
})(window.FX);
