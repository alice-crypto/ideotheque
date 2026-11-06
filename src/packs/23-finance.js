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
})(window.FX);
