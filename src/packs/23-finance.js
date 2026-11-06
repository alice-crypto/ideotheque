/* Pack 23 — Banque et finance */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Un bandeau de cours avec le sens de chaque variation
  FX.register('ticker-tape', {
    setup: function (el) {
      var rows = (el.dataset.fxItems || 'AAA:102,4:1.2|BBB:58,1:-0.6|CCC:230,0:0.4|DDD:14,7:-2.1').split('|');
      var html = rows.map(function (r) {
        var p = r.split(':'), v = parseFloat(p[2]), up = v >= 0;
        return '<span class="' + (up ? 'fx-up' : 'fx-dn') + '"><b>' + p[0] + '</b> ' + p[1] + ' <i>' + (up ? '▲ +' : '▼ ') + p[2] + ' %</i></span>';
      }).join('');
      el.setAttribute('aria-label', 'Cours : ' + rows.join(', ').replace(/:/g, ' '));
      el.innerHTML = '<div class="fx-tt" aria-hidden="true">' + html + html + '</div>';
      el.style.setProperty('--fx-t', (rows.length * U.num(el, 'fxPace', 4)) + 's');
    }
  });

  // Un graphique en chandeliers qui se dessine bougie par bougie
  FX.register('candlestick-draw', {
    entrance: true,
    setup: function (el) {
      var d = (el.dataset.fxData || '20,26,18,24|24,28,22,23|23,25,19,20|20,27,20,26|26,31,25,30|30,32,26,27|27,34,27,33').split('|').map(function (r) { return r.split(',').map(Number); });
      var hi = Math.max.apply(null, d.map(function (c) { return c[1]; })), lo = Math.min.apply(null, d.map(function (c) { return c[2]; })), Y = function (v) { return 96 - (v - lo) / ((hi - lo) || 1) * 92; };
      var w = 100 / d.length, s = '<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">';
      d.forEach(function (c, i) {
        var x = i * w + w / 2, up = c[3] >= c[0], top = Y(Math.max(c[0], c[3])), h = Math.max(1, Math.abs(Y(c[0]) - Y(c[3])));
        s += '<g class="' + (up ? 'fx-up' : 'fx-dn') + '" style="--fx-i:' + i + '"><line x1="' + x + '" x2="' + x + '" y1="' + Y(c[1]) + '" y2="' + Y(c[2]) + '"/><rect x="' + (x - w * .3) + '" y="' + top + '" width="' + w * .6 + '" height="' + h + '"/></g>';
      });
      el.innerHTML = s + '</svg>';
      el.setAttribute('role', 'img');
      el.setAttribute('aria-label', 'Cours de ' + d[0][0] + ' à ' + d[d.length - 1][3] + ' sur ' + d.length + ' périodes');
    }
  });

  // Un solde qu'on masque d'un geste, pour la discrétion
  FX.register('balance-mask', {
    setup: function (el) {
      var v = el.textContent.trim(), key = el.dataset.fxKey, hidden = false;
      el.textContent = '';
      var out = U.make('span', 'fx-bm-v', el), b = U.make('button', 'fx-bm-b', el);
      b.type = 'button';
      var show = function () {
        out.textContent = hidden ? '••••••' : v;
        el.classList.toggle('fx-hid', hidden);
        b.setAttribute('aria-pressed', hidden);
        b.setAttribute('aria-label', hidden ? 'Afficher le montant' : 'Masquer le montant');
        b.textContent = hidden ? '○' : '●';
      };
      if (key) try { hidden = localStorage.getItem(key) === '1'; } catch (err) {}
      show();
      b.addEventListener('click', function () {
        hidden = !hidden;
        if (key) try { localStorage.setItem(key, hidden ? '1' : '0'); } catch (err) {}
        show();
      });
    }
  });

  // Un numéro de carte masqué, révélé quelques secondes
  FX.register('card-number-reveal', {
    setup: function (el) {
      var n = (el.dataset.fxNumber || '4000 0000 0000 0002').split(' '), to;
      el.textContent = '';
      var box = U.make('span', 'fx-cn', el), b = U.make('button', '', el);
      b.type = 'button';
      var groups = n.map(function (g, i) { var s = U.make('span', '', box); s.dataset.real = g; s.textContent = i === n.length - 1 ? g : '••••'; return s; });
      var set = function (on) {
        groups.forEach(function (s, i) { if (i < n.length - 1) { s.textContent = on ? s.dataset.real : '••••'; s.classList.remove('fx-go'); void s.offsetWidth; s.style.setProperty('--fx-i', i); s.classList.add('fx-go'); } });
        b.textContent = on ? 'Masquer' : 'Afficher';
        b.setAttribute('aria-pressed', on);
        clearTimeout(to);
        if (on) to = setTimeout(function () { set(false); }, U.num(el, 'fxHold', 6000));
      };
      b.addEventListener('click', function () { set(b.getAttribute('aria-pressed') !== 'true'); });
      set(false);
    }
  });

  // Deux champs de montant, reliés par un taux
  FX.register('currency-converter', {
    setup: function (el) {
      var rate = U.num(el, 'fxRate', 1.08), A = el.dataset.fxFrom || 'EUR', B = el.dataset.fxTo || 'USD';
      el.innerHTML = '<label><span></span><input type="number" min="0" step="any" value="100"></label><button type="button" aria-label="Inverser les devises">⇄</button><label><span></span><output></output></label><small></small>';
      var la = el.querySelector('label span'), lb = el.querySelectorAll('label span')[1], input = el.querySelector('input'), out = el.querySelector('output'), sw = el.querySelector('button'), note = el.querySelector('small');
      var calc = function () {
        la.textContent = A; lb.textContent = B;
        var v = (parseFloat(input.value) || 0) * rate;
        out.textContent = v.toLocaleString('fr-FR', { maximumFractionDigits: 2 });
        note.textContent = '1 ' + A + ' = ' + rate.toFixed(4) + ' ' + B + ' (taux indicatif)';
      };
      input.addEventListener('input', calc);
      sw.addEventListener('click', function () { var t = A; A = B; B = t; rate = 1 / rate; sw.classList.toggle('fx-flip'); calc(); });
      calc();
    }
  });

  // Un simulateur de crédit qui répond en direct
  FX.register('loan-calculator', {
    setup: function (el) {
      var rate = U.num(el, 'fxRate', 3.4);
      el.innerHTML = '<label>Montant <b class="a"></b><input type="range" min="5000" max="300000" step="1000" value="' + U.num(el, 'fxAmount', 120000) + '"></label><label>Durée <b class="y"></b><input type="range" min="1" max="30" value="' + U.num(el, 'fxYears', 20) + '"></label><output aria-live="polite"><strong></strong><small></small></output>';
      var r = el.querySelectorAll('input'), f = function (n) { return Math.round(n).toLocaleString('fr-FR') + ' €'; };
      var calc = function () {
        var P = +r[0].value, n = +r[1].value * 12, i = rate / 1200;
        var m = i ? P * i / (1 - Math.pow(1 + i, -n)) : P / n;
        el.querySelector('.a').textContent = f(P);
        el.querySelector('.y').textContent = r[1].value + ' ans';
        el.querySelector('strong').textContent = f(m) + ' / mois';
        el.querySelector('small').textContent = 'Coût du crédit : ' + f(m * n - P) + ' à ' + rate + ' % (simulation)';
        el.style.setProperty('--fx-q', Math.min(1, (m * n - P) / (m * n)).toFixed(3));
      };
      r.forEach(function (x) { x.addEventListener('input', calc); });
      calc();
    }
  });

  // Une courbe d'épargne qui montre l'effet du temps
  FX.register('savings-curve', {
    setup: function (el) {
      var rate = U.num(el, 'fxRate', 4) / 100;
      el.innerHTML = '<svg viewBox="0 0 200 90" preserveAspectRatio="none" role="img"><path class="a"/><path class="b"/></svg><label>Par mois <b></b><input type="range" min="10" max="1000" step="10" value="' + U.num(el, 'fxMonthly', 150) + '"></label><p aria-live="polite"></p>';
      var input = el.querySelector('input'), a = el.querySelector('.a'), b = el.querySelector('.b'), Y = U.num(el, 'fxYears', 25), svg = el.querySelector('svg');
      var draw = function () {
        var m = +input.value, cap = 0, pts = [], dep = [];
        for (var y = 0; y <= Y; y++) { pts.push(cap); dep.push(m * 12 * y); cap = (cap + m * 12) * (1 + rate); }
        var max = pts[Y], line = function (l) { return 'M' + l.map(function (v, i) { return (i / Y * 200).toFixed(1) + ' ' + (88 - v / max * 84).toFixed(1); }).join(' L'); };
        a.setAttribute('d', line(pts) + ' L200 90 L0 90 Z');
        b.setAttribute('d', line(dep));
        el.querySelector('label b').textContent = m + ' €';
        var txt = Math.round(pts[Y]).toLocaleString('fr-FR') + ' € au bout de ' + Y + ' ans, dont ' + Math.round(pts[Y] - dep[Y]).toLocaleString('fr-FR') + ' € d\'intérêts (hypothèse : ' + (rate * 100) + ' % par an)';
        el.querySelector('p').textContent = txt;
        svg.setAttribute('aria-label', txt);
      };
      input.addEventListener('input', draw);
      draw();
    }
  });

  // Dans un tableau de taux, la meilleure valeur de chaque colonne est marquée
  FX.register('rate-best-row', {
    entrance: true,
    setup: function (el) {
      var rows = el.tBodies[0] ? el.tBodies[0].rows : [];
      if (!rows.length) return;
      var mode = (el.dataset.fxBest || 'min').split(',');
      for (var c = 1; c < rows[0].cells.length; c++) {
        var best = null, bv = null, m = mode[Math.min(c - 1, mode.length - 1)];
        for (var r = 0; r < rows.length; r++) {
          var v = parseFloat(rows[r].cells[c].textContent.replace(',', '.'));
          if (!isNaN(v) && (bv === null || (m === 'max' ? v > bv : v < bv))) { bv = v; best = rows[r].cells[c]; }
        }
        if (best) { best.classList.add('fx-best'); best.setAttribute('aria-label', best.textContent.trim() + ', meilleure valeur'); best.style.setProperty('--fx-i', c); }
      }
    }
  });

  // Des opérations arrivent en haut de la liste
  FX.register('transaction-feed', {
    setup: function (el) {
      el.setAttribute('role', 'log');
      el.setAttribute('aria-live', 'polite');
      el._fxAdd = function (name, amount) {
        var r = document.createElement('div');
        r.className = 'fx-tf ' + (amount >= 0 ? 'fx-in-m' : 'fx-out-m');
        r.innerHTML = '<span></span><b></b>';
        r.firstChild.textContent = name;
        r.lastChild.textContent = (amount >= 0 ? '+' : '−') + Math.abs(amount).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' €';
        el.insertBefore(r, el.firstChild);
        while (el.children.length > U.num(el, 'fxMax', 4)) el.lastChild.remove();
      };
      var seq = [['Café Rivage', -4.2], ['Salaire', 2150], ['Librairie', -18.9], ['Remboursement', 32], ['Boulangerie', -6.4]];
      el._fxI = 0;
      el._fxSeq = seq;
      seq.slice(0, 3).forEach(function (s) { el._fxAdd(s[0], s[1]); });
      el._fxT = 0;
    },
    trigger: function (el) { var s = el._fxSeq[el._fxI++ % el._fxSeq.length]; el._fxAdd(s[0], s[1]); },
    tick: function (el, dt) {
      if (el.dataset.fxDemo !== 'true' || U.reduced) return;
      el._fxT += dt;
      if (el._fxT > 2.2) { el._fxT = 0; FX.trigger(el); }
    }
  });

  // Une carte bancaire qui suit le curseur et se retourne
  FX.register('bank-card-flip', {
    setup: function (el) {
      el.tabIndex = 0;
      el.setAttribute('role', 'button');
      el.setAttribute('aria-pressed', 'false');
      var flip = function () { var on = el.classList.toggle('fx-back'); el.setAttribute('aria-pressed', on); };
      el.addEventListener('click', flip);
      el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } });
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--fx-ry', (((e.clientX - r.left) / r.width - .5) * 22).toFixed(1) + 'deg');
        el.style.setProperty('--fx-rx', ((.5 - (e.clientY - r.top) / r.height) * 18).toFixed(1) + 'deg');
      });
      el.addEventListener('pointerleave', function () { el.style.setProperty('--fx-rx', '0deg'); el.style.setProperty('--fx-ry', '0deg'); });
    }
  });

  // Une valeur clignote brièvement selon le sens de son changement
  FX.register('price-tick-flash', {
    setup: function (el) {
      el._fxV = parseFloat(el.textContent.replace(',', '.')) || 0;
      el._fxSet = function (v) {
        var up = v >= el._fxV;
        el._fxV = v;
        el.textContent = v.toFixed(U.num(el, 'fxDigits', 2)).replace('.', ',') + (up ? ' ▲' : ' ▼');
        el.classList.remove('fx-tu', 'fx-td');
        void el.offsetWidth;
        el.classList.add(up ? 'fx-tu' : 'fx-td');
      };
      el._fxT = 0;
    },
    trigger: function (el) { el._fxSet(el._fxV + U.rand(-1.5, 1.6)); },
    tick: function (el, dt) {
      if (el.dataset.fxDemo !== 'true' || U.reduced) return;
      el._fxT += dt;
      if (el._fxT > 1.3) { el._fxT = 0; FX.trigger(el); }
    }
  });

  // Des enveloppes de budget qui se remplissent et signalent le dépassement
  FX.register('budget-envelopes', {
    entrance: true,
    setup: function (el) {
      (el.dataset.fxItems || 'Courses:320:400|Sorties:180:150|Transports:60:90').split('|').forEach(function (s, i) {
        var p = s.split(':'), use = +p[1], max = +p[2], over = use > max, r = U.make('div', 'fx-be' + (over ? ' fx-over' : ''), el);
        r.innerHTML = '<span></span><em></em><i><b></b></i>';
        r.children[0].textContent = p[0];
        r.children[1].textContent = over ? 'dépassé de ' + (use - max) + ' €' : 'reste ' + (max - use) + ' €';
        r.style.setProperty('--fx-q', Math.min(1, use / max));
        r.style.setProperty('--fx-i', i);
      });
    }
  });

  // Une addition partagée au centime près
  FX.register('bill-splitter', {
    setup: function (el) {
      el.innerHTML = '<label>Total <input type="number" min="0" step="0.01" value="' + U.num(el, 'fxTotal', 86.5) + '"></label><div class="fx-bs-c" role="group" aria-label="Nombre de personnes"><button type="button" aria-label="Une personne de moins">−</button><span></span><button type="button" aria-label="Une personne de plus">+</button></div><div class="fx-bs-p" aria-live="polite"></div>';
      var input = el.querySelector('input'), n = U.num(el, 'fxPeople', 3), lab = el.querySelector('.fx-bs-c span'), out = el.querySelector('.fx-bs-p');
      var draw = function () {
        var cents = Math.round((parseFloat(input.value) || 0) * 100), base = Math.floor(cents / n), extra = cents - base * n, h = '';
        for (var i = 0; i < n; i++) h += '<i style="--fx-i:' + i + '">' + ((base + (i < extra ? 1 : 0)) / 100).toFixed(2).replace('.', ',') + ' €</i>';
        out.innerHTML = h;
        lab.textContent = n + (n > 1 ? ' personnes' : ' personne');
      };
      var bs = el.querySelectorAll('.fx-bs-c button');
      bs[0].addEventListener('click', function () { n = Math.max(1, n - 1); draw(); });
      bs[1].addEventListener('click', function () { n = Math.min(12, n + 1); draw(); });
      input.addEventListener('input', draw);
      draw();
    }
  });
})(window.FX);
