/* Pack 26 — Pharmacie */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Une grille des prises par jour et par moment
  FX.register('dose-grid', {
    setup: function (el) {
      var M = (el.dataset.fxMoments || 'Matin,Midi,Soir').split(','), D = (el.dataset.fxDays || 'Lun,Mar,Mer,Jeu').split(','), g = U.make('div', 'fx-dg', el), out = U.make('output', '', el);
      g.style.setProperty('--fx-c', D.length);
      out.setAttribute('aria-live', 'polite');
      U.make('span', '', g);
      D.forEach(function (d) { U.make('b', '', g).textContent = d; });
      M.forEach(function (m) {
        U.make('b', '', g).textContent = m;
        D.forEach(function (d) {
          var c = U.make('input', '', g);
          c.type = 'checkbox'; c.setAttribute('aria-label', m + ', ' + d);
        });
      });
      var go = function () { out.textContent = g.querySelectorAll(':checked').length + ' prises sur ' + D.length * M.length; };
      g.addEventListener('change', go);
      go();
    }
  });

  // Un pilulier de la semaine dont on ouvre les couvercles
  FX.register('pill-organizer', {
    setup: function (el) {
      var L = ['L', 'M', 'M', 'J', 'V', 'S', 'D'], N = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'], today = (new Date().getDay() + 6) % 7, row = U.make('div', 'fx-po', el), out = U.make('output', '', el);
      out.setAttribute('aria-live', 'polite');
      var go = function () { out.textContent = row.querySelectorAll('[aria-pressed=true]').length + ' jours pris cette semaine'; };
      L.forEach(function (d, i) {
        var b = U.make('button', i === today ? 'fx-now' : '', row);
        b.type = 'button'; b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-label', N[i] + (i === today ? ", aujourd'hui" : ''));
        b.innerHTML = '<u aria-hidden="true"></u><i aria-hidden="true"></i><span>' + d + '</span>';
        b.addEventListener('click', function () { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true'); go(); });
      });
      go();
    }
  });

  // Depuis la dernière prise, le temps qu'il reste avant la prochaine
  FX.register('next-dose', {
    setup: function (el) {
      var H = U.num(el, 'fxHours', 6), last = null;
      el.innerHTML = '<svg viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="35"/><circle class="fx-nd" cx="40" cy="40" r="35" pathLength="1"/></svg><div><b>–</b><span>Pas encore de prise</span></div><button type="button">J\'ai pris ma dose</button>';
      var b = el.querySelector('b'), s = el.querySelector('span');
      var go = function () {
        if (!last) return;
        var left = last + H * 3600000 - Date.now(), q = U.clamp(left / (H * 3600000), 0, 1);
        el.style.setProperty('--fx-q', q);
        if (left <= 0) { b.textContent = 'Maintenant'; s.textContent = 'Dose possible'; return; }
        b.textContent = Math.floor(left / 3600000) + ' h ' + String(Math.floor(left / 60000) % 60).padStart(2, '0');
        s.textContent = 'avant la prochaine';
      };
      el.querySelector('button').addEventListener('click', function () { last = Date.now(); go(); });
      setInterval(go, 30000);
      go();
    }
  });

  // Combien de jours tient la boîte, et quand la renouveler
  FX.register('refill-date', {
    entrance: true,
    setup: function (el) {
      var left = U.num(el, 'fxLeft', 18), per = U.num(el, 'fxPerDay', 2), box = U.num(el, 'fxBox', 60), days = Math.floor(left / per), end = new Date(Date.now() + days * 86400000);
      el.style.setProperty('--fx-q', Math.min(1, left / box));
      el.classList.toggle('fx-low', days <= U.num(el, 'fxWarn', 10));
      el.innerHTML = '<div class="fx-rd" aria-hidden="true"><i></i></div><strong>' + days + ' jours</strong><span>' + left + ' comprimés, ' + per + ' par jour</span><span>Boîte vide le ' + end.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) + '</span>';
    }
  });

  // Une fréquence d'effet indésirable montrée en personnes sur cent
  FX.register('side-effect-scale', {
    setup: function (el) {
      var rows = (el.dataset.fxItems || 'Maux de tête:10|Nausées:5|Vertiges:1').split('|').map(function (r) { return r.split(':'); }), sel = U.make('div', 'fx-se-b', el), dots = U.make('div', 'fx-se', el), out = U.make('output', '', el);
      dots.setAttribute('aria-hidden', 'true');
      out.setAttribute('aria-live', 'polite');
      for (var i = 0; i < 100; i++) U.make('i', '', dots).style.setProperty('--fx-i', i);
      var pick = function (r, b) {
        sel.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
        Array.prototype.forEach.call(dots.children, function (d, i) { d.classList.toggle('fx-on', i < +r[1]); });
        out.textContent = r[0] + ' : environ ' + r[1] + ' personne' + (+r[1] > 1 ? 's' : '') + ' sur 100';
      };
      rows.forEach(function (r, i) {
        var b = U.make('button', '', sel);
        b.type = 'button'; b.textContent = r[0];
        b.addEventListener('click', function () { pick(r, b); });
        if (!i) pick(r, b);
      });
      U.make('small', '', el).textContent = 'Valeurs fictives';
    }
  });
})(window.FX);
