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

  // Deux éléments à choisir, et ce que dit la table à leur sujet
  FX.register('interaction-check', {
    setup: function (el) {
      var names = (el.dataset.fxNames || 'Produit A,Produit B,Produit C').split(','), tab = JSON.parse(el.dataset.fxTable || '{"Produit A+Produit B":"caution","Produit B+Produit C":"avoid"}');
      var opt = names.map(function (n) { return '<option>' + n + '</option>'; }).join('');
      el.innerHTML = '<label>Premier<select>' + opt + '</select></label><label>Second<select>' + opt + '</select></label><output role="status"></output>';
      var s = el.querySelectorAll('select'), o = el.querySelector('output');
      s[1].selectedIndex = 1;
      var T = { ok: 'Rien de signalé dans cette table', caution: 'Précaution : demandez conseil', avoid: 'À éviter : demandez conseil' };
      var go = function () {
        var a = s[0].value, b = s[1].value, r = a === b ? 'same' : tab[a + '+' + b] || tab[b + '+' + a] || 'ok';
        el.dataset.fxLevel = r;
        o.textContent = r === 'same' ? 'Choisissez deux éléments différents' : T[r];
      };
      el.addEventListener('change', go);
      go();
    }
  });

  // Le même principe actif, deux prix, et l'écart sur l'année
  FX.register('generic-compare', {
    entrance: true,
    setup: function (el) {
      var a = U.num(el, 'fxBrand', 12.4), b = U.num(el, 'fxGeneric', 7.9), n = U.num(el, 'fxPerYear', 12), f = function (v) { return v.toFixed(2).replace('.', ',') + ' €'; };
      el.innerHTML = '<div><span>' + (el.dataset.fxNameA || 'Marque') + '</span><i style="--fx-q:1"></i><b>' + f(a) + '</b></div><div class="fx-g"><span>' + (el.dataset.fxNameB || 'Générique') + '</span><i style="--fx-q:' + b / a + '"></i><b>' + f(b) + '</b></div><p>Soit <strong>' + f((a - b) * n) + '</strong> d\'écart pour ' + n + ' boîtes par an</p>';
    }
  });

  // Qui est ouvert maintenant, en tête de liste
  FX.register('on-duty-list', {
    setup: function (el) {
      var rows = (el.dataset.fxItems || 'Pharmacie du Port:8:20|Pharmacie de la Gare:0:24|Pharmacie des Tilleuls:9:19|Garde de nuit:20:8').split('|').map(function (r) { var p = r.split(':'); return { n: p[0], a: +p[1], b: +p[2] }; });
      var ul = U.make('ul', '', el), note = U.make('small', '', el);
      var h = new Date().getHours() + new Date().getMinutes() / 60;
      rows.forEach(function (r) { r.open = r.a < r.b ? h >= r.a && h < r.b : h >= r.a || h < r.b; });
      rows.sort(function (x, y) { return y.open - x.open; }).forEach(function (r, i) {
        var li = U.make('li', r.open ? 'fx-open' : '', ul);
        li.style.setProperty('--fx-i', i);
        li.innerHTML = '<i aria-hidden="true"></i><b>' + r.n + '</b><span>' + (r.open ? 'Ouvert' : 'Fermé') + ' · ' + r.a + ' h–' + r.b + ' h</span>';
      });
      note.textContent = 'Exemple fictif';
    }
  });

  // Une ordonnance envoyée, préparée, puis prête à retirer
  FX.register('rx-ready', {
    setup: function (el) {
      var S = (el.dataset.fxItems || 'Reçue|En préparation|Prête à retirer').split('|'), ol = U.make('ol', '', el), live = U.make('output', '', el);
      live.setAttribute('aria-live', 'polite');
      S.forEach(function (t) { U.make('li', '', ol).textContent = t; });
      el._fxSet = function (n) {
        n = U.clamp(n, 0, S.length - 1);
        el.style.setProperty('--fx-q', n / (S.length - 1));
        Array.prototype.forEach.call(ol.children, function (li, i) { li.classList.toggle('fx-done', i <= n); });
        el.classList.toggle('fx-ready', n === S.length - 1);
        live.textContent = S[n];
      };
      el._fxN = U.num(el, 'fxStep', 0);
      el._fxSet(el._fxN);
      new MutationObserver(function () { el._fxN = U.num(el, 'fxStep', 0); el._fxSet(el._fxN); }).observe(el, { attributes: true, attributeFilter: ['data-fx-step'] });
    },
    trigger: function (el) { el._fxN = (el._fxN + 1) % 3; el._fxSet(el._fxN); }
  });

  // Une croix de pharmacie en points lumineux, avec ses animations d'enseigne
  FX.register('led-cross', {
    setup: function (el) {
      var N = 15, a = 5, b = 10, cells = [], box = U.make('div', 'fx-lc', el);
      el.setAttribute('role', 'img');
      el.setAttribute('aria-label', el.dataset.fxLabel || 'Croix lumineuse');
      for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) {
        var i = U.make('i', '', box), on = (x >= a && x < b) || (y >= a && y < b);
        if (on) cells.push({ el: i, d: Math.hypot(x - 7, y - 7), a: Math.atan2(y - 7, x - 7) }); else i.style.visibility = 'hidden';
      }
      el._fxCells = cells;
      if (U.reduced) cells.forEach(function (c) { c.el.style.opacity = 1; });
    },
    tick: function (el, dt, t) {
      if (U.reduced) return;
      var mode = Math.floor(t / 4) % 3;
      el._fxCells.forEach(function (c) {
        var v = mode === 0 ? .5 + .5 * Math.sin(c.d * .9 - t * 4) : mode === 1 ? .5 + .5 * Math.sin(c.a * 2 + t * 3) : (Math.sin(t * 5) > 0 ? 1 : .15);
        c.el.style.opacity = (.15 + v * .85).toFixed(2);
      });
    }
  });

  // Un interrupteur en forme de gélule bicolore
  FX.register('capsule-switch', {
    setup: function (el) {
      var i = el.querySelector('input');
      if (!i) { i = document.createElement('input'); i.type = 'checkbox'; el.insertBefore(i, el.firstChild); }
      i.setAttribute('role', 'switch');
      var c = document.createElement('span');
      c.className = 'fx-cp'; c.setAttribute('aria-hidden', 'true');
      c.innerHTML = '<i></i>';
      i.parentNode.insertBefore(c, i.nextSibling);
      i.addEventListener('change', function () { c.classList.remove('fx-go'); void c.offsetWidth; c.classList.add('fx-go'); });
    }
  });

  // Une gélule qui se remplit de granules au fil du chargement
  FX.register('capsule-progress', {
    entrance: true,
    setup: function (el) {
      var v = U.num(el, 'fxValue', 68), N = 120, box = U.make('div', 'fx-cg', el);
      el.setAttribute('role', 'progressbar');
      el.setAttribute('aria-valuemin', 0); el.setAttribute('aria-valuemax', 100); el.setAttribute('aria-valuenow', v);
      el.setAttribute('aria-label', el.dataset.fxLabel || 'Progression');
      for (var i = 0; i < N; i++) {
        var g = U.make('i', '', box), q = i / N;
        g.style.left = q * 92 + 1 + '%';
        g.style.top = U.rand(14, 76) + '%';
        g.style.setProperty('--fx-s', U.rand(5, 9) + 'px');
        g.style.setProperty('--fx-i', i);
        if (q * 100 > v) g.classList.add('fx-off');
      }
      U.make('b', '', el).textContent = v + ' %';
    }
  });

  // Trois gélules qui roulent en attendant
  FX.register('pill-tumble', {
    setup: function (el) {
      el.setAttribute('role', 'status');
      el.setAttribute('aria-label', el.dataset.fxLabel || 'Chargement');
      for (var i = 0; i < 3; i++) U.make('i', '', el).style.setProperty('--fx-i', i);
    }
  });

  // Une plaquette dont on fait sortir les comprimés un par un
  FX.register('blister-pop', {
    setup: function (el) {
      var n = U.num(el, 'fxCount', 10), box = U.make('div', 'fx-bp', el), out = U.make('output', '', el), left = n;
      out.setAttribute('aria-live', 'polite');
      var say = function () { out.textContent = left + ' restant' + (left > 1 ? 's' : '') + ' sur ' + n; };
      for (var i = 0; i < n; i++) (function (i) {
        var b = U.make('button', '', box);
        b.type = 'button'; b.setAttribute('aria-label', 'Comprimé ' + (i + 1));
        U.make('i', '', b);
        b.addEventListener('click', function () {
          b.disabled = true; b.classList.add('fx-pop');
          left--; say();
        });
      })(i);
      say();
    }
  });

  // Un compte-gouttes : chaque geste fait tomber une goutte
  FX.register('dropper-count', {
    setup: function (el) {
      var max = U.num(el, 'fxMax', 12), n = 0;
      el.innerHTML = '<div class="fx-dr" aria-hidden="true"><u></u><div><i></i></div></div><button type="button">Une goutte</button><output aria-live="polite">0 goutte</output>';
      var b = el.querySelector('button'), o = el.querySelector('output'), drop = el.querySelector('u');
      b.addEventListener('click', function () {
        n++;
        drop.classList.remove('fx-go'); void drop.offsetWidth; drop.classList.add('fx-go');
        el.style.setProperty('--fx-q', n / max);
        o.textContent = n + (n > 1 ? ' gouttes' : ' goutte');
        if (n >= max) { b.disabled = true; o.textContent = n + ' gouttes : maximum de la démonstration'; }
      });
    }
  });

  // Un gobelet gradué dont on règle le niveau
  FX.register('measure-cup', {
    setup: function (el) {
      var max = U.num(el, 'fxMax', 30), step = U.num(el, 'fxStep', 5), t = '';
      for (var v = step; v <= max; v += step) t += '<span style="bottom:' + v / max * 92 + '%">' + v + '</span>';
      el.innerHTML = '<div class="fx-mc" aria-hidden="true"><i></i>' + t + '</div><div><label>Volume en ml<input type="range" min="0" max="' + max + '" step="' + step + '"></label><output aria-live="polite"></output></div>';
      var r = el.querySelector('input'), o = el.querySelector('output');
      r.value = U.num(el, 'fxValue', 15);
      var go = function () {
        el.style.setProperty('--fx-q', r.value / max);
        o.innerHTML = '<b>' + r.value + ' ml</b> soit ' + String(Math.round(r.value / 5 * 10) / 10).replace('.', ',') + ' c. à café';
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // L'indice UV du moment, avec le conseil qui va avec
  FX.register('uv-index', {
    setup: function (el) {
      var T = [[3, 'Faible', 'Pas de protection particulière.'], [6, 'Modéré', 'Crème et lunettes.'], [8, 'Élevé', 'Crème, chapeau, ombre à midi.'], [11, 'Très élevé', 'Évitez le soleil de 11 h à 15 h.'], [99, 'Extrême', 'Restez à l\'ombre.']];
      el.innerHTML = '<div class="fx-uv" aria-hidden="true"><i></i></div><label>Indice <input type="range" min="0" max="12"></label><output aria-live="polite"></output>';
      var r = el.querySelector('input'), o = el.querySelector('output');
      r.value = U.num(el, 'fxValue', 7);
      var go = function () {
        var v = +r.value, t = T.filter(function (x) { return v < x[0]; })[0] || T[4];
        el.style.setProperty('--fx-q', v / 12);
        o.innerHTML = '<b>' + v + ' · ' + t[1] + '</b><br>' + t[2];
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Un calendrier des pollens, avec le mois en cours en évidence
  FX.register('pollen-months', {
    entrance: true,
    setup: function (el) {
      var rows = (el.dataset.fxItems || 'Bouleau:0,1,3,3,1,0,0,0,0,0,0,0|Graminées:0,0,0,1,3,3,2,1,0,0,0,0|Ambroisie:0,0,0,0,0,0,1,3,3,1,0,0').split('|').map(function (r) { var p = r.split(':'); return [p[0], p[1].split(',').map(Number)]; }), now = new Date().getMonth(), L = 'JFMAMJJASOND', h = '<span></span>';
      L.split('').forEach(function (m, i) { h += '<b class="' + (i === now ? 'fx-now' : '') + '">' + m + '</b>'; });
      rows.forEach(function (r, y) {
        h += '<span>' + r[0] + '</span>';
        r[1].forEach(function (v, i) { h += '<i class="l' + v + (i === now ? ' fx-now' : '') + '" style="--fx-i:' + (i + y * 2) + '"></i>'; });
      });
      el.innerHTML = '<div class="fx-pm" aria-hidden="true">' + h + '</div>';
      var cur = rows.filter(function (r) { return r[1][now] >= 2; }).map(function (r) { return r[0]; });
      U.make('p', '', el).textContent = cur.length ? 'Ce mois-ci, surtout : ' + cur.join(', ') : 'Ce mois-ci : peu de pollens dans cet exemple';
    }
  });

  // Cocher ses allergies : les produits concernés sortent de la liste
  FX.register('allergen-filter', {
    setup: function (el) {
      var A = (el.dataset.fxAllergens || 'Parfum,Lanoline,Noix').split(','), P = (el.dataset.fxItems || 'Crème douce:Parfum|Baume intense:Lanoline,Noix|Lait neutre:|Huile légère:Noix').split('|').map(function (r) { var p = r.split(':'); return { n: p[0], a: p[1] ? p[1].split(',') : [] }; });
      var f = U.make('div', 'fx-af', el), ul = U.make('ul', '', el), out = U.make('output', '', el);
      out.setAttribute('aria-live', 'polite');
      P.forEach(function (p) { p.li = U.make('li', '', ul); p.li.innerHTML = '<span>' + p.n + '</span><small>' + (p.a.length ? 'Contient : ' + p.a.join(', ') : 'Aucun des trois') + '</small>'; });
      var go = function () {
        var no = Array.prototype.map.call(f.querySelectorAll(':checked'), function (c) { return c.value; }), n = 0;
        P.forEach(function (p) { var off = p.a.some(function (a) { return no.indexOf(a) >= 0; }); p.li.classList.toggle('fx-off', off); p.li.setAttribute('aria-hidden', off); if (!off) n++; });
        out.textContent = n + ' produit' + (n > 1 ? 's' : '') + ' sur ' + P.length;
      };
      A.forEach(function (a) {
        var l = U.make('label', '', f), c = U.make('input', '', l);
        c.type = 'checkbox'; c.value = a;
        l.appendChild(document.createTextNode(a));
      });
      f.addEventListener('change', go);
      go();
      U.make('small', 'fx-af-n', el).textContent = 'Lisez toujours l\'étiquette.';
    }
  });

  // Saisir une date et voir si le produit est encore bon
  FX.register('expiry-check', {
    setup: function (el) {
      el.innerHTML = '<label>Date de péremption <input type="date"></label><output role="status">Saisissez la date</output>';
      var i = el.querySelector('input'), o = el.querySelector('output'), soon = U.num(el, 'fxSoon', 30);
      var go = function () {
        if (!i.value) return;
        var d = Math.ceil((new Date(i.value) - Date.now()) / 86400000);
        el.dataset.fxLevel = d < 0 ? 'out' : d <= soon ? 'soon' : 'ok';
        o.textContent = d < 0 ? 'Périmé depuis ' + -d + ' jours' : d <= soon ? 'À finir sous ' + d + ' jours' : 'Bon encore ' + d + ' jours';
      };
      i.addEventListener('change', go);
      if (el.dataset.fxDate) { i.value = el.dataset.fxDate; go(); }
      else { var t = new Date(Date.now() + 86400000 * U.num(el, 'fxDays', 20)); i.value = t.toISOString().slice(0, 10); go(); }
    }
  });

  // Une bulle de contact qui propose les questions fréquentes
  FX.register('ask-pharmacist', {
    setup: function (el) {
      var Q = (el.dataset.fxItems || 'Un médicament est-il en stock ?|Puis-je envoyer mon ordonnance ?|Quels sont vos horaires ?').split('|');
      el.innerHTML = '<div class="fx-ap" hidden><strong>' + (el.dataset.fxTitle || 'Une question ?') + '</strong></div><button type="button" class="fx-ap-b" aria-expanded="false" aria-label="Poser une question"><i aria-hidden="true"></i></button>';
      var p = el.firstChild, b = el.lastChild;
      Q.forEach(function (q, i) {
        var a = U.make('button', '', p);
        a.type = 'button'; a.textContent = q; a.style.setProperty('--fx-i', i);
        a.addEventListener('click', function () { el.dispatchEvent(new CustomEvent('fx:ask', { bubbles: true, detail: { question: q } })); a.classList.add('fx-sent'); });
      });
      var set = function (o) { p.hidden = !o; b.setAttribute('aria-expanded', o); el.classList.toggle('fx-open', o); if (o && p.querySelector('button')) p.querySelector('button').focus(); };
      b.addEventListener('click', function () { set(p.hidden); });
      el.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !p.hidden) { set(false); b.focus(); } });
    }
  });

  // Un mortier et son pilon qui écrasent en attendant
  FX.register('mortar-grind', {
    setup: function (el) {
      el.setAttribute('role', 'status');
      el.setAttribute('aria-label', el.dataset.fxLabel || 'Préparation en cours');
      el.innerHTML = '<svg viewBox="0 0 100 90" aria-hidden="true"><g class="fx-mg-p"><rect x="-4" y="-38" width="8" height="42" rx="4"/></g><path class="fx-mg-b" d="M14 44H86C86 64 72 78 50 78S14 64 14 44Z"/><rect class="fx-mg-b" x="34" y="78" width="32" height="6" rx="2"/></svg>';
      var g = el.querySelector('svg');
      for (var i = 0; i < 7; i++) {
        var c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        c.setAttribute('cx', 40 + i * 3.4); c.setAttribute('cy', 44); c.setAttribute('r', 1.5);
        c.style.setProperty('--fx-i', i); c.style.setProperty('--fx-x', U.rand(-14, 14) + 'px');
        g.appendChild(c);
      }
    }
  });

  // Chercher un ingrédient dans une composition trop longue
  FX.register('ingredient-lookup', {
    setup: function (el) {
      var words = el.textContent.split(',').map(function (s) { return s.trim(); });
      el.textContent = '';
      var q = U.make('input', '', el), p = U.make('p', '', el), out = U.make('output', '', el);
      q.type = 'search'; q.placeholder = 'Chercher un ingrédient'; q.setAttribute('aria-label', 'Chercher un ingrédient');
      out.setAttribute('aria-live', 'polite');
      var sp = words.map(function (w, i) { var s = U.make('span', '', p); s.textContent = w + (i < words.length - 1 ? ', ' : ''); return s; });
      q.addEventListener('input', function () {
        var v = q.value.trim().toLowerCase(), n = 0;
        sp.forEach(function (s) { var hit = v && s.textContent.toLowerCase().indexOf(v) >= 0; s.classList.toggle('fx-hit', !!hit); if (hit) n++; });
        p.classList.toggle('fx-q', !!v);
        out.textContent = !v ? '' : n ? 'Présent : ' + n + ' mention' + (n > 1 ? 's' : '') : 'Absent de cette liste';
      });
    }
  });

  // Un code de retrait qui reste facile à montrer, avec sa date limite
  FX.register('pickup-code', {
    setup: function (el) {
      var c = el.dataset.fxCode || '4821', days = U.num(el, 'fxDays', 3), end = new Date(Date.now() + days * 86400000), h = '';
      c.split('').forEach(function (d, i) { h += '<i style="--fx-i:' + i + '">' + d + '</i>'; });
      el.innerHTML = '<small>Votre code de retrait</small><div class="fx-pc" aria-label="Code ' + c.split('').join(' ') + '">' + h + '</div><button type="button">Copier</button><small>À retirer avant le ' + end.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) + '</small>';
      var b = el.querySelector('button');
      b.addEventListener('click', function () {
        if (navigator.clipboard) navigator.clipboard.writeText(c).catch(function () {});
        b.textContent = 'Copié';
        setTimeout(function () { b.textContent = 'Copier'; }, 1400);
      });
    }
  });
})(window.FX);
