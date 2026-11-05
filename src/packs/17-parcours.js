/* Pack 17 — Parcours et mises en page */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Une case de la grille s'ouvre et les autres se rangent autour d'elle
  FX.register('bento-expand', {
    setup: function (el) {
      var cells = Array.prototype.slice.call(el.children);
      var flip = function (change) {
        var first = cells.map(function (c) { return c.getBoundingClientRect(); });
        change();
        cells.forEach(function (c, i) {
          var l = c.getBoundingClientRect(), o = first[i];
          if (U.reduced || !c.animate) return;
          c.animate([{ transform: 'translate(' + (o.left - l.left) + 'px,' + (o.top - l.top) + 'px)' }, { transform: 'none' }], { duration: 480, easing: 'cubic-bezier(.16,1,.3,1)' });
        });
      };
      cells.forEach(function (c) {
        c.tabIndex = 0;
        c.setAttribute('role', 'button');
        c.setAttribute('aria-expanded', 'false');
        var toggle = function () {
          var on = !c.classList.contains('fx-big');
          flip(function () {
            cells.forEach(function (o) { o.classList.remove('fx-big'); o.setAttribute('aria-expanded', 'false'); });
            if (on) { c.classList.add('fx-big'); c.setAttribute('aria-expanded', 'true'); }
          });
        };
        c.addEventListener('click', toggle);
        c.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
          if (e.key === 'Escape' && c.classList.contains('fx-big')) toggle();
        });
      });
    }
  });
})(window.FX);
