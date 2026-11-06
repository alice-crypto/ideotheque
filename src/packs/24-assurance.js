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

  // Les pièces d'un dossier, avec ce qui manque encore
  FX.register('document-checklist', {
    setup: function (el) {
      var rows = (el.dataset.fxItems || 'Constat amiable|Photos des dégâts|Facture du garage|Pièce d\'identité').split('|');
      el.innerHTML = '<div class="fx-dc-b"><i></i></div><output aria-live="polite"></output>';
      var out = el.querySelector('output');
      var go = function () {
        var all = el.querySelectorAll('input'), n = el.querySelectorAll('input:checked').length, left = all.length - n;
        el.style.setProperty('--fx-q', n / all.length);
        el.classList.toggle('fx-full', !left);
        out.textContent = left ? 'Il manque ' + left + (left > 1 ? ' pièces' : ' pièce') : 'Dossier complet';
      };
      rows.forEach(function (r) {
        var l = U.make('label', '', el), c = U.make('input', '', l);
        c.type = 'checkbox';
        U.make('span', '', l).textContent = r;
        c.addEventListener('change', go);
      });
      go();
    }
  });

  // Une dépense partagée entre la base, la complémentaire et ce qu'il reste à payer
  FX.register('reimbursement-split', {
    entrance: true,
    setup: function (el) {
      var cost = U.num(el, 'fxCost', 60), a = Math.min(cost, U.num(el, 'fxBase', 21)), b = Math.min(cost - a, U.num(el, 'fxTop', 24)), c = cost - a - b;
      var parts = [['Base', a, 'a'], ['Complémentaire', b, 'b'], ['Reste à payer', c, 'c']];
      el.innerHTML = '<p>Dépense : <b>' + cost + ' €</b></p><div class="fx-rs">' + parts.map(function (p, i) { return '<i class="' + p[2] + '" style="--fx-q:' + p[1] / cost + ';--fx-i:' + i + '"></i>'; }).join('') + '</div><ul>' + parts.map(function (p) { return '<li class="' + p[2] + '"><span>' + p[0] + '</span><b>' + p[1] + ' €</b></li>'; }).join('') + '</ul>';
    }
  });

  // Composer le foyer et voir la cotisation : le troisième enfant est offert
  FX.register('family-builder', {
    setup: function (el) {
      var A = U.num(el, 'fxAdult', 42), C = U.num(el, 'fxChild', 18), n = { a: 1, c: 0 };
      el.innerHTML = '<div class="fx-fb" aria-hidden="true"></div>' +
        '<div class="fx-fb-r"><span>Adultes</span><button type="button" data-k="a" data-d="-1" aria-label="Retirer un adulte">−</button><b data-v="a"></b><button type="button" data-k="a" data-d="1" aria-label="Ajouter un adulte">+</button></div>' +
        '<div class="fx-fb-r"><span>Enfants</span><button type="button" data-k="c" data-d="-1" aria-label="Retirer un enfant">−</button><b data-v="c"></b><button type="button" data-k="c" data-d="1" aria-label="Ajouter un enfant">+</button></div><output aria-live="polite"></output>';
      var row = el.firstChild;
      var go = function () {
        el.querySelector('[data-v=a]').textContent = n.a;
        el.querySelector('[data-v=c]').textContent = n.c;
        el.querySelector('output').innerHTML = '<b>' + (n.a * A + Math.min(n.c, 2) * C) + ' €</b> par mois';
        while (row.children.length > n.a + n.c) row.lastChild.remove();
        for (var i = row.children.length; i < n.a + n.c; i++) U.make('i', '', row);
        Array.prototype.forEach.call(row.children, function (p, i) { p.className = i < n.a ? 'fx-big' : ''; });
      };
      el.addEventListener('click', function (e) {
        var b = e.target.closest('button');
        if (!b) return;
        var k = b.dataset.k, lo = k === 'a' ? 1 : 0, hi = k === 'a' ? 2 : 6;
        n[k] = U.clamp(n[k] + +b.dataset.d, lo, hi);
        go();
      });
      go();
    }
  });

  // Un bouton d'appel qui sait si l'on répond en ce moment
  FX.register('open-hours-call', {
    setup: function (el) {
      var tel = el.dataset.fxTel || '0100000000', from = U.num(el, 'fxFrom', 8), to = U.num(el, 'fxTo', 20), always = el.dataset.fxAlways === 'true';
      el.innerHTML = '<a href="tel:' + tel + '"><i aria-hidden="true"></i><span>' + (el.dataset.fxLabel || 'Appeler un conseiller') + '</span></a><small></small>';
      var note = el.querySelector('small');
      var go = function () {
        var d = new Date(), h = d.getHours() + d.getMinutes() / 60, open = always || (h >= from && h < to);
        el.classList.toggle('fx-open', open);
        note.textContent = always ? 'Ouvert jour et nuit' : open ? 'Ouvert jusqu\'à ' + to + ' h' : 'Fermé, ouvre à ' + from + ' h';
      };
      go();
      setInterval(go, 60000);
    }
  });

  // Une échelle qui montre le coefficient selon les années sans accident
  FX.register('bonus-ladder', {
    setup: function (el) {
      var max = U.num(el, 'fxYears', 13);
      el.innerHTML = '<label>Années sans accident <input type="range" min="0" max="' + max + '"></label><div class="fx-bl" aria-hidden="true"></div><output aria-live="polite"></output>';
      var r = el.querySelector('input'), box = el.querySelector('.fx-bl'), out = el.querySelector('output');
      for (var i = 0; i <= max; i++) U.make('i', '', box).style.height = (Math.max(.5, Math.pow(.95, i)) * 100) + '%';
      r.value = U.num(el, 'fxValue', 5);
      var go = function () {
        var n = +r.value, c = Math.max(.5, Math.pow(.95, n));
        Array.prototype.forEach.call(box.children, function (b, i) { b.classList.toggle('fx-on', i === n); b.classList.toggle('fx-past', i < n); });
        out.innerHTML = 'Coefficient <b>' + c.toFixed(2).replace('.', ',') + '</b>, soit −' + Math.round((1 - c) * 100) + ' %';
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Estimer la valeur de ses biens, pièce par pièce
  FX.register('room-inventory', {
    setup: function (el) {
      var rows = (el.dataset.fxItems || 'Salon:4000|Cuisine:3000|Chambres:5000').split('|'), cap = U.num(el, 'fxCap', 10000);
      rows.forEach(function (r) {
        var p = r.split(':'), l = U.make('label', '', el);
        U.make('span', '', l).textContent = p[0];
        var i = U.make('input', '', l);
        i.type = 'range'; i.min = 0; i.max = 12000; i.step = 500; i.value = p[1];
        U.make('b', '', l);
      });
      var bar = U.make('div', 'fx-ri', el), out = U.make('output', '', el);
      U.make('i', '', bar);
      U.make('em', '', bar).setAttribute('title', 'Capital assuré');
      out.setAttribute('aria-live', 'polite');
      var go = function () {
        var t = 0;
        el.querySelectorAll('label').forEach(function (l) { var v = +l.querySelector('input').value; t += v; l.querySelector('b').textContent = (v / 1000).toLocaleString('fr-FR') + ' k€'; });
        var top = Math.max(t, cap) * 1.1;
        bar.style.setProperty('--fx-a', t / top); bar.style.setProperty('--fx-b', cap / top);
        el.classList.toggle('fx-under', t > cap);
        out.textContent = t > cap ? 'Sous-assuré de ' + (t - cap).toLocaleString('fr-FR') + ' €' : 'Capital suffisant : ' + cap.toLocaleString('fr-FR') + ' €';
      };
      el.addEventListener('input', go);
      go();
    }
  });

  // Quelques questions, une formule conseillée
  FX.register('plan-quiz', {
    setup: function (el) {
      var Q = (el.dataset.fxQuestions || 'Votre voiture a :Moins de 3 ans=2,Entre 3 et 8 ans=1,Plus de 8 ans=0|Vous roulez :Tous les jours=2,Souvent=1,Rarement=0').split('|').map(function (s) { var c = s.split(':'); return { t: c[0], a: c[1].split(',').map(function (x) { return x.split('='); }) }; });
      var plans = (el.dataset.fxPlans || 'Tiers,Confort,Tous risques').split(','), i = 0, s = 0, box = U.make('div', 'fx-pq', el), live = U.make('div', 'fx-pq-p', el);
      live.setAttribute('aria-hidden', 'true');
      var show = function () {
        el.style.setProperty('--fx-q', i / Q.length);
        box.innerHTML = '';
        if (i === Q.length) {
          var plan = plans[Math.round(s / (Q.length * 2) * (plans.length - 1))];
          box.innerHTML = '<p role="status">Pour vous : <b>' + plan + '</b></p><button type="button" class="fx-pq-a">Recommencer</button>';
          box.firstChild.nextSibling.addEventListener('click', function () { i = 0; s = 0; show(); });
          return;
        }
        U.make('p', '', box).textContent = Q[i].t;
        Q[i].a.forEach(function (o) {
          var b = U.make('button', '', box);
          b.type = 'button'; b.textContent = o[0];
          b.addEventListener('click', function () { s += +o[1]; i++; show(); });
        });
      };
      show();
    }
  });
})(window.FX);
