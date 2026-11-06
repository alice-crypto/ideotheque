/* Pack 33 — Industrie */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Le rendement d'une ligne : trois taux, un seul chiffre
  FX.register('oee-gauge', {
    setup: function (el) {
      var R = [['Disponibilité', U.num(el, 'fxAvail', 88)], ['Performance', U.num(el, 'fxPerf', 92)], ['Qualité', U.num(el, 'fxQual', 97)]];
      el.innerHTML = '<div class="fx-oe" aria-hidden="true"><i></i><b></b></div><div class="fx-oe-s"></div><output aria-live="polite"></output>';
      var box = el.querySelector('.fx-oe-s'), o = el.querySelector('output');
      R.forEach(function (r) {
        var l = U.make('label', '', box);
        l.innerHTML = r[0] + ' <em></em><input type="range" min="40" max="100" value="' + r[1] + '">';
        r.i = l.querySelector('input'); r.e = l.querySelector('em');
      });
      var go = function () {
        var v = 1, low = R[0];
        R.forEach(function (r) { v *= r.i.value / 100; r.e.textContent = r.i.value + ' %'; if (+r.i.value < +low.i.value) low = r; });
        var pc = Math.round(v * 100);
        el.style.setProperty('--fx-q', v);
        el.querySelector('.fx-oe b').textContent = pc + ' %';
        o.textContent = 'À améliorer d\'abord : ' + low[0].toLowerCase();
      };
      box.addEventListener('input', go);
      go();
    }
  });

  // Une ligne d'assemblage : la pièce se complète à chaque poste
  FX.register('assembly-line', {
    setup: function (el) {
      var S = (el.dataset.fxItems || 'Châssis|Moteur|Capot|Contrôle').split('|'), box = U.make('div', 'fx-as2', el), o = U.make('output', '', el), n = 0, done = U.num(el, 'fxStart', 0);
      box.style.setProperty('--fx-n', S.length);
      S.forEach(function (t) { U.make('span', '', box).textContent = t; });
      var p = U.make('i', 'fx-as2-p', box);
      for (var i = 0; i < S.length; i++) U.make('u', '', p).style.setProperty('--fx-i', i);
      el._fxStep = function () {
        n = (n + 1) % (S.length + 1);
        if (n === S.length) { done++; }
        box.style.setProperty('--fx-k', Math.min(n, S.length - 1));
        p.querySelectorAll('u').forEach(function (u, i) { u.classList.toggle('fx-on', i < n); });
        Array.prototype.forEach.call(box.querySelectorAll('span'), function (s, i) { s.classList.toggle('fx-now', i === Math.min(n, S.length - 1)); });
        o.textContent = done + ' pièce' + (done > 1 ? 's' : '') + ' terminée' + (done > 1 ? 's' : '');
      };
      el._fxStep();
      if (!U.reduced) setInterval(el._fxStep, U.num(el, 'fxPace', 1100));
    },
    trigger: function (el) { el._fxStep(); }
  });

  // Le mur de supervision : chaque machine, son état et depuis quand
  FX.register('machine-wall', {
    setup: function (el) {
      var M = (el.dataset.fxItems || 'P1:run|P2:run|P3:stop|P4:run|S1:warn|S2:run|S3:run|R1:run').split('|').map(function (r) { var p = r.split(':'); return { n: p[0], s: p[1], at: Date.now() - U.rand(4, 80) * 60000 }; }), W = { run: 'En marche', warn: 'À surveiller', stop: 'À l\'arrêt' }, box = U.make('div', 'fx-mw', el), o = U.make('output', '', el);
      o.setAttribute('aria-live', 'polite');
      M.forEach(function (m) { m.d = U.make('div', '', box); });
      el._fxShow = function () {
        var bad = 0;
        M.forEach(function (m) {
          var min = Math.round((Date.now() - m.at) / 60000);
          m.d.dataset.s = m.s;
          m.d.innerHTML = '<b>' + m.n + '</b><small>' + W[m.s] + '</small><small>' + min + ' min</small>';
          if (m.s === 'stop') bad++;
        });
        o.textContent = bad ? bad + ' machine' + (bad > 1 ? 's' : '') + ' à l\'arrêt' : 'Tout tourne';
      };
      el._fxFlip = function () {
        var m = M[Math.floor(Math.random() * M.length)];
        m.s = { run: 'warn', warn: 'stop', stop: 'run' }[m.s]; m.at = Date.now();
        el._fxShow();
      };
      el._fxShow();
      setInterval(el._fxShow, 30000);
    },
    trigger: function (el) { el._fxFlip(); }
  });

  // Les quatre temps d'un moteur, avec une vraie bielle
  FX.register('piston-cycle', {
    setup: function (el) {
      var S = ['Admission', 'Compression', 'Combustion', 'Échappement'];
      el.innerHTML = '<svg viewBox="0 0 80 120" aria-hidden="true"><rect class="fx-pi2-c" x="20" y="4" width="40" height="72"/><rect class="fx-pi2-g" x="22" y="6" width="36" height="0"/><rect class="fx-pi2-p" x="22" y="0" width="36" height="16"/><line class="fx-pi2-r" x1="40" y1="0" x2="40" y2="0"/><circle class="fx-pi2-w" cx="40" cy="96" r="20"/><circle class="fx-pi2-h" cx="40" cy="96" r="4"/></svg><output aria-live="off"></output>';
      el._fxP = el.querySelector('.fx-pi2-p'); el._fxR = el.querySelector('.fx-pi2-r'); el._fxG = el.querySelector('.fx-pi2-g'); el._fxH = el.querySelector('.fx-pi2-h'); el._fxO = el.querySelector('output'); el._fxS = S;
      el._fxA = 0;
      el._fxDraw = function (a) {
        var r = 18, L = 52, x = 40 + r * Math.sin(a), y = 96 - r * Math.cos(a), py = y - Math.sqrt(L * L - Math.pow(x - 40, 2)), k = Math.floor((a / (Math.PI * 4)) % 1 * 4);
        el._fxP.setAttribute('y', py - 12);
        el._fxR.setAttribute('x1', 40); el._fxR.setAttribute('y1', py); el._fxR.setAttribute('x2', x); el._fxR.setAttribute('y2', y);
        el._fxH.setAttribute('cx', x); el._fxH.setAttribute('cy', y);
        el._fxG.setAttribute('height', Math.max(0, py - 18));
        el._fxG.setAttribute('class', 'fx-pi2-g k' + k);
        el._fxO.textContent = S[k];
      };
      el._fxDraw(0);
    },
    tick: function (el, dt) { if (U.reduced) return; el._fxA = (el._fxA + dt * U.num(el, 'fxSpeed', 3)) % (Math.PI * 4); el._fxDraw(el._fxA); }
  });

  // Un diagramme de Pareto : les quelques causes qui comptent le plus
  FX.register('defect-pareto', {
    entrance: true,
    setup: function (el) {
      var R = (el.dataset.fxItems || 'Rayures:48|Soudure:31|Cote:12|Couleur:6|Emballage:3').split('|').map(function (r) { var p = r.split(':'); return [p[0], +p[1]]; }).sort(function (a, b) { return b[1] - a[1]; }), tot = R.reduce(function (t, r) { return t + r[1]; }, 0), max = R[0][1], c = 0, line = '', hits = [], h = '';
      R.forEach(function (r, i) {
        c += r[1];
        var q = c / tot, x = (i + .5) / R.length * 100;
        line += (i ? 'L' : 'M') + x + ' ' + (100 - q * 100);
        if (c - r[1] < tot * .8) hits.push(r[0]);
        h += '<div class="' + (c - r[1] < tot * .8 ? 'fx-hit' : '') + '" style="--fx-q:' + r[1] / max + ';--fx-i:' + i + '"><i></i><small>' + r[0] + '</small></div>';
      });
      el.innerHTML = '<div class="fx-dp" aria-hidden="true">' + h + '<svg viewBox="0 0 100 100" preserveAspectRatio="none"><path pathLength="1" d="' + line + '"/></svg></div><p><b>' + hits.join(', ') + '</b> : 80 % des défauts</p>';
    }
  });

  // Une mesure contre sa tolérance : conforme ou non conforme
  FX.register('tolerance-gauge', {
    setup: function (el) {
      var n = U.num(el, 'fxNominal', 25), t = U.num(el, 'fxTol', .05), v = U.num(el, 'fxValue', 25.03);
      el.innerHTML = '<div class="fx-tg2" aria-hidden="true"><i></i><em></em></div><label>Mesure (mm)<input type="number" step=".01" value="' + v + '"></label><output aria-live="polite"></output>';
      var i = el.querySelector('input'), o = el.querySelector('output');
      var go = function () {
        var x = +i.value, d = x - n, ok = Math.abs(d) <= t, q = U.clamp(.5 + d / (t * 4), 0, 1);
        el.style.setProperty('--fx-q', q);
        el.classList.toggle('fx-bad', !ok);
        o.innerHTML = '<b>' + (ok ? 'Conforme' : 'Non conforme') + '</b> · écart ' + (d > 0 ? '+' : '') + d.toFixed(2).replace('.', ',') + ' mm, tolérance ±' + String(t).replace('.', ',') + ' mm';
      };
      i.addEventListener('input', go);
      go();
    }
  });

  // Retrouver le chemin d'un lot, à partir de son numéro
  FX.register('lot-trace', {
    setup: function (el) {
      var D = JSON.parse(el.dataset.fxData || '{"L-2048":["Bois du Jura, 3 mars","Découpe, atelier 2, 5 mars","Assemblage, 9 mars","Contrôle, lot conforme, 10 mars","Expédié à Lyon, 12 mars"]}');
      el.innerHTML = '<form><input placeholder="Numéro de lot" aria-label="Numéro de lot" value="L-2048"><button>Tracer</button></form><ol></ol><output aria-live="polite"></output>';
      var i = el.querySelector('input'), ol = el.querySelector('ol'), o = el.querySelector('output');
      var go = function () {
        var c = D[i.value.trim().toUpperCase()];
        ol.innerHTML = '';
        if (!c) { o.textContent = 'Lot inconnu'; return; }
        c.forEach(function (t, k) { var li = U.make('li', '', ol); li.textContent = t; li.style.setProperty('--fx-i', k); });
        o.textContent = c.length + ' étapes retrouvées (exemple fictif)';
      };
      el.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); go(); });
      go();
    }
  });
})(window.FX);
