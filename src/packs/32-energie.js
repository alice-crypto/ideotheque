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
})(window.FX);
