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

  // Des sources numérotées s'ouvrent dans le texte d'une réponse
  FX.register('citation-pop', {
    setup: function (el) {
      el.querySelectorAll('[data-source]').forEach(function (c, i) {
        var n = i + 1, a = document.createElement('a');
        a.className = 'fx-cite';
        a.href = c.getAttribute('href') || '#';
        a.textContent = n;
        a.setAttribute('aria-label', 'Source ' + n + ' : ' + c.dataset.source);
        var tip = U.make('span', 'fx-cite-tip', a);
        tip.textContent = c.dataset.source;
        tip.setAttribute('aria-hidden', 'true');
        a.style.setProperty('--fx-i', i);
        c.replaceWith(a);
      });
    }
  });

  // Une petite barre dit à quel point la réponse est sûre
  FX.register('confidence-meter', {
    entrance: true,
    setup: function (el) {
      var v = U.clamp(U.num(el, 'fxValue', 72), 0, 100);
      var lvl = v >= 75 ? 'Élevée' : v >= 40 ? 'Moyenne' : 'Faible';
      el.classList.add('fx-lvl-' + (v >= 75 ? 'h' : v >= 40 ? 'm' : 'l'));
      el.setAttribute('role', 'meter');
      el.setAttribute('aria-valuenow', v); el.setAttribute('aria-valuemin', 0); el.setAttribute('aria-valuemax', 100);
      el.setAttribute('aria-label', 'Confiance');
      el.innerHTML = '<span>Confiance : ' + lvl + '</span><i><b></b></i>';
      el.style.setProperty('--fx-v', v / 100);
    }
  });

  // Un texte montre ce qui a été retiré puis ajouté
  FX.register('diff-reveal', {
    entrance: true,
    setup: function (el) {
      el.querySelectorAll('del,ins').forEach(function (d, i) { d.style.setProperty('--fx-i', i); });
    }
  });

  // De petites étiquettes montrent ce que l'assistant est en train de lire
  FX.register('context-chips', {
    entrance: true,
    setup: function (el) {
      el._fxList = (el.dataset.fxItems || 'rapport.pdf|notes.md|budget.xlsx').split('|');
      el.setAttribute('aria-live', 'polite');
    },
    reset: function (el) { el._fxK = (el._fxK || 0) + 1; el.textContent = ''; },
    enter: function (el) {
      var run = el._fxK = (el._fxK || 0) + 1, i = 0;
      el.textContent = '';
      (function add() {
        if (run !== el._fxK || i >= el._fxList.length) return;
        var s = U.make('span', 'fx-cc', el);
        s.textContent = el._fxList[i++];
        if (U.reduced) add(); else setTimeout(add, U.num(el, 'fxStep', 500));
      })();
    }
  });

  // Le squelette de chargement se fond dans le vrai contenu
  FX.register('skeleton-morph', {
    entrance: true,
    setup: function (el) {
      el.setAttribute('aria-busy', 'true');
      el._fxDone = function () { el.classList.add('fx-ready'); el.setAttribute('aria-busy', 'false'); };
    },
    reset: function (el) { clearTimeout(el._fxTo); el.classList.remove('fx-ready'); el.setAttribute('aria-busy', 'true'); },
    enter: function (el) { el._fxTo = setTimeout(el._fxDone, U.num(el, 'fxWait', 1500)); }
  });

  // Du code s'écrit tout seul, avec une coloration simple
  FX.register('streaming-code', {
    entrance: true,
    setup: function (el) {
      el._fxSrc = el.textContent.replace(/^\n/, '');
      el.setAttribute('aria-label', el._fxSrc);
      if (!U.reduced) el.textContent = '';
    },
    reset: function (el) { el._fxS = (el._fxS || 0) + 1; el.textContent = ''; },
    enter: function (el) {
      var run = el._fxS = (el._fxS || 0) + 1, src = el._fxSrc, i = 0;
      var esc = function (s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;'); };
      var hl = function (s) {
        return esc(s).replace(/(\/\/.*)|('[^']*'?|"[^"]*"?)|\b(function|const|let|var|return|if|else|for|await|async|import|from)\b/g, function (m, c, q, k) {
          return '<span class="' + (c ? 'c' : q ? 's' : 'k') + '">' + m + '</span>';
        });
      };
      if (U.reduced) { el.innerHTML = hl(src); return; }
      (function next() {
        if (run !== el._fxS) return;
        i = Math.min(src.length, i + 1 + Math.floor(Math.random() * 3));
        el.innerHTML = hl(src.slice(0, i)) + (i < src.length ? '<i class="fx-cur"></i>' : '');
        if (i < src.length) setTimeout(next, U.num(el, 'fxSpeed', 22));
        else el.dispatchEvent(new CustomEvent('fx:done', { bubbles: true }));
      })();
    }
  });
})(window.FX);
