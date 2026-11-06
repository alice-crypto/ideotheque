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

  // Combien coûte un trajet quand on le partage en voiture
  FX.register('carpool-split', {
    setup: function (el) {
      var cost = U.num(el, 'fxCost', 48), seats = U.num(el, 'fxSeats', 4), box = U.make('div', 'fx-cs3', el), o = U.make('output', '', el), n = 1;
      o.setAttribute('aria-live', 'polite');
      box.setAttribute('role', 'group'); box.setAttribute('aria-label', 'Nombre de personnes');
      for (var i = 1; i <= seats; i++) (function (i) {
        var b = U.make('button', '', box);
        b.type = 'button'; b.setAttribute('aria-label', i + ' personne' + (i > 1 ? 's' : ''));
        U.make('i', '', b);
        b.addEventListener('click', function () { n = i; show(); });
      })(i);
      var show = function () {
        box.querySelectorAll('button').forEach(function (b, i) { b.setAttribute('aria-pressed', i < n); b.classList.toggle('fx-pop', i === n - 1); });
        o.innerHTML = '<b>' + (cost / n).toFixed(2).replace('.', ',') + ' €</b> par personne' + (n > 1 ? ', soit ' + Math.round(cost - cost / n) + ' € de moins' : '');
      };
      show();
    }
  });

  // Un itinéraire en bande : le rouge explique le retard
  FX.register('traffic-strip', {
    entrance: true,
    setup: function (el) {
      var S = (el.dataset.fxItems || '8:60:0|3:15:2|6:50:0|2:10:2|5:30:1').split('|').map(function (r) { return r.split(':').map(Number); }), km = 0, time = 0, free = 0, h = '';
      S.forEach(function (s) { km += s[0]; time += s[0] / s[1] * 60; free += s[0] / 60 * 60; });
      S.forEach(function (s, i) { h += '<i class="l' + s[2] + '" style="flex:' + s[0] + ' 1 0;--fx-i:' + i + '"></i>'; });
      el.innerHTML = '<div class="fx-ts" aria-hidden="true">' + h + '<u></u></div><p><b>' + Math.round(time) + ' min</b> pour ' + km + ' km, soit ' + Math.max(0, Math.round(time - free)) + ' min de retard</p>';
    }
  });

  // Le profil d'un parcours : suivre la pente du doigt
  FX.register('elevation-profile', {
    setup: function (el) {
      var d = (el.dataset.fxData || '120,160,240,310,290,380,520,480,420,360,300,280').split(',').map(Number), km = U.num(el, 'fxKm', 22), lo = Math.min.apply(null, d) - 30, hi = Math.max.apply(null, d) + 20, up = 0;
      d.forEach(function (v, i) { if (i && v > d[i - 1]) up += v - d[i - 1]; });
      var X = function (i) { return i / (d.length - 1) * 200; }, Y = function (v) { return 80 - (v - lo) / (hi - lo) * 74; };
      var p = d.map(function (v, i) { return (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1); }).join('');
      el.innerHTML = '<svg viewBox="0 0 200 80" preserveAspectRatio="none" aria-hidden="true"><path class="fx-ep-a" d="' + p + 'L200 80L0 80Z"/><path class="fx-ep-l" d="' + p + '"/></svg><i aria-hidden="true"></i><input type="range" min="0" max="' + (d.length - 1) + '" value="3" aria-label="Position sur le parcours"><output aria-live="polite"></output>';
      var r = el.querySelector('input'), o = el.querySelector('output'), seg = km / (d.length - 1);
      var go = function () {
        var k = +r.value, n = Math.min(k + 1, d.length - 1), g = n === k ? 0 : (d[n] - d[k]) / (seg * 1000) * 100;
        el.style.setProperty('--fx-x', k / (d.length - 1)); el.style.setProperty('--fx-y', Y(d[k]) / 80);
        o.innerHTML = '<b>' + d[k] + ' m</b> au km ' + Math.round(k * seg) + ', pente ' + (g > 0 ? '+' : '') + g.toFixed(1).replace('.', ',') + ' %. D+ total ' + up + ' m';
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Un plan d'itinéraire qui évite les escaliers à la demande
  FX.register('step-free-route', {
    setup: function (el) {
      var A = { d: 'M12 74H60V24H126', t: '8 min, 2 escaliers' }, B = { d: 'M12 74H96V50H126V24', t: '11 min, ascenseur et rampe' };
      el.innerHTML = '<svg viewBox="0 0 140 90" aria-hidden="true"><path class="fx-sfr-w" d="M58 66H70V24H58ZM92 50H104V58H92Z"/><path class="fx-sfr-p" pathLength="1"/><circle cx="12" cy="74" r="4"/><circle cx="126" cy="24" r="4"/></svg><label><input type="checkbox" role="switch"> Sans marche</label><output aria-live="polite"></output>';
      var c = el.querySelector('input'), p = el.querySelector('.fx-sfr-p'), o = el.querySelector('output');
      var go = function () {
        var r = c.checked ? B : A;
        p.setAttribute('d', r.d);
        p.style.animation = 'none'; void p.getBoundingClientRect(); p.style.animation = '';
        el.classList.toggle('fx-on', c.checked);
        o.textContent = r.t;
      };
      c.addEventListener('change', go);
      go();
    },
    trigger: function (el) { el.querySelector('input').click(); }
  });

  // Un train dont chaque voiture montre son affluence
  FX.register('train-crowding', {
    entrance: true,
    setup: function (el) {
      var C = (el.dataset.fxData || '90,70,35,55,20,60').split(',').map(Number), min = Math.min.apply(null, C), k = C.indexOf(min), box = U.make('div', 'fx-tc2', el), o = U.make('p', '', el), W = function (v) { return v > 75 ? 'pleine' : v > 45 ? 'chargée' : 'calme'; };
      box.setAttribute('role', 'img');
      box.setAttribute('aria-label', C.map(function (v, i) { return 'voiture ' + (i + 1) + ' ' + W(v); }).join(', '));
      C.forEach(function (v, i) {
        var d = U.make('div', i === k ? 'fx-best' : '', box), f = Math.round(v / 100 * 6);
        for (var n = 0; n < f; n++) U.make('i', '', d).style.setProperty('--fx-i', i * 2 + n);
        d.dataset.n = i + 1;
      });
      o.innerHTML = 'Plus de place en <b>voiture ' + (k + 1) + '</b>';
    }
  });

  // Où se placer sur le quai selon la sortie voulue
  FX.register('platform-guide', {
    setup: function (el) {
      var E = (el.dataset.fxItems || 'Hôpital:1|Centre-ville:4|Correspondance B:6').split('|').map(function (r) { return r.split(':'); }), N = U.num(el, 'fxCars', 6);
      el.innerHTML = '<select aria-label="Votre sortie">' + E.map(function (e, i) { return '<option value="' + i + '">' + e[0] + '</option>'; }).join('') + '</select><div class="fx-pg" aria-hidden="true"></div><output aria-live="polite"></output>';
      var s = el.querySelector('select'), box = el.querySelector('.fx-pg'), o = el.querySelector('output');
      for (var i = 0; i < N; i++) U.make('i', '', box).textContent = i + 1;
      var go = function () {
        var c = +E[s.value][1];
        Array.prototype.forEach.call(box.children, function (x, i) { x.classList.toggle('fx-on', i + 1 === c); });
        o.innerHTML = 'Montez en <b>voiture ' + c + '</b> pour sortir au plus près';
      };
      s.addEventListener('change', go);
      go();
    }
  });

  // À partir de combien de trajets l'abonnement est-il rentable ?
  FX.register('pass-or-ticket', {
    setup: function (el) {
      var T = U.num(el, 'fxTicket', 2.1), P = U.num(el, 'fxPass', 42);
      el.innerHTML = '<label>Trajets par mois <b></b><input type="range" min="0" max="60"></label><div class="fx-pt" aria-hidden="true"><em></em><i></i></div><output aria-live="polite"></output>';
      var r = el.querySelector('input'), o = el.querySelector('output'), seuil = Math.ceil(P / T);
      r.value = U.num(el, 'fxTrips', 16);
      el.style.setProperty('--fx-s', seuil / 60);
      var go = function () {
        var n = +r.value, tick = n * T, best = tick > P;
        el.querySelector('label b').textContent = n;
        el.style.setProperty('--fx-q', n / 60);
        el.classList.toggle('fx-pass', best);
        o.innerHTML = '<b>' + (best ? 'L\'abonnement' : 'Les tickets') + '</b> : ' + Math.round(Math.min(tick, P)) + ' € ce mois-ci. Bascule à ' + seuil + ' trajets.';
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Un plan de réseau où l'on isole une ou plusieurs lignes
  FX.register('network-lines', {
    setup: function (el) {
      var L = [['A', '#e4322b', 'M8 60H60L100 20H152'], ['B', '#1d6fe0', 'M8 20H50L100 70H152'], ['C', '#2eaf63', 'M80 4V86']];
      el.innerHTML = '<svg viewBox="0 0 160 90" aria-hidden="true">' + L.map(function (l, i) { return '<path data-i="' + i + '" pathLength="1" d="' + l[2] + '" stroke="' + l[1] + '"/>'; }).join('') + '<circle cx="80" cy="40" r="4"/></svg><div class="fx-nl"></div>';
      var f = el.querySelector('.fx-nl'), P = el.querySelectorAll('path'), on = [true, true, true];
      L.forEach(function (l, i) {
        var b = U.make('button', '', f);
        b.type = 'button'; b.textContent = l[0]; b.style.setProperty('--fx-c', l[1]); b.setAttribute('aria-label', 'Ligne ' + l[0]); b.setAttribute('aria-pressed', 'true');
        b.addEventListener('click', function () {
          on[i] = !on[i];
          b.setAttribute('aria-pressed', on[i]);
          P[i].classList.toggle('fx-off', !on[i]);
        });
      });
    }
  });

  // Une roue de vélo qui tourne en attendant
  FX.register('wheel-loader', {
    setup: function (el) {
      el.setAttribute('role', 'status');
      el.setAttribute('aria-label', el.dataset.fxLabel || 'Chargement');
      var s = '<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="44"/><g class="fx-wl2">';
      for (var i = 0; i < 16; i++) { var a = i / 16 * 6.283; s += '<line x1="' + (50 + 5 * Math.cos(a)).toFixed(1) + '" y1="' + (50 + 5 * Math.sin(a)).toFixed(1) + '" x2="' + (50 + 42 * Math.cos(a + .5)).toFixed(1) + '" y2="' + (50 + 42 * Math.sin(a + .5)).toFixed(1) + '"/>'; }
      el.innerHTML = s + '<circle class="fx-wl2-v" cx="50" cy="8" r="3"/></g><circle class="fx-wl2-h" cx="50" cy="50" r="6"/></svg>';
    }
  });

  // Un feu tricolore qui donne l'état de quelque chose
  FX.register('traffic-light', {
    setup: function (el) {
      var W = (el.dataset.fxItems || 'Attendez|Préparez-vous|C\'est parti').split('|');
      el.innerHTML = '<div class="fx-tl" aria-hidden="true"><i></i><i></i><i></i></div><output aria-live="polite"></output>';
      var o = el.querySelector('output'), L = el.querySelectorAll('i');
      el._fxSet = function (n) { L.forEach(function (x, i) { x.classList.toggle('fx-on', i === n); }); o.textContent = W[n]; el._fxN = n; };
      el._fxSet(U.num(el, 'fxState', 0));
      new MutationObserver(function () { el._fxSet(U.num(el, 'fxState', 0)); }).observe(el, { attributes: true, attributeFilter: ['data-fx-state'] });
    },
    trigger: function (el) { el._fxSet((el._fxN + 1) % 3); }
  });

  // Un bus qui approche, arrêt après arrêt
  FX.register('live-bus', {
    setup: function (el) {
      var S = (el.dataset.fxItems || 'Mairie|Marché|Lycée|Vous|Stade').split('|'), me = S.indexOf('Vous'), step = U.num(el, 'fxStep', 2), k = 0, ol = U.make('ol', '', el), o = U.make('output', '', el);
      o.setAttribute('aria-live', 'polite');
      S.forEach(function (s, i) { U.make('li', i === me ? 'fx-me' : '', ol).innerHTML = '<i></i><span>' + s + '</span>'; });
      el._fxGo = function () {
        Array.prototype.forEach.call(ol.children, function (li, i) { li.classList.toggle('fx-bus', i === k); li.classList.toggle('fx-past', i < k); });
        var left = me - k;
        o.textContent = left > 0 ? 'Arrive dans ' + left * step + ' min' : left === 0 ? 'Le bus est là' : 'Bus passé';
        k = k >= S.length - 1 ? 0 : k + 1;
      };
      el._fxGo();
      setInterval(el._fxGo, U.reduced ? 60000 : U.num(el, 'fxEvery', 2800));
    },
    trigger: function (el) { el._fxGo(); }
  });

  // Des pas qui avancent vers le contenu
  FX.register('footsteps', {
    entrance: true,
    setup: function (el) {
      var n = U.num(el, 'fxSteps', 10), box = U.make('div', 'fx-fs', el);
      box.setAttribute('aria-hidden', 'true');
      for (var i = 0; i < n; i++) {
        var f = U.make('i', i % 2 ? 'r' : 'l', box);
        f.style.left = (i + .5) / n * 100 + '%';
        f.style.setProperty('--fx-i', i);
      }
      if (el.dataset.fxText) U.make('strong', '', el).textContent = el.dataset.fxText;
    }
  });
})(window.FX);
