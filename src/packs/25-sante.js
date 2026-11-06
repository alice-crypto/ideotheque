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

  // Un résultat d'analyse placé sur sa plage de référence
  FX.register('lab-range', {
    entrance: true,
    setup: function (el) {
      var v = U.num(el, 'fxValue', 5.8), lo = U.num(el, 'fxLo', 4), hi = U.num(el, 'fxHi', 5.6), u = el.dataset.fxUnit || 'mmol/L', name = el.dataset.fxName || 'Analyse fictive';
      var span = hi - lo, a = lo - span * .6, b = hi + span * .6, q = U.clamp((v - a) / (b - a), 0, 1);
      var st = v < lo ? 'Sous la plage' : v > hi ? 'Au-dessus de la plage' : 'Dans la plage';
      var f = function (n) { return String(n).replace('.', ','); };
      el.innerHTML = '<div class="fx-lr-h"><b>' + name + '</b><strong>' + f(v) + ' ' + u + '</strong></div><div class="fx-lr" aria-hidden="true"><em style="left:' + (lo - a) / (b - a) * 100 + '%;width:' + span / (b - a) * 100 + '%"></em><i style="--fx-q:' + q + '"></i></div><div class="fx-lr-f"><span>Référence ' + f(lo) + ' – ' + f(hi) + '</span><span class="fx-st">' + st + '</span></div>';
      el.classList.toggle('fx-out', v < lo || v > hi);
    }
  });

  // Une nuit en marches d'escalier, avec le temps de chaque stade
  FX.register('sleep-stages', {
    entrance: true,
    setup: function (el) {
      var S = ['Éveil', 'Léger', 'Profond', 'Paradoxal'], Y = [8, 44, 80, 26];
      var d = (el.dataset.fxData || '0:10,1:40,2:50,1:25,3:20,1:40,2:30,1:30,3:35,1:40,3:30,0:8').split(',').map(function (r) { return r.split(':').map(Number); });
      var tot = d.reduce(function (t, r) { return t + r[1]; }, 0), t = 0, p = '', sum = [0, 0, 0, 0];
      d.forEach(function (r, i) { var x = t / tot * 200, y = Y[r[0]]; p += (i ? 'L' + x.toFixed(1) + ' ' + y : 'M0 ' + y) + 'L' + ((t + r[1]) / tot * 200).toFixed(1) + ' ' + y; t += r[1]; sum[r[0]] += r[1]; });
      var fm = function (m) { return Math.floor(m / 60) + ' h ' + String(m % 60).padStart(2, '0'); };
      el.innerHTML = '<svg viewBox="0 0 200 90" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="' + p + '"/></svg><ul>' + S.map(function (n, i) { return '<li><span>' + n + '</span><b>' + fm(sum[i]) + '</b></li>'; }).join('') + '</ul><p>Nuit fictive de ' + fm(tot) + '</p>';
    }
  });

  // Une semaine de pas, face à la ligne de l'objectif
  FX.register('steps-week-goal', {
    entrance: true,
    setup: function (el) {
      var d = (el.dataset.fxData || '6400,8200,10400,5300,9100,12800,7600').split(',').map(Number), goal = U.num(el, 'fxGoal', 8000), max = Math.max.apply(null, d.concat(goal)), L = 'LMMJVSD', hits = d.filter(function (v) { return v >= goal; }).length;
      var h = '<div class="fx-sw" style="--fx-g:' + goal / max + '"><em aria-hidden="true"></em>';
      d.forEach(function (v, i) { h += '<span class="' + (v >= goal ? 'fx-ok' : '') + '" title="' + v + ' pas" style="--fx-q:' + v / max + ';--fx-i:' + i + '"><i></i><small>' + L[i % 7] + '</small></span>'; });
      el.innerHTML = h + '</div><p>' + hits + ' jours sur ' + d.length + ' au-dessus de ' + goal.toLocaleString('fr-FR') + ' pas</p>';
    }
  });

  // Un temps d'attente clair, avec l'heure de sa mise à jour
  FX.register('er-wait', {
    setup: function (el) {
      var m = U.num(el, 'fxMinutes', 45), lvl = m < 30 ? 0 : m < 90 ? 1 : 2, names = ['Attente faible', 'Attente moyenne', 'Attente longue'], d = new Date();
      el.dataset.fxLevel = lvl;
      el.innerHTML = '<div class="fx-ew" aria-hidden="true"><i></i><i></i><i></i></div><strong>' + (m >= 60 ? Math.floor(m / 60) + ' h ' + String(m % 60).padStart(2, '0') : m + ' min') + '</strong><span>' + names[lvl] + '</span><small>Estimation mise à jour à ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) + '</small><small class="fx-ew-u">En cas d\'urgence vitale, appelez le 15 ou le 112.</small>';
    }
  });

  // Des questions oui ou non qui orientent vers le bon interlocuteur
  FX.register('triage-flow', {
    setup: function (el) {
      var T = el.dataset.fxTree ? JSON.parse(el.dataset.fxTree) : { q: 'Danger immédiat ?', y: { r: 'Appelez le 15 ou le 112.', u: 1 }, n: { q: 'Le problème est apparu aujourd\'hui ?', y: { r: 'Contactez votre médecin aujourd\'hui.' }, n: { r: 'Prenez rendez-vous cette semaine.' } } };
      var hist = [], cur = T;
      var box = U.make('div', 'fx-tf', el);
      box.setAttribute('aria-live', 'polite');
      var show = function () {
        box.innerHTML = '';
        box.className = 'fx-tf' + (cur.u ? ' fx-u' : '');
        U.make('p', '', box).textContent = cur.q || cur.r;
        if (cur.q) ['y', 'n'].forEach(function (k) {
          var b = U.make('button', '', box);
          b.type = 'button'; b.textContent = k === 'y' ? 'Oui' : 'Non';
          b.addEventListener('click', function () { hist.push(cur); cur = cur[k]; show(); });
        });
        if (hist.length) {
          var bk = U.make('button', 'fx-tf-b', box);
          bk.type = 'button'; bk.textContent = 'Revenir';
          bk.addEventListener('click', function () { cur = hist.pop(); show(); });
        }
      };
      show();
    }
  });

  // Une équipe en pile de pastilles qui s'écarte pour se présenter
  FX.register('care-team', {
    setup: function (el) {
      var rows = (el.dataset.fxItems || 'Camille Roy:Médecin traitant|Sam Lefort:Infirmier·e|Noa Petit:Kinésithérapeute|Inès Faure:Diététicienne').split('|');
      var ul = U.make('ul', '', el), note = U.make('output', '', el);
      note.setAttribute('aria-live', 'polite');
      note.textContent = rows.length + ' personnes vous suivent';
      rows.forEach(function (r, i) {
        var p = r.split(':'), h = 0, li = U.make('li', '', ul), b = U.make('button', '', li);
        for (var k = 0; k < p[0].length; k++) h = (h * 17 + p[0].charCodeAt(k)) % 360;
        b.type = 'button'; b.style.setProperty('--fx-h', h); b.style.setProperty('--fx-i', i);
        b.textContent = p[0].split(' ').map(function (s) { return s[0]; }).join('');
        b.setAttribute('aria-label', p[0] + ', ' + p[1]);
        var say = function () { note.innerHTML = '<b>' + p[0] + '</b> · ' + p[1]; };
        b.addEventListener('mouseenter', say); b.addEventListener('focus', say); b.addEventListener('click', say);
      });
    }
  });

  // Avant une consultation à distance : le navigateur est-il prêt ?
  FX.register('device-check', {
    entrance: true,
    setup: function (el) {
      var C = [['Connexion', function () { return navigator.onLine !== false; }], ['Caméra et micro pris en charge', function () { return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia); }], ['Connexion sécurisée', function () { return window.isSecureContext; }]];
      var ul = U.make('ul', '', el), out = U.make('output', '', el);
      out.setAttribute('aria-live', 'polite');
      var run = function () {
        ul.innerHTML = ''; out.textContent = 'Vérification…'; el.classList.remove('fx-ok', 'fx-ko');
        var ok = 0;
        C.forEach(function (c, i) {
          var li = U.make('li', 'fx-wait', ul);
          li.innerHTML = '<i aria-hidden="true"></i>' + c[0];
          setTimeout(function () {
            var good = c[1]();
            ok += good ? 1 : 0;
            li.className = good ? 'fx-yes' : 'fx-no';
            li.appendChild(document.createTextNode(good ? ' : oui' : ' : non'));
            if (i === C.length - 1) { el.classList.add(ok === C.length ? 'fx-ok' : 'fx-ko'); out.textContent = ok === C.length ? 'Tout est prêt' : 'Un point à régler'; }
          }, U.reduced ? 0 : 500 * (i + 1));
        });
      };
      el._fxRun = run;
      run();
    },
    trigger: function (el) { el._fxRun(); }
  });

  // Des rendez-vous de santé par âge, situés depuis une date de naissance
  FX.register('vaccine-calendar', {
    entrance: true,
    setup: function (el) {
      var rows = (el.dataset.fxItems || '2 mois:2|4 mois:4|11 mois:11|6 ans:72|11 ans:132').split('|'), born = el.dataset.fxBorn ? new Date(el.dataset.fxBorn) : new Date(Date.now() - 86400000 * 30.4 * 10);
      var age = (Date.now() - born) / (86400000 * 30.4), ol = U.make('ol', '', el), done = false;
      rows.forEach(function (r, i) {
        var p = r.split(':'), m = +p[1], li = U.make('li', '', ol), past = age >= m, next = !past && !done;
        if (next) done = true;
        li.className = past ? 'fx-past' : next ? 'fx-next' : '';
        li.style.setProperty('--fx-i', i);
        li.innerHTML = '<b>' + p[0] + '</b><span>' + (past ? 'Date passée' : next ? 'Prochain, dans ' + Math.ceil(m - age) + ' mois' : 'Plus tard') + '</span>';
        if (next) li.setAttribute('aria-current', 'date');
      });
      U.make('small', '', el).textContent = 'Exemple fictif : suivez le calendrier officiel.';
    }
  });

  // Un anneau du cycle, avec le jour en cours et sa phase
  FX.register('cycle-ring', {
    entrance: true,
    setup: function (el) {
      var len = U.num(el, 'fxLength', 28), start = el.dataset.fxStart ? new Date(el.dataset.fxStart) : new Date(Date.now() - 86400000 * 11), day = ((Math.floor((Date.now() - start) / 86400000)) % len + len) % len + 1;
      var ph = [['Règles', 5], ['Folliculaire', 8], ['Ovulation', 3], ['Lutéale', len - 16]], s = '<svg viewBox="0 0 100 100" aria-hidden="true">', t = 0, cur = '';
      ph.forEach(function (p, i) {
        var c = 2 * Math.PI * 40;
        s += '<circle class="p' + i + '" cx="50" cy="50" r="40" stroke-dasharray="' + (p[1] / len * c - 1) + ' ' + c + '" stroke-dashoffset="' + -t / len * c + '"/>';
        if (day > t && day <= t + p[1]) cur = p[0];
        t += p[1];
      });
      var a = (day - .5) / len * 360;
      s += '<circle class="fx-dot" cx="90" cy="50" r="5" style="--fx-a:' + a + 'deg"/></svg><div><b>Jour ' + day + '</b><span>' + cur + '</span></div>';
      el.innerHTML = s;
      U.make('small', '', el).textContent = 'Repères moyens, pas une contraception';
    }
  });

  // Une frise de grossesse, semaine après semaine
  FX.register('pregnancy-week', {
    setup: function (el) {
      el.innerHTML = '<div class="fx-pw" aria-hidden="true"><i></i></div><label>Semaine <input type="range" min="1" max="41"></label><output aria-live="polite"></output>';
      var r = el.querySelector('input'), o = el.querySelector('output');
      r.value = U.num(el, 'fxWeek', 20);
      var go = function () {
        var w = +r.value, tri = w <= 14 ? 1 : w <= 28 ? 2 : 3;
        el.style.setProperty('--fx-q', w / 41);
        o.innerHTML = '<b>' + w + 'ᵉ semaine</b> · ' + tri + (tri === 1 ? 'ᵉʳ' : 'ᵉ') + ' trimestre<br>environ ' + Math.max(0, 41 - w) + ' semaines restantes';
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Une arcade dentaire dont on désigne les dents concernées
  FX.register('dental-chart', {
    setup: function (el) {
      var box = U.make('div', 'fx-dt', el), out = U.make('output', '', el), picked = [], Q = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
      out.setAttribute('aria-live', 'polite');
      var say = function () { out.textContent = picked.length ? 'Dents : ' + picked.sort(function (a, b) { return a - b; }).join(', ') : 'Touchez la dent concernée'; };
      box.setAttribute('role', 'group'); box.setAttribute('aria-label', 'Arcade du haut');
      Q.forEach(function (n, i) {
        var a = Math.PI * (i + .5) / Q.length, b = U.make('button', '', box);
        b.type = 'button'; b.textContent = n; b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-label', 'Dent ' + n);
        b.style.left = 50 - 46 * Math.cos(a) + '%'; b.style.top = 92 - 84 * Math.sin(a) + '%';
        b.style.setProperty('--fx-r', (a * 180 / Math.PI - 90) + 'deg');
        b.addEventListener('click', function () {
          var k = picked.indexOf(n), on = k < 0;
          if (on) picked.push(n); else picked.splice(k, 1);
          b.setAttribute('aria-pressed', on);
          say();
        });
      });
      say();
    }
  });

  // Un message composé comme un tableau d'ophtalmologue
  FX.register('eye-chart', {
    entrance: true,
    setup: function (el) {
      var t = el.textContent.trim().toUpperCase(), n = t.replace(/\s/g, ''), i = 0, row = 1, h = '';
      el.setAttribute('aria-label', el.textContent.trim());
      while (i < n.length) {
        var s = n.slice(i, i + row);
        h += '<span class="fx-ec" style="--fx-z:' + Math.max(.28, 1 - (row - 1) * .19) + ';--fx-i:' + (row - 1) + '" aria-hidden="true">' + s.split('').join(' ') + '</span>';
        i += row; row++;
      }
      el.innerHTML = h;
    }
  });
})(window.FX);
