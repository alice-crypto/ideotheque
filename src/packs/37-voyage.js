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
})(window.FX);
