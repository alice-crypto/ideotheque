/* Pack 05 — Transitions plein écran */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Place les pièces d'une grille (--c colonne, --r rangée) et un délai aléatoire --fx-r
  function grid(cols) {
    return function (o) {
      Array.prototype.forEach.call(o.children, function (p, i) {
        p.style.setProperty('--c', i % cols);
        p.style.setProperty('--r', Math.floor(i / cols));
        if ((i % cols + Math.floor(i / cols)) % 2) p.classList.add('fx-alt');
        p.style.setProperty('--fx-r', Math.random().toFixed(2));
      });
    };
  }

  FX.register('bands', { transition: { pieces: 5, cover: 950, uncover: 1000 } });
  FX.register('circle-expand', { transition: { pieces: 1, cover: 850, uncover: 900 } });
  FX.register('slash', { transition: { pieces: 1, cover: 820, uncover: 850 } });
  FX.register('pixel-wipe', { transition: { pieces: 96, cover: 760, uncover: 800, build: grid(12) } });
  FX.register('shutter', { transition: { pieces: 8, cover: 820, uncover: 850 } });
  FX.register('curtain-close', { transition: { pieces: 2, cover: 800, uncover: 850 } });
  FX.register('fade-through', { transition: { pieces: 1, cover: 520, uncover: 550 } });
  FX.register('zoom-through', { transition: { pieces: 1, cover: 850, uncover: 800 } });
  FX.register('push-slide', { transition: { pieces: 1, cover: 780, uncover: 800 } });
  FX.register('arc-rise', { transition: { pieces: 1, cover: 920, uncover: 950 } });
  FX.register('tile-flip', { transition: { pieces: 40, cover: 1000, uncover: 1050, build: grid(8) } });
  FX.register('iris', { transition: { pieces: 1, cover: 820, uncover: 850 } });

  FX.register('glitch-cut', {
    transition: {
      pieces: 10,
      cover: 650,
      uncover: 700,
      build: function (o) {
        Array.prototype.forEach.call(o.children, function (p, i) {
          p.style.setProperty('--fx-dir', i % 2 ? 1 : -1);
          p.style.setProperty('--fx-r', Math.random().toFixed(2));
        });
      }
    }
  });

  FX.register('title-card', {
    transition: {
      pieces: 1,
      cover: 1300,
      uncover: 950,
      build: function (o) {
        var src = o._fxEvent && o._fxEvent.target && o._fxEvent.target.closest && o._fxEvent.target.closest('[data-fx-title]');
        var t = U.make('span', 'fx-tr-title', o);
        t.textContent = (src && src.dataset.fxTitle) || document.title;
      }
    }
  });

  // Morphing natif du navigateur entre deux états de la page ; repli immédiat sinon
  FX.register('view-morph', {
    transition: {
      custom: function (callback) {
        // Onglet masqué : le navigateur attendrait un rendu pour appeler callback
        if (!document.startViewTransition || U.reduced || document.hidden) { if (callback) callback(); return; }
        var vt = document.startViewTransition(function () { if (callback) callback(); });
        // Une transition interrompue rejette ses promesses : ce n'est pas une erreur pour la page
        if (vt && vt.ready) vt.ready.catch(function () {});
        if (vt && vt.finished) vt.finished.catch(function () {});
      }
    }
  });
})(window.FX);
