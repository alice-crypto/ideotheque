/* Pack 30 — Mobilité */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Une ligne de métro : on touche un arrêt pour lire le temps de trajet
  FX.register('metro-line', {
    setup: function (el) {
      var S = (el.dataset.fxItems || 'Gare:0|Marché:3|Université:2|Parc:4|Stade:3').split('|').map(function (r) { var p = r.split(':'); return { n: p[0], m: +p[1] }; }), box = U.make('ol', 'fx-ml', el), o = U.make('output', '', el);
      o.setAttribute('aria-live', 'polite');
      var from = U.num(el, 'fxFrom', 0);
      var pick = function (k) {
        var a = Math.min(from, k), b = Math.max(from, k), t = 0;
        for (var i = a + 1; i <= b; i++) t += S[i].m;
        Array.prototype.forEach.call(box.children, function (li, i) { li.classList.toggle('fx-on', i >= a && i <= b); li.classList.toggle('fx-to', i === k); });
        o.innerHTML = k === from ? 'Vous êtes à <b>' + S[from].n + '</b>' : S[from].n + ' → <b>' + S[k].n + '</b>, ' + t + ' min, ' + (b - a) + ' arrêt' + (b - a > 1 ? 's' : '');
      };
      S.forEach(function (s, i) {
        var li = U.make('li', '', box), b = U.make('button', '', li);
        b.type = 'button'; b.innerHTML = '<i></i><span>' + s.n + '</span>';
        b.addEventListener('click', function () { pick(i); });
      });
      pick(from);
    }
  });

  // Les prochains passages, avec leurs minutes qui descendent
  FX.register('next-departures', {
    setup: function (el) {
      var T = (el.dataset.fxItems || '12:Gare centrale:2|4:Stade:5|12:Gare centrale:9|7:Hôpital:14').split('|').map(function (r) { var p = r.split(':'); return { l: p[0], d: p[1], at: Date.now() + p[2] * 60000 }; }), ul = U.make('ul', '', el);
      var draw = function () {
        ul.innerHTML = '';
        T = T.filter(function (x) { return x.at > Date.now(); });
        T.slice(0, 4).forEach(function (x) {
          var m = Math.max(0, Math.round((x.at - Date.now()) / 60000)), li = U.make('li', m < 2 ? 'fx-now' : '', ul);
          li.innerHTML = '<b>' + x.l + '</b><span>' + x.d + '</span><em>' + (m < 1 ? 'À l\'approche' : m + ' min') + '</em>';
        });
        if (!T.length) ul.innerHTML = '<li>Plus de passage annoncé</li>';
      };
      draw();
      setInterval(draw, 15000);
    }
  });

  // Vélo, bus ou voiture : qui gagne selon la distance et le critère
  FX.register('mode-compare', {
    setup: function (el) {
      var M = [['À pied', 5, 0, 0], ['Vélo', 16, 0, 0], ['Bus', 20, 1.7, 8], ['Voiture', 28, .25, 6]];
      el.innerHTML = '<label>Distance <b></b><input type="range" min="1" max="20" step="1"></label><ul></ul>';
      var r = el.querySelector('input'), ul = el.querySelector('ul'), lab = el.querySelector('b'), L = M.map(function (m) { var li = U.make('li', '', ul); li.innerHTML = '<span>' + m[0] + '</span><i></i><em></em>'; return li; });
      r.value = U.num(el, 'fxKm', 5);
      var go = function () {
        var d = +r.value, res = M.map(function (m, i) { return { i: i, t: Math.round(d / m[1] * 60 + m[3]), c: i === 2 ? m[2] : d * m[2] }; }), best = Math.min.apply(null, res.map(function (x) { return x.t; })), max = Math.max.apply(null, res.map(function (x) { return x.t; }));
        lab.textContent = d + ' km';
        res.forEach(function (x) {
          var li = L[x.i];
          li.style.setProperty('--fx-q', x.t / max);
          li.classList.toggle('fx-best', x.t === best);
          li.querySelector('em').textContent = (x.t >= 60 ? Math.floor(x.t / 60) + ' h ' + String(x.t % 60).padStart(2, '0') : x.t + ' min') + (x.c ? ' · ' + x.c.toFixed(2).replace('.', ',') + ' €' : '');
        });
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Les émissions d'un trajet selon le moyen de transport
  FX.register('co2-per-mode', {
    setup: function (el) {
      var F = (el.dataset.fxItems || 'Train:3|Vélo:0|Bus:100|Voiture seule:190|Avion:230').split('|').map(function (r) { var p = r.split(':'); return [p[0], +p[1]]; });
      el.innerHTML = '<label>Trajet <b></b><input type="range" min="10" max="1000" step="10"></label><ul></ul><small>Ordres de grandeur en g de CO₂ par km : à remplacer par une source officielle.</small>';
      var r = el.querySelector('input'), ul = el.querySelector('ul'), lab = el.querySelector('label b');
      var L = F.map(function (f) { var li = U.make('li', '', ul); li.innerHTML = '<span>' + f[0] + '</span><i></i><b></b>'; return li; });
      r.value = U.num(el, 'fxKm', 500);
      var top = Math.max.apply(null, F.map(function (f) { return f[1]; }));
      var go = function () {
        var d = +r.value;
        lab.textContent = d + ' km';
        F.forEach(function (f, i) {
          var kg = f[1] * d / 1000;
          L[i].style.setProperty('--fx-q', f[1] / top * (d / 1000 + .15));
          L[i].querySelector('b').textContent = (kg < 10 ? kg.toFixed(1).replace('.', ',') : Math.round(kg)) + ' kg';
        });
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Des zones en anneaux : le tarif change selon celles qu'on traverse
  FX.register('zone-fare', {
    setup: function (el) {
      var P = (el.dataset.fxPrices || '1.9,2.8,3.9,5.1,6.4').split(',').map(Number), n = P.length, box = U.make('div', 'fx-zf', el), o = U.make('output', '', el), sel = [];
      o.setAttribute('aria-live', 'polite');
      for (var i = n; i >= 1; i--) (function (i) {
        var b = U.make('button', '', box);
        b.type = 'button'; b.textContent = i; b.setAttribute('aria-label', 'Zone ' + i); b.dataset.z = i; b.style.setProperty('--fx-z', i / n);
        b.addEventListener('click', function () { sel.push(i); if (sel.length > 2) sel = [i]; show(); });
      })(i);
      var show = function () {
        if (!sel.length) { o.textContent = 'Touchez deux zones'; return; }
        var a = Math.min.apply(null, sel), c = Math.max.apply(null, sel), k = c - a;
        box.querySelectorAll('button').forEach(function (x) { var z = +x.dataset.z; x.setAttribute('aria-pressed', z >= a && z <= c); });
        o.innerHTML = sel.length === 1 ? 'Zone ' + a : 'Zones ' + a + ' à ' + c;
        o.innerHTML += ' : <b>' + P[k].toFixed(2).replace('.', ',') + ' €</b>';
      };
      show();
    }
  });

  // Un billet numérique avec sa durée de validité qui s'écoule
  FX.register('transit-ticket', {
    setup: function (el) {
      var min = U.num(el, 'fxMinutes', 90), end = 0;
      el.innerHTML = '<div class="fx-tk2"><strong>' + (el.dataset.fxTitle || 'Ticket 1 zone') + '</strong><span class="fx-tk2-t">Non activé</span><i aria-hidden="true"></i></div><button type="button">Activer</button>';
      var b = el.querySelector('button'), t = el.querySelector('.fx-tk2-t'), bar = el.querySelector('.fx-tk2 i');
      var show = function () {
        if (!end) return;
        var left = end - Date.now();
        if (left <= 0) { el.classList.remove('fx-live'); el.classList.add('fx-off'); t.textContent = 'Billet expiré'; bar.style.width = 0; end = 0; return; }
        t.textContent = 'Valable encore ' + Math.ceil(left / 60000) + ' min';
        bar.style.width = left / (min * 60000) * 100 + '%';
      };
      b.addEventListener('click', function () { end = Date.now() + min * 60000; el.classList.add('fx-live'); el.classList.remove('fx-off'); b.disabled = true; b.textContent = 'Activé'; show(); });
      setInterval(show, 20000);
    },
    trigger: function (el) { el.querySelector('button').click(); }
  });

  // Un trajet en cours : le temps et le montant avancent ensemble
  FX.register('ride-timer', {
    setup: function (el) {
      var unlock = U.num(el, 'fxUnlock', 1), rate = U.num(el, 'fxRate', .2), start = 0, stop = 0, iv;
      el.innerHTML = '<div class="fx-rdt"><b class="t">0:00</b><b class="p"></b></div><button type="button">Démarrer</button>';
      var t = el.querySelector('.t'), p = el.querySelector('.p'), b = el.querySelector('button');
      var show = function () {
        var s = Math.floor(((stop || Date.now()) - start) / 1000) * (start ? 1 : 0), m = Math.ceil(s / 60);
        t.textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
        p.textContent = (start ? (unlock + m * rate) : 0).toFixed(2).replace('.', ',') + ' €';
      };
      b.addEventListener('click', function () {
        if (!start || stop) { start = Date.now(); stop = 0; iv = setInterval(show, 1000); b.textContent = 'Terminer'; el.classList.add('fx-go'); }
        else { stop = Date.now(); clearInterval(iv); b.textContent = 'Nouveau trajet'; el.classList.remove('fx-go'); }
        show();
      });
      show();
    }
  });
})(window.FX);
