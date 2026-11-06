/* Pack 31 — Logistique */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Un colis qui avance sur son trajet, avec un camion sur la ligne
  FX.register('parcel-journey', {
    entrance: true,
    setup: function (el) {
      var S = (el.dataset.fxItems || 'Préparé:lun. 9 h|Expédié:lun. 18 h|En transit:mar. 7 h|En livraison:—|Livré:—').split('|').map(function (r) { var k = r.indexOf(':'); return [r.slice(0, k), r.slice(k + 1)]; }), cur = U.num(el, 'fxCurrent', 2), rail = U.make('div', 'fx-pj', el), o = U.make('p', '', el);
      rail.setAttribute('aria-hidden', 'true');
      S.forEach(function (s, i) { U.make('i', i <= cur ? 'fx-done' : '', rail).style.left = i / (S.length - 1) * 100 + '%'; });
      el.style.setProperty('--fx-q', cur / (S.length - 1));
      U.make('u', '', rail);
      o.innerHTML = '<b>' + S[cur][0] + '</b> · ' + S[cur][1] + '<br>Étape ' + (cur + 1) + ' sur ' + S.length;
    }
  });
})(window.FX);
