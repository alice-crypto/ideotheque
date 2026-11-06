/* Pack 32 — Énergie */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Des panneaux à poser sur un toit, et ce qu'ils produisent
  FX.register('solar-roof', {
    setup: function (el) {
      var kwp = .42, yld = U.num(el, 'fxYield', 1200), price = U.num(el, 'fxKwh', .21), cost = U.num(el, 'fxCost', 650), max = 15;
      el.innerHTML = '<div class="fx-sr2" aria-hidden="true"></div><label>Panneaux <b></b><input type="range" min="2" max="' + max + '"></label><output aria-live="polite"></output><small>Calcul fictif avec 50 % d\'autoconsommation.</small>';
      var box = el.querySelector('.fx-sr2'), r = el.querySelector('input'), o = el.querySelector('output');
      for (var i = 0; i < max; i++) U.make('i', '', box);
      r.value = U.num(el, 'fxCount', 8);
      var go = function () {
        var n = +r.value, prod = n * kwp * yld, gain = prod * .5 * price, invest = n * cost, y = invest / gain;
        Array.prototype.forEach.call(box.children, function (p, i) { p.classList.toggle('fx-on', i < n); });
        el.querySelector('label b').textContent = n + ' · ' + (n * kwp).toFixed(1).replace('.', ',') + ' kWc';
        o.innerHTML = '<b>' + Math.round(prod).toLocaleString('fr-FR') + ' kWh/an</b><br>' + Math.round(gain) + ' € d\'économie, rentable en ' + Math.round(y) + ' ans';
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Une facture découpée : ce que l'on paie vraiment
  FX.register('bill-slices', {
    entrance: true,
    setup: function (el) {
      var R = (el.dataset.fxItems || 'Énergie:42:Ce que vous consommez|Réseau:28:Le transport jusqu\'à chez vous|Taxes:24:Taxes et contributions|Abonnement:6:Part fixe').split('|').map(function (r) { return r.split(':'); }), tot = R.reduce(function (t, r) { return t + +r[1]; }, 0);
      var bar = U.make('div', 'fx-bl3', el), o = U.make('output', '', el);
      o.setAttribute('aria-live', 'polite');
      R.forEach(function (r, i) {
        var b = U.make('button', '', bar);
        b.type = 'button'; b.style.flex = r[1] + ' 1 0'; b.style.setProperty('--fx-i', i); b.setAttribute('aria-label', r[0] + ', ' + Math.round(r[1] / tot * 100) + ' %');
        b.textContent = Math.round(r[1] / tot * 100) >= 15 ? Math.round(r[1] / tot * 100) + ' %' : '';
        b.addEventListener('click', function () { bar.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); o.innerHTML = '<b>' + r[0] + ' : ' + r[1] + ' €</b><br>' + r[2]; });
        if (!i) b.click();
      });
    }
  });

  // Une horloge de 24 h : heures creuses, heures pleines et maintenant
  FX.register('peak-clock', {
    setup: function (el) {
      var Z = (el.dataset.fxOff || '0-6,14-16').split(',').map(function (s) { return s.split('-').map(Number); });
      var deg = function (h) { return h / 24 * 360; }, grad = Z.map(function (z) { return 'var(--fx-off, #2d9c7f) ' + deg(z[0]) + 'deg ' + deg(z[1]) + 'deg'; });
      var st = [], pos = 0;
      Z.forEach(function (z, i) { if (z[0] > pos) st.push('color-mix(in srgb, currentColor 20%, transparent) ' + deg(pos) + 'deg ' + deg(z[0]) + 'deg'); st.push(grad[i]); pos = z[1]; });
      st.push('color-mix(in srgb, currentColor 20%, transparent) ' + deg(pos) + 'deg 360deg');
      el.innerHTML = '<div class="fx-pk" aria-hidden="true" style="background:conic-gradient(' + st.join(',') + ')"><i></i><span>0</span><span>6</span><span>12</span><span>18</span></div><output></output>';
      var o = el.querySelector('output'), hand = el.querySelector('i');
      var go = function () {
        var d = new Date(), h = d.getHours() + d.getMinutes() / 60, off = Z.some(function (z) { return h >= z[0] && h < z[1]; });
        hand.style.transform = 'rotate(' + deg(h) + 'deg)';
        el.classList.toggle('fx-now-off', off);
        if (off) { o.textContent = 'Heure creuse en ce moment'; return; }
        var nx = Z.map(function (z) { return z[0] > h ? z[0] - h : z[0] + 24 - h; }).sort(function (a, b) { return a - b; })[0];
        o.textContent = 'Heure pleine, creuse dans ' + Math.ceil(nx) + ' h';
      };
      go();
      setInterval(go, 60000);
    }
  });

  // La composition de l'électricité en ce moment, qui varie doucement
  FX.register('grid-mix', {
    setup: function (el) {
      var M = (el.dataset.fxItems || 'Nucléaire:62:1|Hydraulique:12:1|Éolien:9:1|Solaire:6:1|Gaz:11:0').split('|').map(function (r) { var p = r.split(':'); return { n: p[0], v: +p[1], g: +p[2] }; }), bar = U.make('div', 'fx-gm', el), ul = U.make('ul', '', el), o = U.make('p', '', el);
      bar.setAttribute('aria-hidden', 'true');
      M.forEach(function (m, i) { m.b = U.make('i', 'c' + i, bar); m.l = U.make('li', 'c' + i, ul); });
      el._fxShow = function () {
        var t = M.reduce(function (s, m) { return s + m.v; }, 0), g = 0;
        M.forEach(function (m) { var q = m.v / t * 100; m.b.style.flexGrow = q; m.l.textContent = m.n + ' ' + Math.round(q) + ' %'; if (m.g) g += q; });
        o.innerHTML = '<b>' + Math.round(g) + ' %</b> décarboné. Données fictives.';
      };
      el._fxM = M;
      el._fxShow();
      if (!U.reduced) setInterval(function () { M.forEach(function (m) { m.v = Math.max(1, m.v + U.rand(-1.2, 1.2)); }); el._fxShow(); }, 1800);
    }
  });

  // Une éolienne : quand le vent double, la puissance est multipliée par huit
  FX.register('wind-turbine', {
    setup: function (el) {
      el.innerHTML = '<svg viewBox="0 0 100 120" aria-hidden="true"><path d="M48 118 49 50H51L52 118Z"/><g class="fx-wt"><path d="M50 48 47 8Q50 4 53 8Z"/><path d="M50 48 47 8Q50 4 53 8Z" transform="rotate(120 50 48)"/><path d="M50 48 47 8Q50 4 53 8Z" transform="rotate(240 50 48)"/><circle cx="50" cy="48" r="4"/></g></svg><label>Vent <b></b><input type="range" min="0" max="30"></label><output aria-live="polite"></output>';
      var r = el.querySelector('input'), o = el.querySelector('output');
      el._fxA = 0;
      r.value = U.num(el, 'fxWind', 10);
      var go = function () {
        var v = +r.value, stop = v < 3 || v > 25, p = stop ? 0 : Math.min(3000, .22 * Math.pow(v, 3) * 8);
        el._fxS = stop ? 0 : Math.min(200, v * 14);
        el.querySelector('label b').textContent = v + ' m/s';
        o.innerHTML = v > 25 ? 'Tempête : <b>arrêt de sécurité</b>' : v < 3 ? 'Trop peu de vent' : '<b>' + Math.round(p).toLocaleString('fr-FR') + ' kW</b> (modèle fictif)';
      };
      r.addEventListener('input', go);
      go();
    },
    tick: function (el, dt) {
      if (U.reduced) return;
      el._fxA = (el._fxA + el._fxS * dt) % 360;
      el.style.setProperty('--fx-a', el._fxA + 'deg');
    }
  });

  // Une pompe à chaleur : 1 kWh d'électricité, combien de chaleur ?
  FX.register('heat-pump-flow', {
    setup: function (el) {
      el.innerHTML = '<div class="fx-hp" aria-hidden="true"><div class="in"><b>1 kWh</b><i></i></div><div class="pm"></div><div class="out"><i></i><b data-o></b></div></div><label>Dehors <b data-t></b><input type="range" min="-15" max="15"></label><output aria-live="polite"></output>';
      var r = el.querySelector('input'), o = el.querySelector('output');
      r.value = U.num(el, 'fxTemp', 7);
      var go = function () {
        var t = +r.value, cop = U.clamp(3.3 + t * .09, 1.3, 5);
        el.querySelector('[data-t]').textContent = t + ' °C';
        el.querySelector('[data-o]').textContent = cop.toFixed(1).replace('.', ',') + ' kWh';
        el.style.setProperty('--fx-q', cop / 5);
        o.textContent = 'COP de ' + cop.toFixed(1).replace('.', ',') + ' à cette température (modèle fictif)';
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Une maison qui perd sa chaleur : isoler, poste après poste
  FX.register('insulation-loss', {
    setup: function (el) {
      var P = (el.dataset.fxItems || 'Toit:30|Murs:25|Fenêtres:15|Sol:10').split('|').map(function (r) { var p = r.split(':'); return { n: p[0], v: +p[1] }; }), bill = U.num(el, 'fxBill', 1800);
      el.innerHTML = '<div class="fx-il" aria-hidden="true"><i class="r"></i><i class="w"></i><i class="f"></i><i class="s"></i></div><div class="fx-il-c"></div><output aria-live="polite"></output>';
      var c = el.querySelector('.fx-il-c'), o = el.querySelector('output'), parts = el.querySelectorAll('.fx-il i');
      P.forEach(function (p, i) {
        var l = U.make('label', '', c), k = U.make('input', '', l);
        k.type = 'checkbox';
        l.appendChild(document.createTextNode(p.n + ' (−' + p.v + ' %)'));
        p.c = k; p.part = parts[i];
      });
      var go = function () {
        var g = 0;
        P.forEach(function (p) { if (p.c.checked) g += p.v; p.part.classList.toggle('fx-ok', p.c.checked); });
        o.innerHTML = '<b>' + (g ? '−' : '') + g + ' %</b> de pertes, ' + Math.round(bill * g / 100).toLocaleString('fr-FR') + ' € par an (estimation)';
      };
      c.addEventListener('change', go);
      go();
    }
  });

  // Un thermostat rond : chaque degré se voit sur la facture
  FX.register('thermostat-dial', {
    setup: function (el) {
      var min = 15, max = 25, ref = U.num(el, 'fxRef', 19), step = 7;
      el.innerHTML = '<div class="fx-td2" role="slider" tabindex="0" aria-label="Température de consigne" aria-valuemin="' + min + '" aria-valuemax="' + max + '"><i></i><b></b></div><div class="fx-td2-b"><button type="button" aria-label="Baisser">−</button><button type="button" aria-label="Monter">+</button></div><output aria-live="polite"></output>';
      var d = el.querySelector('.fx-td2'), b = el.querySelector('b'), o = el.querySelector('output'), v = U.num(el, 'fxValue', 20);
      var set = function (x) {
        v = U.clamp(x, min, max);
        var q = (v - min) / (max - min), diff = (v - ref) * step;
        el.style.setProperty('--fx-q', q);
        el.style.setProperty('--fx-h', 210 - q * 210);
        b.textContent = v + ' °C';
        d.setAttribute('aria-valuenow', v);
        o.textContent = diff === 0 ? 'Référence' : (diff > 0 ? '+' : '−') + Math.abs(diff) + ' % sur la dépense de chauffage (ordre de grandeur)';
      };
      el.querySelectorAll('button').forEach(function (x, i) { x.addEventListener('click', function () { set(v + (i ? 1 : -1)); }); });
      d.addEventListener('keydown', function (e) { var k = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1 }[e.key]; if (k) { e.preventDefault(); set(v + k); } });
      d.addEventListener('wheel', function (e) { e.preventDefault(); set(v + (e.deltaY < 0 ? 1 : -1)); }, { passive: false });
      set(v);
    }
  });

  // Allumer des appareils et regarder tourner le compteur
  FX.register('appliance-meter', {
    setup: function (el) {
      var A = (el.dataset.fxItems || 'Four:2400|Lave-linge:2000|Télé:100|Frigo:150|Bouilloire:2200').split('|').map(function (r) { var p = r.split(':'); return [p[0], +p[1]]; }), price = U.num(el, 'fxKwh', .21), a = 0;
      el.innerHTML = '<div class="fx-am" aria-hidden="true"><i></i></div><div class="fx-am-c"></div><output aria-live="polite"></output>';
      var c = el.querySelector('.fx-am-c'), o = el.querySelector('output');
      A.forEach(function (x) {
        var l = U.make('label', '', c), k = U.make('input', '', l);
        k.type = 'checkbox'; k.value = x[1];
        l.appendChild(document.createTextNode(x[0]));
      });
      var go = function () {
        var w = 0;
        c.querySelectorAll(':checked').forEach(function (k) { w += +k.value; });
        el._fxW = w;
        o.innerHTML = '<b>' + w.toLocaleString('fr-FR') + ' W</b> · ' + (w / 1000 * price).toFixed(2).replace('.', ',') + ' € par heure';
      };
      c.addEventListener('change', go);
      el._fxA = 0;
      c.querySelectorAll('input')[3].checked = true;
      go();
    },
    tick: function (el, dt) {
      if (U.reduced) return;
      el._fxA = (el._fxA + el._fxW * dt * .15) % 360;
      el.style.setProperty('--fx-a', el._fxA + 'deg');
    }
  });

  // Les flux de la maison : du soleil vers la batterie, le réseau et les pièces
  FX.register('energy-flow', {
    setup: function (el) {
      el.innerHTML = '<svg viewBox="0 0 200 110" aria-hidden="true"><path id="a" d="M40 24H100V55"/><path id="b" d="M100 55H160V24"/><path id="c" d="M100 55H40V90"/><path id="d" d="M100 55H160V90"/><circle cx="100" cy="55" r="6"/></svg><span class="s">Soleil</span><span class="h">Maison</span><span class="g">Réseau</span><span class="b2">Batterie</span><label>Heure <input type="range" min="0" max="23"></label><output aria-live="polite"></output>';
      var r = el.querySelector('input'), o = el.querySelector('output'), g = function (s) { return el.querySelector('#' + s); };
      r.value = U.num(el, 'fxHour', 13);
      var go = function () {
        var h = +r.value, sun = h > 7 && h < 19 ? Math.sin((h - 7) / 12 * Math.PI) * 4 : 0, use = h >= 18 && h <= 22 ? 2.2 : .7, net = sun - use;
        g('a').setAttribute('class', sun > 0 ? 'fx-on' : '');
        g('b').setAttribute('class', 'fx-on');
        g('c').setAttribute('class', net > 1.5 ? 'fx-on fx-back' : net < -.6 ? 'fx-on' : '');
        g('d').setAttribute('class', net > 0 ? 'fx-on' : net < 0 ? 'fx-on fx-back' : '');
        o.textContent = h + ' h : ' + sun.toFixed(1).replace('.', ',') + ' kW produits, ' + use.toFixed(1).replace('.', ',') + ' kW consommés. ' + (net > 0 ? 'La batterie charge.' : 'La batterie alimente.');
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Un compteur communicant : l'index monte, la puissance varie
  FX.register('smart-meter', {
    setup: function (el) {
      var kwh = U.num(el, 'fxIndex', 18492.3), p = U.num(el, 'fxPower', 1.4);
      el.innerHTML = '<div class="fx-smm"><small>Index kWh</small><b class="i"></b><small>Puissance</small><b class="p"></b></div>';
      el._fxOut = function () {
        el.querySelector('.i').textContent = kwh.toFixed(3).replace('.', ',');
        el.querySelector('.p').textContent = p.toFixed(2).replace('.', ',') + ' kW';
      };
      el._fxStep = function (dt) {
        p = U.clamp(p + U.rand(-.04, .04), .2, 6);
        kwh += p * dt / 3600 * U.num(el, 'fxSpeed', 40);
        el._fxOut();
      };
      el._fxOut();
      if (el.dataset.fxLabel) el.setAttribute('aria-label', el.dataset.fxLabel);
    },
    tick: function (el, dt) { if (!U.reduced) el._fxStep(dt); }
  });

  // Production solaire contre consommation : la part utilisée sur place
  FX.register('self-consumption', {
    entrance: true,
    setup: function (el) {
      var H = 24, s = [], c = (el.dataset.fxUse || '.3,.3,.3,.3,.3,.4,.9,1.2,.8,.5,.5,.6,.9,.6,.5,.5,.7,1.2,1.8,2,1.6,1,.6,.4').split(',').map(Number), peak = U.num(el, 'fxPeak', 3);
      for (var i = 0; i < H; i++) s.push(i > 6 && i < 20 ? Math.pow(Math.sin((i - 6) / 14 * Math.PI), 1.3) * peak : 0);
      var used = 0, made = 0, Y = function (v) { return 80 - v / peak * 72; }, X = function (i) { return i / (H - 1) * 200; };
      s.forEach(function (v, i) { used += Math.min(v, c[i]); made += v; });
      var ln = function (a) { return a.map(function (v, i) { return (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1); }).join(''); }, over = s.map(function (v, i) { return Math.min(v, c[i]); });
      el.innerHTML = '<svg viewBox="0 0 200 84" preserveAspectRatio="none" aria-hidden="true"><path class="o" d="' + ln(over) + 'L200 80L0 80Z"/><path class="s" pathLength="1" d="' + ln(s) + '"/><path class="c" pathLength="1" d="' + ln(c) + '"/></svg><p><b>' + Math.round(used / made * 100) + ' %</b> du solaire utilisé sur place. Journée fictive.</p>';
    }
  });

  // Option base ou heures creuses : qui gagne selon ses habitudes
  FX.register('tariff-choice', {
    setup: function (el) {
      var Y = U.num(el, 'fxYear', 5000), B = U.num(el, 'fxBase', .2), H = U.num(el, 'fxHigh', .22), L = U.num(el, 'fxLow', .17), S = U.num(el, 'fxExtra', 20);
      el.innerHTML = '<label>Part en heures creuses <b></b><input type="range" min="0" max="80"></label><div class="fx-tc3" aria-hidden="true"><i class="a"></i><i class="b"></i></div><output aria-live="polite"></output><small>Tarifs d\'exemple, à remplacer.</small>';
      var r = el.querySelector('input'), o = el.querySelector('output');
      r.value = U.num(el, 'fxShare', 35);
      var go = function () {
        var q = r.value / 100, a = Y * B, b = Y * (q * L + (1 - q) * H) + S, top = Math.max(a, b);
        el.querySelector('label b').textContent = r.value + ' %';
        el.style.setProperty('--fx-a', a / top); el.style.setProperty('--fx-b', b / top);
        o.innerHTML = b < a ? '<b>Heures creuses</b> : ' + Math.round(a - b) + ' € de moins par an' : '<b>Option base</b> : ' + Math.round(b - a) + ' € de moins par an';
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Taper son code postal pour savoir s'il y a une coupure
  FX.register('outage-check', {
    setup: function (el) {
      var D = JSON.parse(el.dataset.fxData || '{"69003":"vers 18 h 30","31000":"vers 21 h"}');
      el.innerHTML = '<form><input inputmode="numeric" maxlength="5" placeholder="Code postal" aria-label="Code postal"><button>Vérifier</button></form><output aria-live="polite"></output>';
      var i = el.querySelector('input'), o = el.querySelector('output');
      el.querySelector('form').addEventListener('submit', function (e) {
        e.preventDefault();
        var v = i.value.trim();
        el.classList.remove('fx-ok', 'fx-cut');
        if (!/^\d{5}$/.test(v)) { o.textContent = 'Saisissez 5 chiffres'; return; }
        if (D[v]) { el.classList.add('fx-cut'); o.innerHTML = '<b>Coupure signalée</b> · retour ' + D[v]; }
        else { el.classList.add('fx-ok'); o.innerHTML = '<b>Aucune coupure signalée</b>'; }
      });
      U.make('small', '', el).textContent = 'Exemple fictif : essayez 69003.';
    }
  });
})(window.FX);
