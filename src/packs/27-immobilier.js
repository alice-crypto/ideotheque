/* Pack 27 — Immobilier */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Ce qu'on peut acheter selon son revenu, son apport et la durée
  FX.register('budget-reach', {
    setup: function (el) {
      var rate = U.num(el, 'fxRate', 3.4) / 1200, part = U.num(el, 'fxPart', 35) / 100;
      var R = [['Revenus par mois', 'i', 1000, 8000, 100, 3200], ['Apport', 'a', 0, 100000, 1000, 20000], ['Durée (ans)', 'y', 10, 25, 1, 20]], H = '';
      R.forEach(function (r) { H += '<label>' + r[0] + ' <b data-o="' + r[1] + '"></b><input type="range" data-k="' + r[1] + '" min="' + r[2] + '" max="' + r[3] + '" step="' + r[4] + '" value="' + r[5] + '"></label>'; });
      el.innerHTML = H + '<output aria-live="polite"></output><small>Estimation fictive à ' + String(U.num(el, 'fxRate', 3.4)).replace('.', ',') + ' %, hors frais.</small>';
      var o = el.querySelector('output'), g = function (k) { return +el.querySelector('[data-k=' + k + ']').value; };
      var go = function () {
        var n = g('y') * 12, m = g('i') * part, cap = m * (1 - Math.pow(1 + rate, -n)) / rate, tot = cap + g('a');
        ['i', 'a'].forEach(function (k) { el.querySelector('[data-o=' + k + ']').textContent = g(k).toLocaleString('fr-FR') + ' €'; });
        el.querySelector('[data-o=y]').textContent = g('y') + ' ans';
        o.innerHTML = 'Budget possible <b>' + (Math.round(tot / 1000) * 1000).toLocaleString('fr-FR') + ' €</b>';
        el.style.setProperty('--fx-q', Math.min(1, tot / 600000));
      };
      el.addEventListener('input', go);
      go();
    }
  });

  // Un plan dont les pièces donnent leur nom et leur surface
  FX.register('floorplan-rooms', {
    setup: function (el) {
      var P = (el.dataset.fxItems || 'Séjour:0,0,60,55:28|Cuisine:60,0,40,35:11|Bain:60,35,40,20:6|Chambre:0,55,55,45:14|Bureau:55,55,45,45:9').split('|').map(function (r) { var p = r.split(':'); return { n: p[0], r: p[1].split(',').map(Number), s: +p[2] }; });
      var tot = P.reduce(function (t, p) { return t + p.s; }, 0), box = U.make('div', 'fx-fp', el), out = U.make('output', '', el);
      out.setAttribute('aria-live', 'polite');
      out.textContent = tot + ' m² au total';
      P.forEach(function (p) {
        var b = U.make('button', '', box);
        b.type = 'button'; b.textContent = p.n;
        b.style.cssText = 'left:' + p.r[0] + '%;top:' + p.r[1] + '%;width:' + p.r[2] + '%;height:' + p.r[3] + '%';
        var say = function () { out.innerHTML = '<b>' + p.n + '</b>, ' + p.s + ' m² sur ' + tot + ' m²'; };
        b.addEventListener('mouseenter', say); b.addEventListener('focus', say); b.addEventListener('click', say);
      });
    }
  });

  // Faire tourner le soleil autour du logement pour voir ses façades éclairées
  FX.register('sun-exposure', {
    setup: function (el) {
      var F = (el.dataset.fxWindows || 'S,O').split(',');
      el.innerHTML = '<div class="fx-se2" aria-hidden="true"><em></em><div>' + ['N', 'E', 'S', 'O'].map(function (s) { return '<i data-s="' + s + '">' + s + '</i>'; }).join('') + '</div></div><label>Heure <input type="range" min="6" max="21" step=".5"></label><output aria-live="polite"></output>';
      var r = el.querySelector('input'), o = el.querySelector('output');
      r.value = U.num(el, 'fxHour', 14);
      var go = function () {
        var h = +r.value, az = 90 + (h - 6) / 15 * 180, A = { E: 90, S: 180, O: 270 };
        el.style.setProperty('--fx-a', az + 'deg');
        var lit = [];
        el.querySelectorAll('[data-s]').forEach(function (f) {
          var s = f.dataset.s, on = A[s] !== undefined && Math.abs(az - A[s]) < 70;
          f.classList.toggle('fx-on', on);
          f.classList.toggle('fx-win', F.indexOf(s) >= 0);
          if (on && F.indexOf(s) >= 0) lit.push(s);
        });
        o.textContent = Math.floor(h) + ' h' + (h % 1 ? '30' : '') + ' · ' + (lit.length ? 'Soleil par les fenêtres ' + lit.join(', ') : 'Pas de soleil direct aux fenêtres');
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Une étiquette énergie dont la flèche vient se placer sur sa classe
  FX.register('energy-label', {
    entrance: true,
    setup: function (el) {
      var L = ['A', 'B', 'C', 'D', 'E', 'F', 'G'], lim = [70, 110, 180, 250, 330, 420, 1e9], v = U.num(el, 'fxValue', 210), k = lim.findIndex(function (m) { return v < m; }), col = ['#00853f', '#3fa34d', '#a4c639', '#f2d21f', '#f0a91a', '#e8681e', '#d3172a'];
      el.setAttribute('role', 'img');
      el.setAttribute('aria-label', 'Classe énergie ' + L[k] + ', ' + v + ' kWh par mètre carré et par an');
      var h = '';
      L.forEach(function (c, i) { h += '<div class="' + (i === k ? 'fx-on' : '') + '" style="--fx-c:' + col[i] + ';--fx-w:' + (30 + i * 11) + '%;--fx-i:' + i + '"><span>' + c + '</span>' + (i === k ? '<b>' + v + '</b>' : '') + '</div>'; });
      el.innerHTML = h;
    }
  });

  // Le quartier résumé : à combien de minutes à pied se trouve l'essentiel
  FX.register('walk-score', {
    entrance: true,
    setup: function (el) {
      var rows = (el.dataset.fxItems || 'École:6|Boulangerie:3|Métro:9|Parc:12|Médecin:15').split('|').map(function (r) { var p = r.split(':'); return [p[0], +p[1]]; }), max = 20;
      var score = Math.round(rows.reduce(function (t, r) { return t + Math.max(0, 1 - r[1] / max); }, 0) / rows.length * 100);
      var h = '<div class="fx-ws-s"><b>' + score + '</b><small>/100</small></div><ul>';
      rows.sort(function (a, b) { return a[1] - b[1]; }).forEach(function (r, i) { h += '<li style="--fx-q:' + (1 - r[1] / max) + ';--fx-i:' + i + '"><span>' + r[0] + '</span><i></i><b>' + r[1] + ' min</b></li>'; });
      el.innerHTML = h + '</ul>';
    }
  });

  // Le prix au mètre carré, comparé à celui du quartier
  FX.register('price-per-m2', {
    setup: function (el) {
      var price = U.num(el, 'fxPrice', 285000), area = U.num(el, 'fxArea', 62), ref = U.num(el, 'fxRef', 4300);
      el.innerHTML = '<label>Surface <b></b><input type="range" min="15" max="150" value="' + area + '"></label><div class="fx-m2" aria-hidden="true"><em></em><i></i></div><output aria-live="polite"></output>';
      var r = el.querySelector('input'), b = el.querySelector('b'), o = el.querySelector('output');
      var go = function () {
        var a = +r.value, pm = Math.round(price / a), gap = Math.round((pm / ref - 1) * 100);
        b.textContent = a + ' m²';
        el.style.setProperty('--fx-q', U.clamp(pm / (ref * 2), 0, 1));
        o.innerHTML = '<b>' + pm.toLocaleString('fr-FR') + ' €/m²</b><br>' + (gap === 0 ? 'Au niveau du quartier' : Math.abs(gap) + ' % ' + (gap > 0 ? 'au-dessus' : 'en dessous') + ' du quartier');
      };
      r.addEventListener('input', go);
      go();
    }
  });
})(window.FX);
