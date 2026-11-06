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

  // Le créneau de livraison sur la journée, et l'heure qu'il est
  FX.register('delivery-window', {
    setup: function (el) {
      var a = U.num(el, 'fxFrom', 14), b = U.num(el, 'fxTo', 16), s = U.num(el, 'fxStart', 7), e = U.num(el, 'fxEnd', 21), W = e - s;
      el.innerHTML = '<div class="fx-dw" aria-hidden="true"><em style="left:' + (a - s) / W * 100 + '%;width:' + (b - a) / W * 100 + '%"></em><i></i></div><div class="fx-dw-h" aria-hidden="true"><span>' + s + ' h</span><span>' + e + ' h</span></div><output aria-live="polite"></output>';
      var o = el.querySelector('output'), bar = el.querySelector('.fx-dw i');
      var go = function () {
        var d = new Date(), h = d.getHours() + d.getMinutes() / 60;
        bar.style.left = U.clamp((h - s) / W, 0, 1) * 100 + '%';
        el.classList.toggle('fx-now', h >= a && h < b);
        o.innerHTML = h < a ? 'Livraison entre <b>' + a + ' h et ' + b + ' h</b>, dans ' + Math.ceil(a - h) + ' h' : h < b ? '<b>Votre livreur arrive</b>, avant ' + b + ' h' : 'Créneau passé : suivez votre colis';
      };
      go();
      setInterval(go, 60000);
    }
  });
})(window.FX);
