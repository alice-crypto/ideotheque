/* Pack 29 — Automobile */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Choisir une peinture : la voiture se repeint et le prix suit
  FX.register('car-colorizer', {
    setup: function (el) {
      var base = U.num(el, 'fxPrice', 24900), P = (el.dataset.fxItems || 'Blanc nacré:#eef0f2:0|Rouge vif:#c8102e:550|Bleu nuit:#16284f:750|Vert sapin:#1f4d3c:750').split('|').map(function (r) { return r.split(':'); });
      el.innerHTML = '<svg viewBox="0 0 200 80" aria-hidden="true"><path class="fx-cc-b" d="M8 58C8 46 18 44 34 42L62 22C70 16 84 14 104 14C128 14 142 20 154 38C176 40 192 44 192 58V62H8Z"/><path class="fx-cc-g" d="M70 25C76 20 86 19 100 19V38H52ZM106 19C122 19 134 23 144 38H106Z"/><circle cx="52" cy="62" r="14"/><circle cx="52" cy="62" r="6" class="fx-cc-h"/><circle cx="150" cy="62" r="14"/><circle cx="150" cy="62" r="6" class="fx-cc-h"/></svg><div class="fx-cc-s"></div><output aria-live="polite"></output>';
      var s = el.querySelector('.fx-cc-s'), o = el.querySelector('output');
      P.forEach(function (p, i) {
        var b = U.make('button', '', s);
        b.type = 'button'; b.style.background = p[1]; b.setAttribute('aria-label', p[0]);
        b.addEventListener('click', function () {
          s.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
          el.style.setProperty('--fx-paint', p[1]);
          o.innerHTML = '<b>' + (base + +p[2]).toLocaleString('fr-FR') + ' €</b> · ' + p[0] + (+p[2] ? ' (+' + p[2] + ' €)' : '');
        });
        if (!i) b.click();
      });
    }
  });

  // Une voiture qui avance en descendant la page, ses roues tournent juste
  FX.register('wheel-roll', {
    setup: function (el) {
      el.setAttribute('aria-hidden', 'true');
      el.innerHTML = '<div class="fx-wr"><i></i><i></i></div>';
    },
    scroll: function (el, info) {
      var w = el.clientWidth - 110, x = info.pass * w, r = 13;
      el.style.setProperty('--fx-x', x.toFixed(1) + 'px');
      el.style.setProperty('--fx-a', (x / r * 57.3).toFixed(1) + 'deg');
    }
  });

  // L'autonomie selon la température et la vitesse
  FX.register('range-conditions', {
    setup: function (el) {
      var base = U.num(el, 'fxRange', 420);
      el.innerHTML = '<label>Température <b data-o="t"></b><input data-k="t" type="range" min="-10" max="30" value="10"></label><label>Vitesse <b data-o="v"></b><input data-k="v" type="range" min="50" max="130" step="10" value="110"></label><div class="fx-rc" aria-hidden="true"><i></i></div><output aria-live="polite"></output><small>Modèle fictif pour illustrer l\'écart.</small>';
      var T = el.querySelector('[data-k=t]'), V = el.querySelector('[data-k=v]'), o = el.querySelector('output');
      var go = function () {
        var t = +T.value, v = +V.value, ct = t < 20 ? 1 - (20 - t) * .012 : 1, cv = 1 - Math.max(0, v - 70) * .0045, r = Math.round(base * ct * cv);
        el.querySelector('[data-o=t]').textContent = t + ' °C'; el.querySelector('[data-o=v]').textContent = v + ' km/h';
        el.style.setProperty('--fx-q', r / base);
        o.innerHTML = '<b>' + r + ' km</b> sur ' + base + ' km annoncés';
      };
      el.addEventListener('input', go);
      go();
    }
  });

  // Combien de temps pour recharger, selon la borne
  FX.register('charge-time', {
    setup: function (el) {
      var kwh = U.num(el, 'fxBattery', 60), P = [['Prise', 2.3], ['Wallbox', 7.4], ['Rapide', 50], ['Ultra', 150]];
      el.innerHTML = '<div class="fx-ct-p" role="radiogroup" aria-label="Type de borne"></div><label><span>De <b data-a></b> à <b data-b></b></span><input type="range" min="10" max="100" step="5" value="80" aria-label="Niveau visé"></label><div class="fx-ct" aria-hidden="true"><i></i></div><output aria-live="polite"></output>';
      var box = el.querySelector('.fx-ct-p'), r = el.querySelector('input'), o = el.querySelector('output'), kw = 7.4, from = 20;
      var go = function () {
        var to = Math.max(from, +r.value), fast = Math.max(0, Math.min(to, 80) - from) / 100 * kwh, slow = Math.max(0, to - 80) / 100 * kwh, h = fast / kw + slow / (kw > 11 ? kw * .4 : kw);
        el.querySelector('[data-a]').textContent = from + ' %'; el.querySelector('[data-b]').textContent = to + ' %';
        el.style.setProperty('--fx-q', to / 100);
        o.innerHTML = '<b>' + (h >= 1 ? Math.floor(h) + ' h ' : '') + String(Math.round(h % 1 * 60)).padStart(2, '0') + ' min</b> sur ' + kw + ' kW';
      };
      P.forEach(function (p, i) {
        var b = U.make('button', '', box);
        b.type = 'button'; b.setAttribute('role', 'radio'); b.textContent = p[0]; b.setAttribute('aria-checked', i === 1);
        b.addEventListener('click', function () { box.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-checked', x === b); }); kw = p[1]; go(); });
      });
      r.addEventListener('input', go);
      go();
    }
  });

  // Le coût d'énergie sur l'année : essence contre électrique
  FX.register('fuel-vs-electric', {
    setup: function (el) {
      var L = U.num(el, 'fxLitre', 1.85), C = U.num(el, 'fxCons', 6.5), K = U.num(el, 'fxKwh', .21), E = U.num(el, 'fxElec', 17);
      el.innerHTML = '<label>Km par an <b></b><input type="range" min="5000" max="40000" step="1000"></label><div class="fx-fe"><span>Essence</span><i class="a"></i><em data-a></em><span>Électrique</span><i class="b"></i><em data-b></em></div><output aria-live="polite"></output><small>Tarifs d\'exemple modifiables.</small>';
      var r = el.querySelector('input'), o = el.querySelector('output');
      r.value = U.num(el, 'fxKm', 15000);
      var go = function () {
        var km = +r.value, a = km / 100 * C * L, b = km / 100 * E * K, m = function (v) { return Math.round(v).toLocaleString('fr-FR') + ' €'; };
        el.querySelector('label b').textContent = km.toLocaleString('fr-FR');
        el.querySelector('[data-a]').textContent = m(a); el.querySelector('[data-b]').textContent = m(b);
        el.style.setProperty('--fx-a', Math.min(1, a / 3000)); el.style.setProperty('--fx-b', Math.min(1, b / 3000));
        o.innerHTML = '<b>' + m(a - b) + '</b> d\'écart par an';
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Un compte-tours qu'on fait monter en maintenant le bouton
  FX.register('rev-meter', {
    setup: function (el) {
      el.innerHTML = '<svg viewBox="0 0 120 80" aria-hidden="true"><path class="fx-rv-b" pathLength="1" d="M12 70A52 52 0 0 1 108 70"/><path class="fx-rv-r" pathLength="1" d="M92 26A52 52 0 0 1 108 70"/><line class="fx-rv-n" x1="60" y1="70" x2="60" y2="24"/></svg><output></output><button type="button">Accélérer</button>';
      var b = el.querySelector('button'), o = el.querySelector('output');
      el._fxR = 800; el._fxHold = false;
      b.addEventListener('pointerdown', function () { el._fxHold = true; });
      ['pointerup', 'pointerleave', 'blur'].forEach(function (t) { b.addEventListener(t, function () { el._fxHold = false; }); });
      b.addEventListener('keydown', function (e) { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); el._fxHold = true; } });
      b.addEventListener('keyup', function () { el._fxHold = false; });
      el._fxO = o;
    },
    tick: function (el, dt) {
      var top = U.num(el, 'fxMax', 8000), r = el._fxR;
      r += el._fxHold ? 4200 * dt : -2600 * dt;
      r = U.clamp(r, 800, top);
      if (r >= top * .985) r -= U.rand(150, 500);
      el._fxR = r;
      el.style.setProperty('--fx-a', ((r / top) * 150 - 75).toFixed(1) + 'deg');
      el._fxO.textContent = Math.round(r / 50) * 50 + ' tr/min';
      el.classList.toggle('fx-red', r > top * .8);
    },
    trigger: function (el) { el._fxR = 7600; }
  });

  // Un sélecteur P R N D qui fonctionne comme un groupe de boutons radio
  FX.register('gear-selector', {
    setup: function (el) {
      var G = (el.dataset.fxItems || 'P:Parking|R:Marche arrière|N:Point mort|D:Marche avant').split('|').map(function (r) { return r.split(':'); }), n = 0;
      var box = U.make('div', 'fx-gs', el), o = U.make('output', '', el);
      box.setAttribute('role', 'radiogroup'); box.setAttribute('aria-label', 'Rapport');
      U.make('i', '', box).setAttribute('aria-hidden', 'true');
      o.setAttribute('aria-live', 'polite');
      box.style.setProperty('--fx-n', G.length);
      var set = function (k, f) {
        n = (k + G.length) % G.length;
        box.style.setProperty('--fx-k', n);
        box.querySelectorAll('button').forEach(function (b, i) { b.setAttribute('aria-checked', i === n); b.tabIndex = i === n ? 0 : -1; if (i === n && f) b.focus(); });
        o.textContent = G[n][1];
        el.dispatchEvent(new CustomEvent('fx:gear', { bubbles: true, detail: { gear: G[n][0] } }));
      };
      G.forEach(function (g, i) {
        var b = U.make('button', '', box);
        b.type = 'button'; b.setAttribute('role', 'radio'); b.textContent = g[0]; b.setAttribute('aria-label', g[1]);
        b.addEventListener('click', function () { set(i); });
      });
      box.addEventListener('keydown', function (e) { var d = { ArrowUp: -1, ArrowLeft: -1, ArrowDown: 1, ArrowRight: 1 }[e.key]; if (d) { e.preventDefault(); set(n + d, true); } });
      set(0);
    }
  });

  // Des phares qui s'allument et balaient le texte dans le noir
  FX.register('headlight-sweep', {
    setup: function (el) {
      var t = el.innerHTML;
      el.innerHTML = '<div class="fx-hl-t">' + t + '</div><div class="fx-hl-m" aria-hidden="true"></div><button type="button" aria-pressed="false">Allumer les phares</button>';
      var b = el.querySelector('button');
      b.addEventListener('click', function () { var o = !el.classList.contains('fx-on'); el.classList.toggle('fx-on', o); b.setAttribute('aria-pressed', o); b.textContent = o ? 'Éteindre les phares' : 'Allumer les phares'; });
      el.addEventListener('pointermove', function (e) { var r = el.getBoundingClientRect(); el.style.setProperty('--fx-x', (e.clientX - r.left) + 'px'); el.style.setProperty('--fx-y', (e.clientY - r.top) + 'px'); });
      U.ensurePositioned(el);
    }
  });

  // Une voiture vue de dessus qu'on fait tourner sur un plateau
  FX.register('turntable-top', {
    setup: function (el) {
      var a = -18, v = 0, last = null;
      el.tabIndex = 0;
      el.setAttribute('role', 'slider'); el.setAttribute('aria-label', 'Rotation du plateau'); el.setAttribute('aria-valuemin', 0); el.setAttribute('aria-valuemax', 359);
      el.innerHTML = '<div class="fx-tt2" aria-hidden="true"><div class="fx-tt2-c"><i></i><i></i><i></i><i></i><u></u></div></div>';
      var p = el.firstChild;
      var put = function () { p.style.transform = 'rotate(' + a + 'deg)'; el.setAttribute('aria-valuenow', ((Math.round(a) % 360) + 360) % 360); };
      el.addEventListener('pointerdown', function (e) { last = e.clientX; v = 0; el.classList.add('fx-grab'); });
      window.addEventListener('pointermove', function (e) { if (last === null) return; v = (e.clientX - last) * .8; a += v; last = e.clientX; put(); });
      window.addEventListener('pointerup', function () { last = null; el.classList.remove('fx-grab'); });
      el.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') { a -= 12; put(); e.preventDefault(); } if (e.key === 'ArrowRight') { a += 12; put(); e.preventDefault(); } });
      el._fxStep = function () { if (last === null && Math.abs(v) > .05) { a += v; v *= .95; put(); } };
      put();
    },
    tick: function (el) { if (el._fxStep) el._fxStep(); }
  });

  // Un loyer de location selon la durée, les kilomètres et l'apport
  FX.register('lease-monthly', {
    setup: function (el) {
      var P = U.num(el, 'fxPrice', 32000);
      el.innerHTML = '<div class="fx-lm" role="radiogroup" aria-label="Durée"></div><label>Km par an <b data-k></b><input data-r="k" type="range" min="5000" max="30000" step="5000" value="15000"></label><label>Apport <b data-a></b><input data-r="a" type="range" min="0" max="8000" step="500" value="2000"></label><output aria-live="polite"></output><small>Estimation fictive, hors assurance.</small>';
      var box = el.querySelector('.fx-lm'), K = el.querySelector('[data-r=k]'), A = el.querySelector('[data-r=a]'), o = el.querySelector('output'), M = 36;
      var go = function () {
        var km = +K.value, ap = +A.value, residual = P * Math.max(.2, .72 - M / 120 - km / 150000), loyer = (P - residual - ap) / M + P * .0028;
        el.querySelector('[data-k]').textContent = km.toLocaleString('fr-FR');
        el.querySelector('[data-a]').textContent = ap.toLocaleString('fr-FR') + ' €';
        o.innerHTML = '<b>' + Math.round(loyer) + ' €</b> par mois sur ' + M + ' mois';
      };
      [24, 36, 48, 60].forEach(function (m) {
        var b = U.make('button', '', box);
        b.type = 'button'; b.setAttribute('role', 'radio'); b.textContent = m; b.setAttribute('aria-label', m + ' mois'); b.setAttribute('aria-checked', m === 36);
        b.addEventListener('click', function () { box.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-checked', x === b); }); M = m; go(); });
      });
      el.addEventListener('input', go);
      go();
    }
  });

  // La valeur d'un véhicule au fil des années, avec un repère
  FX.register('resale-curve', {
    setup: function (el) {
      var P = U.num(el, 'fxPrice', 28000), Y = 12, pts = [];
      for (var i = 0; i <= Y; i++) pts.push(P * Math.pow(.84, i));
      var p = pts.map(function (v, i) { return (i ? 'L' : 'M') + (i / Y * 200).toFixed(1) + ' ' + (92 - v / P * 86).toFixed(1); }).join('');
      el.innerHTML = '<svg viewBox="0 0 200 96" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="' + p + '"/></svg><span class="fx-rv2" aria-hidden="true"></span><label>Âge <input type="range" min="0" max="' + Y + '"></label><output aria-live="polite"></output><small>Décote fictive de 16 % par an.</small>';
      var r = el.querySelector('input'), o = el.querySelector('output');
      r.value = U.num(el, 'fxYear', 4);
      var go = function () {
        var y = +r.value, v = pts[y];
        el.style.setProperty('--fx-x', y / Y); el.style.setProperty('--fx-y', 1 - v / P * .9);
        o.innerHTML = '<b>' + (Math.round(v / 100) * 100).toLocaleString('fr-FR') + ' €</b> à ' + y + ' an' + (y > 1 ? 's' : '') + ', soit ' + Math.round(v / P * 100) + ' % de sa valeur';
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Ce qui arrive bientôt à l'entretien, selon le compteur
  FX.register('service-odometer', {
    setup: function (el) {
      var km = U.num(el, 'fxKm', 47200), O = (el.dataset.fxItems || 'Vidange:20000|Pneus:40000|Freins:60000|Courroie:120000').split('|').map(function (r) { var p = r.split(':'); return { n: p[0], e: +p[1] }; });
      el.innerHTML = '<div class="fx-so" aria-label="' + km + ' kilomètres">' + String(km).padStart(6, '0').split('').map(function (d) { return '<i>' + d + '</i>'; }).join('') + '</div><ul></ul>';
      var ul = el.querySelector('ul');
      O.forEach(function (o) { o.left = o.e - km % o.e; o.q = 1 - o.left / o.e; });
      O.sort(function (a, b) { return a.left - b.left; }).forEach(function (o, i) {
        var li = U.make('li', o.left < 5000 ? 'fx-soon' : '', ul);
        li.style.setProperty('--fx-q', o.q); li.style.setProperty('--fx-i', i);
        li.innerHTML = '<span>' + o.n + '</span><em></em><b>' + o.left.toLocaleString('fr-FR') + ' km</b>';
      });
    }
  });

  // La pression des quatre pneus, vue de dessus
  FX.register('tire-pressure', {
    setup: function (el) {
      var V = (el.dataset.fxData || '2.4,2.4,1.9,2.3').split(',').map(Number), N = ['Avant gauche', 'Avant droit', 'Arrière gauche', 'Arrière droit'], lo = U.num(el, 'fxLow', 2.1), h = '', bad = [];
      V.forEach(function (v, i) {
        var low = v < lo;
        if (low) bad.push(N[i]);
        h += '<div class="fx-p' + i + (low ? ' fx-low' : '') + '"><i></i><b>' + String(v.toFixed(1)).replace('.', ',') + '</b></div>';
      });
      el.innerHTML = '<div class="fx-tp" aria-hidden="true"><u></u>' + h + '</div><p>' + (bad.length ? 'À regonfler : ' + bad.join(', ') : 'Pression correcte partout') + '</p>';
      el.classList.toggle('fx-bad', bad.length > 0);
    }
  });

  // Un bouton dont la route défile au survol, et la petite voiture arrive au bout
  FX.register('road-cta', {
    setup: function (el) {
      var d = U.make('span', 'fx-rd', el), c = U.make('span', 'fx-rd-c', el);
      d.setAttribute('aria-hidden', 'true'); c.setAttribute('aria-hidden', 'true');
      U.ensurePositioned(el);
    }
  });

  // Une route qui défile en perspective vers l'horizon
  FX.register('road-dashes', {
    setup: function (el) {
      var c = U.make('canvas', '', el), x, W, H;
      el.setAttribute('aria-hidden', 'true');
      var size = function () { var r = el.getBoundingClientRect(), d = window.devicePixelRatio || 1; W = r.width; H = r.height; c.width = W * d; c.height = H * d; x = c.getContext('2d'); x.scale(d, d); };
      size(); U.onResize(size);
      el._fxDraw = function (t) {
        var hz = H * .32, sp = U.num(el, 'fxSpeed', 1), g = x.createLinearGradient(0, 0, 0, hz);
        g.addColorStop(0, '#16213f'); g.addColorStop(1, '#f28a6a');
        x.fillStyle = g; x.fillRect(0, 0, W, hz);
        x.fillStyle = '#1c1d22'; x.fillRect(0, hz, W, H - hz);
        x.fillStyle = '#34363d';
        x.beginPath(); x.moveTo(W * .47, hz); x.lineTo(W * .53, hz); x.lineTo(W * 1.1, H); x.lineTo(-W * .1, H); x.closePath(); x.fill();
        x.fillStyle = '#ffe9a8';
        for (var i = 0; i < 8; i++) {
          var z = ((i / 8 + t * .35 * sp) % 1), z2 = z + .045, y1 = hz + (H - hz) * z * z, y2 = hz + (H - hz) * z2 * z2, w1 = 1 + z * z * 7, w2 = 1 + z2 * z2 * 7;
          x.beginPath(); x.moveTo(W / 2 - w1, y1); x.lineTo(W / 2 + w1, y1); x.lineTo(W / 2 + w2, y2); x.lineTo(W / 2 - w2, y2); x.fill();
        }
      };
      el._fxDraw(0);
    },
    tick: function (el, dt, t) { if (el._fxDraw && !U.reduced) el._fxDraw(t); }
  });

  // Un champ d'immatriculation qui ressemble à la plaque
  FX.register('plate-input', {
    setup: function (el) {
      el.innerHTML = '<div class="fx-pl2"><span class="fx-pl2-e" aria-hidden="true">F</span><input type="text" inputmode="text" autocomplete="off" maxlength="9" placeholder="AB-123-CD" aria-label="Plaque d\'immatriculation" aria-describedby=""><span class="fx-pl2-e" aria-hidden="true"></span></div><output aria-live="polite"></output>';
      var i = el.querySelector('input'), o = el.querySelector('output');
      i.addEventListener('input', function () {
        var c = i.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7), s = c.slice(0, 2) + (c.length > 2 ? '-' + c.slice(2, 5) : '') + (c.length > 5 ? '-' + c.slice(5) : '');
        i.value = s;
        var ok = /^[A-HJ-NP-TV-Z]{2}-(?!000)[0-9]{3}-[A-HJ-NP-TV-Z]{2}$/.test(s);
        el.classList.toggle('fx-ok', ok);
        el.classList.toggle('fx-ko', s.length === 9 && !ok);
        o.textContent = s.length < 9 ? '' : ok ? 'Format valide' : 'Format incorrect';
        if (ok) el.dispatchEvent(new CustomEvent('fx:plate', { bubbles: true, detail: { plate: s } }));
      });
    }
  });

  // Deux modèles côte à côte : le meilleur de chaque ligne ressort
  FX.register('spec-duel', {
    entrance: true,
    setup: function (el) {
      var N = (el.dataset.fxNames || 'Modèle A,Modèle B').split(','), R = (el.dataset.fxItems || 'Autonomie (km):420:510:+|0 à 100 km/h (s):7.8:6.4:-|Coffre (L):470:380:+|Prix (k€):34:41:-').split('|').map(function (r) { return r.split(':'); }), score = [0, 0];
      var h = '<thead><tr><th><span class="fx-sr">Caractéristique</span></th><th>' + N[0] + '</th><th>' + N[1] + '</th></tr></thead><tbody>';
      R.forEach(function (r, i) {
        var a = +r[1], b = +r[2], w = a === b ? -1 : ((a > b) === (r[3] === '+') ? 0 : 1);
        if (w >= 0) score[w]++;
        h += '<tr style="--fx-i:' + i + '"><th scope="row">' + r[0] + '</th><td class="' + (w === 0 ? 'fx-w' : '') + '">' + r[1].replace('.', ',') + '</td><td class="' + (w === 1 ? 'fx-w' : '') + '">' + r[2].replace('.', ',') + '</td></tr>';
      });
      el.innerHTML = '<table>' + h + '</tbody></table><p>' + N[0] + ' ' + score[0] + ' · ' + N[1] + ' ' + score[1] + '</p>';
    }
  });

  // Un radar de recul : plus l'obstacle approche, plus les arcs rougissent
  FX.register('parking-sensor', {
    setup: function (el) {
      el.innerHTML = '<svg viewBox="0 0 120 64" aria-hidden="true"><path d="M20 62A40 40 0 0 1 100 62"/><path d="M34 62A26 26 0 0 1 86 62"/><path d="M46 62A14 14 0 0 1 74 62"/><rect x="50" y="58" width="20" height="6" rx="2"/></svg><label>Distance <input type="range" min="10" max="150" step="5"></label><output aria-live="polite"></output>';
      var r = el.querySelector('input'), o = el.querySelector('output'), A = el.querySelectorAll('svg path');
      r.value = U.num(el, 'fxCm', 60);
      var go = function () {
        var d = +r.value, n = d > 100 ? 0 : d > 60 ? 1 : d > 30 ? 2 : 3;
        A.forEach(function (a, i) { a.classList.toggle('fx-on', 2 - i < n); });
        el.dataset.fxLevel = n;
        o.textContent = d + ' cm · ' + ['Voie libre', 'Attention', 'Approche', 'Stop'][n];
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Une trace de pneu qui traverse le titre et le révèle
  FX.register('tire-track', {
    entrance: true,
    setup: function (el) {
      el.innerHTML = '<span class="fx-tk-x">' + el.innerHTML + '</span>';
      var t = U.make('span', 'fx-tk', el);
      t.setAttribute('aria-hidden', 'true');
      U.ensurePositioned(el);
    }
  });
})(window.FX);
