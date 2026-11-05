/* Pack 20 — Nouvelles entrées */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Les enfants arrivent selon leur position réelle à l'écran
  FX.register('cascade-rows', {
    entrance: true,
    setup: function (el) {
      var tops = [];
      Array.prototype.forEach.call(el.children, function (c) { if (tops.indexOf(c.offsetTop) < 0) tops.push(c.offsetTop); });
      Array.prototype.forEach.call(el.children, function (c) { c.style.setProperty('--fx-rw', tops.indexOf(c.offsetTop)); });
    }
  });
})(window.FX);
