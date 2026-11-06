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

  // Une zone de signature : la validation s'ouvre quand le tracé est assez long
  FX.register('signature-pad', {
    setup: function (el) {
      var c = U.make('canvas', '', el), row = U.make('div', 'fx-sg-r', el), clr = U.make('button', '', row), ok = U.make('button', 'fx-sg-ok', row), len = 0, last = null, x;
      c.setAttribute('aria-label', 'Zone de signature, dessinez avec le pointeur');
      clr.type = ok.type = 'button'; clr.textContent = 'Effacer'; ok.textContent = el.dataset.fxLabel || 'Signer'; ok.disabled = true;
      var size = function () {
        var r = c.getBoundingClientRect(), d = window.devicePixelRatio || 1;
        c.width = r.width * d; c.height = r.height * d;
        x = c.getContext('2d'); x.scale(d, d); x.lineWidth = 2; x.lineCap = 'round'; x.strokeStyle = getComputedStyle(el).color;
        len = 0; ok.disabled = true;
      };
      var at = function (e) { var r = c.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
      c.addEventListener('pointerdown', function (e) { if (!x) size(); c.setPointerCapture && e.isTrusted && c.setPointerCapture(e.pointerId); last = at(e); });
      c.addEventListener('pointermove', function (e) {
        if (!last) return;
        var p = at(e);
        x.beginPath(); x.moveTo(last[0], last[1]); x.lineTo(p[0], p[1]); x.stroke();
        len += Math.hypot(p[0] - last[0], p[1] - last[1]);
        last = p;
        ok.disabled = len < U.num(el, 'fxMin', 40);
      });
      ['pointerup', 'pointercancel'].forEach(function (t) { c.addEventListener(t, function () { last = null; }); });
      clr.addEventListener('click', size);
      ok.addEventListener('click', function () {
        el.classList.add('fx-signed');
        el.dispatchEvent(new CustomEvent('fx:signed', { bubbles: true, detail: { image: c.toDataURL() } }));
      });
      U.onResize(function () { if (!len) size(); });
      size();
    }
  });

  // Choisir l'heure à laquelle on veut être rappelé
  FX.register('callback-slots', {
    setup: function (el) {
      var from = U.num(el, 'fxFrom', 9), to = U.num(el, 'fxTo', 19), step = U.num(el, 'fxStep', 2), box = U.make('div', 'fx-cb', el), out = U.make('output', '', el), now = new Date().getHours();
      out.setAttribute('aria-live', 'polite');
      out.textContent = 'Quand vous rappeler ?';
      var today = [];
      for (var h = from; h < to; h += step) today.push([h, h > now]);
      var slots = today.filter(function (s) { return s[1]; }).map(function (s) { return ['Aujourd\'hui', s[0]]; });
      for (h = from; slots.length < U.num(el, 'fxCount', 4) && h < to; h += step) slots.push(['Demain', h]);
      slots.slice(0, U.num(el, 'fxCount', 4)).forEach(function (s) {
        var b = U.make('button', '', box);
        b.type = 'button'; b.setAttribute('aria-pressed', 'false');
        b.innerHTML = '<small>' + s[0] + '</small>' + s[1] + ' h – ' + (s[1] + step) + ' h';
        b.addEventListener('click', function () {
          box.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
          out.textContent = 'Rappel prévu : ' + s[0].toLowerCase() + ', vers ' + s[1] + ' h';
          el.dispatchEvent(new CustomEvent('fx:slot', { bubbles: true, detail: { day: s[0], hour: s[1] } }));
        });
      });
    }
  });

  // Ce qui est couvert et ce qui ne l'est pas, sur le même plan
  FX.register('covered-list', {
    entrance: true,
    setup: function (el) {
      var yes = (el.dataset.fxYes || 'Incendie|Dégât des eaux|Vol').split('|'), no = (el.dataset.fxNo || 'Usure|Défaut d\'entretien').split('|'), n = 0;
      var ul = function (title, a, c, word) {
        var d = U.make('div', c, el);
        U.make('b', '', d).textContent = title;
        var u = U.make('ul', '', d);
        a.forEach(function (t) {
          var li = U.make('li', '', u);
          li.style.setProperty('--fx-i', n++);
          li.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true"><path pathLength="1" d="' + (c === 'fx-y' ? 'M3 8.5 7 12 13 4' : 'M4 4 12 12M12 4 4 12') + '"/></svg><span><span class="fx-sr">' + word + ' : </span>' + t + '</span>';
        });
      };
      ul('Couvert', yes, 'fx-y', 'Couvert');
      ul('Non couvert', no, 'fx-n', 'Non couvert');
    }
  });

  // Payer au mois ou à l'année : ce que ça change vraiment sur l'année
  FX.register('payment-frequency', {
    setup: function (el) {
      var y = U.num(el, 'fxYear', 480), modes = [['Annuel', 1, 0], ['Semestriel', 2, .02], ['Mensuel', 12, .05]];
      var f = U.make('div', 'fx-pf', el), out = U.make('output', '', el);
      f.setAttribute('role', 'radiogroup'); f.setAttribute('aria-label', 'Fréquence de paiement');
      out.setAttribute('aria-live', 'polite');
      var worst = y * (1 + modes[2][2]);
      var pick = function (m, b) {
        f.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-checked', x === b); });
        var tot = y * (1 + m[2]), one = tot / m[1], save = worst - tot;
        el.style.setProperty('--fx-q', tot / worst);
        out.innerHTML = '<b>' + (Math.round(one * 100) / 100).toLocaleString('fr-FR') + ' €</b> × ' + m[1] + '<br>Total ' + Math.round(tot) + ' €' + (save > 0 ? ', soit ' + Math.round(save) + ' € d\'économie' : '');
      };
      modes.forEach(function (m, i) {
        var b = U.make('button', '', f);
        b.type = 'button'; b.setAttribute('role', 'radio'); b.textContent = m[0];
        b.addEventListener('click', function () { pick(m, b); });
        if (i === 2) pick(m, b);
      });
      U.make('div', 'fx-pf-b', el);
    }
  });

  // L'année du contrat, avec la fenêtre pendant laquelle on peut résilier
  FX.register('renewal-window', {
    entrance: true,
    setup: function (el) {
      var end = new Date(el.dataset.fxEnd || Date.now() + 86400000 * 45), now = new Date(), days = Math.ceil((end - now) / 86400000), notice = U.num(el, 'fxNotice', 60), year = 365;
      var q = U.clamp(1 - days / year, 0, 1), w = notice / year, open = days >= 0 && days <= notice;
      el.style.setProperty('--fx-q', q); el.style.setProperty('--fx-w', w);
      el.innerHTML = '<div class="fx-rw" aria-hidden="true"><em></em><i></i></div><p></p>';
      el.classList.toggle('fx-open', open);
      el.querySelector('p').textContent = days < 0 ? 'Contrat renouvelé il y a ' + -days + ' jours' : open ? 'Vous pouvez résilier encore ' + days + ' jours' : 'Résiliation possible dans ' + (days - notice) + ' jours';
    }
  });

  // Une attestation sur écran : valide ou expirée selon la vraie date
  FX.register('attestation-card', {
    entrance: true,
    setup: function (el) {
      var no = el.dataset.fxNumber || 'FICTIF-2027-0042', until = new Date(el.dataset.fxUntil || Date.now() + 86400000 * 120), ok = until >= new Date(), h = 7, cells = '';
      for (var i = 0; i < no.length; i++) h = (h * 31 + no.charCodeAt(i)) >>> 0;
      for (i = 0; i < 49; i++) { h = (h * 1664525 + 1013904223) >>> 0; cells += '<i class="' + (h >> 16 & 1 ? 'fx-k' : '') + '"></i>'; }
      el.innerHTML = '<div class="fx-ac-g" aria-hidden="true">' + cells + '</div><div><strong>' + (el.dataset.fxTitle || 'Attestation') + '</strong><span>' + no + '</span><b>' + (ok ? 'Valide' : 'Expirée') + ' jusqu\'au ' + until.toLocaleDateString('fr-FR') + '</b></div>';
      el.classList.toggle('fx-exp', !ok);
      el.style.setProperty('--fx-rot', U.rand(-1, 1) + 'deg');
    }
  });

  // Un mot technique souligné qui donne sa définition au clic
  FX.register('glossary-tip', {
    setup: function (el) {
      var open = null, close = function () { if (open) { open.setAttribute('aria-expanded', 'false'); open = null; } };
      el.querySelectorAll('[data-def]').forEach(function (w) {
        var b = document.createElement('button');
        b.type = 'button'; b.textContent = w.textContent; b.setAttribute('aria-expanded', 'false');
        var d = document.createElement('span');
        d.className = 'fx-gt'; d.setAttribute('role', 'note'); d.textContent = w.dataset.def;
        w.textContent = ''; w.appendChild(b); w.appendChild(d);
        b.addEventListener('click', function (e) {
          e.stopPropagation();
          var was = open === b;
          close();
          if (!was) { b.setAttribute('aria-expanded', 'true'); open = b; }
        });
      });
      document.addEventListener('click', close);
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    }
  });

  // Un parapluie s'ouvre et écarte la pluie
  FX.register('umbrella-open', {
    entrance: true,
    setup: function (el) {
      var s = '<svg viewBox="0 0 120 120" aria-hidden="true"><g class="fx-u-c">';
      var n = 5, w = 100 / n;
      s += '<path d="M10 60A50 50 0 0 1 110 60';
      for (var i = n - 1; i >= 0; i--) s += 'A' + w / 2 + ' ' + w / 3 + ' 0 0 0 ' + (10 + i * w) + ' 60';
      s += 'Z"/></g><path class="fx-u-h" d="M60 60V102A7 7 0 0 1 46 102"/></svg>';
      el.innerHTML = s;
      for (i = 0; i < 16; i++) {
        var d = U.make('i', '', el), x = U.rand(2, 98);
        d.style.setProperty('--fx-x', x + '%');
        d.style.setProperty('--fx-out', (x < 50 ? -1 : 1) * (Math.max(0, 48 - Math.abs(x - 50)) * .9) + 'px');
        d.style.setProperty('--fx-d', U.rand(0, 1.2).toFixed(2) + 's');
        d.setAttribute('aria-hidden', 'true');
      }
      if (el.dataset.fxLabel) { el.setAttribute('role', 'img'); el.setAttribute('aria-label', el.dataset.fxLabel); }
    }
  });

  // Faire glisser l'âge pour voir quel besoin arrive à ce moment de la vie
  FX.register('life-events-rail', {
    setup: function (el) {
      var ev = (el.dataset.fxItems || '20:Premier logement:Assurance habitation|30:Premier enfant:Garantie famille|45:Achat immobilier:Assurance de prêt|65:Retraite:Complément santé').split('|').map(function (r) { var p = r.split(':'); return { a: +p[0], t: p[1], b: p[2] }; });
      var min = U.num(el, 'fxMin', 18), max = U.num(el, 'fxMax', 75);
      el.innerHTML = '<div class="fx-le" aria-hidden="true"></div><input type="range" min="' + min + '" max="' + max + '" aria-label="Âge"><p aria-live="polite"></p>';
      var rail = el.firstChild, r = el.querySelector('input'), p = el.querySelector('p');
      ev.forEach(function (e) { var i = U.make('i', '', rail); i.style.left = (e.a - min) / (max - min) * 100 + '%'; });
      r.value = U.num(el, 'fxValue', 30);
      var go = function () {
        var a = +r.value, cur = ev[0];
        ev.forEach(function (e) { if (a >= e.a) cur = e; });
        Array.prototype.forEach.call(rail.children, function (d, i) { d.classList.toggle('fx-on', ev[i] === cur); d.classList.toggle('fx-past', ev[i].a <= a); });
        p.innerHTML = '<b>' + a + ' ans</b> · ' + cur.t + '<br><em>' + cur.b + '</em>';
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Un devis qui se reprend là où on l'avait laissé, sur le même appareil
  FX.register('quote-resume', {
    setup: function (el) {
      var key = el.dataset.fxKey || 'fx-quote', bar = document.createElement('div'), saved = null;
      bar.className = 'fx-qr'; bar.setAttribute('role', 'status');
      el.insertBefore(bar, el.firstChild);
      var fields = el.querySelectorAll('input,select,textarea');
      var read = function () { var o = {}; fields.forEach(function (f) { if (f.name) o[f.name] = f.type === 'checkbox' ? f.checked : f.value; }); return o; };
      var write = function (o) { fields.forEach(function (f) { if (f.name in o) { if (f.type === 'checkbox') f.checked = o[f.name]; else f.value = o[f.name]; } }); };
      try { saved = JSON.parse(localStorage.getItem(key)); } catch (err) {}
      var tell = function (t) { bar.textContent = t; bar.classList.remove('fx-go'); void bar.offsetWidth; bar.classList.add('fx-go'); };
      if (saved && saved.d) {
        write(saved.d);
        tell('Devis repris. ');
        var b = U.make('button', '', bar);
        b.type = 'button'; b.textContent = 'Repartir de zéro';
        b.addEventListener('click', function () { fields.forEach(function (f) { if (f.type === 'checkbox') f.checked = false; else f.value = ''; }); try { localStorage.removeItem(key); } catch (err) {} tell('Formulaire vidé.'); });
      }
      el.addEventListener('input', function () {
        try { localStorage.setItem(key, JSON.stringify({ d: read() })); tell('Enregistré sur cet appareil'); } catch (err) {}
      });
    }
  });

  // Ce dont le foyer aurait besoin face à ce qu'il a : l'écart se voit
  FX.register('gap-coverage', {
    entrance: true,
    setup: function (el) {
      var need = U.num(el, 'fxNeed', 2400), rows = (el.dataset.fxItems || 'Pension:900|Épargne:400').split('|').map(function (r) { return r.split(':'); });
      var got = rows.reduce(function (t, r) { return t + +r[1]; }, 0), gap = Math.max(0, need - got), top = Math.max(need, got);
      var col = function (t, a) { return '<div><b>' + t + '</b><span>' + a + '</span></div>'; };
      var h = '<div class="fx-gc" aria-hidden="true"><div class="fx-gc-n" style="--fx-q:' + need / top + '"></div><div class="fx-gc-h">';
      rows.forEach(function (r, i) { h += '<i style="--fx-q:' + r[1] / top + ';--fx-i:' + i + '"></i>'; });
      if (gap) h += '<i class="fx-g" style="--fx-q:' + gap / top + ';--fx-i:' + rows.length + '"></i>';
      h += '</div></div>' + col('Besoin', need.toLocaleString('fr-FR') + ' € / mois') + rows.map(function (r) { return col(r[0], (+r[1]).toLocaleString('fr-FR') + ' €'); }).join('') + col('À couvrir', gap.toLocaleString('fr-FR') + ' €');
      el.innerHTML = h;
    }
  });

  // Après un sinistre, le temps qu'il reste pour déclarer
  FX.register('incident-timer', {
    setup: function (el) {
      var days = U.num(el, 'fxDays', 5), start = el.dataset.fxStart ? new Date(el.dataset.fxStart) : new Date(Date.now() - 86400000 * U.num(el, 'fxAgo', 2));
      var end = +start + days * 86400000;
      el.innerHTML = '<div class="fx-it" role="timer"><b></b><span></span></div><div class="fx-it-b" aria-hidden="true"><i></i></div><small>Délai de déclaration : ' + days + ' jours (à vérifier au contrat)</small>';
      var b = el.querySelector('b'), s = el.querySelector('span'), bar = el.querySelector('i');
      var go = function () {
        var left = end - Date.now(), q = U.clamp(left / (days * 86400000), 0, 1), h = Math.max(0, Math.floor(left / 3600000));
        b.textContent = left <= 0 ? 'Délai dépassé' : Math.floor(h / 24) + ' j ' + h % 24 + ' h';
        s.textContent = left <= 0 ? '' : 'pour déclarer';
        bar.style.width = q * 100 + '%';
        el.classList.toggle('fx-urgent', q < .25);
      };
      go();
      setInterval(go, 60000);
    }
  });
})(window.FX);
