/* Pack 01 — Entrées */
(function (FX) {
  'use strict';
  var U = FX.util;

  [
    'fade-up', 'slide-in', 'zoom-in-soft', 'flip-up', 'swing-in', 'iris-open', 'diagonal-wipe',
    'split-reveal', 'block-reveal', 'stretch-in', 'skew-up', 'drop-bounce', 'pop-in', 'blinds-open',
    'ink-spread', 'fold-down', 'lift-shadow', 'rule-draw'
  ].forEach(function (name) { FX.register(name, { entrance: true }); });

  // Ordre diagonal : rangée + colonne, mesurées sur la grille réelle
  function orderTiles(el) {
    var kids = Array.prototype.slice.call(el.children);
    var tops = [];
    var lefts = [];
    kids.forEach(function (k) {
      if (tops.indexOf(k.offsetTop) === -1) tops.push(k.offsetTop);
      if (lefts.indexOf(k.offsetLeft) === -1) lefts.push(k.offsetLeft);
    });
    tops.sort(function (a, b) { return a - b; });
    lefts.sort(function (a, b) { return a - b; });
    kids.forEach(function (k) {
      k.style.setProperty('--fx-i', tops.indexOf(k.offsetTop) + lefts.indexOf(k.offsetLeft));
    });
  }
  FX.register('tile-cascade', { entrance: true, setup: orderTiles });
  U.onResize(function () { document.querySelectorAll('[data-fx="tile-cascade"]').forEach(orderTiles); });

  function scatter(el) {
    var spread = U.num(el, 'fxSpread', 140);
    Array.prototype.forEach.call(el.children, function (k, i) {
      k.style.setProperty('--fx-i', i);
      k.style.setProperty('--fx-x', U.rand(-spread, spread).toFixed(0) + 'px');
      k.style.setProperty('--fx-y', U.rand(-spread, spread).toFixed(0) + 'px');
      k.style.setProperty('--fx-r', U.rand(-90, 90).toFixed(0) + 'deg');
    });
  }
  FX.register('scatter-gather', { entrance: true, setup: scatter, reset: scatter });
})(window.FX);
