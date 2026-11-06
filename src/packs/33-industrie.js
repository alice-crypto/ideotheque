/* Pack 33 — Industrie */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Le rendement d'une ligne : trois taux, un seul chiffre
  FX.register('oee-gauge', {
    setup: function (el) {
      var R = [['Disponibilité', U.num(el, 'fxAvail', 88)], ['Performance', U.num(el, 'fxPerf', 92)], ['Qualité', U.num(el, 'fxQual', 97)]];
      el.innerHTML = '<div class="fx-oe" aria-hidden="true"><i></i><b></b></div><div class="fx-oe-s"></div><output aria-live="polite"></output>';
      var box = el.querySelector('.fx-oe-s'), o = el.querySelector('output');
      R.forEach(function (r) {
        var l = U.make('label', '', box);
        l.innerHTML = r[0] + ' <em></em><input type="range" min="40" max="100" value="' + r[1] + '">';
        r.i = l.querySelector('input'); r.e = l.querySelector('em');
      });
      var go = function () {
        var v = 1, low = R[0];
        R.forEach(function (r) { v *= r.i.value / 100; r.e.textContent = r.i.value + ' %'; if (+r.i.value < +low.i.value) low = r; });
        var pc = Math.round(v * 100);
        el.style.setProperty('--fx-q', v);
        el.querySelector('.fx-oe b').textContent = pc + ' %';
        o.textContent = 'À améliorer d\'abord : ' + low[0].toLowerCase();
      };
      box.addEventListener('input', go);
      go();
    }
  });

  // Une ligne d'assemblage : la pièce se complète à chaque poste
  FX.register('assembly-line', {
    setup: function (el) {
      var S = (el.dataset.fxItems || 'Châssis|Moteur|Capot|Contrôle').split('|'), box = U.make('div', 'fx-as2', el), o = U.make('output', '', el), n = 0, done = U.num(el, 'fxStart', 0);
      box.style.setProperty('--fx-n', S.length);
      S.forEach(function (t) { U.make('span', '', box).textContent = t; });
      var p = U.make('i', 'fx-as2-p', box);
      for (var i = 0; i < S.length; i++) U.make('u', '', p).style.setProperty('--fx-i', i);
      el._fxStep = function () {
        n = (n + 1) % (S.length + 1);
        if (n === S.length) { done++; }
        box.style.setProperty('--fx-k', Math.min(n, S.length - 1));
        p.querySelectorAll('u').forEach(function (u, i) { u.classList.toggle('fx-on', i < n); });
        Array.prototype.forEach.call(box.querySelectorAll('span'), function (s, i) { s.classList.toggle('fx-now', i === Math.min(n, S.length - 1)); });
        o.textContent = done + ' pièce' + (done > 1 ? 's' : '') + ' terminée' + (done > 1 ? 's' : '');
      };
      el._fxStep();
      if (!U.reduced) setInterval(el._fxStep, U.num(el, 'fxPace', 1100));
    },
    trigger: function (el) { el._fxStep(); }
  });

  // Le mur de supervision : chaque machine, son état et depuis quand
  FX.register('machine-wall', {
    setup: function (el) {
      var M = (el.dataset.fxItems || 'P1:run|P2:run|P3:stop|P4:run|S1:warn|S2:run|S3:run|R1:run').split('|').map(function (r) { var p = r.split(':'); return { n: p[0], s: p[1], at: Date.now() - U.rand(4, 80) * 60000 }; }), W = { run: 'En marche', warn: 'À surveiller', stop: 'À l\'arrêt' }, box = U.make('div', 'fx-mw', el), o = U.make('output', '', el);
      o.setAttribute('aria-live', 'polite');
      M.forEach(function (m) { m.d = U.make('div', '', box); });
      el._fxShow = function () {
        var bad = 0;
        M.forEach(function (m) {
          var min = Math.round((Date.now() - m.at) / 60000);
          m.d.dataset.s = m.s;
          m.d.innerHTML = '<b>' + m.n + '</b><small>' + W[m.s] + '</small><small>' + min + ' min</small>';
          if (m.s === 'stop') bad++;
        });
        o.textContent = bad ? bad + ' machine' + (bad > 1 ? 's' : '') + ' à l\'arrêt' : 'Tout tourne';
      };
      el._fxFlip = function () {
        var m = M[Math.floor(Math.random() * M.length)];
        m.s = { run: 'warn', warn: 'stop', stop: 'run' }[m.s]; m.at = Date.now();
        el._fxShow();
      };
      el._fxShow();
      setInterval(el._fxShow, 30000);
    },
    trigger: function (el) { el._fxFlip(); }
  });

  // Les quatre temps d'un moteur, avec une vraie bielle
  FX.register('piston-cycle', {
    setup: function (el) {
      var S = ['Admission', 'Compression', 'Combustion', 'Échappement'];
      el.innerHTML = '<svg viewBox="0 0 80 120" aria-hidden="true"><rect class="fx-pi2-c" x="20" y="4" width="40" height="72"/><rect class="fx-pi2-g" x="22" y="6" width="36" height="0"/><rect class="fx-pi2-p" x="22" y="0" width="36" height="16"/><line class="fx-pi2-r" x1="40" y1="0" x2="40" y2="0"/><circle class="fx-pi2-w" cx="40" cy="96" r="20"/><circle class="fx-pi2-h" cx="40" cy="96" r="4"/></svg><output aria-live="off"></output>';
      el._fxP = el.querySelector('.fx-pi2-p'); el._fxR = el.querySelector('.fx-pi2-r'); el._fxG = el.querySelector('.fx-pi2-g'); el._fxH = el.querySelector('.fx-pi2-h'); el._fxO = el.querySelector('output'); el._fxS = S;
      el._fxA = 0;
      el._fxDraw = function (a) {
        var r = 18, L = 52, x = 40 + r * Math.sin(a), y = 96 - r * Math.cos(a), py = y - Math.sqrt(L * L - Math.pow(x - 40, 2)), k = Math.floor((a / (Math.PI * 4)) % 1 * 4);
        el._fxP.setAttribute('y', py - 12);
        el._fxR.setAttribute('x1', 40); el._fxR.setAttribute('y1', py); el._fxR.setAttribute('x2', x); el._fxR.setAttribute('y2', y);
        el._fxH.setAttribute('cx', x); el._fxH.setAttribute('cy', y);
        el._fxG.setAttribute('height', Math.max(0, py - 18));
        el._fxG.setAttribute('class', 'fx-pi2-g k' + k);
        el._fxO.textContent = S[k];
      };
      el._fxDraw(0);
    },
    tick: function (el, dt) { if (U.reduced) return; el._fxA = (el._fxA + dt * U.num(el, 'fxSpeed', 3)) % (Math.PI * 4); el._fxDraw(el._fxA); }
  });

  // Un diagramme de Pareto : les quelques causes qui comptent le plus
  FX.register('defect-pareto', {
    entrance: true,
    setup: function (el) {
      var R = (el.dataset.fxItems || 'Rayures:48|Soudure:31|Cote:12|Couleur:6|Emballage:3').split('|').map(function (r) { var p = r.split(':'); return [p[0], +p[1]]; }).sort(function (a, b) { return b[1] - a[1]; }), tot = R.reduce(function (t, r) { return t + r[1]; }, 0), max = R[0][1], c = 0, line = '', hits = [], h = '';
      R.forEach(function (r, i) {
        c += r[1];
        var q = c / tot, x = (i + .5) / R.length * 100;
        line += (i ? 'L' : 'M') + x + ' ' + (100 - q * 100);
        if (c - r[1] < tot * .8) hits.push(r[0]);
        h += '<div class="' + (c - r[1] < tot * .8 ? 'fx-hit' : '') + '" style="--fx-q:' + r[1] / max + ';--fx-i:' + i + '"><i></i><small>' + r[0] + '</small></div>';
      });
      el.innerHTML = '<div class="fx-dp" aria-hidden="true">' + h + '<svg viewBox="0 0 100 100" preserveAspectRatio="none"><path pathLength="1" d="' + line + '"/></svg></div><p><b>' + hits.join(', ') + '</b> : 80 % des défauts</p>';
    }
  });

  // Une mesure contre sa tolérance : conforme ou non conforme
  FX.register('tolerance-gauge', {
    setup: function (el) {
      var n = U.num(el, 'fxNominal', 25), t = U.num(el, 'fxTol', .05), v = U.num(el, 'fxValue', 25.03);
      el.innerHTML = '<div class="fx-tg2" aria-hidden="true"><i></i><em></em></div><label>Mesure (mm)<input type="number" step=".01" value="' + v + '"></label><output aria-live="polite"></output>';
      var i = el.querySelector('input'), o = el.querySelector('output');
      var go = function () {
        var x = +i.value, d = x - n, ok = Math.abs(d) <= t, q = U.clamp(.5 + d / (t * 4), 0, 1);
        el.style.setProperty('--fx-q', q);
        el.classList.toggle('fx-bad', !ok);
        o.innerHTML = '<b>' + (ok ? 'Conforme' : 'Non conforme') + '</b> · écart ' + (d > 0 ? '+' : '') + d.toFixed(2).replace('.', ',') + ' mm, tolérance ±' + String(t).replace('.', ',') + ' mm';
      };
      i.addEventListener('input', go);
      go();
    }
  });

  // Retrouver le chemin d'un lot, à partir de son numéro
  FX.register('lot-trace', {
    setup: function (el) {
      var D = JSON.parse(el.dataset.fxData || '{"L-2048":["Bois du Jura, 3 mars","Découpe, atelier 2, 5 mars","Assemblage, 9 mars","Contrôle, lot conforme, 10 mars","Expédié à Lyon, 12 mars"]}');
      el.innerHTML = '<form><input placeholder="Numéro de lot" aria-label="Numéro de lot" value="L-2048"><button>Tracer</button></form><ol></ol><output aria-live="polite"></output>';
      var i = el.querySelector('input'), ol = el.querySelector('ol'), o = el.querySelector('output');
      var go = function () {
        var c = D[i.value.trim().toUpperCase()];
        ol.innerHTML = '';
        if (!c) { o.textContent = 'Lot inconnu'; return; }
        c.forEach(function (t, k) { var li = U.make('li', '', ol); li.textContent = t; li.style.setProperty('--fx-i', k); });
        o.textContent = c.length + ' étapes retrouvées (exemple fictif)';
      };
      el.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); go(); });
      go();
    }
  });

  // Le panneau de sécurité : jours sans accident et record
  FX.register('safety-days', {
    entrance: true,
    setup: function (el) {
      var since = el.dataset.fxSince ? new Date(el.dataset.fxSince) : new Date(Date.now() - 86400000 * 412), days = Math.floor((Date.now() - since) / 86400000), rec = Math.max(days, U.num(el, 'fxRecord', 530));
      el.innerHTML = '<small>' + (el.dataset.fxTitle || 'Jours sans accident') + '</small><div class="fx-sd">' + String(days).padStart(4, '0').split('').map(function (d, i) { return '<i style="--fx-i:' + i + '">' + d + '</i>'; }).join('') + '</div><small>Record : ' + rec + ' jours</small>';
      el.setAttribute('aria-label', days + ' jours sans accident, record ' + rec);
      el.setAttribute('role', 'img');
    }
  });

  // Une trajectoire d'outil qui usine une forme, ligne après ligne
  FX.register('cnc-toolpath', {
    entrance: true,
    setup: function (el) {
      var n = U.num(el, 'fxPasses', 14), W = 100, H = 70, d = '', r = 32;
      for (var i = 0; i <= n; i++) {
        var y = 35 - r + (i / n) * r * 2, half = Math.sqrt(Math.max(0, r * r - Math.pow(y - 35, 2))) * 1.3;
        d += (i ? 'L' : 'M') + (i % 2 ? 50 + half : 50 - half).toFixed(1) + ' ' + y.toFixed(1) + 'L' + (i % 2 ? 50 - half : 50 + half).toFixed(1) + ' ' + y.toFixed(1);
      }
      el.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true"><path class="fx-cn-b" d="' + d + '"/><path class="fx-cn-l" pathLength="1" d="' + d + '"/></svg>';
      if (el.dataset.fxLabel) { el.setAttribute('role', 'img'); el.setAttribute('aria-label', el.dataset.fxLabel); }
    }
  });

  // Une pièce qui s'imprime couche après couche
  FX.register('print-layers', {
    setup: function (el) {
      var N = U.num(el, 'fxLayers', 22), H = U.num(el, 'fxHours', 6);
      el.innerHTML = '<div class="fx-pl4" aria-hidden="true"><u></u></div><label>Avancement <input type="range" min="0" max="' + N + '"></label><output aria-live="polite"></output>';
      var box = el.querySelector('.fx-pl4'), r = el.querySelector('input'), o = el.querySelector('output'), head = box.firstChild;
      for (var i = 0; i < N; i++) { var w = Math.sin(i / (N - 1) * Math.PI * .85 + .25); var l = U.make('i', '', box); l.style.width = 30 + w * 65 + '%'; }
      r.value = U.num(el, 'fxValue', 13);
      var go = function () {
        var v = +r.value, L = box.querySelectorAll('i');
        L.forEach(function (x, k) { x.classList.toggle('fx-on', k < v); });
        box.style.setProperty('--fx-q', v / N);
        var h = (N - v) / N * H;
        o.innerHTML = '<b>' + Math.round(v / N * 100) + ' %</b> · ' + (h >= 1 ? Math.floor(h) + ' h ' : '') + String(Math.round(h % 1 * 60)).padStart(2, '0') + ' min restantes';
      };
      r.addEventListener('input', go);
      go();
    },
    trigger: function (el) { var r = el.querySelector('input'); r.value = 0; U.tween(el, 1600, function (p) { r.value = Math.round(p * r.max); r.dispatchEvent(new Event('input')); }); }
  });

  // Un titre soudé : un point lumineux avance et projette des étincelles
  FX.register('weld-sparks', {
    entrance: true,
    setup: function (el) {
      var c = U.make('canvas', '', el), x = c.getContext('2d'), P = [];
      c.setAttribute('aria-hidden', 'true');
      U.ensurePositioned(el);
      var size = function () { var r = el.getBoundingClientRect(), d = window.devicePixelRatio || 1; c.width = r.width * d; c.height = (r.height + 50) * d; c.style.height = (r.height + 50) + 'px'; x = c.getContext('2d'); x.scale(d, d); el._fxW = r.width; el._fxH = r.height; };
      size(); U.onResize(size);
      el._fxP = P;
      el._fxDraw = function (dt) {
        x.clearRect(0, 0, el._fxW, el._fxH + 50);
        if (el._fxQ < 1) {
          el._fxQ = Math.min(1, el._fxQ + dt / 1.5);
          el.style.setProperty('--fx-q', el._fxQ);
          for (var i = 0; i < 5; i++) P.push({ x: el._fxQ * el._fxW, y: el._fxH - 2, vx: U.rand(-110, 110), vy: U.rand(-140, 20), l: U.rand(.2, .7) });
        }
        for (var k = P.length - 1; k >= 0; k--) {
          var p = P[k];
          p.l -= dt; p.vy += 420 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
          if (p.l <= 0) { P.splice(k, 1); continue; }
          x.strokeStyle = 'rgba(255,' + Math.round(150 + p.l * 150) + ',80,' + Math.min(1, p.l * 2) + ')';
          x.beginPath(); x.moveTo(p.x, p.y); x.lineTo(p.x - p.vx * .025, p.y - p.vy * .025); x.stroke();
        }
      };
      el._fxQ = 1;
    },
    enter: function (el) { if (U.reduced) { el.style.setProperty('--fx-q', 1); return; } el._fxQ = 0; },
    tick: function (el, dt) { if (el._fxDraw && !U.reduced) el._fxDraw(dt); },
    trigger: function (el) { el._fxQ = 0; }
  });

  // Une plaque d'acier dont les rivets se posent un à un
  FX.register('rivet-frame', {
    entrance: true,
    setup: function (el) {
      var build = function () {
        el.querySelectorAll('.fx-rvt').forEach(function (r) { r.remove(); });
        var r = el.getBoundingClientRect(), gap = U.num(el, 'fxGap', 34), nx = Math.max(2, Math.round(r.width / gap)), ny = Math.max(2, Math.round(r.height / gap)), k = 0;
        var add = function (x, y) { var i = U.make('i', 'fx-rvt', el); i.setAttribute('aria-hidden', 'true'); i.style.cssText = 'left:' + x + '%;top:' + y + '%;--fx-i:' + k++; };
        for (var a = 0; a <= nx; a++) add(a / nx * 96 + 2, 4);
        for (var b = 1; b <= ny; b++) add(98, b / ny * 92 + 4);
        for (var c = nx - 1; c >= 0; c--) add(c / nx * 96 + 2, 96);
        for (var d = ny - 1; d >= 1; d--) add(2, d / ny * 92 + 4);
      };
      U.ensurePositioned(el);
      build();
      U.onResize(build);
    }
  });

  // Maintenir pour descendre la presse et marquer la pièce
  FX.register('press-stamp', {
    setup: function (el) {
      var F = U.num(el, 'fxForce', 120), T = el.dataset.fxText || 'CE';
      el.innerHTML = '<div class="fx-ps2" aria-hidden="true"><i></i><div><b>' + T + '</b></div></div><button type="button">Maintenir</button><output aria-live="polite"></output>';
      var b = el.querySelector('button'), o = el.querySelector('output'), q = 0, hold = false;
      el._fxTick = function (dt) {
        q = U.clamp(q + (hold ? dt * .9 : -dt * .8), 0, 1);
        el.style.setProperty('--fx-q', q);
        if (q >= 1 && !el.classList.contains('fx-done')) { el.classList.add('fx-done'); o.textContent = 'Pièce marquée'; }
        else if (q < 1 && hold) o.textContent = Math.round(q * F) + ' tonnes';
      };
      var on = function () { hold = true; el.classList.remove('fx-done'); }, off = function () { hold = false; };
      b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointerleave', off);
      b.addEventListener('keydown', function (e) { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); on(); } });
      b.addEventListener('keyup', off);
      el._fxOn = on; el._fxOff = off;
    },
    tick: function (el, dt) { el._fxTick(dt); },
    trigger: function (el) { el._fxOn(); setTimeout(el._fxOff, 1300); }
  });

  // Une cuve et ses deux vannes : le niveau monte ou descend en continu
  FX.register('tank-valve', {
    setup: function (el) {
      var lv = U.num(el, 'fxLevel', 40) / 100;
      el.innerHTML = '<button type="button" class="in" aria-pressed="true">Vanne d\'entrée</button><div class="fx-tv" aria-hidden="true"><i></i></div><button type="button" class="out" aria-pressed="false">Vanne de sortie</button><output aria-live="polite"></output>';
      var bi = el.querySelector('.in'), bo = el.querySelector('.out'), o = el.querySelector('output');
      [bi, bo].forEach(function (b) { b.addEventListener('click', function () { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true'); }); });
      var last = -1;
      el._fxStep = function (dt) {
        var a = bi.getAttribute('aria-pressed') === 'true', c = bo.getAttribute('aria-pressed') === 'true';
        lv = U.clamp(lv + ((a ? .1 : 0) - (c ? .14 : 0)) * dt, 0, 1);
        el.style.setProperty('--fx-q', lv);
        el.classList.toggle('fx-a', a); el.classList.toggle('fx-c', c);
        var v = Math.round(lv * 100);
        if (Math.floor(v / 5) !== last) { last = Math.floor(v / 5); o.textContent = v + ' %' + (v >= 95 ? ', cuve pleine' : v <= 5 ? ', cuve vide' : ''); }
      };
    },
    tick: function (el, dt) { if (el._fxStep) el._fxStep(dt); }
  });

  // Une trieuse : chaque pièce part vers le bon bac
  FX.register('sort-gate', {
    setup: function (el) {
      var T = (el.dataset.fxItems || 'Rouge:#e4432c|Bleu:#2d82d6|Jaune:#e8b71f').split('|').map(function (r) { var p = r.split(':'); return { n: p[0], c: p[1], k: 0 }; }), box = U.make('div', 'fx-sg', el), bins = U.make('div', 'fx-sg-b', el);
      T.forEach(function (t) { t.d = U.make('div', '', bins); t.d.innerHTML = '<b style="color:' + t.c + '">●</b> ' + t.n + ' <em>0</em>'; });
      el._fxGo = function () {
        var t = T[Math.floor(Math.random() * T.length)], i = T.indexOf(t), p = U.make('i', '', box);
        p.style.background = t.c;
        p.style.setProperty('--fx-x', ((i + .5) / T.length * 100) + '%');
        setTimeout(function () { p.remove(); t.k++; t.d.querySelector('em').textContent = t.k; }, U.reduced ? 0 : 1100);
      };
      el._fxGo();
      if (!U.reduced) setInterval(el._fxGo, U.num(el, 'fxEvery', 700));
    },
    trigger: function (el) { el._fxGo(); }
  });

  // Une roue de trois-huit : quelle équipe est en poste maintenant
  FX.register('shift-wheel', {
    setup: function (el) {
      var T = (el.dataset.fxTeams || 'A,B,C').split(','), S = [[6, 14, 'Matin'], [14, 22, 'Après-midi'], [22, 30, 'Nuit']];
      el.innerHTML = '<div class="fx-sw2" aria-hidden="true"><i></i><span>6</span><span>14</span><span>22</span></div><output></output>';
      var o = el.querySelector('output'), hand = el.querySelector('i');
      var go = function () {
        var d = new Date(), h = d.getHours() + d.getMinutes() / 60, h2 = h < 6 ? h + 24 : h, k = S.findIndex(function (s) { return h2 >= s[0] && h2 < s[1]; }), day = Math.floor(d / 86400000), team = T[(k + day) % T.length], left = S[k][1] - h2;
        hand.style.transform = 'rotate(' + h / 24 * 360 + 'deg)';
        o.innerHTML = 'Équipe <b>' + team + '</b>, poste du ' + S[k][2].toLowerCase() + '<br>Relève dans ' + Math.floor(left) + ' h ' + String(Math.round(left % 1 * 60)).padStart(2, '0');
      };
      go();
      setInterval(go, 60000);
    }
  });
})(window.FX);
