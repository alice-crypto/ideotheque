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

  // Une facture découpée : ce que l'on paie vraiment
  FX.register('bill-slices', {
    entrance: true,
    setup: function (el) {
      var R = (el.dataset.fxItems || 'Énergie:42:Ce que vous consommez|Réseau:28:Le transport jusqu\'à chez vous|Taxes:24:Taxes et contributions|Abonnement:6:Part fixe').split('|').map(function (r) { return r.split(':'); }), tot = R.reduce(function (t, r) { return t + +r[1]; }, 0);
      var bar = U.make('div', 'fx-bl3', el), o = U.make('output', '', el);
      o.setAttribute('aria-live', 'polite');
      R.forEach(function (r, i) {
        var b = U.make('button', '', bar);
        b.type = 'button'; b.style.flex = r[1] + ' 1 0'; b.style.setProperty('--fx-i', i); b.setAttribute('aria-label', r[0] + ', ' + Math.round(r[1] / tot * 100) + ' %');
        b.textContent = Math.round(r[1] / tot * 100) >= 15 ? Math.round(r[1] / tot * 100) + ' %' : '';
        b.addEventListener('click', function () { bar.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); o.innerHTML = '<b>' + r[0] + ' : ' + r[1] + ' €</b><br>' + r[2]; });
        if (!i) b.click();
      });
    }
  });
})(window.FX);
