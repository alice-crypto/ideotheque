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
})(window.FX);
