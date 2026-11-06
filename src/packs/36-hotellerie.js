/* Pack 36 — Hôtellerie */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Choisir ses dates de séjour : deux clics, et les nuits se comptent
  FX.register('stay-range', {
    setup: function (el) {
      var P = U.num(el, 'fxPrice', 110), W = U.num(el, 'fxWeekend', 145), a = null, b = null, start = new Date();
      start.setHours(0, 0, 0, 0);
      var box = U.make('div', 'fx-sr3', el), o = U.make('output', '', el), D = [];
      o.setAttribute('aria-live', 'polite');
      for (var i = 0; i < 21; i++) (function (i) {
        var d = new Date(+start + i * 86400000), c = U.make('button', '', box);
        c.type = 'button'; c.textContent = d.getDate();
        c.setAttribute('aria-label', d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }));
        c.style.gridColumnStart = i === 0 ? ((d.getDay() + 6) % 7 + 1) : 'auto';
        c.addEventListener('click', function () {
          if (a === null || b !== null) { a = i; b = null; } else if (i <= a) a = i; else b = i;
          show();
        });
        D.push({ d: d, c: c });
      })(i);
      var show = function () {
        D.forEach(function (x, i) {
          x.c.classList.toggle('fx-e', i === a || i === b);
          x.c.classList.toggle('fx-r', b !== null && i > a && i < b);
        });
        if (b === null) { o.textContent = a === null ? 'Choisissez votre arrivée' : 'Choisissez votre départ'; return; }
        var t = 0;
        for (var k = a; k < b; k++) { var g = D[k].d.getDay(); t += g === 5 || g === 6 ? W : P; }
        o.innerHTML = '<b>' + (b - a) + ' nuit' + (b - a > 1 ? 's' : '') + '</b> · ' + t.toLocaleString('fr-FR') + ' € (exemple)';
        el.dispatchEvent(new CustomEvent('fx:stay', { bubbles: true, detail: { from: D[a].d, to: D[b].d, total: t } }));
      };
      show();
    }
  });

  // Passer d'une chambre à l'autre, avec sa surface à l'échelle
  FX.register('room-type', {
    setup: function (el) {
      var R = (el.dataset.fxItems || 'Classique:18:1 grand lit:Cour:119|Supérieure:26:1 très grand lit:Jardin:159|Suite:44:Chambre et salon:Mer:249').split('|').map(function (r) { return r.split(':'); }), max = Math.max.apply(null, R.map(function (r) { return +r[1]; }));
      el.innerHTML = '<div class="fx-rt2" role="radiogroup" aria-label="Type de chambre"></div><div class="fx-rt2-s" aria-hidden="true"><i></i></div><ul aria-live="polite"></ul>';
      var f = el.querySelector('.fx-rt2'), ul = el.querySelector('ul');
      var pick = function (r, b) {
        f.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-checked', x === b); });
        el.style.setProperty('--fx-q', Math.sqrt(r[1] / max));
        ul.innerHTML = '<li><span>Surface</span><b>' + r[1] + ' m²</b></li><li><span>Couchage</span><b>' + r[2] + '</b></li><li><span>Vue</span><b>' + r[3] + '</b></li><li><span>À partir de</span><b>' + r[4] + ' €</b></li>';
      };
      R.forEach(function (r, i) {
        var b = U.make('button', '', f);
        b.type = 'button'; b.setAttribute('role', 'radio'); b.textContent = r[0];
        b.addEventListener('click', function () { pick(r, b); });
        if (i === 1) pick(r, b);
      });
    }
  });

  // Combien de voyageurs : adultes, enfants et chambres
  FX.register('guest-steppers', {
    setup: function (el) {
      var R = [['Adultes', 'à partir de 13 ans', 2, 1, 8], ['Enfants', 'de 2 à 12 ans', 0, 0, 6], ['Chambres', '', 1, 1, 4]];
      var b = U.make('button', 'fx-gs2-b', el), box = U.make('div', 'fx-gs2', el);
      b.type = 'button'; b.setAttribute('aria-expanded', el.dataset.fxOpen === 'false' ? 'false' : 'true');
      R.forEach(function (r) {
        var d = U.make('div', '', box);
        d.innerHTML = '<span>' + r[0] + (r[1] ? '<small>' + r[1] + '</small>' : '') + '</span><button type="button" aria-label="Retirer : ' + r[0] + '">−</button><b aria-live="polite"></b><button type="button" aria-label="Ajouter : ' + r[0] + '">+</button>';
        var B = d.querySelectorAll('button');
        r.t = d.querySelector('b'); r.m = B[0]; r.p = B[1];
        B[0].addEventListener('click', function () { r[2]--; show(); });
        B[1].addEventListener('click', function () { r[2]++; show(); });
      });
      var show = function () {
        R.forEach(function (r) { r.t.textContent = r[2]; r.m.disabled = r[2] <= r[3]; r.p.disabled = r[2] >= r[4]; });
        var a = R[0][2], c = R[1][2], rm = R[2][2];
        b.textContent = (a + c) + ' voyageur' + (a + c > 1 ? 's' : '') + ', ' + rm + ' chambre' + (rm > 1 ? 's' : '');
        el.dispatchEvent(new CustomEvent('fx:guests', { bubbles: true, detail: { adults: a, children: c, rooms: rm } }));
      };
      b.addEventListener('click', function () { b.setAttribute('aria-expanded', b.getAttribute('aria-expanded') !== 'true'); });
      show();
    }
  });
})(window.FX);
