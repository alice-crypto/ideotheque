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

  // Les prochains passages, avec leurs minutes qui descendent
  FX.register('next-departures', {
    setup: function (el) {
      var T = (el.dataset.fxItems || '12:Gare centrale:2|4:Stade:5|12:Gare centrale:9|7:Hôpital:14').split('|').map(function (r) { var p = r.split(':'); return { l: p[0], d: p[1], at: Date.now() + p[2] * 60000 }; }), ul = U.make('ul', '', el);
      var draw = function () {
        ul.innerHTML = '';
        T = T.filter(function (x) { return x.at > Date.now(); });
        T.slice(0, 4).forEach(function (x) {
          var m = Math.max(0, Math.round((x.at - Date.now()) / 60000)), li = U.make('li', m < 2 ? 'fx-now' : '', ul);
          li.innerHTML = '<b>' + x.l + '</b><span>' + x.d + '</span><em>' + (m < 1 ? 'À l\'approche' : m + ' min') + '</em>';
        });
        if (!T.length) ul.innerHTML = '<li>Plus de passage annoncé</li>';
      };
      draw();
      setInterval(draw, 15000);
    }
  });
})(window.FX);
