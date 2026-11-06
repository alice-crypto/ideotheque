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
})(window.FX);
