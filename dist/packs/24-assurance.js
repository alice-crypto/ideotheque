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

  // Une franchise à régler : ce qu'on paie en cas de sinistre contre chaque mois
  FX.register('deductible-slider', {
    setup: function (el) {
      var min = U.num(el, 'fxMin', 0), max = U.num(el, 'fxMax', 1000), top = U.num(el, 'fxTop', 48), low = U.num(el, 'fxLow', 26);
      el.innerHTML = '<label>Franchise <input type="range" min="' + min + '" max="' + max + '" step="50"></label><div class="fx-ds"><span><b class="a"></b>en cas de sinistre</span><span><b class="c"></b>par mois</span></div>';
      var r = el.querySelector('input'), a = el.querySelector('.a'), c = el.querySelector('.c');
      r.value = U.num(el, 'fxValue', 300);
      var go = function () {
        var q = (r.value - min) / (max - min);
        a.textContent = (+r.value).toLocaleString('fr-FR') + ' €';
        c.textContent = Math.round(top - (top - low) * Math.sqrt(q)) + ' €';
        el.style.setProperty('--fx-q', q);
        r.setAttribute('aria-valuetext', a.textContent + ' de franchise, ' + c.textContent + ' par mois');
      };
      r.addEventListener('input', go);
      go();
    }
  });
})(window.FX);
