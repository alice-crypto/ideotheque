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
})(window.FX);
