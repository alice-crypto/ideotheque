/* Pack 37 — Voyage */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Un arc de vol avec la vraie distance entre deux villes
  FX.register('flight-arc', {
    entrance: true,
    setup: function (el) {
      var A = (el.dataset.fxFrom || 'Paris:48.86:2.35').split(':'), B = (el.dataset.fxTo || 'Tokyo:35.68:139.69').split(':'), R = 6371, r = Math.PI / 180, la1 = A[1] * r, la2 = B[1] * r, dl = (B[2] - A[2]) * r, h = Math.pow(Math.sin((la2 - la1) / 2), 2) + Math.cos(la1) * Math.cos(la2) * Math.pow(Math.sin(dl / 2), 2), km = 2 * R * Math.asin(Math.sqrt(h)), hr = km / 850 + .5;
      el.innerHTML = '<svg viewBox="0 0 200 90" aria-hidden="true"><path class="fx-fa-l" pathLength="1" d="M18 72Q100 -22 182 72"/><circle cx="18" cy="72" r="4"/><circle cx="182" cy="72" r="4"/><path class="fx-fa-p" d="M-6 0 6 0M0 -5 3 0 0 5"/></svg><div class="fx-fa2"><b>' + A[0] + '</b><b>' + B[0] + '</b></div><p>' + Math.round(km).toLocaleString('fr-FR') + ' km · environ ' + Math.floor(hr) + ' h ' + String(Math.round(hr % 1 * 60)).padStart(2, '0') + ' de vol direct</p>';
    }
  });

  // Une carte d'embarquement, avec le temps avant la fermeture
  FX.register('boarding-pass', {
    entrance: true,
    setup: function (el) {
      var d = el.dataset, min = U.num(el, 'fxIn', 48), at = new Date(Date.now() + min * 60000), f = function (x) { return x.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }); };
      el.innerHTML = '<div class="fx-bp"><header><b>' + (d.fxFrom || 'CDG') + '</b><i aria-hidden="true">→</i><b>' + (d.fxTo || 'LIS') + '</b></header><dl><div><dt>Vol</dt><dd>' + (d.fxFlight || 'FX 042') + '</dd></div><div><dt>Porte</dt><dd>' + (d.fxGate || 'B12') + '</dd></div><div><dt>Siège</dt><dd>' + (d.fxSeat || '14C') + '</dd></div><div><dt>Embarquement</dt><dd>' + f(at) + '</dd></div></dl></div><small>Exemple fictif. Fermeture dans ' + min + ' min.</small>';
    }
  });

  // Faire glisser une heure et lire celle des autres villes
  FX.register('timezone-slider', {
    setup: function (el) {
      var Z = (el.dataset.fxItems || 'Paris:Europe/Paris|New York:America/New_York|Tokyo:Asia/Tokyo|Sydney:Australia/Sydney').split('|').map(function (r) { return r.split(':'); }), box = U.make('ul', '', el), lab = U.make('label', '', el), o = U.make('output', '', el);
      lab.innerHTML = 'Faire glisser l\'heure<input type="range" min="0" max="47" aria-label="Heure de la première ville">';
      o.setAttribute('aria-live', 'polite');
      Z.forEach(function (z) { z.li = U.make('li', '', box); z.li.innerHTML = '<span>' + z[0] + '</span><b></b><i aria-hidden="true"></i>'; });
      var r = lab.querySelector('input');
      var base = new Date(); base.setHours(0, 0, 0, 0);
      var off0 = new Date(base.toLocaleString('en-US', { timeZone: Z[0][1] })) - new Date(base.toLocaleString('en-US'));
      r.value = new Date().getHours() * 2;
      var go = function () {
        var t = new Date(+base + r.value * 1800000 - off0), work = 0;
        Z.forEach(function (z) {
          var h = +t.toLocaleString('en-GB', { timeZone: z[1], hour: '2-digit', hour12: false }) % 24, s = t.toLocaleTimeString('fr-FR', { timeZone: z[1], hour: '2-digit', minute: '2-digit' }), isW = h >= 9 && h < 18;
          z.li.querySelector('b').textContent = s;
          z.li.classList.toggle('fx-w', isW);
          z.li.classList.toggle('fx-n', h < 7 || h >= 22);
          if (isW) work++;
        });
        o.textContent = work === Z.length ? 'Tout le monde est au bureau' : work + ' ville' + (work > 1 ? 's' : '') + ' sur ' + Z.length + ' aux heures de bureau';
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Faire sa valise : le poids monte, la limite approche
  FX.register('packing-weight', {
    setup: function (el) {
      var I = (el.dataset.fxItems || 'Vêtements:4.2|Chaussures:1.1|Trousse:0.8|Ordinateur:1.5|Appareil photo:0.9|Livres:1.4|Veste:1').split('|').map(function (r) { var p = r.split(':'); return [p[0], +p[1]]; }), lim = U.num(el, 'fxLimit', 8), box = U.make('div', 'fx-pw', el), bar = U.make('div', 'fx-pw-b', el), o = U.make('output', '', el);
      o.setAttribute('aria-live', 'polite');
      U.make('i', '', bar);
      I.forEach(function (x, k) {
        var l = U.make('label', '', box), c = U.make('input', '', l);
        c.type = 'checkbox'; c.value = x[1]; c.checked = k < 3;
        l.appendChild(document.createTextNode(x[0]));
        U.make('small', '', l).textContent = String(x[1]).replace('.', ',') + ' kg';
      });
      var go = function () {
        var t = 0;
        box.querySelectorAll(':checked').forEach(function (c) { t += +c.value; });
        el.style.setProperty('--fx-q', Math.min(1, t / lim));
        el.classList.toggle('fx-over', t > lim);
        o.textContent = t.toFixed(1).replace('.', ',') + ' kg sur ' + lim + ' kg' + (t > lim ? ' : ' + (t - lim).toFixed(1).replace('.', ',') + ' kg de trop' : '');
      };
      box.addEventListener('change', go);
      go();
    }
  });

  // Une page de passeport qui reçoit ses tampons un à un
  FX.register('passport-stamps', {
    entrance: true,
    setup: function (el) {
      var S = (el.dataset.fxItems || 'Lisbonne:2024|Kyoto:2025|Dakar:2025|Lima:2026|Oslo:2026|Hanoï:2027').split('|').map(function (r) { return r.split(':'); }), seed = U.num(el, 'fxSeed', 7), R = function () { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }, C = 2;
      S.forEach(function (s, i) {
        var d = U.make('div', i % 3 === 1 ? 'fx-round' : '', el);
        d.style.left = (i % 3) * 33 + R() * 4 + '%';
        d.style.top = Math.floor(i / 3) * 50 + R() * 6 + '%';
        d.style.setProperty('--fx-r', (R() * 26 - 13).toFixed(1) + 'deg');
        d.style.setProperty('--fx-i', i);
        d.style.setProperty('--fx-c', ['#c6341f', '#1d4fa2', '#1f7a4d', '#7a2aa0'][i % 4]);
        d.innerHTML = '<b>' + s[0] + '</b><small>' + s[1] + '</small>';
      });
      el.setAttribute('aria-label', S.length + ' tampons : ' + S.map(function (s) { return s[0]; }).join(', '));
      el.setAttribute('role', 'group');
    }
  });

  // Le budget d'un voyage : durée, niveau et postes
  FX.register('trip-budget', {
    setup: function (el) {
      var L = { Malin: [25, 15, 10], Confort: [70, 35, 25], Plaisir: [160, 70, 55] }, N = ['Logement', 'Repas', 'Sorties'], k = 'Confort';
      el.innerHTML = '<div class="fx-tb2" role="radiogroup" aria-label="Niveau de confort"></div><label>Durée <b></b><input type="range" min="2" max="30"></label><div class="fx-tb2-b" aria-hidden="true"><i class="a"></i><i class="b"></i><i class="c"></i></div><ul></ul><output aria-live="polite"></output>';
      var f = el.querySelector('.fx-tb2'), r = el.querySelector('input'), ul = el.querySelector('ul'), o = el.querySelector('output');
      N.forEach(function () { U.make('li', '', ul); });
      r.value = U.num(el, 'fxDays', 10);
      var go = function () {
        var d = +r.value, v = L[k], tot = (v[0] + v[1] + v[2]) * d;
        el.querySelector('label b').textContent = d + ' jours';
        N.forEach(function (n, i) { ul.children[i].textContent = n + ' : ' + (v[i] * d).toLocaleString('fr-FR') + ' €'; el.style.setProperty('--fx-' + 'abc'[i], v[i]); });
        o.innerHTML = '<b>' + tot.toLocaleString('fr-FR') + ' €</b> sans le transport';
      };
      Object.keys(L).forEach(function (n) {
        var b = U.make('button', '', f);
        b.type = 'button'; b.setAttribute('role', 'radio'); b.textContent = n; b.setAttribute('aria-checked', n === k);
        b.addEventListener('click', function () { k = n; f.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-checked', x === b); }); go(); });
      });
      r.addEventListener('input', go);
      go();
    }
  });

  // Un plan de cabine : choisir ses sièges, jusqu'au nombre de voyageurs
  FX.register('seat-map', {
    setup: function (el) {
      var R = U.num(el, 'fxRows', 8), max = U.num(el, 'fxMax', 2), seed = 9, rand = function () { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }, L = 'ABC DEF'.split(''), box = U.make('div', 'fx-sm', el), o = U.make('output', '', el), pick = [];
      o.setAttribute('aria-live', 'polite');
      for (var y = 1; y <= R; y++) L.forEach(function (c) {
        if (c === ' ') { U.make('small', '', box).textContent = y; return; }
        var b = U.make('button', y <= 2 ? 'fx-plus' : '', box), id = y + c;
        b.type = 'button'; b.setAttribute('aria-label', 'Siège ' + id + (y <= 2 ? ', avec supplément' : '')); b.textContent = c;
        b.disabled = rand() < .3;
        b.addEventListener('click', function () {
          var k = pick.indexOf(id);
          if (k >= 0) pick.splice(k, 1); else { if (pick.length >= max) { var old = pick.shift(); box.querySelector('[data-id="' + old + '"]').setAttribute('aria-pressed', 'false'); } pick.push(id); }
          b.setAttribute('aria-pressed', k < 0);
          var ex = pick.filter(function (p) { return parseInt(p, 10) <= 2; }).length * 25;
          o.textContent = pick.length ? 'Sièges ' + pick.join(', ') + (ex ? ' (+' + ex + ' €)' : '') : 'Choisissez ' + max + ' sièges';
        });
        b.dataset.id = id;
      });
      o.textContent = 'Choisissez ' + max + ' sièges';
    }
  });

  // Une carte postale qu'on retourne pour lire le message
  FX.register('postcard-flip', {
    setup: function (el) {
      var d = el.dataset, img = d.fxImage || 'assets/dune.svg';
      el.innerHTML = '<button type="button" aria-pressed="false" aria-label="Retourner la carte postale"><span class="fx-pf2"><span class="f"><img alt="" src="' + img + '"><b>' + (d.fxPlace || 'Bons baisers') + '</b></span><span class="k"><em>' + (d.fxText || 'Il fait beau, la mer est chaude. On pense à vous.') + '<small>' + new Date().toLocaleDateString('fr-FR') + '</small></em><i></i></span></span></button>';
      var b = el.firstChild;
      b.addEventListener('click', function () { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true'); });
    },
    trigger: function (el) { el.firstChild.click(); }
  });

  // Un voyage jour par jour, avec le point sur la carte qui avance
  FX.register('itinerary-days', {
    setup: function (el) {
      var D = (el.dataset.fxItems || 'Arrivée à Porto:Quartier de la Ribeira|Vallée du Douro:Vignobles en terrasses|Coimbra:La vieille université|Lisbonne:Tram et belvédères').split('|').map(function (r) { return r.split(':'); });
      el.innerHTML = '<div class="fx-id" aria-hidden="true"><i></i></div><div class="fx-id-l"></div>';
      var rail = el.firstChild, list = el.lastChild, dot = rail.firstChild, n = D.length;
      for (var k = 0; k < n; k++) U.make('u', '', rail).style.top = k / (n - 1) * 100 + '%';
      D.forEach(function (d, i) {
        var b = U.make('button', '', list), p = U.make('p', '', list);
        b.type = 'button'; b.setAttribute('aria-expanded', i === 0); b.innerHTML = '<small>Jour ' + (i + 1) + '</small>' + d[0];
        p.textContent = d[1];
        b.addEventListener('click', function () {
          list.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-expanded', x === b); });
          dot.style.top = i / (n - 1) * 100 + '%';
        });
      });
    }
  });

  // Un plan pour décaler son sommeil avant un long voyage
  FX.register('jetlag-plan', {
    setup: function (el) {
      var bed = U.num(el, 'fxBed', 23);
      el.innerHTML = '<label>Décalage <b></b><input type="range" min="-10" max="10"></label><ol></ol><output aria-live="polite"></output>';
      var r = el.querySelector('input'), ol = el.querySelector('ol'), o = el.querySelector('output');
      r.value = U.num(el, 'fxHours', 6);
      var go = function () {
        var z = +r.value, abs = Math.abs(z), s = z >= 0 ? -1 : 1, n = Math.min(4, abs);
        el.querySelector('label b').textContent = (z > 0 ? '+' : '') + z + ' h';
        ol.innerHTML = '';
        for (var i = n; i >= 1; i--) {
          var d = U.make('li', '', ol), h = (bed + s * (n - i + 1) + 24) % 24;
          d.style.setProperty('--fx-i', n - i);
          d.style.setProperty('--fx-q', h / 24);
          d.innerHTML = '<span>J−' + i + '</span><i></i><b>' + h + ' h</b>';
        }
        o.textContent = n ? 'Heure de coucher, ' + (z > 0 ? 'plus tôt' : 'plus tard') + ' chaque jour' : 'Aucun décalage à préparer';
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Faut-il un adaptateur ? La prise et la tension du pays choisi
  FX.register('plug-adapter', {
    setup: function (el) {
      var C = JSON.parse(el.dataset.fxData || '{"France":["E",230],"Allemagne":["F",230],"Royaume-Uni":["G",230],"États-Unis":["A/B",120],"Japon":["A/B",100],"Australie":["I",230],"Suisse":["J",230]}'), home = el.dataset.fxHome || 'E,F', H = home.split(','), P = { E: [[.33, .5], [.67, .5]], F: [[.33, .5], [.67, .5]], G: [[.5, .25], [.25, .7], [.75, .7]], 'A/B': [[.38, .4], [.62, .4]], I: [[.33, .4], [.67, .4], [.5, .75]], J: [[.28, .55], [.5, .35], [.72, .55]] };
      el.innerHTML = '<select aria-label="Pays de destination">' + Object.keys(C).map(function (k) { return '<option>' + k + '</option>'; }).join('') + '</select><div class="fx-pa" aria-hidden="true"></div><output aria-live="polite"></output>';
      var s = el.querySelector('select'), b = el.querySelector('.fx-pa'), o = el.querySelector('output');
      s.selectedIndex = 2;
      var go = function () {
        var c = C[s.value], need = H.indexOf(c[0]) < 0;
        b.innerHTML = (P[c[0]] || P.E).map(function (p) { return '<i class="' + (c[0] === 'A/B' || c[0] === 'I' || (c[0] === 'G' && p[1] > .5) ? 'fx-bar' : '') + '" style="left:' + p[0] * 100 + '%;top:' + p[1] * 100 + '%"></i>'; }).join('');
        el.classList.toggle('fx-need', need);
        o.innerHTML = '<b>Prise ' + c[0] + ', ' + c[1] + ' V</b><br>' + (need ? 'Adaptateur nécessaire' : 'Pas d\'adaptateur') + (c[1] < 200 ? ', vérifiez aussi vos appareils' : '');
      };
      s.addEventListener('change', go);
      go();
    }
  });

  // Quand partir : température, pluie et meilleurs mois
  FX.register('climate-months', {
    entrance: true,
    setup: function (el) {
      var T = (el.dataset.fxTemp || '11,12,15,17,20,24,27,27,24,20,15,12').split(',').map(Number), R = (el.dataset.fxRain || '85,70,60,55,40,15,8,12,35,80,95,95').split(',').map(Number), L = 'JFMAMJJASOND', tm = Math.max.apply(null, T), rm = Math.max.apply(null, R), best = [], h = '';
      T.forEach(function (t, i) {
        var good = t >= 18 && t <= 27 && R[i] <= 45;
        if (good) best.push(['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'][i]);
        h += '<div class="' + (good ? 'fx-best' : '') + '" style="--fx-i:' + i + ';--fx-t:' + t / tm + ';--fx-r:' + R[i] / rm + '"><i></i><u></u><small>' + L[i] + '</small></div>';
      });
      el.innerHTML = '<div class="fx-cm2" aria-hidden="true">' + h + '</div><p>Meilleurs mois : <b>' + (best.join(', ') || 'à vous de voir') + '</b>. Données fictives.</p>';
    }
  });
})(window.FX);
