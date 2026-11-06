/* Pack 34 — Agriculture */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Un calendrier de cultures : ce qu'on sème et récolte ce mois-ci
  FX.register('crop-calendar', {
    entrance: true,
    setup: function (el) {
      var R = (el.dataset.fxItems || 'Tomate:3-5:7-9|Carotte:2-6:6-10|Courge:4-5:9-10|Ail:10-11:6-7|Blé:9-10:6-7').split('|').map(function (r) { var p = r.split(':'); return [p[0], p[1].split('-').map(Number), p[2].split('-').map(Number)]; }), now = new Date().getMonth() + 1, L = 'JFMAMJJASOND', h = '<span></span>', todo = [];
      L.split('').forEach(function (m, i) { h += '<b class="' + (i + 1 === now ? 'fx-now' : '') + '">' + m + '</b>'; });
      R.forEach(function (r, y) {
        h += '<span>' + r[0] + '</span>';
        for (var i = 1; i <= 12; i++) {
          var s = i >= r[1][0] && i <= r[1][1], c = i >= r[2][0] && i <= r[2][1];
          h += '<i class="' + (s ? 's' : c ? 'c' : '') + (i === now ? ' fx-now' : '') + '" style="--fx-i:' + (i + y) + '"></i>';
          if (i === now && s) todo.push('semer ' + r[0].toLowerCase());
          if (i === now && c) todo.push('récolter ' + r[0].toLowerCase());
        }
      });
      el.innerHTML = '<div class="fx-cc2" aria-hidden="true">' + h + '</div><p class="fx-cc2-l"><i class="s"></i> Semis <i class="c"></i> Récolte</p><p>' + (todo.length ? 'Ce mois-ci : ' + todo.join(', ') : 'Rien à faire ce mois-ci dans cet exemple') + '</p>';
    }
  });

  // Des parcelles dont les cultures tournent d'année en année
  FX.register('field-rotation', {
    setup: function (el) {
      var C = (el.dataset.fxItems || 'Blé:#d6b34a|Colza:#e6d928|Maïs:#e2a22e|Trèfle:#5aa35c').split('|').map(function (r) { return r.split(':'); }), box = U.make('div', 'fx-fr', el), cur = new Date().getFullYear();
      el.insertAdjacentHTML('beforeend', '<label>Année <input type="range" min="' + cur + '" max="' + (cur + 7) + '"></label><output aria-live="polite"></output>');
      C.forEach(function () { U.make('i', '', box); });
      var r = el.querySelector('input'), o = el.querySelector('output');
      r.value = cur;
      var go = function () {
        var y = +r.value - cur, names = [];
        Array.prototype.forEach.call(box.children, function (p, i) {
          var c = C[(i + y) % C.length];
          p.textContent = c[0]; p.style.background = c[1];
          names.push('parcelle ' + (i + 1) + ' : ' + c[0].toLowerCase());
        });
        o.textContent = r.value + ' · ' + names.join(', ');
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Une grille de capteurs : quelles zones ont besoin d'eau ?
  FX.register('moisture-grid', {
    setup: function (el) {
      var D = (el.dataset.fxData || '62,48,22,35,70,28,18,55,41,66,30,25').split(',').map(Number), th = U.num(el, 'fxMin', 35), box = U.make('div', 'fx-mg2', el), b = U.make('button', '', el), o = U.make('output', '', el);
      o.setAttribute('aria-live', 'polite');
      b.type = 'button'; b.textContent = 'Arroser les zones sèches';
      D.forEach(function (v, i) { var c = U.make('i', '', box); c.setAttribute('role', 'img'); });
      var show = function () {
        var dry = 0;
        Array.prototype.forEach.call(box.children, function (c, i) {
          var v = D[i];
          c.style.setProperty('--fx-q', v / 100);
          c.textContent = v;
          c.setAttribute('aria-label', 'Zone ' + (i + 1) + ', ' + v + ' %');
          c.classList.toggle('fx-dry', v < th);
          if (v < th) dry++;
        });
        o.textContent = dry ? dry + ' zones sous ' + th + ' %' : 'Sol bien hydraté partout';
        b.disabled = !dry;
      };
      b.addEventListener('click', function () {
        box.classList.add('fx-rain');
        D.forEach(function (v, i) { if (v < th) D[i] = th + U.rand(10, 24) | 0; });
        show();
        setTimeout(function () { box.classList.remove('fx-rain'); }, U.reduced ? 0 : 900);
      });
      show();
    }
  });

  // Un pluviomètre : la semaine de pluie face à la normale
  FX.register('rain-gauge', {
    entrance: true,
    setup: function (el) {
      var D = (el.dataset.fxData || '2,0,6,14,3,0,8').split(',').map(Number), norm = U.num(el, 'fxNormal', 22), tot = D.reduce(function (a, b) { return a + b; }, 0), max = Math.max(tot, norm) * 1.2, L = 'LMMJVSD', h = '';
      D.forEach(function (v, i) { h += '<span><i style="--fx-q:' + v / Math.max.apply(null, D) + ';--fx-i:' + i + '"></i><small>' + L[i] + '</small></span>'; });
      el.style.setProperty('--fx-t', tot / max); el.style.setProperty('--fx-n', norm / max);
      el.innerHTML = '<div class="fx-rg2" aria-hidden="true"><i></i><em></em></div><div class="fx-rg2-w" aria-hidden="true">' + h + '</div><p><b>' + tot + ' mm</b> cette semaine, ' + (tot >= norm ? '+' : '') + (tot - norm) + ' mm par rapport à la normale</p>';
    }
  });

  // Surface, rendement, prix : ce que donnera la récolte
  FX.register('harvest-yield', {
    setup: function (el) {
      var P = U.num(el, 'fxPrice', 230), R = [['Surface', 'a', 5, 200, 5, 40, 'ha'], ['Rendement', 'y', 20, 110, 5, 70, 'q/ha']], h = '';
      R.forEach(function (r) { h += '<label>' + r[0] + ' <b data-o="' + r[1] + '"></b><input data-k="' + r[1] + '" type="range" min="' + r[2] + '" max="' + r[3] + '" step="' + r[4] + '" value="' + r[5] + '"></label>'; });
      el.innerHTML = h + '<div class="fx-hy" aria-hidden="true"></div><output aria-live="polite"></output><small>Prix d\'exemple : ' + P + ' €/t.</small>';
      var box = el.querySelector('.fx-hy'), o = el.querySelector('output');
      for (var i = 0; i < 30; i++) U.make('i', '', box).style.setProperty('--fx-i', i);
      var g = function (k) { return +el.querySelector('[data-k=' + k + ']').value; };
      var go = function () {
        var a = g('a'), y = g('y'), t = a * y / 10;
        el.querySelector('[data-o=a]').textContent = a + ' ha'; el.querySelector('[data-o=y]').textContent = y + ' q/ha';
        var n = Math.round(Math.min(1, t / 800) * 30);
        Array.prototype.forEach.call(box.children, function (e, i) { e.classList.toggle('fx-on', i < n); });
        o.innerHTML = '<b>' + Math.round(t).toLocaleString('fr-FR') + ' t</b> · environ ' + Math.round(t * P).toLocaleString('fr-FR') + ' €';
      };
      el.addEventListener('input', go);
      go();
    }
  });

  // Un tracteur traverse le titre et le fait apparaître dans ses sillons
  FX.register('tractor-plow', {
    entrance: true,
    setup: function (el) {
      var t = el.innerHTML;
      el.innerHTML = '<span class="fx-tw" aria-hidden="true">' + t + '</span><span class="fx-tw-s">' + t + '</span><i class="fx-tw-t" aria-hidden="true"><b></b><u></u></i>';
      U.ensurePositioned(el);
    }
  });

  // Du grain à la plante : faire avancer les jours
  FX.register('sprout-stages', {
    setup: function (el) {
      var S = (el.dataset.fxItems || '0:Graine|7:Germination|14:Plantule|30:Croissance|60:Fleur|80:Récolte').split('|').map(function (r) { var p = r.split(':'); return [+p[0], p[1]]; });
      el.innerHTML = '<svg viewBox="0 0 80 100" aria-hidden="true"><rect x="0" y="74" width="80" height="26"/><ellipse class="seed" cx="40" cy="80" rx="5" ry="3.5"/><path class="st" d="M40 78V74"/><path class="l l1" d="M40 58C30 56 26 50 26 46C34 46 40 52 40 58Z"/><path class="l l2" d="M40 46C50 44 54 38 54 34C46 34 40 40 40 46Z"/><circle class="fl" cx="40" cy="16" r="9"/></svg><label>Jour <b></b><input type="range" min="0" max="' + S[S.length - 1][0] + '"></label><output aria-live="polite"></output>';
      var r = el.querySelector('input'), o = el.querySelector('output'), st = el.querySelector('.st');
      r.value = U.num(el, 'fxDay', 18);
      var go = function () {
        var d = +r.value, k = 0, q = d / S[S.length - 1][0];
        S.forEach(function (s, i) { if (d >= s[0]) k = i; });
        st.setAttribute('d', 'M40 78V' + (74 - q * 56).toFixed(1));
        el.dataset.fxK = k;
        el.querySelector('label b').textContent = d;
        o.textContent = S[k][1];
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Composer son panier de saison, avec le poids de ce qu'on y met
  FX.register('veg-basket', {
    setup: function (el) {
      var P = (el.dataset.fxItems || 'Carottes:1:2.5|Poireaux:1:3|Courge:1.5:3.2|Pommes:1:2.8|Œufs:0.4:2.6').split('|').map(function (r) { var p = r.split(':'); return { n: p[0], w: +p[1], e: +p[2], q: 0 }; }), max = U.num(el, 'fxMax', 5), ul = U.make('ul', '', el), v = U.make('div', 'fx-vb', el), o = U.make('output', '', el);
      v.setAttribute('aria-hidden', 'true');
      o.setAttribute('aria-live', 'polite');
      var show = function () {
        var w = 0, e = 0;
        P.forEach(function (p) { w += p.w * p.q; e += p.e * p.q; p.t.textContent = p.q; p.b.disabled = !p.q; });
        el.style.setProperty('--fx-q', Math.min(1, w / max));
        el.classList.toggle('fx-full', w > max);
        o.innerHTML = '<b>' + e.toFixed(2).replace('.', ',') + ' €</b> · ' + String(w.toFixed(1)).replace('.', ',') + ' kg sur ' + max + ' kg' + (w > max ? ' : panier trop lourd' : '');
      };
      P.forEach(function (p) {
        var li = U.make('li', '', ul);
        li.innerHTML = '<span>' + p.n + '</span><button type="button" aria-label="Retirer ' + p.n + '">−</button><b></b><button type="button" aria-label="Ajouter ' + p.n + '">+</button>';
        var B = li.querySelectorAll('button');
        p.t = li.querySelector('b'); p.b = B[0];
        B[0].addEventListener('click', function () { p.q--; show(); });
        B[1].addEventListener('click', function () { p.q++; show(); });
      });
      show();
    }
  });

  // La distance parcourue par un aliment : à côté ou depuis l'autre bout du monde
  FX.register('food-miles', {
    entrance: true,
    setup: function (el) {
      var R = (el.dataset.fxItems || 'Ferme voisine:35:0.1|Région:220:0.25|Espagne:1500:0.9|Autre continent:9800:3.2').split('|').map(function (r) { var p = r.split(':'); return [p[0], +p[1], +p[2]]; }), max = Math.max.apply(null, R.map(function (r) { return r[1]; })), ul = U.make('ul', '', el);
      R.forEach(function (r, i) {
        var li = U.make('li', '', ul);
        li.style.setProperty('--fx-q', Math.max(.015, Math.log(r[1] + 1) / Math.log(max + 1)));
        li.style.setProperty('--fx-i', i);
        li.innerHTML = '<span>' + r[0] + '</span><i></i><b>' + r[1].toLocaleString('fr-FR') + ' km</b><small>' + String(r[2]).replace('.', ',') + ' kg CO₂</small>';
      });
      U.make('p', '', el).textContent = 'Valeurs fictives. Échelle logarithmique : les grandes distances sont compressées.';
    }
  });

  // Descendre dans le sol pour lire chacune de ses couches
  FX.register('soil-layers', {
    setup: function (el) {
      var L = (el.dataset.fxItems || 'Litière:5:#3a2a18:Feuilles et débris|Humus:25:#2c1c0f:Riche en vers de terre|Terre arable:45:#6b4a2d:Racines des cultures|Sous-sol:80:#a77c4e:Argile et minéraux|Roche:120:#7b7b78:Roche mère').split('|').map(function (r) { return r.split(':'); }), max = 120;
      el.innerHTML = '<div class="fx-sl2" aria-hidden="true"><u></u></div><label>Profondeur <b></b><input type="range" min="0" max="' + max + '" step="5"></label><output aria-live="polite"></output>';
      var box = el.firstChild, r = el.querySelector('input'), o = el.querySelector('output'), prev = 0;
      L.forEach(function (l) { var i = U.make('i', '', box); i.style.flex = (l[1] - prev) + ' 1 0'; i.style.background = l[2]; prev = +l[1]; });
      r.value = U.num(el, 'fxDepth', 30);
      var go = function () {
        var d = +r.value, cur = L.filter(function (l) { return d <= +l[1]; })[0] || L[L.length - 1];
        box.style.setProperty('--fx-q', d / max);
        el.querySelector('label b').textContent = d + ' cm';
        o.innerHTML = '<b>' + cur[0] + '</b><br>' + cur[3];
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Un pH de sol : la couleur et les plantes qui s'y plaisent
  FX.register('ph-meter', {
    setup: function (el) {
      var C = (el.dataset.fxItems || 'Myrtille:4.5:5.5|Pomme de terre:5:6|Tomate:6:6.8|Carotte:6:7|Chou:6.5:7.5|Lavande:6.5:8').split('|').map(function (r) { var p = r.split(':'); return [p[0], +p[1], +p[2]]; });
      el.innerHTML = '<div class="fx-ph" aria-hidden="true"><i></i></div><label>pH <input type="range" min="4" max="9" step=".1"></label><output aria-live="polite"></output>';
      var r = el.querySelector('input'), o = el.querySelector('output');
      r.value = U.num(el, 'fxValue', 6.4);
      var go = function () {
        var v = +r.value, ok = C.filter(function (c) { return v >= c[1] && v <= c[2]; }).map(function (c) { return c[0]; }), w = v < 6 ? 'Sol acide' : v > 7.5 ? 'Sol basique' : 'Sol neutre';
        el.style.setProperty('--fx-q', (v - 4) / 5);
        o.innerHTML = '<b>' + String(v.toFixed(1)).replace('.', ',') + ' · ' + w + '</b><br>' + (ok.length ? ok.join(', ') : 'Peu de cultures de cet exemple');
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Un rayon de ruche qui se remplit de miel, alvéole par alvéole
  FX.register('honeycomb-fill', {
    entrance: true,
    setup: function (el) {
      var R = U.num(el, 'fxRows', 5), C = U.num(el, 'fxCols', 6), v = U.num(el, 'fxValue', 64), box = U.make('div', 'fx-hc2', el), A = [];
      box.setAttribute('aria-hidden', 'true');
      for (var y = 0; y < R; y++) {
        var row = U.make('div', y % 2 ? 'fx-odd' : '', box);
        for (var x = 0; x < C; x++) { var c = U.make('i', '', row); A.push({ e: c, d: Math.hypot(x - C / 2, y - R / 2) }); }
      }
      A.sort(function (a, b) { return a.d - b.d; });
      var n = Math.round(A.length * v / 100);
      A.forEach(function (a, i) { a.e.style.setProperty('--fx-i', i); if (i < n) a.e.classList.add('fx-on'); });
      var o = U.make('p', '', el);
      o.textContent = el.dataset.fxText || v + ' % de la récolte';
    }
  });

  // Un troupeau qui rentre à l'enclos d'un geste
  FX.register('flock-gather', {
    setup: function (el) {
      var n = U.num(el, 'fxCount', 22), box = U.make('div', 'fx-fg', el), b = U.make('button', '', el), S = [];
      box.setAttribute('aria-hidden', 'true');
      U.make('em', '', box);
      for (var i = 0; i < n; i++) { var s = U.make('i', '', box); S.push({ e: s, x: U.rand(5, 92), y: U.rand(10, 86), h: U.rand(0, 6.28) }); }
      b.type = 'button'; b.textContent = 'Rentrer le troupeau'; b.setAttribute('aria-pressed', 'false');
      el._fxIn = false;
      b.addEventListener('click', function () { el._fxIn = !el._fxIn; b.setAttribute('aria-pressed', el._fxIn); b.textContent = el._fxIn ? 'Sortir le troupeau' : 'Rentrer le troupeau'; });
      el._fxS = S;
      el._fxDraw = function (dt) {
        S.forEach(function (s, i) {
          if (el._fxIn) { var tx = 78 + (i % 5) * 4, ty = 66 + (i % 4) * 7; s.x += (tx - s.x) * dt * 2; s.y += (ty - s.y) * dt * 2; }
          else { s.h += U.rand(-.5, .5) * dt * 3; s.x = U.clamp(s.x + Math.cos(s.h) * dt * 3, 3, 96); s.y = U.clamp(s.y + Math.sin(s.h) * dt * 3, 8, 90); }
          s.e.style.left = s.x + '%'; s.e.style.top = s.y + '%';
        });
      };
      el._fxDraw(0);
    },
    tick: function (el, dt) { if (!U.reduced) el._fxDraw(dt); else el._fxDraw(0); },
    trigger: function (el) { el.querySelector('button').click(); }
  });

  // Un verger qui pousse rang après rang
  FX.register('orchard-grow', {
    entrance: true,
    setup: function (el) {
      var C = U.num(el, 'fxCols', 8), R = U.num(el, 'fxRows', 4), v = U.num(el, 'fxValue', 0) || C * R, box = U.make('div', 'fx-og', el);
      box.style.setProperty('--fx-c', C);
      box.setAttribute('aria-hidden', 'true');
      for (var y = 0; y < R; y++) for (var x = 0; x < C; x++) {
        var t = U.make('i', '', box);
        t.style.setProperty('--fx-i', x + y * 1.5);
        t.style.setProperty('--fx-s', U.rand(.78, 1.05).toFixed(2));
      }
      U.make('p', '', el).textContent = el.dataset.fxText || v + ' arbres plantés';
    }
  });

  // Les prochaines nuits : y a-t-il un risque de gel ?
  FX.register('frost-alert', {
    setup: function (el) {
      var D = (el.dataset.fxData || '4,2,-1,-3,0,3,5').split(',').map(Number), th = U.num(el, 'fxMin', 0), box = U.make('div', 'fx-fa', el), cold = [], now = Date.now();
      D.forEach(function (v, i) {
        var d = new Date(now + i * 86400000), c = U.make('div', v < th ? 'fx-f' : '', box);
        c.innerHTML = '<small>' + d.toLocaleDateString('fr-FR', { weekday: 'short' }) + '</small><b>' + v + '°</b><i aria-hidden="true"></i>';
        c.style.setProperty('--fx-i', i);
        if (v < th) cold.push(v);
      });
      var o = U.make('p', '', el);
      o.setAttribute('role', cold.length ? 'alert' : 'status');
      o.textContent = cold.length ? cold.length + ' nuits sous ' + th + ' °C, jusqu\'à ' + Math.min.apply(null, cold) + ' °C : protégez les jeunes plants.' : 'Pas de gel annoncé.';
      U.make('small', '', el).textContent = 'Prévisions fictives';
    }
  });

  // Des degrés qui s'accumulent jusqu'à la récolte
  FX.register('degree-days', {
    entrance: true,
    setup: function (el) {
      var base = U.num(el, 'fxBase', 10), need = U.num(el, 'fxNeed', 2200), D = (el.dataset.fxData || '14,17,20,23,24,26,27,26,24,20').split(',').map(Number), per = 15, tot = 0, h = '';
      D.forEach(function (t, i) { var g = Math.max(0, t - base) * per; tot += g; h += '<i style="--fx-q:' + Math.min(1, tot / need) + ';--fx-i:' + i + '"></i>'; });
      var last = Math.max(1, D[D.length - 1] - base), left = Math.max(0, need - tot), d = new Date(Date.now() + left / last * 86400000);
      el.innerHTML = '<div class="fx-dd2" aria-hidden="true">' + h + '</div><p><b>' + Math.round(tot) + '</b> degrés-jours sur ' + need + '<br>' + (left ? 'Récolte estimée vers le ' + d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) : 'Maturité atteinte') + '</p>';
    }
  });

  // Un champ de blé qui ondule au vent et s'écarte sous le pointeur
  FX.register('wheat-field', {
    setup: function (el) {
      var c = U.make('canvas', '', el), x, W, H, S = [], mx = -999;
      el.setAttribute('aria-hidden', 'true');
      var size = function () {
        var r = el.getBoundingClientRect(), d = window.devicePixelRatio || 1;
        W = r.width; H = r.height; c.width = W * d; c.height = H * d;
        x = c.getContext('2d'); x.scale(d, d); S = [];
        for (var i = 0; i < Math.round(W / 2.4); i++) S.push({ x: U.rand(0, W), h: U.rand(H * .5, H * .9), t: U.rand(0, 6) });
        S.sort(function (a, b) { return a.h - b.h; });
      };
      size(); U.onResize(size);
      el.addEventListener('pointermove', function (e) { mx = e.clientX - el.getBoundingClientRect().left; });
      el.addEventListener('pointerleave', function () { mx = -999; });
      el._fxDraw = function (t) {
        x.clearRect(0, 0, W, H);
        S.forEach(function (s) {
          var l = Math.sin(s.x * .03 + t * 1.6 + s.t * .1) * 9, dx = s.x - mx;
          if (Math.abs(dx) < 34) l += (dx > 0 ? 1 : -1) * (34 - Math.abs(dx)) * .55;
          var top = H - s.h, c1 = s.x + l * .4;
          x.strokeStyle = '#c2a03f'; x.lineWidth = 1.1;
          x.beginPath(); x.moveTo(s.x, H); x.quadraticCurveTo(c1, top + s.h * .4, s.x + l, top); x.stroke();
          x.fillStyle = '#e5c66a';
          x.beginPath(); x.ellipse(s.x + l, top - 3, 1.8, 5, l * .03, 0, 6.3); x.fill();
        });
      };
      el._fxDraw(0);
    },
    tick: function (el, dt, t) { if (!U.reduced) el._fxDraw(t); }
  });

  // Des oiseaux posés qui s'envolent quand on approche
  FX.register('crow-scatter', {
    setup: function (el) {
      var n = U.num(el, 'fxCount', 9), box = U.make('div', 'fx-cw2', el), B = [];
      box.setAttribute('aria-hidden', 'true');
      U.make('em', '', box);
      for (var i = 0; i < n; i++) {
        var o = U.make('i', '', box);
        o.style.left = (i + .5) / n * 100 + '%';
        o.style.setProperty('--fx-x', U.rand(-90, 90) + 'px');
        o.style.setProperty('--fx-y', U.rand(-140, -70) + 'px');
        o.style.setProperty('--fx-d', U.rand(0, 140).toFixed(0) + 'ms');
        B.push(o);
      }
      var fly = function () {
        el.classList.add('fx-fly');
        clearTimeout(el._fxTo);
        el._fxTo = setTimeout(function () { el.classList.remove('fx-fly'); }, U.num(el, 'fxBack', 2400));
      };
      box.addEventListener('pointerenter', fly);
      el._fxFly = fly;
    },
    trigger: function (el) { el._fxFly(); }
  });

  // Une ardoise de marché qui s'écrit à la craie
  FX.register('chalk-board', {
    entrance: true,
    setup: function (el) {
      var R = (el.dataset.fxItems || 'Pommes:2,80 €|Carottes:1,90 €|Miel:9,50 €').split('|').map(function (r) { var k = r.lastIndexOf(':'); return [r.slice(0, k), r.slice(k + 1)]; }), box = U.make('div', 'fx-cb3', el), n = 0, wrap = function (t) { return t.split('').map(function (c) { return '<span style="--fx-i:' + n++ + '">' + (c === ' ' ? '&nbsp;' : c) + '</span>'; }).join(''); };
      if (el.dataset.fxTitle) { var T = U.make('h4', '', box); T.innerHTML = wrap(el.dataset.fxTitle); }
      R.forEach(function (r) { var d = U.make('div', 'fx-cb3-r', box); d.innerHTML = '<span>' + wrap(r[0]) + '</span><span>' + wrap(r[1]) + '</span>'; d.setAttribute('aria-label', r[0] + ', ' + r[1]); });
      el.style.setProperty('--fx-pace', U.num(el, 'fxPace', 34) + 'ms');
    }
  });

  // Un composteur : le bon mélange de brun et de vert
  FX.register('compost-ratio', {
    setup: function (el) {
      var G = 3, B = 3;
      el.innerHTML = '<div class="fx-cm" aria-hidden="true"></div><div class="fx-cm-c"><button type="button" class="g">+ Vert (épluchures)</button><button type="button" class="b">+ Brun (carton)</button><button type="button" class="r">Vider</button></div><output aria-live="polite"></output>';
      var box = el.querySelector('.fx-cm'), o = el.querySelector('output');
      var add = function (cls) { var l = U.make('i', cls, box); l.style.width = U.rand(82, 100) + '%'; };
      var show = function () {
        var q = B / Math.max(1, G), W = q < 1 ? 'Trop humide : ajoutez du brun' : q > 2.5 ? 'Trop sec : ajoutez du vert' : 'Bon équilibre';
        el.classList.toggle('fx-ok', q >= 1 && q <= 2.5);
        o.innerHTML = '<b>' + G + ' vert · ' + B + ' brun</b><br>' + W;
      };
      el.querySelector('.g').addEventListener('click', function () { G++; add('v'); show(); });
      el.querySelector('.b').addEventListener('click', function () { B++; add('w'); show(); });
      el.querySelector('.r').addEventListener('click', function () { G = 0; B = 0; box.innerHTML = ''; show(); });
      for (var i = 0; i < 6; i++) add(i % 2 ? 'w' : 'v');
      show();
    }
  });

  // Une serre : plus il fait chaud, plus les vantaux s'ouvrent
  FX.register('greenhouse-vent', {
    setup: function (el) {
      var aim = U.num(el, 'fxAim', 24);
      el.innerHTML = '<svg viewBox="0 0 120 80" aria-hidden="true"><path class="w" d="M10 76V40L60 10L110 40V76Z"/><path class="fx-gv-a" d="M60 10L34 25.6"/><path class="fx-gv-b" d="M60 10L86 25.6"/></svg><label>Dedans <b></b><input type="range" min="10" max="42"></label><output aria-live="polite"></output>';
      var r = el.querySelector('input'), o = el.querySelector('output');
      r.value = U.num(el, 'fxTemp', 30);
      var go = function () {
        var t = +r.value, q = U.clamp((t - aim) / 12, 0, 1);
        el.style.setProperty('--fx-a', q * 42 + 'deg'); el.style.setProperty('--fx-b', -q * 42 + 'deg');
        el.style.setProperty('--fx-h', 210 - U.clamp((t - 10) / 32, 0, 1) * 210);
        el.querySelector('label b').textContent = t + ' °C';
        o.innerHTML = '<b>Vantaux à ' + Math.round(q * 100) + ' %</b>, consigne ' + aim + ' °C';
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Un sachet de graines qui se retourne pour montrer ses conseils
  FX.register('seed-packet', {
    setup: function (el) {
      var n = el.dataset.fxName || 'Radis rose', I = (el.dataset.fxItems || 'Semis:mars à août|Profondeur:1 cm|Récolte:4 semaines').split('|').map(function (r) { return r.split(':'); });
      el.innerHTML = '<button type="button" aria-pressed="false" aria-label="Voir les conseils de ' + n + '"><span class="fx-sp-c"><span class="fx-sp-f"><i></i><b>' + n + '</b></span><span class="fx-sp-b">' + I.map(function (x) { return '<em><u>' + x[0] + '</u>' + x[1] + '</em>'; }).join('') + '</span></span></button>';
      var b = el.firstChild;
      b.addEventListener('click', function () { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true'); });
    },
    trigger: function (el) { el.firstChild.click(); }
  });

  // Les jours favorables pour semer, selon les prévisions
  FX.register('sow-window', {
    setup: function (el) {
      var D = (el.dataset.fxData || '12:8|15:0|16:1|9:6|14:0|17:0|13:12').split('|').map(function (r) { return r.split(':').map(Number); }), box = U.make('div', 'fx-so2', el), best = [];
      D.forEach(function (d, i) {
        var day = new Date(Date.now() + i * 86400000), good = d[0] >= 12 && d[1] <= 2, c = U.make('div', good ? 'fx-good' : '', box), label = day.toLocaleDateString('fr-FR', { weekday: 'short' });
        c.style.setProperty('--fx-i', i);
        c.innerHTML = '<small>' + label + '</small><b>' + d[0] + '°</b><i>' + d[1] + ' mm</i>';
        if (good) best.push(label);
      });
      U.make('p', '', el).innerHTML = best.length ? 'À semer : <b>' + best.join(', ') + '</b>' : 'Pas de bonne fenêtre cette semaine';
      U.make('small', 'fx-so2-n', el).textContent = 'Prévisions fictives. Règle : 12 °C ou plus, 2 mm de pluie au plus.';
    }
  });

  // Azote, phosphore, potassium : où se situe l'engrais
  FX.register('npk-triangle', {
    setup: function (el) {
      var V = [U.num(el, 'fxN', 10), U.num(el, 'fxP', 5), U.num(el, 'fxK', 15)], N = ['N azote', 'P phosphore', 'K potassium'], h = '';
      N.forEach(function (n, i) { h += '<label>' + n + ' <b data-o="' + i + '"></b><input data-i="' + i + '" type="range" min="0" max="30" value="' + V[i] + '"></label>'; });
      el.innerHTML = '<svg viewBox="0 0 120 108" aria-hidden="true"><path d="M60 6 114 100H6Z"/><circle r="6"/><text x="60" y="4">N</text><text x="2" y="108">P</text><text x="118" y="108">K</text></svg><div class="fx-np">' + h + '</div><output aria-live="polite"></output>';
      var c = el.querySelector('circle'), o = el.querySelector('output');
      var go = function () {
        V = Array.prototype.map.call(el.querySelectorAll('input'), function (i) { return +i.value; });
        var t = V[0] + V[1] + V[2] || 1, a = V[0] / t, b = V[1] / t, k = V[2] / t;
        c.setAttribute('cx', a * 60 + b * 6 + k * 114);
        c.setAttribute('cy', a * 6 + b * 100 + k * 100);
        V.forEach(function (v, i) { el.querySelector('[data-o="' + i + '"]').textContent = v; });
        var top = V.indexOf(Math.max.apply(null, V));
        o.innerHTML = '<b>' + V.join('-') + '</b> · ' + ['pousse des feuilles', 'racines et floraison', 'fruits et résistance'][top];
      };
      el.addEventListener('input', go);
      go();
    }
  });
})(window.FX);
