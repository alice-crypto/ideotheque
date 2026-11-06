/* Pack 24 — Assurance */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Des garanties à cocher, et la cotisation qui se recalcule
  FX.register('premium-builder', {
    setup: function (el) {
      var base = U.num(el, 'fxBase', 18), rows = (el.dataset.fxItems || 'Vol:6|Bris de glace:4|Assistance 0 km:5').split('|');
      el.textContent = '';
      var box = U.make('div', 'fx-pb-l', el), out = U.make('output', 'fx-pb-t', el);
      out.setAttribute('aria-live', 'polite');
      var calc = function () {
        var t = base;
        box.querySelectorAll('input').forEach(function (i) { if (i.checked) t += +i.value; });
        out.innerHTML = '<b>' + t + ' €</b> par mois';
        out.classList.remove('fx-go'); void out.offsetWidth; out.classList.add('fx-go');
      };
      rows.forEach(function (r) {
        var p = r.split(':'), l = U.make('label', '', box), i = U.make('input', '', l);
        i.type = 'checkbox'; i.value = p[1];
        l.appendChild(document.createTextNode(p[0]));
        U.make('em', '', l).textContent = '+' + p[1] + ' €';
        i.addEventListener('change', calc);
      });
      calc();
    }
  });

  // Une franchise à régler : ce qu'on paie en cas de sinistre contre chaque mois
  FX.register('deductible-slider', {
    setup: function (el) {
      var min = U.num(el, 'fxMin', 0), max = U.num(el, 'fxMax', 1000), top = U.num(el, 'fxTop', 48), low = U.num(el, 'fxLow', 26);
      el.innerHTML = '<label>Franchise <input type="range" min="' + min + '" max="' + max + '" step="50"></label><div class="fx-ds"><span><b class="a"></b>en cas de sinistre</span><span><b class="c"></b>par mois</span></div>';
      var r = el.querySelector('input'), a = el.querySelector('.a'), c = el.querySelector('.c');
      r.value = U.num(el, 'fxValue', 300);
      var go = function () {
        var q = (r.value - min) / (max - min);
        a.textContent = (+r.value).toLocaleString('fr-FR') + ' €';
        c.textContent = Math.round(top - (top - low) * Math.sqrt(q)) + ' €';
        el.style.setProperty('--fx-q', q);
        r.setAttribute('aria-valuetext', a.textContent + ' de franchise, ' + c.textContent + ' par mois');
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Un tableau de garanties dont on éclaire une formule
  FX.register('coverage-matrix', {
    setup: function (el) {
      var plans = (el.dataset.fxPlans || 'Tiers,Confort,Tous risques').split(','), rows = (el.dataset.fxItems || 'Tiers:1,1,1|Vol:0,1,1|Incendie:0,1,1|Bris:0,0,1').split('|');
      var h = '<table><thead><tr><th scope="col"><span class="fx-sr">Garantie</span></th>' + plans.map(function (p, i) { return '<th scope="col"><button type="button" data-i="' + i + '">' + p + '</button></th>'; }).join('') + '</tr></thead><tbody>';
      rows.forEach(function (r) {
        var p = r.split(':');
        h += '<tr><th scope="row">' + p[0] + '</th>' + p[1].split(',').map(function (v) { return '<td>' + (v === '1' ? '<i aria-label="inclus">✓</i>' : '<i class="fx-no" aria-label="non inclus">–</i>') + '</td>'; }).join('') + '</tr>';
      });
      el.innerHTML = h + '</tbody></table>';
      var pick = function (n) {
        el.querySelectorAll('tr').forEach(function (tr) { Array.prototype.forEach.call(tr.children, function (c, i) { c.classList.toggle('fx-on', i === n + 1); }); });
        el.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', +b.dataset.i === n); });
      };
      el.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) pick(+b.dataset.i); });
      pick(U.num(el, 'fxPick', 1));
    }
  });

  // Un bouclier dont chaque secteur est un risque couvert
  FX.register('peril-shield', {
    entrance: true,
    setup: function (el) {
      var items = (el.dataset.fxItems || 'Incendie,Vol,Dégât des eaux,Tempête,Bris de glace,Catastrophe').split(','), n = items.length, id = 'fxps' + Math.floor(U.rand(1e4, 1e5));
      var s = '<svg viewBox="0 0 100 116" aria-hidden="true"><defs><clipPath id="' + id + '"><path d="M50 2 94 16V56C94 84 74 104 50 114 26 104 6 84 6 56V16Z"/></clipPath></defs><g clip-path="url(#' + id + ')">';
      for (var i = 0; i < n; i++) {
        var a = (i / n) * 6.283 - 1.571, b = ((i + 1) / n) * 6.283 - 1.571;
        s += '<path d="M50 58L' + (50 + 110 * Math.cos(a)).toFixed(1) + ' ' + (58 + 110 * Math.sin(a)).toFixed(1) + 'L' + (50 + 110 * Math.cos(b)).toFixed(1) + ' ' + (58 + 110 * Math.sin(b)).toFixed(1) + 'Z" style="--fx-i:' + i + '"/>';
      }
      s += '</g><path class="fx-o" d="M50 2 94 16V56C94 84 74 104 50 114 26 104 6 84 6 56V16Z"/></svg><div class="fx-pl"></div><output aria-live="polite"></output>';
      el.innerHTML = s;
      var segs = el.querySelectorAll('svg g path'), list = el.querySelector('.fx-pl'), out = el.querySelector('output');
      items.forEach(function (t, i) {
        var l = U.make('label', '', list), c = U.make('input', '', l);
        c.type = 'checkbox'; c.checked = i < (U.num(el, 'fxOn', 4));
        l.appendChild(document.createTextNode(t));
        var up = function () { segs[i].classList.toggle('fx-on', c.checked); out.textContent = list.querySelectorAll(':checked').length + ' risques sur ' + n; };
        c.addEventListener('change', up);
        up();
      });
    }
  });

  // Le suivi d'un dossier : ce qui est fait, ce qui est en cours, ce qui reste
  FX.register('claim-tracker', {
    entrance: true,
    setup: function (el) {
      var rows = (el.dataset.fxItems || 'Déclaré:3 mars|Pièces reçues:5 mars|Expertise:en cours|Indemnisation:à venir').split('|'), cur = U.num(el, 'fxCurrent', 2);
      var ol = U.make('ol', '', el);
      el.dataset.fxRendered = '1';
      rows.forEach(function (r, i) {
        var p = r.split(':'), li = U.make('li', i < cur ? 'fx-done' : i === cur ? 'fx-now' : '', ol);
        li.style.setProperty('--fx-i', i);
        li.innerHTML = '<b>' + p[0] + '</b><span>' + p[1] + '</span>';
        if (i === cur) li.setAttribute('aria-current', 'step');
      });
    }
  });

  // Un schéma de voiture sur lequel on situe les chocs
  FX.register('damage-spots', {
    setup: function (el) {
      var zones = [['Avant', 14, 34, 22, 32], ['Capot', 36, 34, 18, 32], ['Toit', 54, 34, 20, 32], ['Coffre', 74, 34, 14, 32], ['Côté gauche', 14, 14, 74, 18], ['Côté droit', 14, 68, 74, 18]], picked = [];
      var box = U.make('div', 'fx-dsp', el), out = U.make('output', '', el);
      out.setAttribute('aria-live', 'polite');
      var say = function () { out.textContent = picked.length ? 'Touché : ' + picked.join(', ') : 'Touchez les zones abîmées'; };
      zones.forEach(function (z) {
        var b = U.make('button', '', box);
        b.type = 'button'; b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-label', z[0]); b.title = z[0];
        b.style.cssText = 'left:' + z[1] + '%;top:' + z[2] + '%;width:' + z[3] + '%;height:' + z[4] + '%';
        b.addEventListener('click', function () {
          var on = picked.indexOf(z[0]) < 0;
          if (on) picked.push(z[0]); else picked.splice(picked.indexOf(z[0]), 1);
          b.setAttribute('aria-pressed', on);
          say();
        });
      });
      say();
    }
  });
})(window.FX);
