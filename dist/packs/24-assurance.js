/* Pack 24 — Assurance */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Des garanties à cocher, et la cotisation qui se recalcule
  FX.register('premium-builder', {
    setup: function (el) {
      var base = U.num(el, 'fxBase', 18), rows = (el.dataset.fxItems || 'Vol:6|Bris de glace:4|Assistance 0 km:5').split('|');
      el.textContent = '';
      var box = U.make('div', 'fx-pb-l', el), out = U.make('output', 'fx-pb-t', el);
      out.setAttribute('aria-live', 'polite');
      var calc = function () {
        var t = base;
        box.querySelectorAll('input').forEach(function (i) { if (i.checked) t += +i.value; });
        out.innerHTML = '<b>' + t + ' €</b> par mois';
        out.classList.remove('fx-go'); void out.offsetWidth; out.classList.add('fx-go');
      };
      rows.forEach(function (r) {
        var p = r.split(':'), l = U.make('label', '', box), i = U.make('input', '', l);
        i.type = 'checkbox'; i.value = p[1];
        l.appendChild(document.createTextNode(p[0]));
        U.make('em', '', l).textContent = '+' + p[1] + ' €';
        i.addEventListener('change', calc);
      });
      calc();
    }
  });
})(window.FX);
