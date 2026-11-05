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

  // Une frise où chaque date affiche son histoire
  FX.register('timeline-scrub', {
    setup: function (el) {
      var items = Array.prototype.slice.call(el.children);
      var rail = U.make('div', 'fx-ts-rail', el), out = U.make('div', 'fx-ts-out', el);
      rail.setAttribute('role', 'tablist');
      out.setAttribute('aria-live', 'polite');
      var dots = items.map(function (it, i) {
        it.hidden = true;
        var b = U.make('button', '', rail);
        b.type = 'button';
        b.setAttribute('role', 'tab');
        b.textContent = it.dataset.date || i + 1;
        b.style.setProperty('--fx-x', items.length > 1 ? i / (items.length - 1) : 0);
        b.addEventListener('click', function () { set(i); });
        b.addEventListener('pointerenter', function () { set(i); });
        return b;
      });
      var set = function (i) {
        dots.forEach(function (d, k) { d.setAttribute('aria-selected', k === i); d.tabIndex = k === i ? 0 : -1; });
        rail.style.setProperty('--fx-p', items.length > 1 ? i / (items.length - 1) : 0);
        out.innerHTML = '';
        var c = items[i].cloneNode(true);
        c.hidden = false;
        c.className = 'fx-ts-in';
        out.appendChild(c);
      };
      rail.addEventListener('keydown', function (e) {
        var i = dots.indexOf(document.activeElement);
        if (e.key === 'ArrowRight' && dots[i + 1]) { set(i + 1); dots[i + 1].focus(); }
        if (e.key === 'ArrowLeft' && dots[i - 1]) { set(i - 1); dots[i - 1].focus(); }
      });
      set(0);
    }
  });

  // Des bobines de chiffres tournent et s'arrêtent sur le nombre
  FX.register('number-ticker-reel', {
    entrance: true,
    setup: function (el) {
      var txt = (el.dataset.fxValue || el.textContent).trim();
      el.setAttribute('aria-label', txt);
      el.textContent = '';
      Array.from(txt).forEach(function (ch, i) {
        var box = U.make('span', 'fx-ntr', el);
        box.setAttribute('aria-hidden', 'true');
        if (!/\d/.test(ch)) { box.textContent = ch; box.classList.add('fx-ntr-fix'); return; }
        var col = U.make('span', 'fx-ntr-col', box), s = '';
        for (var k = 0; k < 20; k++) s += k % 10 + '\n';
        col.textContent = s + ch;
        col.style.setProperty('--fx-i', i);
      });
    }
  });

  // Une pile de témoignages dont la première carte part au fond
  FX.register('quote-card-shuffle', {
    setup: function (el) {
      el._fxT = 0;
      el._fxOrder = function () { Array.prototype.forEach.call(el.children, function (c, i) { c.style.setProperty('--fx-pos', i); c.style.zIndex = 30 - i; c.setAttribute('aria-hidden', i > 0); }); };
      el._fxOrder();
      el._fxNext = function () {
        var f = el.firstElementChild;
        f.classList.add('fx-out');
        setTimeout(function () { f.classList.remove('fx-out'); el.appendChild(f); el._fxOrder(); }, 420);
      };
      el.addEventListener('click', el._fxNext);
    },
    trigger: function (el) { el._fxNext(); },
    tick: function (el, dt) {
      if (U.reduced || el.matches(':hover')) return;
      el._fxT += dt;
      if (el._fxT > U.num(el, 'fxHold', 3.5)) { el._fxT = 0; el._fxNext(); }
    }
  });

  // Des cartes de tarifs dont les prix suivent la bascule annuelle
  FX.register('pricing-toggle-cards', {
    setup: function (el) {
      var tog = el.querySelector('input[type="checkbox"]'), prices = el.querySelectorAll('[data-month]');
      if (!tog) return;
      var render = function () {
        prices.forEach(function (p) {
          var to = parseFloat(tog.checked ? p.dataset.year : p.dataset.month), from = parseFloat(p.textContent) || to;
          U.tween(p, 450, function (k) { p.textContent = Math.round(U.lerp(from, to, U.easeOut(k))); });
        });
        el.classList.toggle('fx-year', tog.checked);
      };
      prices.forEach(function (p) { p.textContent = p.dataset.month; });
      tog.addEventListener('change', render);
    }
  });

  // Une liste de fonctions dont l'élément actif change et se remplit
  FX.register('feature-orbit-card', {
    setup: function (el) {
      var k = Array.prototype.slice.call(el.children), cur = 0;
      el._fxT = 0; el._fxD = U.num(el, 'fxHold', 3.2);
      var set = function (i) { cur = i; el._fxT = 0; k.forEach(function (c, j) { c.classList.toggle('fx-cur', j === i); if (j === i) c.setAttribute('aria-current', 'true'); else c.removeAttribute('aria-current'); }); };
      k.forEach(function (c, i) { c.tabIndex = 0; c.addEventListener('pointerenter', function () { set(i); }); c.addEventListener('focus', function () { set(i); }); U.make('i', 'fx-foc', c).setAttribute('aria-hidden', 'true'); });
      set(0);
      el._fxNext = function () { set((cur + 1) % k.length); };
      el._fxCur = function () { return k[cur]; };
    },
    tick: function (el, dt) {
      if (U.reduced || el.matches(':hover')) return;
      el._fxT += dt;
      el._fxCur().style.setProperty('--fx-q', Math.min(1, el._fxT / el._fxD).toFixed(3));
      if (el._fxT >= el._fxD) el._fxNext();
    }
  });

  // Un mur de logos dont les cases se retournent une à une
  FX.register('logo-wall-flip', {
    setup: function (el) {
      var all = (el.dataset.fxLogos || 'Atlas|Brume|Halo|Ocre|Verdure|Nord|Sable|Iris|Onde').split('|'), n = U.num(el, 'fxCells', 6);
      el.style.setProperty('--fx-cells', Math.ceil(n / 2));
      el.setAttribute('aria-label', 'Références : ' + all.join(', '));
      el.setAttribute('role', 'img');
      var cells = [];
      for (var i = 0; i < n; i++) { var c = U.make('span', '', el); c.setAttribute('aria-hidden', 'true'); c.textContent = all[i % all.length]; cells.push(c); }
      el._fxC = cells; el._fxNx = n; el._fxAll = all; el._fxT = 0;
    },
    tick: function (el, dt) {
      if (U.reduced) return;
      el._fxT += dt;
      if (el._fxT < U.num(el, 'fxEvery', 1.1)) return;
      el._fxT = 0;
      var c = el._fxC[Math.floor(Math.random() * el._fxC.length)], t = el._fxAll[el._fxNx++ % el._fxAll.length];
      c.classList.add('fx-flip');
      setTimeout(function () { c.textContent = t; }, 220);
      setTimeout(function () { c.classList.remove('fx-flip'); }, 460);
    }
  });

  // Un grand chiffre monte pendant que son libellé se dévoile
  FX.register('stat-reveal-split', {
    entrance: true,
    setup: function (el) {
      var v = U.num(el, 'fxValue', 87), s = el.dataset.fxSuffix || '%', l = el.dataset.fxLabel || '';
      el.innerHTML = '<b></b><span></span>';
      el.lastChild.textContent = l;
      el.setAttribute('aria-label', v + ' ' + s + ' ' + l);
      el._fxW = function (p) { el.firstChild.textContent = Math.round(v * U.easeOut(p)) + s; };
      el._fxW(0);
    },
    reset: function (el) { el._fxW(0); },
    enter: function (el) { U.tween(el, 1200, el._fxW); }
  });

  // Une carte en points avec des épingles qui s'allument
  FX.register('world-pins', {
    entrance: true,
    setup: function (el) {
      var pins = (el.dataset.fxPins || '48,2;40,-74;35,139;-23,-46;51,0;1,103').split(';').map(function (s) { return s.split(',').map(Number); });
      el.setAttribute('role', 'img');
      el.setAttribute('aria-label', el.getAttribute('aria-label') || pins.length + ' implantations dans le monde');
      var svg = '<svg viewBox="0 0 360 170" aria-hidden="true">';
      // Grandes masses de terre approximées par des ellipses : suffisant pour un décor en points
      var land = [[-100, 45, 50, 25], [-60, -15, 22, 32], [15, 50, 25, 15], [20, 5, 26, 32], [90, 45, 62, 25], [135, -25, 20, 12]];
      for (var y = -60; y <= 80; y += 6) for (var x = -170; x <= 175; x += 6) {
        if (land.some(function (l) { var dx = (x - l[0]) / l[2], dy = (y - l[1]) / l[3]; return dx * dx + dy * dy < 1; })) svg += '<circle class="d" cx="' + (x + 180) + '" cy="' + (85 - y) + '" r="1.2"/>';
      }
      pins.forEach(function (p, i) { svg += '<g class="p" style="--fx-i:' + i + ';transform-origin:' + (p[1] + 180) + 'px ' + (85 - p[0]) + 'px"><circle cx="' + (p[1] + 180) + '" cy="' + (85 - p[0]) + '" r="3"/><circle class="r" cx="' + (p[1] + 180) + '" cy="' + (85 - p[0]) + '" r="3"/></g>'; });
      el.innerHTML = svg + '</svg>';
    }
  });

  // Dans un tableau, la colonne survolée s'illumine en entier
  FX.register('compare-table-sweep', {
    setup: function (el) {
      var cells = el.querySelectorAll('th,td'), best = U.num(el, 'fxBest', -1);
      var mark = function (i) { cells.forEach(function (c) { c.classList.toggle('fx-col', c.cellIndex === i); }); };
      cells.forEach(function (c) {
        c.addEventListener('pointerenter', function () { if (c.cellIndex > 0) mark(c.cellIndex); });
        c.addEventListener('focusin', function () { if (c.cellIndex > 0) mark(c.cellIndex); });
      });
      el.addEventListener('pointerleave', function () { mark(best); });
      mark(best);
    }
  });

  // Un itinéraire se dessine au fil du défilement et allume ses étapes
  FX.register('map-route-draw', {
    setup: function (el) {
      var path = el.querySelector('path');
      if (!path) return;
      var L = path.getTotalLength();
      path.style.strokeDasharray = L;
      el._fxP = path; el._fxL = L;
      el._fxS = Array.prototype.slice.call(el.querySelectorAll('[data-at]')).map(function (d) { return { d: d, at: parseFloat(d.dataset.at) }; });
    },
    scroll: function (el, info) {
      if (!el._fxP) return;
      var q = el.dataset.fxDemo ? .72 : info.enter;
      el._fxP.style.strokeDashoffset = (el._fxL * (1 - q)).toFixed(1);
      el._fxS.forEach(function (s) { s.d.classList.toggle('fx-on', q >= s.at); });
    }
  });

  // Une rangée de visages, dont celui survolé s'agrandit et se présente
  FX.register('team-card-spotlight', {
    setup: function (el) {
      var k = Array.prototype.slice.call(el.children);
      var cap = document.createElement('div');
      cap.className = 'fx-tc-cap';
      cap.setAttribute('aria-live', 'polite');
      el.appendChild(cap);
      var set = function (c) {
        k.forEach(function (o) { o.classList.toggle('fx-on', o === c); });
        cap.textContent = (c.dataset.name || '') + (c.dataset.role ? ' — ' + c.dataset.role : '');
      };
      k.forEach(function (c) {
        c.tabIndex = 0;
        c.addEventListener('pointerenter', function () { set(c); });
        c.addEventListener('focus', function () { set(c); });
      });
      set(k[0]);
    }
  });

  // Un journal des nouveautés, filtrable par type
  FX.register('changelog-feed', {
    entrance: true,
    setup: function (el) {
      var items = Array.prototype.slice.call(el.children), types = [];
      items.forEach(function (it, i) {
        it.style.setProperty('--fx-i', i);
        if (it.dataset.type && types.indexOf(it.dataset.type) < 0) types.push(it.dataset.type);
      });
      if (!types.length) return;
      var bar = document.createElement('div');
      bar.className = 'fx-cf-bar';
      el.parentNode.insertBefore(bar, el);
      ['Tout'].concat(types).forEach(function (t, k) {
        var b = U.make('button', '', bar);
        b.type = 'button';
        b.textContent = t;
        b.setAttribute('aria-pressed', k === 0);
        b.addEventListener('click', function () {
          bar.querySelectorAll('button').forEach(function (o) { o.setAttribute('aria-pressed', o === b); });
          items.forEach(function (it) { it.hidden = !(k === 0 || it.dataset.type === t); });
        });
      });
    }
  });
})(window.FX);
