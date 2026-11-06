/* Pack 31 — Logistique */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Un colis qui avance sur son trajet, avec un camion sur la ligne
  FX.register('parcel-journey', {
    entrance: true,
    setup: function (el) {
      var S = (el.dataset.fxItems || 'Préparé:lun. 9 h|Expédié:lun. 18 h|En transit:mar. 7 h|En livraison:—|Livré:—').split('|').map(function (r) { var k = r.indexOf(':'); return [r.slice(0, k), r.slice(k + 1)]; }), cur = U.num(el, 'fxCurrent', 2), rail = U.make('div', 'fx-pj', el), o = U.make('p', '', el);
      rail.setAttribute('aria-hidden', 'true');
      S.forEach(function (s, i) { U.make('i', i <= cur ? 'fx-done' : '', rail).style.left = i / (S.length - 1) * 100 + '%'; });
      el.style.setProperty('--fx-q', cur / (S.length - 1));
      U.make('u', '', rail);
      o.innerHTML = '<b>' + S[cur][0] + '</b> · ' + S[cur][1] + '<br>Étape ' + (cur + 1) + ' sur ' + S.length;
    }
  });

  // Le créneau de livraison sur la journée, et l'heure qu'il est
  FX.register('delivery-window', {
    setup: function (el) {
      var a = U.num(el, 'fxFrom', 14), b = U.num(el, 'fxTo', 16), s = U.num(el, 'fxStart', 7), e = U.num(el, 'fxEnd', 21), W = e - s;
      el.innerHTML = '<div class="fx-dw" aria-hidden="true"><em style="left:' + (a - s) / W * 100 + '%;width:' + (b - a) / W * 100 + '%"></em><i></i></div><div class="fx-dw-h" aria-hidden="true"><span>' + s + ' h</span><span>' + e + ' h</span></div><output aria-live="polite"></output>';
      var o = el.querySelector('output'), bar = el.querySelector('.fx-dw i');
      var go = function () {
        var d = new Date(), h = d.getHours() + d.getMinutes() / 60;
        bar.style.left = U.clamp((h - s) / W, 0, 1) * 100 + '%';
        el.classList.toggle('fx-now', h >= a && h < b);
        o.innerHTML = h < a ? 'Livraison entre <b>' + a + ' h et ' + b + ' h</b>, dans ' + Math.ceil(a - h) + ' h' : h < b ? '<b>Votre livreur arrive</b>, avant ' + b + ' h' : 'Créneau passé : suivez votre colis';
      };
      go();
      setInterval(go, 60000);
    }
  });

  // Trouver le carton le plus petit qui contient l'objet
  FX.register('box-finder', {
    setup: function (el) {
      var B = (el.dataset.fxItems || 'S:25,20,10|M:35,30,20|L:50,40,30|XL:70,50,40').split('|').map(function (r) { var p = r.split(':'); return { n: p[0], d: p[1].split(',').map(Number) }; });
      el.innerHTML = '<div class="fx-bf-i">' + ['Longueur', 'Largeur', 'Hauteur'].map(function (t, i) { return '<label>' + t + '<input type="number" min="1" max="200" value="' + [30, 22, 12][i] + '"></label>'; }).join('') + '</div><div class="fx-bf" aria-hidden="true"></div><output aria-live="polite"></output>';
      var I = el.querySelectorAll('input'), box = el.querySelector('.fx-bf'), o = el.querySelector('output');
      B.forEach(function (b, i) { var x = U.make('i', '', box); x.textContent = b.n; x.style.setProperty('--fx-s', .55 + i * .15); });
      var sort = function (a) { return a.slice().sort(function (x, y) { return y - x; }); };
      var go = function () {
        var d = sort(Array.prototype.map.call(I, function (i) { return +i.value || 0; })), fit = -1;
        B.some(function (b, i) { var s = sort(b.d); if (d.every(function (v, k) { return v <= s[k]; })) { fit = i; return true; } return false; });
        Array.prototype.forEach.call(box.children, function (x, i) { x.classList.toggle('fx-on', i === fit); });
        o.innerHTML = fit < 0 ? 'Trop grand pour nos cartons' : 'Carton <b>' + B[fit].n + '</b> : ' + B[fit].d.join(' × ') + ' cm';
      };
      el.addEventListener('input', go);
      go();
    }
  });

  // Le poids facturé : le plus grand du réel et du volumétrique
  FX.register('volumetric-weight', {
    setup: function (el) {
      var div = U.num(el, 'fxDivisor', 5000);
      el.innerHTML = '<label>Longueur, largeur, hauteur (cm)<span><input type="number" value="60"><input type="number" value="40"><input type="number" value="30"></span></label><label>Poids réel (kg)<input class="w" type="number" value="6" step=".5"></label><div class="fx-vw" aria-hidden="true"><div><i class="a"></i><small>Réel</small></div><div><i class="b"></i><small>Volume</small></div></div><output aria-live="polite"></output>';
      var D = el.querySelectorAll('span input'), W = el.querySelector('.w'), o = el.querySelector('output');
      var go = function () {
        var v = 1;
        D.forEach(function (i) { v *= +i.value || 0; });
        var vw = v / div, w = +W.value || 0, top = Math.max(w, vw, .1);
        el.style.setProperty('--fx-a', w / top); el.style.setProperty('--fx-b', vw / top);
        o.innerHTML = 'Facturé <b>' + Math.max(w, vw).toFixed(1).replace('.', ',') + ' kg</b>' + (vw > w ? ', à cause du volume' : ', au poids réel');
      };
      el.addEventListener('input', go);
      go();
    }
  });

  // Combien de cartons sur une palette, couche après couche
  FX.register('pallet-stack', {
    setup: function (el) {
      var L = 120, W = 80, H = 180, cols = 3;
      el.innerHTML = '<div class="fx-pl3" aria-hidden="true"></div><label>Hauteur d\'un carton <b></b><input type="range" min="15" max="60" step="5"></label><output aria-live="polite"></output>';
      var box = el.querySelector('.fx-pl3'), r = el.querySelector('input'), o = el.querySelector('output');
      r.value = U.num(el, 'fxHeight', 30);
      var go = function () {
        var h = +r.value, rows = Math.floor((H - 15) / h), per = cols * 2, tot = rows * per;
        box.innerHTML = '';
        for (var y = 0; y < rows; y++) {
          var row = U.make('div', '', box);
          row.style.height = 100 / Math.floor((H - 15) / 15) * h / 15 + '%';
          for (var x = 0; x < cols; x++) U.make('i', '', row).style.setProperty('--fx-i', y * 2 + x);
        }
        el.querySelector('label b').textContent = h + ' cm';
        o.innerHTML = '<b>' + tot + ' cartons</b> : ' + per + ' par couche, ' + rows + ' couches';
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Un conteneur vu de dessus, rempli par un calcul de rangées
  FX.register('container-fill', {
    entrance: true,
    setup: function (el) {
      var CW = U.num(el, 'fxLength', 590), CH = U.num(el, 'fxWidth', 235), I = (el.dataset.fxItems || '180x120|180x120|120x100|120x100|120x80|120x80|100x80|80x60|80x60|60x40').split('|').map(function (s) { var p = s.split('x'); return { w: +p[0], h: +p[1] }; }).sort(function (a, b) { return b.h - a.h || b.w - a.w; });
      var x = 0, y = 0, rowH = 0, used = 0, box = U.make('div', 'fx-cf', el), out = 0;
      box.setAttribute('aria-hidden', 'true');
      I.forEach(function (b, i) {
        if (x + b.w > CW) { x = 0; y += rowH; rowH = 0; }
        if (y + b.h > CH) { out++; return; }
        var d = U.make('i', '', box);
        d.style.cssText = 'left:' + x / CW * 100 + '%;top:' + y / CH * 100 + '%;width:' + b.w / CW * 100 + '%;height:' + b.h / CH * 100 + '%;--fx-i:' + i;
        x += b.w; rowH = Math.max(rowH, b.h); used += b.w * b.h;
      });
      var q = used / (CW * CH) * 100;
      U.make('p', '', el).innerHTML = '<b>' + Math.round(q) + ' %</b> de la surface' + (out ? ', ' + out + ' caisse' + (out > 1 ? 's' : '') + ' en attente' : ', tout tient');
    }
  });

  // Taper un emplacement et le voir s'allumer dans l'entrepôt
  FX.register('warehouse-slot', {
    setup: function (el) {
      var A = U.num(el, 'fxAisles', 4), B = U.num(el, 'fxBays', 8);
      el.innerHTML = '<input type="text" maxlength="4" value="' + (el.dataset.fxCode || 'B-5') + '" aria-label="Emplacement, par exemple B-5"><div class="fx-wh" aria-hidden="true"></div><output aria-live="polite"></output>';
      var i = el.querySelector('input'), g = el.querySelector('.fx-wh'), o = el.querySelector('output');
      g.style.setProperty('--fx-c', B);
      for (var a = 0; a < A; a++) for (var b = 0; b < B; b++) U.make('i', '', g);
      var go = function () {
        var m = i.value.toUpperCase().match(/^([A-Z])-?(\d+)$/), hit = -1;
        if (m) { var a2 = m[1].charCodeAt(0) - 65, b2 = +m[2] - 1; if (a2 >= 0 && a2 < A && b2 >= 0 && b2 < B) hit = a2 * B + b2; }
        Array.prototype.forEach.call(g.children, function (c, k) { c.classList.toggle('fx-on', k === hit); });
        o.textContent = hit >= 0 ? 'Allée ' + m[1] + ', travée ' + m[2] : 'Emplacement inconnu';
      };
      i.addEventListener('input', go);
      go();
    }
  });

  // Un code-barres généré qu'un laser vient lire
  FX.register('barcode-scan', {
    setup: function (el) {
      var c = el.dataset.fxCode || 'FICTIF-48210', h = 13, bars = '';
      for (var k = 0; k < c.length; k++) h = (h * 33 + c.charCodeAt(k)) >>> 0;
      for (var i = 0; i < 46; i++) { h = (h * 1664525 + 1013904223) >>> 0; bars += '<i style="flex:' + (1 + (h >> 13) % 3) + ' 1 0"></i>'; }
      el.innerHTML = '<div class="fx-bc2" role="img" aria-label="Code-barres ' + c + '">' + bars + '<u aria-hidden="true"></u></div><small>' + c + '</small><button type="button">Scanner</button><output aria-live="polite"></output>';
      el.querySelector('button').addEventListener('click', function () { FX.trigger(el); });
    },
    trigger: function (el) {
      var o = el.querySelector('output'), u = el.querySelector('u');
      el.classList.remove('fx-ok');
      o.textContent = 'Lecture…';
      u.classList.remove('fx-go'); void u.offsetWidth; u.classList.add('fx-go');
      setTimeout(function () { el.classList.add('fx-ok'); o.textContent = 'Lu : ' + (el.dataset.fxCode || 'FICTIF-48210'); }, U.reduced ? 0 : 950);
    }
  });

  // Une tournée en désordre qui se réorganise, avec les kilomètres gagnés
  FX.register('route-optimize', {
    setup: function (el) {
      var P = (el.dataset.fxData || '10,70|80,20|25,20|70,80|45,50|15,35|88,55|55,15').split('|').map(function (s) { var p = s.split(','); return [+p[0], +p[1]]; }), d = function (a, b) { return Math.hypot(a[0] - b[0], a[1] - b[1]); };
      var len = function (o) { var t = 0; for (var i = 1; i < o.length; i++) t += d(P[o[i - 1]], P[o[i]]); return t; };
      var a = P.map(function (_, i) { return i; }), b = [0], left = a.slice(1);
      while (left.length) { var last = P[b[b.length - 1]], best = 0; left.forEach(function (k, i) { if (d(P[k], last) < d(P[left[best]], last)) best = i; }); b.push(left.splice(best, 1)[0]); }
      var path = function (o) { return o.map(function (k, i) { return (i ? 'L' : 'M') + P[k][0] + ' ' + P[k][1]; }).join(''); };
      el.innerHTML = '<svg viewBox="0 0 100 100" aria-hidden="true"><path class="fx-ro-l"/>' + P.map(function (p, i) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + (i ? 2.6 : 4) + '"/>'; }).join('') + '</svg><button type="button">Optimiser</button><output aria-live="polite"></output>';
      var L = el.querySelector('path'), o = el.querySelector('output'), btn = el.querySelector('button'), on = false, u = U.num(el, 'fxScale', .6);
      el._fxSet = function (v) {
        on = v;
        L.setAttribute('d', path(on ? b : a));
        L.style.stroke = on ? 'var(--fx-up, #2eaf63)' : '';
        L.setAttribute('pathLength', 1);
        L.classList.remove('fx-go'); void L.getBoundingClientRect(); L.classList.add('fx-go');
        btn.textContent = on ? 'Revenir à l\'ordre initial' : 'Optimiser';
        o.innerHTML = '<b>' + Math.round((on ? len(b) : len(a)) * u) + ' km</b>' + (on ? ', soit ' + Math.round((len(a) - len(b)) * u) + ' km de moins' : ' dans l\'ordre de saisie');
      };
      btn.addEventListener('click', function () { el._fxSet(!on); });
      el._fxSet(false);
    },
    trigger: function (el) { el.querySelector('button').click(); }
  });

  // Une flotte sur un plan : ceux qui roulent, ceux qui sont arrêtés
  FX.register('fleet-dots', {
    setup: function (el) {
      var n = U.num(el, 'fxCount', 14), box = U.make('div', 'fx-fd', el), o = U.make('output', '', el), V = [];
      box.setAttribute('aria-hidden', 'true');
      for (var i = 0; i < n; i++) V.push({ el: U.make('i', '', box), x: U.rand(0, 100), y: U.rand(0, 100), a: U.rand(0, 6.28), stop: Math.random() < .25 });
      el._fxV = V; el._fxO = o; el._fxT = 0;
      var show = function () { var s = V.filter(function (v) { return v.stop; }).length; o.textContent = (V.length - s) + ' en route, ' + s + ' à l\'arrêt'; };
      el._fxShow = show;
      V.forEach(function (v) { v.el.classList.toggle('fx-stop', v.stop); v.el.style.left = v.x + '%'; v.el.style.top = v.y + '%'; });
      show();
    },
    tick: function (el, dt, t) {
      if (U.reduced) return;
      el._fxV.forEach(function (v) {
        if (v.stop) return;
        v.x += Math.cos(v.a) * dt * 7; v.y += Math.sin(v.a) * dt * 7;
        if (v.x < 0 || v.x > 100) v.a = Math.PI - v.a;
        if (v.y < 0 || v.y > 100) v.a = -v.a;
        v.el.style.left = v.x + '%'; v.el.style.top = v.y + '%';
      });
      if (t - el._fxT > 3) {
        el._fxT = t;
        var w = el._fxV[Math.floor(Math.random() * el._fxV.length)];
        w.stop = !w.stop; w.el.classList.toggle('fx-stop', w.stop); el._fxShow();
      }
    }
  });
})(window.FX);
