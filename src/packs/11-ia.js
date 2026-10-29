/* Pack 11 — Idées de l'ère de l'IA */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Réponse « générée » : des groupes de 1 à 3 mots arrivent à un rythme irrégulier.
  // Pour afficher une nouvelle réponse : el.dataset.fxText = '…' puis FX.replay(el).
  FX.register('stream-text', {
    entrance: true,
    setup: function (el) {
      if (!el.dataset.fxText) el.dataset.fxText = el.textContent.trim().replace(/\s+/g, ' ');
      el.setAttribute('aria-label', el.dataset.fxText);
      if (!U.reduced) el.textContent = '';
    },
    reset: function (el) { el._fxStream = (el._fxStream || 0) + 1; el.textContent = ''; el.classList.remove('fx-done'); },
    enter: function (el) {
      var text = el.dataset.fxText;
      var run = el._fxStream = (el._fxStream || 0) + 1;
      el.setAttribute('aria-label', text);
      el.classList.remove('fx-done');
      if (U.reduced) { el.textContent = text; el.classList.add('fx-done'); return; }
      el.textContent = '';
      var words = text.split(' ');
      var speed = U.num(el, 'fxSpeed', 55);
      var caret = U.make('span', 'fx-caret', el);
      caret.setAttribute('aria-hidden', 'true');
      var i = 0;
      (function next() {
        if (run !== el._fxStream) return;
        var n = 1 + Math.floor(Math.random() * 3);
        for (var k = 0; k < n && i < words.length; k++, i++) {
          var tok = document.createElement('span');
          tok.className = 'fx-tok';
          tok.setAttribute('aria-hidden', 'true');
          tok.textContent = (i ? ' ' : '') + words[i];
          el.insertBefore(tok, caret);
        }
        if (i < words.length) setTimeout(next, speed * n * (.6 + Math.random() * .8));
        else {
          el.classList.add('fx-done');
          el.dispatchEvent(new CustomEvent('fx:done', { bubbles: true }));
        }
      })();
    }
  });

  FX.register('text-shimmer', {});
  FX.register('ai-orb', {});

  // Champ de saisie qui écrit, montre puis efface des exemples de demandes, en boucle
  FX.register('prompt-box', {
    setup: function (el) {
      var list = (el.dataset.fxPrompts || 'Résume ce document en trois points|Propose un titre plus court').split('|');
      el.innerHTML = '<span class="fx-prompt-text"></span><span class="fx-prompt-caret" aria-hidden="true"></span><span class="fx-prompt-send" aria-hidden="true"></span>';
      el.setAttribute('role', 'img');
      el.setAttribute('aria-label', 'Exemples de demandes : ' + list.join(' ; '));
      el._fxPrompt = { list: list, i: 0, n: 0, phase: 'type', t: 0, txt: el.querySelector('.fx-prompt-text') };
      if (U.reduced) { el._fxPrompt.txt.textContent = list[0]; el.classList.add('fx-ready'); }
    },
    tick: function (el, dt) {
      if (U.reduced) return;
      var s = el._fxPrompt;
      var word = s.list[s.i];
      s.t += dt * 1000;
      if (s.phase === 'type') {
        if (s.t < U.num(el, 'fxSpeed', 45)) return;
        s.t = 0;
        s.txt.textContent = word.slice(0, ++s.n);
        if (s.n >= word.length) { s.phase = 'hold'; el.classList.add('fx-ready'); }
      } else if (s.phase === 'hold') {
        if (s.t < U.num(el, 'fxHold', 1800)) return;
        s.t = 0;
        s.phase = 'erase';
        el.classList.remove('fx-ready');
      } else {
        if (s.t < 16) return;
        s.t = 0;
        s.n = Math.max(0, s.n - 2);
        s.txt.textContent = word.slice(0, s.n);
        if (!s.n) { s.phase = 'type'; s.i = (s.i + 1) % s.list.length; }
      }
    }
  });

  // Grille dont les lignes s'allument autour du curseur
  FX.register('glow-grid', {
    setup: function (el) {
      if (!U.canHover) return;
      // Écoute la fenêtre : la grille peut ainsi être un calque placé sous le contenu
      window.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        if (e.clientY < r.top - 200 || e.clientY > r.bottom + 200) return;
        el.style.setProperty('--fx-mx', (e.clientX - r.left) + 'px');
        el.style.setProperty('--fx-my', (e.clientY - r.top) + 'px');
      }, { passive: true });
    }
  });

  // Étapes d'un agent : chacune tourne pendant data-fx-step ms puis se coche
  FX.register('thinking-steps', {
    entrance: true,
    reset: function (el) {
      el._fxSteps = (el._fxSteps || 0) + 1;
      Array.prototype.forEach.call(el.children, function (li) { li.classList.remove('fx-active', 'fx-done'); });
    },
    enter: function (el) {
      var items = Array.prototype.slice.call(el.children);
      var run = el._fxSteps = (el._fxSteps || 0) + 1;
      if (U.reduced) { items.forEach(function (li) { li.classList.add('fx-done'); }); return; }
      var step = U.num(el, 'fxStep', 900);
      var i = 0;
      (function next() {
        if (run !== el._fxSteps) return;
        if (i > 0) { items[i - 1].classList.remove('fx-active'); items[i - 1].classList.add('fx-done'); }
        if (i >= items.length) { el.dispatchEvent(new CustomEvent('fx:done', { bubbles: true })); return; }
        items[i].classList.add('fx-active');
        i++;
        setTimeout(next, step * (.7 + Math.random() * .6));
      })();
    }
  });
})(window.FX);
