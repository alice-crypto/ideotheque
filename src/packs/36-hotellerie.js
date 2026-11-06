/* Pack 36 — Hôtellerie */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Choisir ses dates de séjour : deux clics, et les nuits se comptent
  FX.register('stay-range', {
    setup: function (el) {
      var P = U.num(el, 'fxPrice', 110), W = U.num(el, 'fxWeekend', 145), a = null, b = null, start = new Date();
      start.setHours(0, 0, 0, 0);
      var box = U.make('div', 'fx-sr3', el), o = U.make('output', '', el), D = [];
      o.setAttribute('aria-live', 'polite');
      for (var i = 0; i < 21; i++) (function (i) {
        var d = new Date(+start + i * 86400000), c = U.make('button', '', box);
        c.type = 'button'; c.textContent = d.getDate();
        c.setAttribute('aria-label', d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }));
        c.style.gridColumnStart = i === 0 ? ((d.getDay() + 6) % 7 + 1) : 'auto';
        c.addEventListener('click', function () {
          if (a === null || b !== null) { a = i; b = null; } else if (i <= a) a = i; else b = i;
          show();
        });
        D.push({ d: d, c: c });
      })(i);
      var show = function () {
        D.forEach(function (x, i) {
          x.c.classList.toggle('fx-e', i === a || i === b);
          x.c.classList.toggle('fx-r', b !== null && i > a && i < b);
        });
        if (b === null) { o.textContent = a === null ? 'Choisissez votre arrivée' : 'Choisissez votre départ'; return; }
        var t = 0;
        for (var k = a; k < b; k++) { var g = D[k].d.getDay(); t += g === 5 || g === 6 ? W : P; }
        o.innerHTML = '<b>' + (b - a) + ' nuit' + (b - a > 1 ? 's' : '') + '</b> · ' + t.toLocaleString('fr-FR') + ' € (exemple)';
        el.dispatchEvent(new CustomEvent('fx:stay', { bubbles: true, detail: { from: D[a].d, to: D[b].d, total: t } }));
      };
      show();
    }
  });

  // Passer d'une chambre à l'autre, avec sa surface à l'échelle
  FX.register('room-type', {
    setup: function (el) {
      var R = (el.dataset.fxItems || 'Classique:18:1 grand lit:Cour:119|Supérieure:26:1 très grand lit:Jardin:159|Suite:44:Chambre et salon:Mer:249').split('|').map(function (r) { return r.split(':'); }), max = Math.max.apply(null, R.map(function (r) { return +r[1]; }));
      el.innerHTML = '<div class="fx-rt2" role="radiogroup" aria-label="Type de chambre"></div><div class="fx-rt2-s" aria-hidden="true"><i></i></div><ul aria-live="polite"></ul>';
      var f = el.querySelector('.fx-rt2'), ul = el.querySelector('ul');
      var pick = function (r, b) {
        f.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-checked', x === b); });
        el.style.setProperty('--fx-q', Math.sqrt(r[1] / max));
        ul.innerHTML = '<li><span>Surface</span><b>' + r[1] + ' m²</b></li><li><span>Couchage</span><b>' + r[2] + '</b></li><li><span>Vue</span><b>' + r[3] + '</b></li><li><span>À partir de</span><b>' + r[4] + ' €</b></li>';
      };
      R.forEach(function (r, i) {
        var b = U.make('button', '', f);
        b.type = 'button'; b.setAttribute('role', 'radio'); b.textContent = r[0];
        b.addEventListener('click', function () { pick(r, b); });
        if (i === 1) pick(r, b);
      });
    }
  });

  // Combien de voyageurs : adultes, enfants et chambres
  FX.register('guest-steppers', {
    setup: function (el) {
      var R = [['Adultes', 'à partir de 13 ans', 2, 1, 8], ['Enfants', 'de 2 à 12 ans', 0, 0, 6], ['Chambres', '', 1, 1, 4]];
      var b = U.make('button', 'fx-gs2-b', el), box = U.make('div', 'fx-gs2', el);
      b.type = 'button'; b.setAttribute('aria-expanded', el.dataset.fxOpen === 'false' ? 'false' : 'true');
      R.forEach(function (r) {
        var d = U.make('div', '', box);
        d.innerHTML = '<span>' + r[0] + (r[1] ? '<small>' + r[1] + '</small>' : '') + '</span><button type="button" aria-label="Retirer : ' + r[0] + '">−</button><b aria-live="polite"></b><button type="button" aria-label="Ajouter : ' + r[0] + '">+</button>';
        var B = d.querySelectorAll('button');
        r.t = d.querySelector('b'); r.m = B[0]; r.p = B[1];
        B[0].addEventListener('click', function () { r[2]--; show(); });
        B[1].addEventListener('click', function () { r[2]++; show(); });
      });
      var show = function () {
        R.forEach(function (r) { r.t.textContent = r[2]; r.m.disabled = r[2] <= r[3]; r.p.disabled = r[2] >= r[4]; });
        var a = R[0][2], c = R[1][2], rm = R[2][2];
        b.textContent = (a + c) + ' voyageur' + (a + c > 1 ? 's' : '') + ', ' + rm + ' chambre' + (rm > 1 ? 's' : '');
        el.dispatchEvent(new CustomEvent('fx:guests', { bubbles: true, detail: { adults: a, children: c, rooms: rm } }));
      };
      b.addEventListener('click', function () { b.setAttribute('aria-expanded', b.getAttribute('aria-expanded') !== 'true'); });
      show();
    }
  });

  // Un mois de prix : du moins cher au plus cher, d'un coup d'œil
  FX.register('price-calendar', {
    setup: function (el) {
      var seed = U.num(el, 'fxSeed', 11), R = function () { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }, start = new Date(), box = U.make('div', 'fx-pc3', el), o = U.make('output', '', el), A = [];
      o.setAttribute('aria-live', 'polite');
      for (var i = 0; i < 28; i++) {
        var d = new Date(+start + i * 86400000), we = d.getDay() === 5 || d.getDay() === 6, p = Math.round(79 + R() * 70 + (we ? 45 : 0));
        A.push({ d: d, p: p });
      }
      var lo = Math.min.apply(null, A.map(function (x) { return x.p; })), hi = Math.max.apply(null, A.map(function (x) { return x.p; }));
      A.forEach(function (x) {
        var c = U.make('button', x.p === lo ? 'fx-best' : '', box);
        c.type = 'button';
        c.style.setProperty('--fx-h', 130 - (x.p - lo) / (hi - lo) * 130);
        c.innerHTML = '<small>' + x.d.getDate() + '</small>' + x.p;
        c.setAttribute('aria-label', x.d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) + ', ' + x.p + ' euros');
        c.addEventListener('click', function () { o.textContent = x.d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) + ' : ' + x.p + ' €'; });
      });
      o.textContent = 'Le moins cher : ' + lo + ' €. Prix fictifs.';
    }
  });

  // Une grille d'équipements : les essentiels, puis tout le reste
  FX.register('amenity-grid', {
    setup: function (el) {
      var A = (el.dataset.fxItems || 'Wi-Fi gratuit|Petit-déjeuner|Parking|Piscine|Climatisation|Spa|Salle de sport|Bar|Animaux admis|Navette').split('|'), first = U.num(el, 'fxFirst', 6), ul = U.make('ul', '', el), b = U.make('button', '', el);
      A.forEach(function (t, i) { var li = U.make('li', i >= first ? 'fx-more' : '', ul); li.style.setProperty('--fx-i', i - first); li.innerHTML = '<i aria-hidden="true">✓</i>' + t; });
      b.type = 'button'; b.setAttribute('aria-expanded', 'false');
      var more = A.length - first;
      b.textContent = 'Voir ' + more + ' équipements de plus';
      if (more <= 0) b.hidden = true;
      b.addEventListener('click', function () {
        var o = b.getAttribute('aria-expanded') !== 'true';
        b.setAttribute('aria-expanded', o);
        el.classList.toggle('fx-all', o);
        b.textContent = o ? 'Voir moins' : 'Voir ' + more + ' équipements de plus';
      });
    }
  });

  // Une carte qu'on passe devant le lecteur : voyant vert, porte ouverte
  FX.register('key-card', {
    setup: function (el) {
      var valid = el.dataset.fxValid !== 'false', rm = el.dataset.fxRoom || '412';
      el.innerHTML = '<div class="fx-kc" aria-hidden="true"><i class="fx-kc-r"><u></u></i><i class="fx-kc-c"><b>' + rm + '</b></i></div><button type="button">Passer la carte</button><output aria-live="polite"></output>';
      var b = el.querySelector('button'), o = el.querySelector('output');
      b.addEventListener('click', function () { FX.trigger(el); });
      el._fxTap = function () {
        el.classList.remove('fx-tap', 'fx-ok', 'fx-no');
        void el.offsetWidth;
        el.classList.add('fx-tap');
        setTimeout(function () { el.classList.add(valid ? 'fx-ok' : 'fx-no'); o.textContent = valid ? 'Chambre ' + rm + ' : porte ouverte' : 'Carte refusée, voyez la réception'; }, U.reduced ? 0 : 520);
      };
    },
    trigger: function (el) { el._fxTap(); }
  });

  // Une accroche-porte qui se retourne : ne pas déranger, ou faire la chambre
  FX.register('door-hanger', {
    setup: function (el) {
      var A = (el.dataset.fxItems || 'Ne pas déranger|Faire la chambre').split('|');
      el.innerHTML = '<button type="button" role="switch" aria-checked="false" aria-label="' + A[0] + '"><span class="fx-dh"><span class="a">' + A[0] + '</span><span class="b">' + A[1] + '</span></span></button><output aria-live="polite"></output>';
      var b = el.firstChild, o = el.querySelector('output');
      var set = function (on) { b.setAttribute('aria-checked', on); o.textContent = 'État : ' + (on ? A[0] : A[1]); el.dispatchEvent(new CustomEvent('fx:hanger', { bubbles: true, detail: { dnd: on } })); };
      b.addEventListener('click', function () { set(b.getAttribute('aria-checked') !== 'true'); });
      set(el.dataset.fxOn === 'true');
    },
    trigger: function (el) { el.firstChild.click(); }
  });

  // Composer son plateau de petit-déjeuner en chambre
  FX.register('breakfast-tray', {
    setup: function (el) {
      var I = (el.dataset.fxItems || 'Café:☕:4|Croissant:🥐:3|Jus d\'orange:🧃:5|Œufs:🍳:7|Fruits:🍓:6').split('|').map(function (r) { return r.split(':'); });
      el.innerHTML = '<div class="fx-bt2" aria-hidden="true"></div><div class="fx-bt2-l"></div><label>Servi à <select><option>7:30</option><option>8:00</option><option selected>8:30</option><option>9:00</option><option>9:30</option></select></label><output aria-live="polite"></output>';
      var tray = el.querySelector('.fx-bt2'), list = el.querySelector('.fx-bt2-l'), o = el.querySelector('output'), sel = el.querySelector('select');
      var go = function () {
        var t = 0, n = [];
        tray.innerHTML = '';
        list.querySelectorAll('button').forEach(function (b, i) { if (b.getAttribute('aria-pressed') === 'true') { t += +I[i][2]; n.push(I[i][0]); U.make('i', '', tray).textContent = I[i][1]; } });
        o.innerHTML = n.length ? '<b>' + t + ' €</b>, servi à ' + sel.value : 'Votre plateau est vide';
      };
      I.forEach(function (x) {
        var b = U.make('button', '', list);
        b.type = 'button'; b.textContent = x[0]; b.setAttribute('aria-pressed', 'false');
        b.addEventListener('click', function () { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true'); go(); });
      });
      sel.addEventListener('change', go);
      list.firstChild.click();
      list.children[1].click();
    }
  });

  // Une sonnette de réception : on sonne, et le conseil arrive
  FX.register('concierge-bell', {
    setup: function (el) {
      var T = (el.dataset.fxItems || 'Essayez le petit marché du dimanche, à 10 minutes à pied.|Le musée est gratuit le premier mardi du mois.|Prenez le bac pour la plus belle vue au coucher du soleil.').split('|'), n = -1;
      el.innerHTML = '<button type="button" aria-label="Sonner à la réception"><svg viewBox="0 0 80 60" aria-hidden="true"><path class="b" d="M12 46C12 26 24 14 40 14S68 26 68 46Z"/><rect x="6" y="46" width="68" height="6" rx="3"/><circle cx="40" cy="10" r="4"/></svg></button><output aria-live="polite">Une question ? Sonnez.</output>';
      var b = el.firstChild, o = el.querySelector('output');
      b.addEventListener('click', function () {
        n = (n + 1) % T.length;
        b.classList.remove('fx-go'); void b.offsetWidth; b.classList.add('fx-go');
        o.textContent = T[n];
      });
    },
    trigger: function (el) { el.firstChild.click(); }
  });

  // Une chambre dont la lumière suit l'heure
  FX.register('day-night-room', {
    setup: function (el) {
      el.innerHTML = '<div class="fx-dn" aria-hidden="true"><i class="w"><u></u></i><i class="b"></i><i class="l"></i></div><label>Heure <b></b><input type="range" min="0" max="23"></label>';
      var r = el.querySelector('input');
      r.value = U.num(el, 'fxHour', 20);
      var go = function () {
        var h = +r.value, day = Math.sin((h - 6) / 12 * Math.PI), q = U.clamp(day, 0, 1), night = 1 - q;
        el.style.setProperty('--fx-d', q.toFixed(2));
        el.style.setProperty('--fx-n', night.toFixed(2));
        el.style.setProperty('--fx-s', ((h - 6) / 12 * 100) + '%');
        el.querySelector('label b').textContent = h + ' h';
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Avant le séjour : le temps qui reste et ce qu'il reste à faire
  FX.register('checkin-ready', {
    setup: function (el) {
      var at = el.dataset.fxDate ? new Date(el.dataset.fxDate) : new Date(Date.now() + 86400000 * U.num(el, 'fxDays', 2)), T = (el.dataset.fxItems || 'Pièce d\'identité|Heure d\'arrivée|Carte de garantie').split('|');
      el.innerHTML = '<b class="fx-cr2-c"></b><ul></ul><output aria-live="polite"></output>';
      var c = el.querySelector('.fx-cr2-c'), ul = el.querySelector('ul'), o = el.querySelector('output');
      T.forEach(function (t) { var l = U.make('label', '', U.make('li', '', ul)), k = U.make('input', '', l); k.type = 'checkbox'; l.appendChild(document.createTextNode(t)); });
      var go = function () {
        var left = at - Date.now(), d = Math.floor(left / 86400000), h = Math.floor(left / 3600000) % 24, n = ul.querySelectorAll(':checked').length;
        c.textContent = left <= 0 ? 'Bienvenue !' : (d ? d + ' j ' : '') + h + ' h avant votre arrivée';
        el.classList.toggle('fx-done', n === T.length);
        o.textContent = n === T.length ? 'Tout est prêt : passez directement en chambre' : (T.length - n) + ' étape' + (T.length - n > 1 ? 's' : '') + ' avant de gagner du temps';
      };
      el.addEventListener('change', go);
      go();
      setInterval(go, 60000);
    }
  });

  // Les conditions d'annulation sur une ligne de temps, avec aujourd'hui dessus
  FX.register('cancel-policy', {
    entrance: true,
    setup: function (el) {
      var arrive = el.dataset.fxDate ? new Date(el.dataset.fxDate) : new Date(Date.now() + 86400000 * 20), free = U.num(el, 'fxFree', 7), half = U.num(el, 'fxHalf', 2), span = U.num(el, 'fxSpan', 30), now = Date.now(), days = Math.ceil((arrive - now) / 86400000), f = function (n) { return new Date(+arrive - n * 86400000).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }); }, q = 1 - U.clamp(days, 0, span) / span, st = days > free ? 'Annulation gratuite jusqu\'au ' + f(free) : days > half ? 'Remboursé à 50 % jusqu\'au ' + f(half) : 'Sans remboursement';
      el.style.setProperty('--fx-q', q);
      el.innerHTML = '<div class="fx-cp3" aria-hidden="true"><i class="a" style="flex:' + (span - free) + ' 1 0"></i><i class="b" style="flex:' + (free - half) + ' 1 0"></i><i class="c" style="flex:' + half + ' 1 0"></i><u></u></div><div class="fx-cp3-l" aria-hidden="true"><span>Aujourd\'hui ou avant</span><span>Arrivée</span></div><p>' + st + '</p>';
    }
  });

  // Un programme de fidélité : encore combien de nuits ?
  FX.register('loyalty-nights', {
    entrance: true,
    setup: function (el) {
      var T = (el.dataset.fxItems || 'Argent:10|Or:25|Platine:50').split('|').map(function (r) { var p = r.split(':'); return [p[0], +p[1]]; }), n = U.num(el, 'fxNights', 17), max = T[T.length - 1][0] ? T[T.length - 1][1] : 50, next = T.filter(function (t) { return n < t[1]; })[0];
      el.style.setProperty('--fx-q', Math.min(1, n / max));
      var h = '<div class="fx-ln" aria-hidden="true"><i></i>' + T.map(function (t) { return '<em class="' + (n >= t[1] ? 'fx-got' : '') + '" style="left:' + t[1] / max * 100 + '%"><b>' + t[0] + '</b></em>'; }).join('') + '</div>';
      el.innerHTML = h + '<p><b>' + n + ' nuits</b> cette année. ' + (next ? 'Plus que ' + (next[1] - n) + ' nuits pour le niveau ' + next[0] : 'Niveau maximal atteint') + '</p>';
    }
  });

  // Une carte de piscine : on la touche, et l'eau répond
  FX.register('pool-card', {
    setup: function (el) {
      var T = U.num(el, 'fxTemp', 27), a = U.num(el, 'fxFrom', 8), b = U.num(el, 'fxTo', 20), h = new Date().getHours(), open = h >= a && h < b;
      el.innerHTML = '<div class="fx-pl5"><strong>' + T + ' °C</strong><span>' + (open ? 'Ouverte jusqu\'à ' + b + ' h' : 'Ouvre à ' + a + ' h') + '</span></div>';
      var p = el.firstChild;
      p.addEventListener('pointerdown', function (e) {
        if (U.reduced) return;
        var r = p.getBoundingClientRect(), w = U.make('i', '', p);
        w.style.left = (e.clientX - r.left) + 'px'; w.style.top = (e.clientY - r.top) + 'px';
        setTimeout(function () { w.remove(); }, 1200);
      });
    }
  });

  // L'heure du coucher de soleil calculée pour le lieu et le jour
  FX.register('sunset-bar', {
    setup: function (el) {
      var lat = U.num(el, 'fxLat', 43.3) * Math.PI / 180, lon = U.num(el, 'fxLon', 5.4), now = new Date(), start = new Date(now.getFullYear(), 0, 0), n = Math.floor((now - start) / 86400000), dec = -23.44 * Math.PI / 180 * Math.cos(2 * Math.PI / 365 * (n + 10)), ha = Math.acos(U.clamp((Math.sin(-.0145) - Math.sin(lat) * Math.sin(dec)) / (Math.cos(lat) * Math.cos(dec)), -1, 1)), set = 12 + ha * 12 / Math.PI - lon / 15 - now.getTimezoneOffset() / 60, h = Math.floor(set), m = Math.round((set - h) * 60), cur = now.getHours() + now.getMinutes() / 60, left = set - cur;
      el.style.setProperty('--fx-q', U.clamp(cur / 24, 0, 1)); el.style.setProperty('--fx-s', U.clamp(set / 24, 0, 1));
      el.innerHTML = '<div class="fx-sb2" aria-hidden="true"><i></i><u></u></div><p>Coucher du soleil vers <b>' + h + ' h ' + String(m).padStart(2, '0') + '</b><br>' + (left > 0 ? 'Dans ' + Math.floor(left) + ' h ' + String(Math.round(left % 1 * 60)).padStart(2, '0') : 'C\'est passé pour aujourd\'hui') + '</p>';
    }
  });

  // Combien de chambres restent, avec la date de la donnée
  FX.register('rooms-left', {
    setup: function (el) {
      var n = U.num(el, 'fxLeft', 4), t = U.num(el, 'fxTotal', 32), d = el.dataset.fxUpdated ? new Date(el.dataset.fxUpdated) : new Date(), box = U.make('div', 'fx-rl2', el), p = U.make('p', '', el);
      box.setAttribute('aria-hidden', 'true');
      for (var i = 0; i < t; i++) U.make('i', i < t - n ? 'fx-x' : '', box);
      p.innerHTML = '<b>' + n + ' chambre' + (n > 1 ? 's' : '') + '</b> sur ' + t + ' à ces dates<br><small>Mis à jour à ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) + '</small>';
    }
  });

  // Des avis résumés par critère, avec le point fort et le point faible
  FX.register('review-bars', {
    entrance: true,
    setup: function (el) {
      var R = (el.dataset.fxItems || 'Propreté:9.2|Accueil:9.5|Emplacement:8.8|Calme:7.4|Rapport qualité-prix:8.1').split('|').map(function (r) { var p = r.split(':'); return [p[0], +p[1]]; }), avg = R.reduce(function (a, b) { return a + b[1]; }, 0) / R.length, s = R.slice().sort(function (a, b) { return b[1] - a[1]; }), f = function (v) { return v.toFixed(1).replace('.', ','); };
      el.innerHTML = '<div class="fx-rb"><b>' + f(avg) + '</b><small>sur 10, ' + U.num(el, 'fxCount', 248) + ' avis fictifs</small></div><ul>' + R.map(function (r, i) { return '<li style="--fx-q:' + r[1] / 10 + ';--fx-i:' + i + '"><span>' + r[0] + '</span><i></i><em>' + f(r[1]) + '</em></li>'; }).join('') + '</ul><p>Point fort : ' + s[0][0].toLowerCase() + '. À noter : ' + s[s.length - 1][0].toLowerCase() + '.</p>';
    }
  });

  // Deux lits simples qui se rapprochent pour n'en faire qu'un
  FX.register('bed-merge', {
    setup: function (el) {
      el.innerHTML = '<div class="fx-bm2" aria-hidden="true"><i></i><i></i></div><button type="button" aria-pressed="false"></button><output aria-live="polite"></output>';
      var b = el.querySelector('button'), o = el.querySelector('output');
      var set = function (m) {
        b.setAttribute('aria-pressed', m);
        el.classList.toggle('fx-on', m);
        b.textContent = m ? 'Séparer les lits' : 'Rapprocher les lits';
        o.textContent = m ? 'Un grand lit, 180 × 200' : 'Deux lits simples, 90 × 200';
        el.dispatchEvent(new CustomEvent('fx:beds', { bubbles: true, detail: { merged: m } }));
      };
      b.addEventListener('click', function () { set(!el.classList.contains('fx-on')); });
      set(el.dataset.fxOn === 'true');
    },
    trigger: function (el) { el.querySelector('button').click(); }
  });

  // Un réveil demandé à la réception, avec le temps de sommeil qu'il reste
  FX.register('wakeup-call', {
    setup: function (el) {
      el.innerHTML = '<label>Réveil à <input type="time" value="' + (el.dataset.fxTime || '07:30') + '"></label><button type="button" aria-pressed="false">Programmer</button><output aria-live="polite"></output>';
      var i = el.querySelector('input'), b = el.querySelector('button'), o = el.querySelector('output');
      var calc = function () {
        var p = i.value.split(':'), now = new Date(), t = new Date(now);
        t.setHours(+p[0], +p[1], 0, 0);
        if (t <= now) t = new Date(+t + 86400000);
        var m = Math.round((t - now) / 60000);
        return Math.floor(m / 60) + ' h ' + String(m % 60).padStart(2, '0');
      };
      var show = function () {
        var on = b.getAttribute('aria-pressed') === 'true';
        el.classList.toggle('fx-on', on);
        b.textContent = on ? 'Annuler' : 'Programmer';
        o.textContent = on ? 'Réveil à ' + i.value + ', dans ' + calc() : 'Vous pourriez dormir ' + calc();
      };
      b.addEventListener('click', function () { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true'); show(); });
      i.addEventListener('input', show);
      show();
    }
  });

  // Une porte de chambre numérotée qui s'ouvre sur son image
  FX.register('door-reveal', {
    setup: function (el) {
      var n = el.dataset.fxNumber || '207';
      var d = U.make('span', 'fx-dr3', el);
      d.setAttribute('aria-hidden', 'true');
      d.innerHTML = '<b>' + n + '</b><i></i>';
      U.ensurePositioned(el);
      if (!el.hasAttribute('tabindex') && !/^(A|BUTTON)$/.test(el.tagName)) el.tabIndex = 0;
      el.addEventListener('click', function () { el.classList.toggle('fx-open'); });
    }
  });
})(window.FX);
