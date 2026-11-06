/* Pack 28 — Architecture */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Un curseur coupe le bâtiment et montre ce qu'il y a dedans
  FX.register('section-cut', {
    setup: function (el) {
      var n = U.num(el, 'fxFloors', 4), h = '', w = '';
      for (var i = 0; i < n; i++) { h += '<div><i></i><i></i><i></i></div>'; w += '<div><em></em><em></em></div>'; }
      el.innerHTML = '<div class="fx-sc"><div class="fx-sc-i" aria-hidden="true">' + h + '</div><div class="fx-sc-o" aria-hidden="true">' + w + '</div><span class="fx-sc-l" aria-hidden="true"></span></div><input type="range" min="0" max="100" value="' + U.num(el, 'fxValue', 55) + '" aria-label="Position de la coupe">';
      var r = el.querySelector('input'), go = function () { el.style.setProperty('--fx-q', r.value + '%'); };
      r.addEventListener('input', go);
      go();
    }
  });

  // Des étages en axonométrie qui s'écartent pour se présenter
  FX.register('axo-explode', {
    setup: function (el) {
      var L = (el.dataset.fxItems || 'Toiture|Logements|Bureaux|Socle').split('|'), box = U.make('div', 'fx-ax', el), o = U.make('output', '', el);
      o.setAttribute('aria-live', 'polite');
      o.textContent = L.length + ' niveaux';
      L.slice().reverse().forEach(function (t, i) {
        var b = U.make('button', '', box);
        b.type = 'button'; b.setAttribute('aria-label', t); b.style.setProperty('--fx-i', i);
        var say = function () { o.textContent = t; box.querySelectorAll('button').forEach(function (x) { x.classList.toggle('fx-on', x === b); }); };
        b.addEventListener('mouseenter', say); b.addEventListener('focus', say); b.addEventListener('click', say);
      });
    }
  });

  // Choisir un matériau et voir la façade changer
  FX.register('material-swatch', {
    setup: function (el) {
      var M = { Béton: 'linear-gradient(#a3a5a7,#8d8f91)', Bois: 'repeating-linear-gradient(92deg,#a06a39 0 8px,#8b5a2d 8px 13px,#b47a44 13px 22px)', Brique: 'repeating-linear-gradient(0deg,#e8dbcb 0 2px,transparent 2px 13px),repeating-linear-gradient(90deg,#b0502d 0 26px,#a34827 26px 28px)', Zinc: 'repeating-linear-gradient(90deg,#6a7680 0 22px,#3f4850 22px 24px)' };
      var box = U.make('div', 'fx-ms', el), row = U.make('div', 'fx-ms-r', el), o = U.make('output', '', el);
      o.setAttribute('aria-live', 'polite');
      Object.keys(M).forEach(function (k, i) {
        var b = U.make('button', '', row);
        b.type = 'button'; b.setAttribute('aria-label', k); b.title = k; b.style.background = M[k];
        b.addEventListener('click', function () {
          row.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
          var f = U.make('i', '', box);
          f.style.background = M[k];
          setTimeout(function () { while (box.children.length > 1) box.firstChild.remove(); }, U.reduced ? 0 : 750);
          o.textContent = k;
        });
        if (!i) b.click();
      });
    }
  });
})(window.FX);
