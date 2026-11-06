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

  // Réserver une table : combien, et à quelle heure
  FX.register('table-booking', {
    setup: function (el) {
      var S = (el.dataset.fxItems || '19:00:8|19:30:4|20:00:2|20:30:6|21:00:10').split('|').map(function (r) { var p = r.split(':'); return { h: p[0] + ':' + p[1], left: +p[2] }; }), n = U.num(el, 'fxParty', 2);
      el.innerHTML = '<div class="fx-tb"><button type="button" aria-label="Moins de couverts">−</button><span aria-live="polite"></span><button type="button" aria-label="Plus de couverts">+</button></div><div class="fx-tb-s"></div><output aria-live="polite"></output>';
      var B = el.querySelectorAll('.fx-tb button'), c = el.querySelector('.fx-tb span'), box = el.querySelector('.fx-tb-s'), o = el.querySelector('output');
      var show = function () {
        c.textContent = n + ' couvert' + (n > 1 ? 's' : '');
        box.innerHTML = '';
        S.forEach(function (s, i) {
          var b = U.make('button', '', box);
          b.type = 'button'; b.textContent = s.h; b.disabled = s.left < n; b.style.setProperty('--fx-i', i);
          b.addEventListener('click', function () {
            box.querySelectorAll('button').forEach(function (x) { x.classList.toggle('fx-on', x === b); });
            o.innerHTML = 'Table pour <b>' + n + '</b> à <b>' + s.h + '</b>';
            el.dispatchEvent(new CustomEvent('fx:booking', { bubbles: true, detail: { party: n, time: s.h } }));
          });
        });
        o.textContent = 'Choisissez une heure';
      };
      B[0].addEventListener('click', function () { n = Math.max(1, n - 1); show(); });
      B[1].addEventListener('click', function () { n = Math.min(12, n + 1); show(); });
      show();
    }
  });

  // Un plan de salle pour choisir sa table
  FX.register('floor-tables', {
    setup: function (el) {
      var T = (el.dataset.fxItems || '12:18:2:o|38:18:2:f|66:18:4:f|12:62:4:f|40:62:6:o|72:64:2:f').split('|').map(function (r) { var p = r.split(':'); return { x: +p[0], y: +p[1], s: +p[2], st: p[3] }; }), box = U.make('div', 'fx-ft', el), o = U.make('output', '', el);
      o.setAttribute('aria-live', 'polite');
      o.textContent = 'Touchez une table libre';
      T.forEach(function (t, i) {
        var b = U.make('button', 's' + t.s, box);
        b.type = 'button'; b.textContent = t.s;
        b.style.left = t.x + '%'; b.style.top = t.y + '%';
        b.setAttribute('aria-label', 'Table ' + (i + 1) + ', ' + t.s + ' places, ' + (t.st === 'o' ? 'occupée' : 'libre'));
        if (t.st === 'o') b.disabled = true;
        b.addEventListener('click', function () {
          box.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
          o.innerHTML = '<b>Table ' + (i + 1) + '</b>, ' + t.s + ' places';
        });
      });
    }
  });

  // Un bon de cuisine : plat à plat, avec son temps écoulé
  FX.register('kitchen-ticket', {
    setup: function (el) {
      var I = (el.dataset.fxItems || '2 Burgers|1 Salade César|1 Frites').split('|'), start = Date.now(), lim = U.num(el, 'fxLimit', 15);
      el.innerHTML = '<div class="fx-kt"><header><b>Table ' + U.num(el, 'fxTable', 12) + '</b><time></time></header><ul></ul></div><output aria-live="polite"></output>';
      var ul = el.querySelector('ul'), t = el.querySelector('time'), o = el.querySelector('output');
      I.forEach(function (x) {
        var b = U.make('button', '', U.make('li', '', ul));
        b.type = 'button'; b.textContent = x; b.setAttribute('aria-pressed', 'false');
        b.addEventListener('click', function () { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true'); count(); });
      });
      var count = function () {
        var left = ul.querySelectorAll('[aria-pressed=false]').length;
        el.classList.toggle('fx-done', !left);
        o.textContent = left ? left + ' à envoyer' : 'Bon complet, envoyé en salle';
      };
      var tick = function () {
        var m = (Date.now() - start) / 60000 + U.num(el, 'fxPast', 7);
        t.textContent = Math.floor(m) + ' min';
        el.classList.toggle('fx-late', m > lim);
      };
      count(); tick();
      setInterval(tick, 15000);
    }
  });

  // Composer son bol : les ingrédients tombent dedans
  FX.register('bowl-builder', {
    setup: function (el) {
      var I = (el.dataset.fxItems || 'Riz:#f3ecd2:1:210|Saumon:#f28c6a:4:180|Avocat:#8bb94e:2:120|Edamame:#5da34a:1.5:70|Carotte:#ef8a2c:.5:25|Maïs:#f2d045:.5:60').split('|').map(function (r) { var p = r.split(':'); return { n: p[0], c: p[1], e: +p[2], k: +p[3] }; }), base = U.num(el, 'fxBase', 6), box = U.make('div', 'fx-bb', el), list = U.make('div', 'fx-bb-l', el), o = U.make('output', '', el);
      box.setAttribute('aria-hidden', 'true');
      o.setAttribute('aria-live', 'polite');
      I.forEach(function (x) {
        var b = U.make('button', '', list);
        b.type = 'button'; b.textContent = x.n; b.setAttribute('aria-pressed', 'false');
        b.style.setProperty('--fx-c', x.c);
        b.addEventListener('click', function () { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true'); go(); });
        x.b = b; x.parts = [];
        for (var i = 0; i < 8; i++) { var d = U.make('i', '', box), a = U.rand(0, 6.28), r = U.rand(0, 42); d.style.cssText = 'left:' + (50 + Math.cos(a) * r) + '%;top:' + (50 + Math.sin(a) * r * .5) + '%;background:' + x.c + ';--fx-d:' + U.rand(0, 180).toFixed(0) + 'ms'; x.parts.push(d); }
      });
      var go = function () {
        var e = base, k = 0;
        I.forEach(function (x) { var on = x.b.getAttribute('aria-pressed') === 'true'; if (on) { e += x.e; k += x.k; } x.parts.forEach(function (d) { d.classList.toggle('fx-on', on); }); });
        o.innerHTML = '<b>' + e.toFixed(2).replace('.', ',') + ' €</b> · ' + k + ' kcal';
      };
      I[0].b.click();
    }
  });

  // Une pizza moitié-moitié : chaque garniture va sur le côté choisi
  FX.register('pizza-builder', {
    setup: function (el) {
      var T = (el.dataset.fxItems || 'Olive:#2c3320|Tomate:#d6341f|Basilic:#3f8f3d|Champignon:#b79779').split('|').map(function (r) { return r.split(':'); }), base = U.num(el, 'fxBase', 9), box = U.make('div', 'fx-pz', el), f = U.make('div', 'fx-pz-s', el), list = U.make('div', 'fx-pz-t', el), o = U.make('output', '', el), side = 0, st = {};
      box.setAttribute('aria-hidden', 'true');
      o.setAttribute('aria-live', 'polite');
      ['Gauche', 'Droite', 'Toute'].forEach(function (s, i) {
        var b = U.make('button', '', f);
        b.type = 'button'; b.textContent = s; b.setAttribute('aria-pressed', i === 0);
        b.addEventListener('click', function () { side = i; f.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); });
      });
      T.forEach(function (t) {
        st[t[0]] = -1;
        var b = U.make('button', '', list);
        b.type = 'button'; b.textContent = t[0];
        t.parts = [];
        for (var k = 0; k < 12; k++) { var d = U.make('i', '', box), a = U.rand(.3, 2.84), r = U.rand(12, 40), left = k % 2 === 0; d.style.left = (50 + (left ? -1 : 1) * Math.sin(a) * r) + '%'; d.style.top = (50 + Math.cos(a) * r) + '%'; d.style.background = t[1]; d.dataset.l = left ? '1' : ''; t.parts.push(d); }
        b.addEventListener('click', function () { st[t[0]] = st[t[0]] === side ? -1 : side; draw(); b.classList.toggle('fx-on', st[t[0]] >= 0); });
      });
      var draw = function () {
        var c = 0;
        T.forEach(function (t) {
          var s = st[t[0]];
          if (s >= 0) c += s === 2 ? 2 : 1;
          t.parts.forEach(function (d) { d.classList.toggle('fx-on', s === 2 || (s === 0 && d.dataset.l) || (s === 1 && !d.dataset.l)); });
        });
        o.innerHTML = '<b>' + (base + c).toFixed(2).replace('.', ',') + ' €</b>';
      };
      st[T[0][0]] = 2;
      list.firstChild.classList.add('fx-on');
      draw();
    }
  });

  // Partager l'addition et le pourboire
  FX.register('tip-split', {
    setup: function (el) {
      var P = U.num(el, 'fxTotal', 86);
      el.innerHTML = '<label>Addition <input type="number" min="0" value="' + P + '"></label><div class="fx-ts2" role="radiogroup" aria-label="Pourboire">' + [0, 5, 10, 15].map(function (v) { return '<button type="button" role="radio" data-v="' + v + '" aria-checked="' + (v === 10) + '">' + v + ' %</button>'; }).join('') + '</div><label>Personnes <input type="number" min="1" max="20" value="' + U.num(el, 'fxPeople', 3) + '"></label><output aria-live="polite"></output>';
      var I = el.querySelectorAll('input'), o = el.querySelector('output'), t = 10;
      var go = function () {
        var a = +I[0].value || 0, n = Math.max(1, +I[1].value || 1), tot = a * (1 + t / 100), each = Math.ceil(tot / n * 100) / 100;
        o.innerHTML = '<b>' + each.toFixed(2).replace('.', ',') + ' €</b> par personne<br>Total avec pourboire : ' + tot.toFixed(2).replace('.', ',') + ' €';
      };
      el.querySelectorAll('button').forEach(function (b) { b.addEventListener('click', function () { t = +b.dataset.v; el.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-checked', x === b); }); go(); }); });
      el.addEventListener('input', go);
      go();
    }
  });
})(window.FX);
