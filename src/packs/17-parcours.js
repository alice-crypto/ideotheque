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

  // Une liste de grands liens dont l'aperçu change au survol
  FX.register('mega-index', {
    setup: function (el) {
      var pv = U.make('div', 'fx-mi-pv', el);
      pv.setAttribute('aria-hidden', 'true');
      var links = el.querySelectorAll('a');
      var show = function (a) {
        links.forEach(function (o) { o.classList.toggle('fx-dim', o !== a); });
        var src = a.dataset.fxImg;
        if (src) pv.style.backgroundImage = 'url("' + src + '")';
        pv.classList.add('fx-on');
      };
      var hide = function () {
        links.forEach(function (o) { o.classList.remove('fx-dim'); });
        pv.classList.remove('fx-on');
      };
      links.forEach(function (a) {
        if (a.dataset.fxImg) (new Image()).src = a.dataset.fxImg;
        a.addEventListener('pointerenter', function () { show(a); });
        a.addEventListener('focus', function () { show(a); });
        a.addEventListener('blur', hide);
      });
      el.addEventListener('pointerleave', hide);
    }
  });
})(window.FX);
