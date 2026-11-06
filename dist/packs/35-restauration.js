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

  // Un écran de retrait : préparation d'un côté, prêt de l'autre
  FX.register('pickup-board', {
    setup: function (el) {
      var n = U.num(el, 'fxStart', 204), A = [n, n + 1, n + 2, n + 3], B = [n - 1, n - 2];
      el.innerHTML = '<div class="fx-pb"><div><h4>En préparation</h4><ul class="a"></ul></div><div><h4>Prêt</h4><ul class="b" aria-live="polite"></ul></div></div>';
      var ua = el.querySelector('.a'), ub = el.querySelector('.b');
      el._fxDraw = function () {
        ua.innerHTML = A.map(function (x) { return '<li>' + x + '</li>'; }).join('');
        ub.innerHTML = B.map(function (x, i) { return '<li class="' + (i === 0 ? 'fx-new' : '') + '">' + x + '</li>'; }).join('');
      };
      el._fxStep = function () {
        if (A.length) B.unshift(A.shift());
        A.push((A.length ? A[A.length - 1] : B[0]) + 1);
        if (B.length > 3) B.pop();
        el._fxDraw();
      };
      el._fxDraw();
      if (!U.reduced) setInterval(el._fxStep, U.num(el, 'fxEvery', 4000));
    },
    trigger: function (el) { el._fxStep(); }
  });

  // Un minuteur de cuisine avec ses préréglages
  FX.register('egg-timer', {
    setup: function (el) {
      var P = (el.dataset.fxItems || 'Coque:3|Mollet:6|Dur:9').split('|').map(function (r) { var p = r.split(':'); return [p[0], +p[1]]; }), end = 0, tot = 0, iv;
      el.innerHTML = '<div class="fx-et"><div class="fx-et-y"></div></div><b role="timer">0:00</b><div class="fx-et-b"></div><output aria-live="assertive"></output>';
      var t = el.querySelector('b'), box = el.querySelector('.fx-et-b'), o = el.querySelector('output');
      var tick = function () {
        var left = Math.max(0, end - Date.now()), s = Math.ceil(left / 1000);
        t.textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
        el.style.setProperty('--fx-q', tot ? left / tot : 0);
        if (!left) { clearInterval(iv); el.classList.add('fx-ring'); o.textContent = 'C\'est prêt !'; }
      };
      el._fxStart = function (m) { tot = m * 60000; end = Date.now() + tot; el.classList.remove('fx-ring'); o.textContent = ''; clearInterval(iv); iv = setInterval(tick, 250); tick(); };
      P.forEach(function (p) {
        var b = U.make('button', '', box);
        b.type = 'button'; b.textContent = p[0] + ' ' + p[1] + ' min';
        b.addEventListener('click', function () { el._fxStart(p[1]); });
      });
    },
    trigger: function (el) { el._fxStart(.05); }
  });

  // Une recette qui s'adapte au nombre de convives
  FX.register('recipe-scale', {
    setup: function (el) {
      var R = (el.dataset.fxItems || 'Farine:200:g|Lait:40:cl|Œufs:2:|Beurre:50:g|Sel:0.5:c. à café').split('|').map(function (r) { var p = r.split(':'); return { n: p[0], q: +p[1], u: p[2] }; }), base = U.num(el, 'fxServes', 4), n = base;
      el.innerHTML = '<div class="fx-rs2"><button type="button" aria-label="Moins de parts">−</button><span aria-live="polite"></span><button type="button" aria-label="Plus de parts">+</button></div><ul></ul>';
      var ul = el.querySelector('ul'), lab = el.querySelector('.fx-rs2 span');
      var nice = function (v, u) { if (u === 'g' || u === 'cl') return String(Math.round(v / (v > 20 ? 5 : 1)) * (v > 20 ? 5 : 1)); var w = Math.round(v * 4) / 4; return String(w).replace('.', ','); };
      R.forEach(function (r) { r.li = U.make('li', '', ul); r.li.innerHTML = '<span>' + r.n + '</span><b></b>'; });
      var go = function () {
        lab.textContent = n + ' part' + (n > 1 ? 's' : '');
        R.forEach(function (r) { var b = r.li.querySelector('b'); b.textContent = nice(r.q * n / base, r.u) + (r.u ? ' ' + r.u : ''); b.classList.remove('fx-go'); void b.offsetWidth; b.classList.add('fx-go'); });
      };
      var B = el.querySelectorAll('button');
      B[0].addEventListener('click', function () { n = Math.max(1, n - 1); go(); });
      B[1].addEventListener('click', function () { n = Math.min(24, n + 1); go(); });
      go();
    }
  });

  // Un plat choisi, le vin qui lui va, et son profil
  FX.register('wine-pairing', {
    setup: function (el) {
      var D = JSON.parse(el.dataset.fxData || '{"Poisson grillé":["Blanc sec",[80,20,15]],"Bœuf en sauce":["Rouge charpenté",[25,75,80]],"Fromage de chèvre":["Blanc vif",[90,15,10]],"Fraises":["Rosé doux",[50,35,25]]}'), K = ['Acidité', 'Corps', 'Tanins'];
      el.innerHTML = '<select aria-label="Votre plat">' + Object.keys(D).map(function (k) { return '<option>' + k + '</option>'; }).join('') + '</select><div class="fx-wp"><div class="fx-wp-g" aria-hidden="true"></div><div><output aria-live="polite"></output><ul></ul></div></div>';
      var s = el.querySelector('select'), o = el.querySelector('output'), ul = el.querySelector('ul'), g = el.querySelector('.fx-wp-g');
      K.forEach(function (k) { var li = U.make('li', '', ul); li.innerHTML = '<span>' + k + '</span><i></i>'; });
      var go = function () {
        var d = D[s.value];
        o.textContent = d[0];
        g.dataset.t = d[0].split(' ')[0];
        Array.prototype.forEach.call(ul.children, function (li, i) { li.style.setProperty('--fx-q', d[1][i] / 100); });
      };
      s.addEventListener('change', go);
      go();
    }
  });

  // De la vapeur qui monte au-dessus d'un contenu
  FX.register('steam-rise', {
    setup: function (el) {
      var n = U.num(el, 'fxCount', 5), box = U.make('div', 'fx-st2', el);
      box.setAttribute('aria-hidden', 'true');
      U.ensurePositioned(el);
      for (var i = 0; i < n; i++) {
        var v = U.make('i', '', box);
        v.style.left = 20 + i * (60 / Math.max(1, n - 1)) + '%';
        v.style.setProperty('--fx-t', U.rand(2.6, 4.6).toFixed(2) + 's');
        v.style.setProperty('--fx-d', -U.rand(0, 4).toFixed(2) + 's');
        v.style.setProperty('--fx-x', U.rand(-16, 16).toFixed(0) + 'px');
      }
    }
  });

  // Une carte à l'ancienne, avec les points qui courent jusqu'au prix
  FX.register('menu-leaders', {
    entrance: true,
    setup: function (el) {
      var R = (el.dataset.fxItems || 'Velouté de saison:12|Daurade au fenouil:24|Pot-au-feu de la maison:21|Tarte au citron:9').split('|').map(function (r) { var k = r.lastIndexOf(':'); return [r.slice(0, k), r.slice(k + 1)]; }), ul = U.make('ul', '', el);
      R.forEach(function (r, i) {
        var li = U.make('li', '', ul);
        li.style.setProperty('--fx-i', i);
        li.innerHTML = '<span>' + r[0] + '</span><i aria-hidden="true"></i><b>' + r[1] + ' €</b>';
      });
    }
  });

  // Choisir son niveau de piment, de doux à brûlant
  FX.register('spice-level', {
    setup: function (el) {
      var W = (el.dataset.fxItems || 'Doux|Relevé|Épicé|Fort|Brûlant').split('|'), box = U.make('div', 'fx-sv', el), o = U.make('output', '', el), v = U.num(el, 'fxValue', 2);
      box.setAttribute('role', 'radiogroup'); box.setAttribute('aria-label', 'Niveau de piment');
      o.setAttribute('aria-live', 'polite');
      var set = function (k, f) {
        v = U.clamp(k, 0, W.length - 1);
        box.querySelectorAll('button').forEach(function (b, i) { b.classList.toggle('fx-on', i <= v); b.setAttribute('aria-checked', i === v); b.tabIndex = i === v ? 0 : -1; if (i === v && f) b.focus(); });
        o.textContent = W[v];
        el.style.setProperty('--fx-q', v / (W.length - 1));
      };
      W.forEach(function (t, i) {
        var b = U.make('button', '', box);
        b.type = 'button'; b.setAttribute('role', 'radio'); b.setAttribute('aria-label', t);
        b.innerHTML = '<svg viewBox="0 0 24 32" aria-hidden="true"><path d="M13 7C20 9 21 18 16 24C13 28 8 30 6 28C11 26 9 18 10 12C10 9 11 8 13 7Z"/><path class="t" d="M13 7C13 4 15 3 17 2"/></svg>';
        b.addEventListener('click', function () { set(i); });
      });
      box.addEventListener('keydown', function (e) { var d = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 }[e.key]; if (d) { e.preventDefault(); set(v + d, true); } });
      set(v);
    }
  });

  // Le dosage du café, selon le volume et l'intensité
  FX.register('brew-ratio', {
    setup: function (el) {
      el.innerHTML = '<div class="fx-br2" aria-hidden="true"><i class="w"></i><i class="c"></i></div><label>Eau <b data-w></b><input data-k="w" type="range" min="100" max="1000" step="20" value="300"></label><label>Intensité <b data-r></b><input data-k="r" type="range" min="12" max="20" value="16"></label><output aria-live="polite"></output>';
      var W = el.querySelector('[data-k=w]'), R = el.querySelector('[data-k=r]'), o = el.querySelector('output');
      var go = function () {
        var w = +W.value, r = +R.value, c = w / r;
        el.querySelector('[data-w]').textContent = w + ' ml';
        el.querySelector('[data-r]').textContent = '1:' + r + (r <= 14 ? ' (corsé)' : r >= 18 ? ' (léger)' : ' (équilibré)');
        el.style.setProperty('--fx-a', w / 1000); el.style.setProperty('--fx-b', c / 80);
        o.innerHTML = '<b>' + Math.round(c) + ' g</b> de café moulu';
      };
      el.addEventListener('input', go);
      go();
    }
  });

  // Une tasse dont on voit les couches, selon la boisson
  FX.register('latte-layers', {
    setup: function (el) {
      var D = JSON.parse(el.dataset.fxData || '{"Espresso":[["Café",100,"#3d2212"]],"Cappuccino":[["Café",33,"#3d2212"],["Lait chaud",33,"#c9a07a"],["Mousse",34,"#f4e7d5"]],"Latte":[["Café",20,"#3d2212"],["Lait chaud",60,"#d0ac86"],["Mousse",20,"#f4e7d5"]],"Moka":[["Chocolat",20,"#4b2415"],["Café",30,"#3d2212"],["Lait",30,"#b4835b"],["Crème",20,"#fbf3e5"]]}'), K = Object.keys(D);
      el.innerHTML = '<div class="fx-ll" role="radiogroup" aria-label="Boisson"></div><div class="fx-ll-c" aria-hidden="true"></div><output aria-live="polite"></output>';
      var f = el.querySelector('.fx-ll'), cup = el.querySelector('.fx-ll-c'), o = el.querySelector('output');
      var pick = function (k, b) {
        f.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-checked', x === b); });
        cup.innerHTML = '';
        D[k].forEach(function (l, i) { var d = U.make('i', '', cup); d.style.cssText = 'flex:' + l[1] + ' 1 0;background:' + l[2] + ';--fx-i:' + i; d.textContent = l[1] > 25 ? l[0] : ''; });
        o.textContent = D[k].map(function (l) { return l[0] + ' ' + l[1] + ' %'; }).join(', ');
      };
      K.forEach(function (k, i) {
        var b = U.make('button', '', f);
        b.type = 'button'; b.setAttribute('role', 'radio'); b.textContent = k;
        b.addEventListener('click', function () { pick(k, b); });
        if (i === 1) pick(k, b);
      });
    }
  });

  // Un tableau d'allergènes qu'on peut filtrer d'un geste
  FX.register('allergen-matrix', {
    setup: function (el) {
      var A = (el.dataset.fxAllergens || 'Gluten,Lait,Œuf,Fruits à coque').split(','), R = (el.dataset.fxItems || 'Velouté:0,1,0,0|Quiche:1,1,1,0|Salade:0,0,0,1|Tarte:1,1,1,1').split('|').map(function (r) { var p = r.split(':'); return [p[0], p[1].split(',')]; });
      var h = '<thead><tr><th><span class="fx-sr">Plat</span></th>' + A.map(function (a, i) { return '<th scope="col"><button type="button" data-i="' + i + '" aria-pressed="false">' + a + '</button></th>'; }).join('') + '</tr></thead><tbody>';
      R.forEach(function (r) {
        h += '<tr><th scope="row">' + r[0] + '</th>' + r[1].map(function (v) { return '<td>' + (v === '1' ? '<i aria-label="contient">●</i>' : '<span class="fx-sr">non</span>') + '</td>'; }).join('') + '</tr>';
      });
      el.innerHTML = '<table>' + h + '</tbody></table><small>Exemple fictif. Demandez toujours confirmation en cuisine.</small>';
      var pick = -1;
      el.addEventListener('click', function (e) {
        var b = e.target.closest('button');
        if (!b) return;
        pick = pick === +b.dataset.i ? -1 : +b.dataset.i;
        el.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', +x.dataset.i === pick); });
        el.querySelectorAll('tbody tr').forEach(function (tr, y) {
          Array.prototype.forEach.call(tr.cells, function (c, i) { c.classList.toggle('fx-col', i === pick + 1); });
          tr.classList.toggle('fx-has', pick >= 0 && R[y][1][pick] === '1');
        });
      });
    }
  });
})(window.FX);
