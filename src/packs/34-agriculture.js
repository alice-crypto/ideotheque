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
})(window.FX);
