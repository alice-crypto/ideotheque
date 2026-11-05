/* Pack 21 — Détails éditoriaux */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Une lettrine entre en grand et le texte se place autour d'elle
  FX.register('drop-cap-draw', {
    entrance: true,
    setup: function (el) {
      var t = el.textContent.trim();
      el.setAttribute('aria-label', t);
      el.textContent = '';
      var c = U.make('span', 'fx-dc', el);
      c.textContent = t.charAt(0);
      c.setAttribute('aria-hidden', 'true');
      var r = U.make('span', 'fx-dc-r', el);
      r.textContent = t.slice(1);
      r.setAttribute('aria-hidden', 'true');
    }
  });

  // Une note en marge s'éclaire quand on survole sa référence
  FX.register('margin-note', {
    setup: function (el) {
      var refs = el.querySelectorAll('[data-note]');
      refs.forEach(function (r, i) {
        r.classList.add('fx-mn-ref');
        r.tabIndex = 0;
        var n = document.createElement('small');
        n.className = 'fx-mn';
        n.textContent = (i + 1) + '. ' + r.dataset.note;
        r.appendChild(n);
        r.style.setProperty('--fx-n', '"' + (i + 1) + '"');
      });
    }
  });

  // Une grande citation monte, précédée de ses guillemets
  FX.register('pull-quote-rise', {
    entrance: true,
    setup: function (el) {
      var r = function () { U.splitLines(el); };
      r();
      U.onResize(r);
    }
  });

  // Un petit bandeau indique le temps de lecture restant
  FX.register('reading-time-bar', {
    setup: function (el) {
      var target = document.querySelector(el.dataset.fxTarget || 'article');
      var words = target ? target.textContent.trim().split(/\s+/).length : U.num(el, 'fxWords', 1200);
      el._fxMin = Math.max(1, Math.ceil(words / U.num(el, 'fxWpm', 220)));
      el._fxT = target;
      el.setAttribute('role', 'status');
      el.innerHTML = '<span></span><i></i>';
    },
    scroll: function (el, info) {
      var p = info.pass;
      if (el._fxT) { var r = el._fxT.getBoundingClientRect(); p = U.clamp(-r.top / Math.max(1, r.height - info.vh), 0, 1); }
      var m = Math.ceil(el._fxMin * (1 - p));
      if (m !== el._fxLast) { el._fxLast = m; el.firstChild.textContent = m > 0 ? m + ' min restante' + (m > 1 ? 's' : '') : 'Lecture terminée'; }
      el.style.setProperty('--fx-p', p.toFixed(3));
    }
  });

  // Autour du curseur, les mots sont nets et le reste s'estompe
  FX.register('kerning-focus', {
    setup: function (el) {
      U.splitWords(el);
      var ws = el.querySelectorAll('.fx-word');
      el.addEventListener('pointermove', function (e) {
        ws.forEach(function (w) {
          var r = w.getBoundingClientRect();
          var d = Math.hypot(r.left + r.width / 2 - e.clientX, r.top + r.height / 2 - e.clientY);
          w.style.setProperty('--fx-k', U.clamp(1 - d / U.num(el, 'fxRadius', 130), .12, 1).toFixed(2));
        });
      });
      el.addEventListener('pointerleave', function () { ws.forEach(function (w) { w.style.removeProperty('--fx-k'); }); });
    }
  });

  // Un bandeau d'informations qu'on peut mettre en pause
  FX.register('news-ticker-pause', {
    setup: function (el) {
      var items = Array.prototype.slice.call(el.children);
      var track = document.createElement('div');
      track.className = 'fx-nt';
      items.forEach(function (i) { track.appendChild(i); });
      el.appendChild(track);
      items.forEach(function (i) { var c = i.cloneNode(true); c.setAttribute('aria-hidden', 'true'); c.querySelectorAll('a').forEach(function (a) { a.tabIndex = -1; }); track.appendChild(c); });
      var b = U.make('button', 'fx-nt-b', el);
      b.type = 'button';
      var set = function (p) { el.classList.toggle('fx-paused', p); b.textContent = p ? '▶' : '❚❚'; b.setAttribute('aria-label', p ? 'Reprendre' : 'Mettre en pause'); };
      set(U.reduced);
      b.addEventListener('click', function () { set(!el.classList.contains('fx-paused')); });
      el.style.setProperty('--fx-t', (track.scrollWidth / 2 / U.num(el, 'fxSpeed', 50)).toFixed(1) + 's');
    }
  });

  // Une phrase bascule entre deux langues, lettre par lettre
  FX.register('bilingual-toggle', {
    setup: function (el) {
      var a = el.textContent.trim(), b = el.dataset.fxOther || a, cur = a, lang = false;
      el.setAttribute('aria-label', a);
      var morph = function (to) {
        var from = cur, n = Math.max(from.length, to.length);
        U.tween(el, U.num(el, 'fxDuration', 650), function (p) {
          var c = Math.floor(p * (n + 6)), s = '';
          for (var i = 0; i < n; i++) {
            if (i < c - 6) s += to.charAt(i);
            else if (i < c) s += to.charAt(i) && to.charAt(i) !== ' ' ? U.GLYPHS.charAt(Math.floor(Math.random() * U.GLYPHS.length)) : ' ';
            else s += from.charAt(i);
          }
          el.textContent = p >= 1 ? to : s;
        }, function () { cur = to; el.textContent = to; el.setAttribute('aria-label', to); });
      };
      el._fxFlip = function () { lang = !lang; morph(lang ? b : a); };
      el.addEventListener('click', el._fxFlip);
    },
    trigger: function (el) { el._fxFlip(); }
  });

  // Un champ d'écriture qui compte les mots jusqu'à un objectif
  FX.register('word-counter-goal', {
    setup: function (el) {
      var area = el.querySelector('textarea,[contenteditable]'), goal = U.num(el, 'fxGoal', 30);
      var out = U.make('div', 'fx-wc', el);
      out.setAttribute('aria-live', 'polite');
      var upd = function () {
        var t = area ? (area.value != null ? area.value : area.textContent) : '';
        var n = t.trim() ? t.trim().split(/\s+/).length : 0, ok = n >= goal;
        el.style.setProperty('--fx-q', Math.min(1, n / goal).toFixed(3));
        out.textContent = n + ' / ' + goal + ' mots';
        if (ok !== el._fxOk) { el._fxOk = ok; el.classList.toggle('fx-goal', ok); if (ok) el.dispatchEvent(new CustomEvent('fx:goal', { bubbles: true })); }
      };
      if (area) area.addEventListener('input', upd);
      upd();
    }
  });

  // Un spécimen de police qu'on règle en direct
  FX.register('typo-specimen', {
    setup: function (el) {
      var txt = el.textContent.trim() || 'Aa';
      el.innerHTML = '<div class="fx-ts-v" contenteditable="true" spellcheck="false" aria-label="Texte du spécimen"></div><label>Taille <input type="range" min="16" max="120" value="48"></label><label>Graisse <input type="range" min="100" max="900" step="100" value="500"></label>';
      var v = el.firstChild;
      v.textContent = txt;
      el.querySelectorAll('input').forEach(function (r, i) {
        var set = function () { v.style.setProperty(i ? '--fx-w' : '--fx-s', r.value + (i ? '' : 'px')); };
        r.addEventListener('input', set);
        set();
      });
    }
  });

  // Dans un titre fixe, un mot change avec la section
  FX.register('headline-replace-scroll', {
    setup: function (el) {
      el._fxSecs = Array.prototype.slice.call(document.querySelectorAll(el.dataset.fxTarget || '[data-word]'));
      el._fxWords = (el.dataset.fxWords || 'créer|tester|publier').split('|');
      el.setAttribute('aria-live', 'off');
      el.innerHTML = '<span class="fx-hr-w"></span>';
      el._fxBox = el.firstChild;
      el._fxI = -1;
    },
    scroll: function (el, info) {
      var i;
      if (el._fxSecs.length) {
        i = 0;
        el._fxSecs.forEach(function (s, k) { if (s.getBoundingClientRect().top < info.vh / 2) i = k; });
      } else i = Math.min(el._fxWords.length - 1, Math.floor(info.pass * el._fxWords.length));
      if (i === el._fxI) return;
      el._fxI = i;
      var w = el._fxSecs.length ? el._fxSecs[i].dataset.word : el._fxWords[i];
      var s = document.createElement('span');
      s.className = 'fx-hr-in';
      s.textContent = w;
      el._fxBox.textContent = '';
      el._fxBox.appendChild(s);
    }
  });

  // Des mots clés se surlignent l'un après l'autre dans le texte
  FX.register('highlight-terms-sweep', {
    entrance: true,
    setup: function (el) {
      var terms = (el.dataset.fxTerms || '').split('|').filter(Boolean);
      if (!terms.length) return;
      var esc = function (s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); };
      var re = new RegExp('(' + terms.map(esc).join('|') + ')', 'gi'), i = 0;
      var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach(function (n) {
        if (!re.test(n.nodeValue)) return;
        re.lastIndex = 0;
        var f = document.createDocumentFragment(), parts = n.nodeValue.split(re);
        parts.forEach(function (p, k) {
          if (k % 2) { var m = document.createElement('mark'); m.textContent = p; m.style.setProperty('--fx-i', i++); f.appendChild(m); }
          else if (p) f.appendChild(document.createTextNode(p));
        });
        n.replaceWith(f);
      });
    }
  });
})(window.FX);
