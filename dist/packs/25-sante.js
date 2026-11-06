/* Pack 25 — Santé */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Une semaine de rendez-vous : on choisit le jour, puis l'heure
  FX.register('appointment-week', {
    setup: function (el) {
      var hours = (el.dataset.fxHours || '9:00,10:30,14:00,16:30').split(','), days = U.make('div', 'fx-aw-d', el), slots = U.make('div', 'fx-aw-s', el), out = U.make('output', '', el);
      out.setAttribute('aria-live', 'polite');
      out.textContent = 'Choisissez un jour';
      for (var i = 1; i <= U.num(el, 'fxDays', 5); i++) (function (i) {
        var d = new Date(Date.now() + i * 86400000), b = U.make('button', '', days);
        b.type = 'button'; b.setAttribute('aria-pressed', 'false');
        b.innerHTML = '<small>' + d.toLocaleDateString('fr-FR', { weekday: 'short' }) + '</small>' + d.getDate();
        b.addEventListener('click', function () {
          days.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
          slots.innerHTML = '';
          hours.forEach(function (h, n) {
            if ((i + n) % 3 === 2) return;
            var s = U.make('button', '', slots);
            s.type = 'button'; s.textContent = h; s.style.setProperty('--fx-i', n);
            s.addEventListener('click', function () {
              slots.querySelectorAll('button').forEach(function (x) { x.classList.toggle('fx-on', x === s); });
              out.textContent = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) + ' à ' + h;
              el.dispatchEvent(new CustomEvent('fx:slot', { bubbles: true, detail: { date: d, hour: h } }));
            });
          });
          out.textContent = 'Choisissez une heure';
        });
      })(i);
    }
  });

  // Une silhouette dont on choisit une zone pour orienter la suite
  FX.register('body-map', {
    setup: function (el) {
      var Z = { Tête: 'M50 4a12 13 0 1 1-.1 0Z', Épaule: 'M28 32h44l6 14H22Z', Dos: 'M34 46h32l-2 34H36Z', Bras: 'M22 46h12l-4 42H14ZM66 46h12l8 42H70Z', Jambes: 'M36 80h13l-2 66H34ZM51 80h13l2 66H53Z' };
      var txt = JSON.parse(el.dataset.fxItems || '{}');
      var s = '<svg viewBox="0 0 100 150" role="group" aria-label="Zones du corps">';
      Object.keys(Z).forEach(function (k) { s += '<path d="' + Z[k] + '" tabindex="0" role="button" aria-label="' + k + '" data-k="' + k + '"/>'; });
      el.innerHTML = s + '</svg><output aria-live="polite">Touchez une zone</output>';
      var out = el.querySelector('output');
      var pick = function (p) {
        el.querySelectorAll('path').forEach(function (x) { x.classList.toggle('fx-on', x === p); });
        out.innerHTML = '<b>' + p.dataset.k + '</b><br>' + (txt[p.dataset.k] || 'Voir les conseils pour cette zone');
        el.dispatchEvent(new CustomEvent('fx:zone', { bubbles: true, detail: { zone: p.dataset.k } }));
      };
      el.addEventListener('click', function (e) { if (e.target.dataset.k) pick(e.target); });
      el.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && e.target.dataset.k) { e.preventDefault(); pick(e.target); } });
    }
  });

  // Une échelle de douleur de 0 à 10, avec un visage qui change
  FX.register('pain-scale', {
    setup: function (el) {
      var W = ['Aucune', 'Très légère', 'Légère', 'Gênante', 'Modérée', 'Forte', 'Très forte'];
      el.innerHTML = '<svg viewBox="0 0 60 60" aria-hidden="true"><circle cx="30" cy="30" r="27"/><circle class="e" cx="21" cy="24" r="3"/><circle class="e" cx="39" cy="24" r="3"/><path d="M18 40Q30 40 42 40"/></svg><label>Votre douleur <input type="range" min="0" max="10"></label><output aria-live="polite"></output>';
      var r = el.querySelector('input'), m = el.querySelector('svg path'), o = el.querySelector('output'), c = el.querySelector('svg circle');
      r.value = U.num(el, 'fxValue', 3);
      var go = function () {
        var v = +r.value, q = v / 10, y = 34 + q * 12;
        m.setAttribute('d', 'M18 ' + y + 'Q30 ' + (46 - q * 22) + ' 42 ' + y);
        c.style.fill = 'hsl(' + (130 - q * 130) + ' 70% 50%)';
        o.innerHTML = '<b>' + v + '</b> / 10 · ' + W[Math.round(q * 6)];
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Des verres à remplir d'un geste, jusqu'à l'objectif du jour
  FX.register('hydration-glasses', {
    setup: function (el) {
      var goal = U.num(el, 'fxGoal', 8), key = el.dataset.fxKey, day = new Date().toDateString(), n = 0;
      if (key) try { var o = JSON.parse(localStorage.getItem(key)); if (o && o.d === day) n = o.n; } catch (err) {}
      var row = U.make('div', 'fx-hg', el), out = U.make('output', '', el);
      out.setAttribute('aria-live', 'polite');
      var show = function () {
        Array.prototype.forEach.call(row.children, function (b, i) { b.classList.toggle('fx-on', i < n); b.setAttribute('aria-pressed', i < n); });
        out.textContent = n >= goal ? 'Objectif atteint' : n + ' verres sur ' + goal;
        if (key) try { localStorage.setItem(key, JSON.stringify({ d: day, n: n })); } catch (err) {}
      };
      for (var i = 0; i < goal; i++) (function (i) {
        var b = U.make('button', '', row);
        b.type = 'button'; b.setAttribute('aria-label', 'Verre ' + (i + 1));
        U.make('i', '', b);
        b.addEventListener('click', function () { n = n === i + 1 ? i : i + 1; show(); });
      })(i);
      show();
    }
  });

  // Un tracé de moniteur cardiaque qui efface devant lui
  FX.register('ecg-line', {
    setup: function (el) {
      var c = U.make('canvas', '', el), x = c.getContext('2d'), bpm = U.num(el, 'fxBpm', 72), px = 0, last = null, phase = 0, W, H;
      el.setAttribute('role', 'img');
      el.setAttribute('aria-label', el.dataset.fxLabel || 'Tracé cardiaque, ' + bpm + ' battements par minute');
      var size = function () { var r = el.getBoundingClientRect(), d = window.devicePixelRatio || 1; W = r.width; H = r.height; c.width = W * d; c.height = H * d; x = c.getContext('2d'); x.scale(d, d); px = 0; last = null; };
      var wave = function (p) {
        if (p < .1) return Math.sin(p / .1 * Math.PI) * .12;
        if (p < .18) return 0;
        if (p < .2) return -(p - .18) / .02 * .15;
        if (p < .23) return -.15 + (p - .2) / .03 * 1.05;
        if (p < .27) return .9 - (p - .23) / .04 * 1.2;
        if (p < .3) return -.3 + (p - .27) / .03 * .3;
        if (p < .55 && p > .38) return Math.sin((p - .38) / .17 * Math.PI) * .22;
        return 0;
      };
      size();
      U.onResize(size);
      el._fxDraw = function (dt) {
        var col = getComputedStyle(el).color, sp = U.num(el, 'fxSpeed', 70);
        for (var i = 0; i < Math.max(1, sp * dt); i++) {
          phase = (phase + bpm / 60 / sp) % 1;
          var y = H / 2 - wave(phase) * H * .42;
          x.clearRect(px, 0, 14, H);
          if (last !== null) { x.strokeStyle = col; x.lineWidth = 2; x.beginPath(); x.moveTo(px - 1, last); x.lineTo(px, y); x.stroke(); }
          last = y;
          px++;
          if (px > W) { px = 0; last = null; }
        }
      };
      if (U.reduced) { for (var k = 0; k < 40; k++) el._fxDraw(1 / 6); }
    },
    tick: function (el, dt) { if (el._fxDraw && !U.reduced) el._fxDraw(dt); }
  });
})(window.FX);
