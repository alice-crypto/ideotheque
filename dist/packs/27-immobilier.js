/* Pack 27 — Immobilier */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Ce qu'on peut acheter selon son revenu, son apport et la durée
  FX.register('budget-reach', {
    setup: function (el) {
      var rate = U.num(el, 'fxRate', 3.4) / 1200, part = U.num(el, 'fxPart', 35) / 100;
      var R = [['Revenus par mois', 'i', 1000, 8000, 100, 3200], ['Apport', 'a', 0, 100000, 1000, 20000], ['Durée (ans)', 'y', 10, 25, 1, 20]], H = '';
      R.forEach(function (r) { H += '<label>' + r[0] + ' <b data-o="' + r[1] + '"></b><input type="range" data-k="' + r[1] + '" min="' + r[2] + '" max="' + r[3] + '" step="' + r[4] + '" value="' + r[5] + '"></label>'; });
      el.innerHTML = H + '<output aria-live="polite"></output><small>Estimation fictive à ' + String(U.num(el, 'fxRate', 3.4)).replace('.', ',') + ' %, hors frais.</small>';
      var o = el.querySelector('output'), g = function (k) { return +el.querySelector('[data-k=' + k + ']').value; };
      var go = function () {
        var n = g('y') * 12, m = g('i') * part, cap = m * (1 - Math.pow(1 + rate, -n)) / rate, tot = cap + g('a');
        ['i', 'a'].forEach(function (k) { el.querySelector('[data-o=' + k + ']').textContent = g(k).toLocaleString('fr-FR') + ' €'; });
        el.querySelector('[data-o=y]').textContent = g('y') + ' ans';
        o.innerHTML = 'Budget possible <b>' + (Math.round(tot / 1000) * 1000).toLocaleString('fr-FR') + ' €</b>';
        el.style.setProperty('--fx-q', Math.min(1, tot / 600000));
      };
      el.addEventListener('input', go);
      go();
    }
  });
})(window.FX);
