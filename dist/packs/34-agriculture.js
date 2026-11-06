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
})(window.FX);
