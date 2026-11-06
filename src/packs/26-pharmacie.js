/* Pack 26 — Pharmacie */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Une grille des prises par jour et par moment
  FX.register('dose-grid', {
    setup: function (el) {
      var M = (el.dataset.fxMoments || 'Matin,Midi,Soir').split(','), D = (el.dataset.fxDays || 'Lun,Mar,Mer,Jeu').split(','), g = U.make('div', 'fx-dg', el), out = U.make('output', '', el);
      g.style.setProperty('--fx-c', D.length);
      out.setAttribute('aria-live', 'polite');
      U.make('span', '', g);
      D.forEach(function (d) { U.make('b', '', g).textContent = d; });
      M.forEach(function (m) {
        U.make('b', '', g).textContent = m;
        D.forEach(function (d) {
          var c = U.make('input', '', g);
          c.type = 'checkbox'; c.setAttribute('aria-label', m + ', ' + d);
        });
      });
      var go = function () { out.textContent = g.querySelectorAll(':checked').length + ' prises sur ' + D.length * M.length; };
      g.addEventListener('change', go);
      go();
    }
  });

  // Un pilulier de la semaine dont on ouvre les couvercles
  FX.register('pill-organizer', {
    setup: function (el) {
      var L = ['L', 'M', 'M', 'J', 'V', 'S', 'D'], N = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'], today = (new Date().getDay() + 6) % 7, row = U.make('div', 'fx-po', el), out = U.make('output', '', el);
      out.setAttribute('aria-live', 'polite');
      var go = function () { out.textContent = row.querySelectorAll('[aria-pressed=true]').length + ' jours pris cette semaine'; };
      L.forEach(function (d, i) {
        var b = U.make('button', i === today ? 'fx-now' : '', row);
        b.type = 'button'; b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-label', N[i] + (i === today ? ", aujourd'hui" : ''));
        b.innerHTML = '<u aria-hidden="true"></u><i aria-hidden="true"></i><span>' + d + '</span>';
        b.addEventListener('click', function () { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true'); go(); });
      });
      go();
    }
  });

  // Depuis la dernière prise, le temps qu'il reste avant la prochaine
  FX.register('next-dose', {
    setup: function (el) {
      var H = U.num(el, 'fxHours', 6), last = null;
      el.innerHTML = '<svg viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="35"/><circle class="fx-nd" cx="40" cy="40" r="35" pathLength="1"/></svg><div><b>–</b><span>Pas encore de prise</span></div><button type="button">J\'ai pris ma dose</button>';
      var b = el.querySelector('b'), s = el.querySelector('span');
      var go = function () {
        if (!last) return;
        var left = last + H * 3600000 - Date.now(), q = U.clamp(left / (H * 3600000), 0, 1);
        el.style.setProperty('--fx-q', q);
        if (left <= 0) { b.textContent = 'Maintenant'; s.textContent = 'Dose possible'; return; }
        b.textContent = Math.floor(left / 3600000) + ' h ' + String(Math.floor(left / 60000) % 60).padStart(2, '0');
        s.textContent = 'avant la prochaine';
      };
      el.querySelector('button').addEventListener('click', function () { last = Date.now(); go(); });
      setInterval(go, 30000);
      go();
    }
  });

  // Combien de jours tient la boîte, et quand la renouveler
  FX.register('refill-date', {
    entrance: true,
    setup: function (el) {
      var left = U.num(el, 'fxLeft', 18), per = U.num(el, 'fxPerDay', 2), box = U.num(el, 'fxBox', 60), days = Math.floor(left / per), end = new Date(Date.now() + days * 86400000);
      el.style.setProperty('--fx-q', Math.min(1, left / box));
      el.classList.toggle('fx-low', days <= U.num(el, 'fxWarn', 10));
      el.innerHTML = '<div class="fx-rd" aria-hidden="true"><i></i></div><strong>' + days + ' jours</strong><span>' + left + ' comprimés, ' + per + ' par jour</span><span>Boîte vide le ' + end.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) + '</span>';
    }
  });

  // Une fréquence d'effet indésirable montrée en personnes sur cent
  FX.register('side-effect-scale', {
    setup: function (el) {
      var rows = (el.dataset.fxItems || 'Maux de tête:10|Nausées:5|Vertiges:1').split('|').map(function (r) { return r.split(':'); }), sel = U.make('div', 'fx-se-b', el), dots = U.make('div', 'fx-se', el), out = U.make('output', '', el);
      dots.setAttribute('aria-hidden', 'true');
      out.setAttribute('aria-live', 'polite');
      for (var i = 0; i < 100; i++) U.make('i', '', dots).style.setProperty('--fx-i', i);
      var pick = function (r, b) {
        sel.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
        Array.prototype.forEach.call(dots.children, function (d, i) { d.classList.toggle('fx-on', i < +r[1]); });
        out.textContent = r[0] + ' : environ ' + r[1] + ' personne' + (+r[1] > 1 ? 's' : '') + ' sur 100';
      };
      rows.forEach(function (r, i) {
        var b = U.make('button', '', sel);
        b.type = 'button'; b.textContent = r[0];
        b.addEventListener('click', function () { pick(r, b); });
        if (!i) pick(r, b);
      });
      U.make('small', '', el).textContent = 'Valeurs fictives';
    }
  });

  // Deux éléments à choisir, et ce que dit la table à leur sujet
  FX.register('interaction-check', {
    setup: function (el) {
      var names = (el.dataset.fxNames || 'Produit A,Produit B,Produit C').split(','), tab = JSON.parse(el.dataset.fxTable || '{"Produit A+Produit B":"caution","Produit B+Produit C":"avoid"}');
      var opt = names.map(function (n) { return '<option>' + n + '</option>'; }).join('');
      el.innerHTML = '<label>Premier<select>' + opt + '</select></label><label>Second<select>' + opt + '</select></label><output role="status"></output>';
      var s = el.querySelectorAll('select'), o = el.querySelector('output');
      s[1].selectedIndex = 1;
      var T = { ok: 'Rien de signalé dans cette table', caution: 'Précaution : demandez conseil', avoid: 'À éviter : demandez conseil' };
      var go = function () {
        var a = s[0].value, b = s[1].value, r = a === b ? 'same' : tab[a + '+' + b] || tab[b + '+' + a] || 'ok';
        el.dataset.fxLevel = r;
        o.textContent = r === 'same' ? 'Choisissez deux éléments différents' : T[r];
      };
      el.addEventListener('change', go);
      go();
    }
  });

  // Le même principe actif, deux prix, et l'écart sur l'année
  FX.register('generic-compare', {
    entrance: true,
    setup: function (el) {
      var a = U.num(el, 'fxBrand', 12.4), b = U.num(el, 'fxGeneric', 7.9), n = U.num(el, 'fxPerYear', 12), f = function (v) { return v.toFixed(2).replace('.', ',') + ' €'; };
      el.innerHTML = '<div><span>' + (el.dataset.fxNameA || 'Marque') + '</span><i style="--fx-q:1"></i><b>' + f(a) + '</b></div><div class="fx-g"><span>' + (el.dataset.fxNameB || 'Générique') + '</span><i style="--fx-q:' + b / a + '"></i><b>' + f(b) + '</b></div><p>Soit <strong>' + f((a - b) * n) + '</strong> d\'écart pour ' + n + ' boîtes par an</p>';
    }
  });

  // Qui est ouvert maintenant, en tête de liste
  FX.register('on-duty-list', {
    setup: function (el) {
      var rows = (el.dataset.fxItems || 'Pharmacie du Port:8:20|Pharmacie de la Gare:0:24|Pharmacie des Tilleuls:9:19|Garde de nuit:20:8').split('|').map(function (r) { var p = r.split(':'); return { n: p[0], a: +p[1], b: +p[2] }; });
      var ul = U.make('ul', '', el), note = U.make('small', '', el);
      var h = new Date().getHours() + new Date().getMinutes() / 60;
      rows.forEach(function (r) { r.open = r.a < r.b ? h >= r.a && h < r.b : h >= r.a || h < r.b; });
      rows.sort(function (x, y) { return y.open - x.open; }).forEach(function (r, i) {
        var li = U.make('li', r.open ? 'fx-open' : '', ul);
        li.style.setProperty('--fx-i', i);
        li.innerHTML = '<i aria-hidden="true"></i><b>' + r.n + '</b><span>' + (r.open ? 'Ouvert' : 'Fermé') + ' · ' + r.a + ' h–' + r.b + ' h</span>';
      });
      note.textContent = 'Exemple fictif';
    }
  });

  // Une ordonnance envoyée, préparée, puis prête à retirer
  FX.register('rx-ready', {
    setup: function (el) {
      var S = (el.dataset.fxItems || 'Reçue|En préparation|Prête à retirer').split('|'), ol = U.make('ol', '', el), live = U.make('output', '', el);
      live.setAttribute('aria-live', 'polite');
      S.forEach(function (t) { U.make('li', '', ol).textContent = t; });
      el._fxSet = function (n) {
        n = U.clamp(n, 0, S.length - 1);
        el.style.setProperty('--fx-q', n / (S.length - 1));
        Array.prototype.forEach.call(ol.children, function (li, i) { li.classList.toggle('fx-done', i <= n); });
        el.classList.toggle('fx-ready', n === S.length - 1);
        live.textContent = S[n];
      };
      el._fxN = U.num(el, 'fxStep', 0);
      el._fxSet(el._fxN);
      new MutationObserver(function () { el._fxN = U.num(el, 'fxStep', 0); el._fxSet(el._fxN); }).observe(el, { attributes: true, attributeFilter: ['data-fx-step'] });
    },
    trigger: function (el) { el._fxN = (el._fxN + 1) % 3; el._fxSet(el._fxN); }
  });

  // Une croix de pharmacie en points lumineux, avec ses animations d'enseigne
  FX.register('led-cross', {
    setup: function (el) {
      var N = 15, a = 5, b = 10, cells = [], box = U.make('div', 'fx-lc', el);
      el.setAttribute('role', 'img');
      el.setAttribute('aria-label', el.dataset.fxLabel || 'Croix lumineuse');
      for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) {
        var i = U.make('i', '', box), on = (x >= a && x < b) || (y >= a && y < b);
        if (on) cells.push({ el: i, d: Math.hypot(x - 7, y - 7), a: Math.atan2(y - 7, x - 7) }); else i.style.visibility = 'hidden';
      }
      el._fxCells = cells;
      if (U.reduced) cells.forEach(function (c) { c.el.style.opacity = 1; });
    },
    tick: function (el, dt, t) {
      if (U.reduced) return;
      var mode = Math.floor(t / 4) % 3;
      el._fxCells.forEach(function (c) {
        var v = mode === 0 ? .5 + .5 * Math.sin(c.d * .9 - t * 4) : mode === 1 ? .5 + .5 * Math.sin(c.a * 2 + t * 3) : (Math.sin(t * 5) > 0 ? 1 : .15);
        c.el.style.opacity = (.15 + v * .85).toFixed(2);
      });
    }
  });

  // Un interrupteur en forme de gélule bicolore
  FX.register('capsule-switch', {
    setup: function (el) {
      var i = el.querySelector('input');
      if (!i) { i = document.createElement('input'); i.type = 'checkbox'; el.insertBefore(i, el.firstChild); }
      i.setAttribute('role', 'switch');
      var c = document.createElement('span');
      c.className = 'fx-cp'; c.setAttribute('aria-hidden', 'true');
      c.innerHTML = '<i></i>';
      i.parentNode.insertBefore(c, i.nextSibling);
      i.addEventListener('change', function () { c.classList.remove('fx-go'); void c.offsetWidth; c.classList.add('fx-go'); });
    }
  });
})(window.FX);
