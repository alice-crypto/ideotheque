/* Pack 19 — États et interfaces d'IA */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Un agent parcourt un graphe d'étapes, nœud après nœud
  FX.register('agent-graph', {
    entrance: true,
    setup: function (el) {
      var names = (el.dataset.fxSteps || 'Lire|Chercher|Écrire|Vérifier').split('|');
      el.setAttribute('role', 'list');
      el._fxN = names.map(function (n, i) {
        var d = U.make('span', 'fx-ag', el);
        d.setAttribute('role', 'listitem');
        d.textContent = n;
        d.style.setProperty('--fx-i', i);
        return d;
      });
    },
    reset: function (el) { el._fxRun2 = (el._fxRun2 || 0) + 1; el._fxN.forEach(function (d) { d.classList.remove('fx-on', 'fx-ok'); }); },
    enter: function (el) {
      var run = el._fxRun2 = (el._fxRun2 || 0) + 1, i = 0, step = U.num(el, 'fxStep', 800);
      if (U.reduced) { el._fxN.forEach(function (d) { d.classList.add('fx-ok'); }); return; }
      (function next() {
        if (run !== el._fxRun2) return;
        if (i) { el._fxN[i - 1].classList.remove('fx-on'); el._fxN[i - 1].classList.add('fx-ok'); }
        if (i >= el._fxN.length) { el.dispatchEvent(new CustomEvent('fx:done', { bubbles: true })); return; }
        el._fxN[i++].classList.add('fx-on');
        setTimeout(next, step);
      })();
    }
  });

  // Une onde vocale qui réagit quand l'assistant écoute
  FX.register('voice-wave', {
    setup: function (el) {
      el.setAttribute('role', 'img');
      el.setAttribute('aria-label', el.getAttribute('aria-label') || "L'assistant écoute");
      el._fxB = [];
      for (var i = 0; i < U.num(el, 'fxBars', 13); i++) el._fxB.push(U.make('i', '', el));
    },
    tick: function (el, dt, t) {
      if (U.reduced) return;
      var level = typeof el.fxLevel === 'number' ? el.fxLevel : .5 + .5 * Math.sin(t * .0023) * Math.sin(t * .0007);
      var n = el._fxB.length;
      el._fxB.forEach(function (b, i) {
        var env = Math.sin((i + .5) / n * 3.14);
        var v = .12 + env * level * (.5 + .5 * Math.sin(t * .012 + i * 1.3));
        b.style.transform = 'scaleY(' + v.toFixed(3) + ')';
      });
    }
  });
})(window.FX);
