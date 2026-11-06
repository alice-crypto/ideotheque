/* Pack 35 — Restauration */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Une carte qu'on filtre selon son régime
  FX.register('menu-diet-filter', {
    setup: function (el) {
      var T = { v: 'Végétarien', g: 'Sans gluten', l: 'Sans lactose' }, P = (el.dataset.fxItems || 'Velouté de courge:12:vgl|Risotto aux cèpes:18:vg|Tarte fine aux poireaux:15:v|Poulet rôti:21:gl|Mousse au chocolat:8:vg').split('|').map(function (r) { var p = r.split(':'); return { n: p[0], e: p[1], t: p[2] }; });
      var f = U.make('div', 'fx-mf', el), ul = U.make('ul', '', el), o = U.make('output', '', el);
      o.setAttribute('aria-live', 'polite');
      Object.keys(T).forEach(function (k) {
        var b = U.make('button', '', f);
        b.type = 'button'; b.textContent = T[k]; b.dataset.k = k; b.setAttribute('aria-pressed', 'false');
        b.addEventListener('click', function () { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true'); go(); });
      });
      P.forEach(function (p) { p.li = U.make('li', '', ul); p.li.innerHTML = '<span>' + p.n + '</span><b>' + p.e + ' €</b>'; });
      var go = function () {
        var on = Array.prototype.filter.call(f.children, function (b) { return b.getAttribute('aria-pressed') === 'true'; }).map(function (b) { return b.dataset.k; }), n = 0;
        P.forEach(function (p) { var ok = on.every(function (k) { return p.t.indexOf(k) >= 0; }); p.li.classList.toggle('fx-off', !ok); p.li.setAttribute('aria-hidden', !ok); if (ok) n++; });
        o.textContent = n + ' plat' + (n > 1 ? 's' : '') + ' sur ' + P.length;
      };
      go();
    }
  });
})(window.FX);
