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

  // Une horloge de 24 h : heures creuses, heures pleines et maintenant
  FX.register('peak-clock', {
    setup: function (el) {
      var Z = (el.dataset.fxOff || '0-6,14-16').split(',').map(function (s) { return s.split('-').map(Number); });
      var deg = function (h) { return h / 24 * 360; }, grad = Z.map(function (z) { return 'var(--fx-off, #2d9c7f) ' + deg(z[0]) + 'deg ' + deg(z[1]) + 'deg'; });
      var st = [], pos = 0;
      Z.forEach(function (z, i) { if (z[0] > pos) st.push('color-mix(in srgb, currentColor 20%, transparent) ' + deg(pos) + 'deg ' + deg(z[0]) + 'deg'); st.push(grad[i]); pos = z[1]; });
      st.push('color-mix(in srgb, currentColor 20%, transparent) ' + deg(pos) + 'deg 360deg');
      el.innerHTML = '<div class="fx-pk" aria-hidden="true" style="background:conic-gradient(' + st.join(',') + ')"><i></i><span>0</span><span>6</span><span>12</span><span>18</span></div><output></output>';
      var o = el.querySelector('output'), hand = el.querySelector('i');
      var go = function () {
        var d = new Date(), h = d.getHours() + d.getMinutes() / 60, off = Z.some(function (z) { return h >= z[0] && h < z[1]; });
        hand.style.transform = 'rotate(' + deg(h) + 'deg)';
        el.classList.toggle('fx-now-off', off);
        if (off) { o.textContent = 'Heure creuse en ce moment'; return; }
        var nx = Z.map(function (z) { return z[0] > h ? z[0] - h : z[0] + 24 - h; }).sort(function (a, b) { return a - b; })[0];
        o.textContent = 'Heure pleine, creuse dans ' + Math.ceil(nx) + ' h';
      };
      go();
      setInterval(go, 60000);
    }
  });
})(window.FX);
