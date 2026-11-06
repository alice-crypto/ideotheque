/* Pack 30 — Mobilité */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Une ligne de métro : on touche un arrêt pour lire le temps de trajet
  FX.register('metro-line', {
    setup: function (el) {
      var S = (el.dataset.fxItems || 'Gare:0|Marché:3|Université:2|Parc:4|Stade:3').split('|').map(function (r) { var p = r.split(':'); return { n: p[0], m: +p[1] }; }), box = U.make('ol', 'fx-ml', el), o = U.make('output', '', el);
      o.setAttribute('aria-live', 'polite');
      var from = U.num(el, 'fxFrom', 0);
      var pick = function (k) {
        var a = Math.min(from, k), b = Math.max(from, k), t = 0;
        for (var i = a + 1; i <= b; i++) t += S[i].m;
        Array.prototype.forEach.call(box.children, function (li, i) { li.classList.toggle('fx-on', i >= a && i <= b); li.classList.toggle('fx-to', i === k); });
        o.innerHTML = k === from ? 'Vous êtes à <b>' + S[from].n + '</b>' : S[from].n + ' → <b>' + S[k].n + '</b>, ' + t + ' min, ' + (b - a) + ' arrêt' + (b - a > 1 ? 's' : '');
      };
      S.forEach(function (s, i) {
        var li = U.make('li', '', box), b = U.make('button', '', li);
        b.type = 'button'; b.innerHTML = '<i></i><span>' + s.n + '</span>';
        b.addEventListener('click', function () { pick(i); });
      });
      pick(from);
    }
  });
})(window.FX);
