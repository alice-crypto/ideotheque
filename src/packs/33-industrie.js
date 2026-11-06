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
})(window.FX);
