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
})(window.FX);
