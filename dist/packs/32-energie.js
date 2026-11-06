/* Pack 32 — Énergie */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Des panneaux à poser sur un toit, et ce qu'ils produisent
  FX.register('solar-roof', {
    setup: function (el) {
      var kwp = .42, yld = U.num(el, 'fxYield', 1200), price = U.num(el, 'fxKwh', .21), cost = U.num(el, 'fxCost', 650), max = 15;
      el.innerHTML = '<div class="fx-sr2" aria-hidden="true"></div><label>Panneaux <b></b><input type="range" min="2" max="' + max + '"></label><output aria-live="polite"></output><small>Calcul fictif avec 50 % d\'autoconsommation.</small>';
      var box = el.querySelector('.fx-sr2'), r = el.querySelector('input'), o = el.querySelector('output');
      for (var i = 0; i < max; i++) U.make('i', '', box);
      r.value = U.num(el, 'fxCount', 8);
      var go = function () {
        var n = +r.value, prod = n * kwp * yld, gain = prod * .5 * price, invest = n * cost, y = invest / gain;
        Array.prototype.forEach.call(box.children, function (p, i) { p.classList.toggle('fx-on', i < n); });
        el.querySelector('label b').textContent = n + ' · ' + (n * kwp).toFixed(1).replace('.', ',') + ' kWc';
        o.innerHTML = '<b>' + Math.round(prod).toLocaleString('fr-FR') + ' kWh/an</b><br>' + Math.round(gain) + ' € d\'économie, rentable en ' + Math.round(y) + ' ans';
      };
      r.addEventListener('input', go);
      go();
    }
  });
})(window.FX);
