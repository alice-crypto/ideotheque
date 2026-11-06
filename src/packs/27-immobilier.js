/* Pack 27 — Immobilier */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Ce qu'on peut acheter selon son revenu, son apport et la durée
  FX.register('budget-reach', {
    setup: function (el) {
      var rate = U.num(el, 'fxRate', 3.4) / 1200, part = U.num(el, 'fxPart', 35) / 100;
      var R = [['Revenus par mois', 'i', 1000, 8000, 100, 3200], ['Apport', 'a', 0, 100000, 1000, 20000], ['Durée (ans)', 'y', 10, 25, 1, 20]], H = '';
      R.forEach(function (r) { H += '<label>' + r[0] + ' <b data-o="' + r[1] + '"></b><input type="range" data-k="' + r[1] + '" min="' + r[2] + '" max="' + r[3] + '" step="' + r[4] + '" value="' + r[5] + '"></label>'; });
      el.innerHTML = H + '<output aria-live="polite"></output><small>Estimation fictive à ' + String(U.num(el, 'fxRate', 3.4)).replace('.', ',') + ' %, hors frais.</small>';
      var o = el.querySelector('output'), g = function (k) { return +el.querySelector('[data-k=' + k + ']').value; };
      var go = function () {
        var n = g('y') * 12, m = g('i') * part, cap = m * (1 - Math.pow(1 + rate, -n)) / rate, tot = cap + g('a');
        ['i', 'a'].forEach(function (k) { el.querySelector('[data-o=' + k + ']').textContent = g(k).toLocaleString('fr-FR') + ' €'; });
        el.querySelector('[data-o=y]').textContent = g('y') + ' ans';
        o.innerHTML = 'Budget possible <b>' + (Math.round(tot / 1000) * 1000).toLocaleString('fr-FR') + ' €</b>';
        el.style.setProperty('--fx-q', Math.min(1, tot / 600000));
      };
      el.addEventListener('input', go);
      go();
    }
  });

  // Un plan dont les pièces donnent leur nom et leur surface
  FX.register('floorplan-rooms', {
    setup: function (el) {
      var P = (el.dataset.fxItems || 'Séjour:0,0,60,55:28|Cuisine:60,0,40,35:11|Bain:60,35,40,20:6|Chambre:0,55,55,45:14|Bureau:55,55,45,45:9').split('|').map(function (r) { var p = r.split(':'); return { n: p[0], r: p[1].split(',').map(Number), s: +p[2] }; });
      var tot = P.reduce(function (t, p) { return t + p.s; }, 0), box = U.make('div', 'fx-fp', el), out = U.make('output', '', el);
      out.setAttribute('aria-live', 'polite');
      out.textContent = tot + ' m² au total';
      P.forEach(function (p) {
        var b = U.make('button', '', box);
        b.type = 'button'; b.textContent = p.n;
        b.style.cssText = 'left:' + p.r[0] + '%;top:' + p.r[1] + '%;width:' + p.r[2] + '%;height:' + p.r[3] + '%';
        var say = function () { out.innerHTML = '<b>' + p.n + '</b>, ' + p.s + ' m² sur ' + tot + ' m²'; };
        b.addEventListener('mouseenter', say); b.addEventListener('focus', say); b.addEventListener('click', say);
      });
    }
  });

  // Faire tourner le soleil autour du logement pour voir ses façades éclairées
  FX.register('sun-exposure', {
    setup: function (el) {
      var F = (el.dataset.fxWindows || 'S,O').split(',');
      el.innerHTML = '<div class="fx-se2" aria-hidden="true"><em></em><div>' + ['N', 'E', 'S', 'O'].map(function (s) { return '<i data-s="' + s + '">' + s + '</i>'; }).join('') + '</div></div><label>Heure <input type="range" min="6" max="21" step=".5"></label><output aria-live="polite"></output>';
      var r = el.querySelector('input'), o = el.querySelector('output');
      r.value = U.num(el, 'fxHour', 14);
      var go = function () {
        var h = +r.value, az = 90 + (h - 6) / 15 * 180, A = { E: 90, S: 180, O: 270 };
        el.style.setProperty('--fx-a', az + 'deg');
        var lit = [];
        el.querySelectorAll('[data-s]').forEach(function (f) {
          var s = f.dataset.s, on = A[s] !== undefined && Math.abs(az - A[s]) < 70;
          f.classList.toggle('fx-on', on);
          f.classList.toggle('fx-win', F.indexOf(s) >= 0);
          if (on && F.indexOf(s) >= 0) lit.push(s);
        });
        o.textContent = Math.floor(h) + ' h' + (h % 1 ? '30' : '') + ' · ' + (lit.length ? 'Soleil par les fenêtres ' + lit.join(', ') : 'Pas de soleil direct aux fenêtres');
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Une étiquette énergie dont la flèche vient se placer sur sa classe
  FX.register('energy-label', {
    entrance: true,
    setup: function (el) {
      var L = ['A', 'B', 'C', 'D', 'E', 'F', 'G'], lim = [70, 110, 180, 250, 330, 420, 1e9], v = U.num(el, 'fxValue', 210), k = lim.findIndex(function (m) { return v < m; }), col = ['#00853f', '#3fa34d', '#a4c639', '#f2d21f', '#f0a91a', '#e8681e', '#d3172a'];
      el.setAttribute('role', 'img');
      el.setAttribute('aria-label', 'Classe énergie ' + L[k] + ', ' + v + ' kWh par mètre carré et par an');
      var h = '';
      L.forEach(function (c, i) { h += '<div class="' + (i === k ? 'fx-on' : '') + '" style="--fx-c:' + col[i] + ';--fx-w:' + (30 + i * 11) + '%;--fx-i:' + i + '"><span>' + c + '</span>' + (i === k ? '<b>' + v + '</b>' : '') + '</div>'; });
      el.innerHTML = h;
    }
  });

  // Le quartier résumé : à combien de minutes à pied se trouve l'essentiel
  FX.register('walk-score', {
    entrance: true,
    setup: function (el) {
      var rows = (el.dataset.fxItems || 'École:6|Boulangerie:3|Métro:9|Parc:12|Médecin:15').split('|').map(function (r) { var p = r.split(':'); return [p[0], +p[1]]; }), max = 20;
      var score = Math.round(rows.reduce(function (t, r) { return t + Math.max(0, 1 - r[1] / max); }, 0) / rows.length * 100);
      var h = '<div class="fx-ws-s"><b>' + score + '</b><small>/100</small></div><ul>';
      rows.sort(function (a, b) { return a[1] - b[1]; }).forEach(function (r, i) { h += '<li style="--fx-q:' + (1 - r[1] / max) + ';--fx-i:' + i + '"><span>' + r[0] + '</span><i></i><b>' + r[1] + ' min</b></li>'; });
      el.innerHTML = h + '</ul>';
    }
  });

  // Le prix au mètre carré, comparé à celui du quartier
  FX.register('price-per-m2', {
    setup: function (el) {
      var price = U.num(el, 'fxPrice', 285000), area = U.num(el, 'fxArea', 62), ref = U.num(el, 'fxRef', 4300);
      el.innerHTML = '<label>Surface <b></b><input type="range" min="15" max="150" value="' + area + '"></label><div class="fx-m2" aria-hidden="true"><em></em><i></i></div><output aria-live="polite"></output>';
      var r = el.querySelector('input'), b = el.querySelector('b'), o = el.querySelector('output');
      var go = function () {
        var a = +r.value, pm = Math.round(price / a), gap = Math.round((pm / ref - 1) * 100);
        b.textContent = a + ' m²';
        el.style.setProperty('--fx-q', U.clamp(pm / (ref * 2), 0, 1));
        o.innerHTML = '<b>' + pm.toLocaleString('fr-FR') + ' €/m²</b><br>' + (gap === 0 ? 'Au niveau du quartier' : Math.abs(gap) + ' % ' + (gap > 0 ? 'au-dessus' : 'en dessous') + ' du quartier');
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Une photo panoramique qu'on fait tourner, avec sa boussole
  FX.register('panorama-drag', {
    setup: function (el) {
      var img = el.dataset.fxImage || 'assets/city.svg', x = 0, v = 0, down = false, last = 0, W = U.num(el, 'fxWidth', 900);
      el.tabIndex = 0;
      el.setAttribute('role', 'slider'); el.setAttribute('aria-label', el.dataset.fxLabel || 'Vue panoramique'); el.setAttribute('aria-valuemin', 0); el.setAttribute('aria-valuemax', 359);
      el.innerHTML = '<div class="fx-pn"></div><span class="fx-pn-c" aria-hidden="true"><i></i></span>';
      var p = el.firstChild;
      p.style.backgroundImage = 'url(' + img + ')';
      p.style.backgroundSize = W + 'px 100%';
      var put = function () { var c = ((x % W) + W) % W, d = Math.round(c / W * 360) % 360; p.style.backgroundPositionX = -c + 'px'; el.style.setProperty('--fx-a', d + 'deg'); el.setAttribute('aria-valuenow', d); };
      el.addEventListener('pointerdown', function (e) { down = true; last = e.clientX; v = 0; el.classList.add('fx-grab'); });
      window.addEventListener('pointermove', function (e) { if (!down) return; v = last - e.clientX; x += v; last = e.clientX; put(); });
      window.addEventListener('pointerup', function () { down = false; el.classList.remove('fx-grab'); });
      el.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') { x -= 25; put(); e.preventDefault(); } if (e.key === 'ArrowRight') { x += 25; put(); e.preventDefault(); } });
      el._fxStep = function () { if (!down && Math.abs(v) > .1) { x += v; v *= .94; put(); } };
      put();
    },
    tick: function (el) { if (el._fxStep) el._fxStep(); }
  });

  // Une carte à bulles de prix qui s'ouvre sur l'annonce
  FX.register('map-price-pins', {
    setup: function (el) {
      var P = (el.dataset.fxItems || '24:30:285 k€:T3 lumineux, 62 m²|62:22:410 k€:Maison, 98 m²|42:62:198 k€:Studio, 28 m²|76:68:340 k€:T4, 81 m²').split('|').map(function (r) { return r.split(':'); });
      var map = U.make('div', 'fx-mp', el), o = U.make('output', '', el);
      o.setAttribute('aria-live', 'polite');
      o.textContent = P.length + ' annonces fictives sur la carte';
      P.forEach(function (p, i) {
        var b = U.make('button', '', map);
        b.type = 'button'; b.textContent = p[2]; b.style.left = p[0] + '%'; b.style.top = p[1] + '%'; b.style.setProperty('--fx-i', i);
        b.setAttribute('aria-pressed', 'false');
        b.addEventListener('click', function () {
          map.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
          o.innerHTML = '<b>' + p[2] + '</b> · ' + p[3];
        });
      });
    }
  });

  // Une carte d'annonce : passer la souris fait défiler les photos
  FX.register('listing-photos', {
    setup: function (el) {
      var A = (el.dataset.fxImages || 'assets/city.svg,assets/bloom.svg,assets/dune.svg,assets/wave.svg').split(','), n = 0;
      el.innerHTML = '<div class="fx-lp">' + A.map(function (s, i) { return '<img src="' + s + '" alt="Photo ' + (i + 1) + ' sur ' + A.length + '" ' + (i ? 'hidden' : '') + '>'; }).join('') + '<button type="button" aria-label="Photo précédente">‹</button><button type="button" aria-label="Photo suivante">›</button><div aria-hidden="true">' + A.map(function () { return '<i></i>'; }).join('') + '</div></div>';
      var imgs = el.querySelectorAll('img'), d = el.querySelectorAll('i'), bs = el.querySelectorAll('button'), lp = el.firstChild;
      var show = function (k) { n = (k + A.length) % A.length; imgs.forEach(function (m, i) { m.hidden = i !== n; }); d.forEach(function (x, i) { x.classList.toggle('fx-on', i === n); }); };
      bs[0].addEventListener('click', function () { show(n - 1); });
      bs[1].addEventListener('click', function () { show(n + 1); });
      lp.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var r = lp.getBoundingClientRect(); show(Math.min(A.length - 1, Math.floor((e.clientX - r.left) / r.width * A.length))); });
      show(0);
    }
  });

  // Enregistrer une recherche pour recevoir les nouvelles annonces
  FX.register('search-alert', {
    setup: function (el) {
      var c = el.dataset.fxCriteria || 'T3, Lyon, moins de 300 000 €', key = el.dataset.fxKey, on = false;
      if (key) try { on = localStorage.getItem(key) === '1'; } catch (err) {}
      el.innerHTML = '<button type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 17V11a6 6 0 0 1 12 0v6l2 2H4Z"/><path d="M10 21h4"/></svg><span></span></button><small aria-live="polite"></small>';
      var b = el.firstChild, sp = el.querySelector('span'), s = el.querySelector('small');
      var show = function (anim) {
        b.setAttribute('aria-pressed', on);
        el.classList.toggle('fx-on', on);
        sp.textContent = on ? 'Alerte active' : 'Créer une alerte';
        s.textContent = on ? 'Nous vous préviendrons pour : ' + c : c;
        if (anim) { b.classList.remove('fx-go'); void b.offsetWidth; b.classList.add('fx-go'); }
      };
      b.addEventListener('click', function () {
        on = !on;
        if (key) try { localStorage.setItem(key, on ? '1' : '0'); } catch (err) {}
        show(on);
        el.dispatchEvent(new CustomEvent('fx:alert', { bubbles: true, detail: { on: on, criteria: c } }));
      });
      show();
    }
  });

  // Louer ou acheter : deux courbes et l'année où elles se croisent
  FX.register('rent-vs-buy', {
    setup: function (el) {
      el.innerHTML = '<svg viewBox="0 0 200 100" preserveAspectRatio="none" aria-hidden="true"><path class="r" pathLength="1"/><path class="b" pathLength="1"/><line y1="0" y2="100"/></svg><label>Loyer mensuel <b></b><input type="range" min="400" max="2500" step="50"></label><output aria-live="polite"></output><small>Modèle fictif : frais d\'achat et valeur du bien simplifiés.</small>';
      var i = el.querySelector('input'), P = U.num(el, 'fxPrice', 250000), F = P * .08, C = P * .012, Y = 25, o = el.querySelector('output');
      i.value = U.num(el, 'fxRent', 950);
      var go = function () {
        var rent = [], buy = [], cross = null;
        for (var y = 0; y <= Y; y++) { rent.push(+i.value * 12 * y); buy.push(F + C * y); if (cross === null && rent[y] > buy[y]) cross = y; }
        var top = Math.max(rent[Y], buy[Y]), p = function (a) { return a.map(function (v, k) { return (k ? 'L' : 'M') + (k / Y * 200).toFixed(1) + ' ' + (100 - v / top * 96).toFixed(1); }).join(''); };
        el.querySelector('.r').setAttribute('d', p(rent));
        el.querySelector('.b').setAttribute('d', p(buy));
        el.querySelector('b').textContent = (+i.value).toLocaleString('fr-FR') + ' €';
        var ln = el.querySelector('line');
        ln.setAttribute('x1', (cross || 0) / Y * 200); ln.setAttribute('x2', (cross || 0) / Y * 200);
        o.innerHTML = cross === null ? 'Pas de bascule sur 25 ans' : 'Acheter devient avantageux après <b>' + cross + ' ans</b>';
      };
      i.addEventListener('input', go);
      go();
    }
  });

  // Ce que coûte vraiment un achat : le prix plus les frais, en bloc empilé
  FX.register('closing-costs', {
    setup: function (el) {
      var P = U.num(el, 'fxPrice', 250000);
      el.innerHTML = '<div class="fx-cc-t"><button type="button" data-t=".075" aria-pressed="true">Ancien</button><button type="button" data-t=".025" aria-pressed="false">Neuf</button></div><div class="fx-cc" aria-hidden="true"><i class="a"></i><i class="b"></i><i class="c"></i></div><output aria-live="polite"></output><small>Taux approximatifs, à faire confirmer par le notaire.</small>';
      var o = el.querySelector('output');
      var set = function (t) {
        var n = P * t, ag = P * .045, tot = P + n + ag, m = function (v) { return Math.round(v).toLocaleString('fr-FR') + ' €'; };
        el.style.setProperty('--fx-a', P / tot); el.style.setProperty('--fx-b', n / tot); el.style.setProperty('--fx-c', ag / tot);
        o.innerHTML = 'Prix ' + m(P) + '<br>Frais de notaire ' + m(n) + '<br>Agence ' + m(ag) + '<br><b>Total ' + m(tot) + '</b>';
      };
      el.querySelectorAll('button').forEach(function (b) {
        b.addEventListener('click', function () {
          el.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
          set(+b.dataset.t);
        });
      });
      set(.075);
    }
  });

  // Un mètre ruban qui se déroule et compte en s'ouvrant
  FX.register('tape-measure', {
    entrance: true,
    enter: function (el) {
      var v = U.num(el, 'fxValue', 4.2), o = el.querySelector('output');
      U.tween(el, 1200, function (p) { o.textContent = (U.easeOut(p) * v).toFixed(2).replace('.', ',') + ' m'; });
    },
    setup: function (el) {
      var v = U.num(el, 'fxValue', 4.2), t = '';
      for (var i = 0; i <= 40; i++) t += '<i class="' + (i % 10 ? '' : 'fx-b') + '"></i>';
      el.innerHTML = '<div class="fx-tm"><div class="fx-tm-r" aria-hidden="true">' + t + '</div><span class="fx-tm-c" aria-hidden="true"></span></div><output>' + String(v.toFixed(2)).replace('.', ',') + ' m</output>';
      el.setAttribute('aria-label', 'Longueur : ' + v + ' mètres');
      el.setAttribute('role', 'img');
    }
  });

  // Un plan bleu qui se trace mur par mur
  FX.register('blueprint-draw', {
    entrance: true,
    setup: function (el) {
      var W = (el.dataset.fxWalls || '10,10,190,10|190,10,190,110|190,110,10,110|10,110,10,10|110,10,110,60|110,60,80,60|110,85,110,110|10,62,60,62').split('|'), s = '<svg viewBox="0 0 200 120" aria-hidden="true">';
      W.forEach(function (w, i) { var p = w.split(','); s += '<line pathLength="1" x1="' + p[0] + '" y1="' + p[1] + '" x2="' + p[2] + '" y2="' + p[3] + '" style="--fx-i:' + i + '"/>'; });
      s += '<path class="fx-bpd" d="M80 60A20 20 0 0 1 60 40"/><text x="40" y="40">Séjour</text><text x="150" y="60">Chambre</text><text x="55" y="90">Cuisine</text></svg>';
      el.innerHTML = s;
      if (el.dataset.fxLabel) { el.setAttribute('role', 'img'); el.setAttribute('aria-label', el.dataset.fxLabel); }
    }
  });

  // Une clé qui tourne dans la serrure, et la porte qui s'ouvre
  FX.register('key-unlock', {
    entrance: true,
    setup: function (el) {
      var msg = el.textContent.trim() || 'Bienvenue chez vous';
      el.innerHTML = '<div class="fx-ku"><span class="fx-ku-m">' + msg + '</span><div class="fx-ku-d" aria-hidden="true"><i class="fx-ku-h"></i><svg class="fx-ku-k" viewBox="0 0 60 20"><circle cx="9" cy="10" r="7"/><circle cx="9" cy="10" r="3"/><path d="M16 10H56V15H52V12H47V15H43V12H16Z"/></svg></div></div>';
    }
  });

  // Une façade dont les fenêtres s'allument selon l'heure du jour
  FX.register('facade-windows', {
    setup: function (el) {
      var c = U.num(el, 'fxCols', 8), r = U.num(el, 'fxRows', 6), g = U.make('div', 'fx-fw', el);
      g.style.setProperty('--fx-c', c);
      el.setAttribute('aria-hidden', 'true');
      for (var i = 0; i < c * r; i++) U.make('i', '', g);
      var h = new Date().getHours(), p = h >= 22 || h < 6 ? .15 : h >= 18 ? .65 : .25;
      el._fxW = g.children; el._fxP = U.num(el, 'fxDensity', p); el._fxNext = 0;
      Array.prototype.forEach.call(g.children, function (w) { w.classList.toggle('fx-on', Math.random() < el._fxP); });
    },
    tick: function (el, dt, t) {
      if (U.reduced || t < el._fxNext) return;
      el._fxNext = t + U.rand(.25, .8);
      var w = el._fxW[Math.floor(Math.random() * el._fxW.length)];
      w.classList.toggle('fx-on', Math.random() < el._fxP);
    }
  });

  // Une pancarte d'agence qui passe de « à vendre » à « vendu »
  FX.register('sold-sign', {
    setup: function (el) {
      var S = (el.dataset.fxItems || 'À vendre|Sous offre|Vendu').split('|'), n = U.num(el, 'fxStep', 0);
      el.innerHTML = '<div class="fx-ss" aria-hidden="true"><em></em><div class="fx-ss-p"><b></b></div></div><span class="fx-ss-l" aria-live="polite"></span>';
      var b = el.querySelector('b'), l = el.querySelector('.fx-ss-l');
      el._fxSet = function (k) {
        n = k;
        b.textContent = S[n]; l.textContent = 'État : ' + S[n];
        el.classList.toggle('fx-sold', n === S.length - 1);
        var p = el.querySelector('.fx-ss-p');
        p.classList.remove('fx-go'); void p.offsetWidth; p.classList.add('fx-go');
      };
      el._fxLen = S.length; el._fxN = function () { return n; };
      el._fxSet(n);
      el.querySelector('.fx-ss').addEventListener('click', function () { FX.trigger(el); });
    },
    trigger: function (el) { el._fxSet((el._fxN() + 1) % el._fxLen); }
  });

  // Partager le loyer selon la taille des chambres
  FX.register('rent-split', {
    setup: function (el) {
      var rent = U.num(el, 'fxRent', 1500), commonQ = U.num(el, 'fxCommon', 40) / 100, P = (el.dataset.fxItems || 'Aya:18|Léo:12|Sami:9').split('|').map(function (r) { var p = r.split(':'); return { n: p[0], s: +p[1] }; });
      P.forEach(function (p) {
        var l = U.make('label', '', el);
        l.innerHTML = '<span>' + p.n + '</span><input type="range" min="6" max="30" value="' + p.s + '" aria-label="Chambre de ' + p.n + ', en mètres carrés"><em></em><b></b>';
        p.i = l.querySelector('input'); p.b = l.querySelector('b'); p.e = l.querySelector('em');
      });
      var go = function () {
        var tot = P.reduce(function (t, p) { return t + +p.i.value; }, 0);
        P.forEach(function (p) {
          var v = rent * commonQ / P.length + rent * (1 - commonQ) * p.i.value / tot;
          p.b.textContent = Math.round(v) + ' €'; p.e.textContent = p.i.value + ' m²';
        });
      };
      el.addEventListener('input', go);
      U.make('small', '', el).textContent = 'Loyer de ' + rent + ' €, ' + Math.round(commonQ * 100) + ' % partagés à égalité';
      go();
    }
  });

  // Des anneaux de temps de trajet autour d'une adresse
  FX.register('commute-rings', {
    setup: function (el) {
      var P = (el.dataset.fxItems || 'Bureau:18:40|Gare:9:150|École:6:250|Aéroport:42:320').split('|').map(function (r) { var p = r.split(':'); return [p[0], +p[1], +p[2]]; }), Max = 45;
      var box = U.make('div', 'fx-cr', el), l = U.make('label', '', el), o = U.make('output', '', el);
      box.setAttribute('aria-hidden', 'true');
      [15, 30, 45].forEach(function (m) { var r = U.make('u', '', box); r.style.setProperty('--fx-r', m / Max); r.textContent = m; });
      U.make('b', '', box);
      P.forEach(function (p) {
        var d = U.make('i', '', box), q = p[1] / Max, a = p[2] * Math.PI / 180;
        d.style.left = 50 + 50 * q * Math.cos(a) + '%'; d.style.top = 50 + 50 * q * Math.sin(a) + '%'; d.textContent = p[0]; p.d = d;
      });
      l.innerHTML = 'Moins de <b></b><input type="range" min="5" max="45" step="5">';
      o.setAttribute('aria-live', 'polite');
      var r = l.querySelector('input');
      r.value = U.num(el, 'fxMinutes', 20);
      var go = function () {
        var hit = [];
        P.forEach(function (p) { var on = p[1] <= +r.value; p.d.classList.toggle('fx-on', on); if (on) hit.push(p[0]); });
        l.querySelector('b').textContent = r.value + ' min';
        el.style.setProperty('--fx-z', r.value / Max);
        o.textContent = hit.length ? 'Accessible : ' + hit.join(', ') : 'Rien dans ce temps';
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Choisir son étage : la vue change et le prix aussi
  FX.register('floor-view', {
    setup: function (el) {
      var base = U.num(el, 'fxPrice', 240000), add = U.num(el, 'fxStep', 4000), F = U.num(el, 'fxFloors', 8);
      el.innerHTML = '<div class="fx-fv" aria-hidden="true"><i></i><i></i><i></i><b></b></div><label>Étage <input type="range" min="0" max="' + F + '"></label><output aria-live="polite"></output>';
      var r = el.querySelector('input'), o = el.querySelector('output');
      r.value = U.num(el, 'fxFloor', 3);
      var go = function () {
        var f = +r.value, q = f / F;
        el.style.setProperty('--fx-q', q);
        o.innerHTML = '<b>' + (f ? f + (f === 1 ? 'ᵉʳ' : 'ᵉ') + ' étage' : 'Rez-de-chaussée') + '</b> · ' + (base + add * f).toLocaleString('fr-FR') + ' € (fictif)';
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Le dossier passe-t-il la règle du revenu égal à trois fois le loyer ?
  FX.register('rent-ratio', {
    setup: function (el) {
      var need = U.num(el, 'fxRatio', 3);
      el.innerHTML = '<label>Revenus <input type="number" min="0" step="50" value="' + U.num(el, 'fxIncome', 2400) + '"></label><label>Loyer <input type="number" min="0" step="10" value="' + U.num(el, 'fxRent', 900) + '"></label><div class="fx-rr" aria-hidden="true"></div><output aria-live="polite"></output>';
      var I = el.querySelectorAll('input'), box = el.querySelector('.fx-rr'), o = el.querySelector('output');
      for (var i = 0; i < need + 1; i++) U.make('i', '', box);
      var go = function () {
        var a = +I[0].value || 0, b = +I[1].value || 1, q = a / b, ok = q >= need;
        el.classList.toggle('fx-ok', ok);
        Array.prototype.forEach.call(box.children, function (d, k) { d.style.setProperty('--fx-f', U.clamp(q - k, 0, 1)); });
        o.textContent = String(q.toFixed(1)).replace('.', ',') + ' fois le loyer · ' + (ok ? 'Seuil atteint' : 'Il manque ' + Math.ceil(need * b - a) + ' €');
      };
      el.addEventListener('input', go);
      go();
    }
  });
})(window.FX);
