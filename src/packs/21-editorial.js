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

  // Une référence amène à sa note, qui rebondit pour se signaler
  FX.register('footnote-spring', {
    setup: function (el) {
      el.addEventListener('click', function (e) {
        var a = e.target.closest('a[href^="#"]');
        if (!a) return;
        var t = document.querySelector(a.getAttribute('href').length > 1 ? a.getAttribute('href') : null);
        if (!t) return;
        e.preventDefault();
        t.scrollIntoView({ behavior: U.reduced ? 'auto' : 'smooth', block: 'center' });
        t.classList.remove('fx-fn'); void t.offsetWidth; t.classList.add('fx-fn');
        if (!t.hasAttribute('tabindex')) t.tabIndex = -1;
        t.focus({ preventScroll: true });
      });
    }
  });

  // Un autocollant se décolle un peu au survol
  FX.register('sticker-peel-hover', {
    setup: function (el) {
      el.style.setProperty('--fx-rot', U.rand(-8, 8).toFixed(1) + 'deg');
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--fx-rx', (-(e.clientY - r.top) / r.height * 18 + 9).toFixed(1) + 'deg');
        el.style.setProperty('--fx-ry', ((e.clientX - r.left) / r.width * 22 - 11).toFixed(1) + 'deg');
      });
      el.addEventListener('pointerleave', function () { el.style.setProperty('--fx-rx', '0deg'); el.style.setProperty('--fx-ry', '0deg'); });
    }
  });

  // Un soulignement ondulé se dessine sous le lien
  FX.register('underline-wave-draw', {
    setup: function (el) {
      var w = Math.max(60, Math.round(el.offsetWidth || 120)), d = 'M0 5', n = Math.round(w / 12);
      for (var i = 0; i < n; i++) d += ' q ' + (w / n / 2).toFixed(1) + ' ' + (i % 2 ? 7 : -7) + ' ' + (w / n).toFixed(1) + ' 0';
      var s = U.make('span', 'fx-uwd', el);
      s.setAttribute('aria-hidden', 'true');
      s.innerHTML = '<svg viewBox="0 0 ' + w + ' 10" preserveAspectRatio="none"><path pathLength="1" d="' + d + '"/></svg>';
    }
  });

  // Des réactions s'envolent quand on clique
  FX.register('emoji-burst', {
    triggerOn: 'click',
    trigger: function (el) {
      if (U.reduced) return;
      U.ensurePositioned(el);
      var list = (el.dataset.fxIcons || '♥|★|✦').split('|');
      for (var i = 0; i < U.num(el, 'fxCount', 6); i++) {
        var s = U.make('span', 'fx-eb', el);
        s.setAttribute('aria-hidden', 'true');
        s.textContent = list[Math.floor(Math.random() * list.length)];
        s.style.setProperty('--fx-x', U.rand(-50, 50).toFixed(0) + 'px');
        s.style.setProperty('--fx-y', U.rand(-120, -60).toFixed(0) + 'px');
        s.style.setProperty('--fx-r', U.rand(-40, 40).toFixed(0) + 'deg');
        s.style.animationDelay = i * 40 + 'ms';
        setTimeout(function (n) { n.remove(); }.bind(null, s), 1300);
      }
    }
  });

  // Une grille d'aiguilles s'oriente vers le curseur
  FX.register('cursor-compass', {
    setup: function (el) {
      var n = U.num(el, 'fxCount', 42);
      el.setAttribute('aria-hidden', 'true');
      for (var i = 0; i < n; i++) U.make('i', '', el);
      var nodes = el.children;
      var look = function (x, y) {
        for (var k = 0; k < nodes.length; k++) {
          var r = nodes[k].getBoundingClientRect();
          nodes[k].style.transform = 'rotate(' + Math.atan2(y - r.top - r.height / 2, x - r.left - r.width / 2).toFixed(3) + 'rad)';
        }
      };
      if (!U.reduced) window.addEventListener('pointermove', function (e) {
        var b = el.getBoundingClientRect();
        if (b.bottom < -100 || b.top > innerHeight + 100) return;
        look(e.clientX, e.clientY);
      }, { passive: true });
      el._fxLook = look;
      el._fxA = 0;
    },
    tick: function (el, dt) {
      if (U.reduced || U.canHover) return;
      el._fxA += dt;
      var b = el.getBoundingClientRect();
      el._fxLook(b.left + b.width / 2 + Math.cos(el._fxA) * 100, b.top + b.height / 2 + Math.sin(el._fxA) * 100);
    }
  });

  // Un double appui sur l'image fait apparaître un cœur
  FX.register('double-click-like', {
    setup: function (el) {
      U.ensurePositioned(el);
      el._fxBurst = function (x, y) {
        var h = U.make('span', 'fx-dcl', el);
        h.textContent = '♥';
        h.setAttribute('aria-hidden', 'true');
        h.style.left = x + 'px';
        h.style.top = y + 'px';
        h.style.setProperty('--fx-r', U.rand(-16, 16).toFixed(0) + 'deg');
        setTimeout(function () { h.remove(); }, 900);
        el.dispatchEvent(new CustomEvent('fx:like', { bubbles: true }));
      };
      el.addEventListener('dblclick', function (e) {
        var r = el.getBoundingClientRect();
        el._fxBurst(e.clientX - r.left, e.clientY - r.top);
      });
    },
    trigger: function (el) { el._fxBurst(el.offsetWidth / 2, el.offsetHeight / 2); }
  });

  // Un curseur dont la valeur suit dans une bulle
  FX.register('range-bubble', {
    setup: function (el) {
      var input = el.querySelector('input[type="range"]');
      if (!input) return;
      var b = U.make('output', 'fx-rb', el), unit = el.dataset.fxUnit || '';
      var upd = function () {
        var min = +input.min || 0, max = +input.max || 100, p = (input.value - min) / (max - min);
        el.style.setProperty('--fx-p', p.toFixed(3));
        b.textContent = input.value + unit;
      };
      input.addEventListener('input', upd);
      input.addEventListener('pointerdown', function () { el.classList.add('fx-on'); });
      input.addEventListener('focus', function () { el.classList.add('fx-on'); });
      input.addEventListener('blur', function () { el.classList.remove('fx-on'); });
      window.addEventListener('pointerup', function () { if (document.activeElement !== input) el.classList.remove('fx-on'); });
      upd();
    }
  });

  // Une info-bulle riche suit le curseur sans quitter l'écran
  FX.register('rich-tooltip-follow', {
    setup: function (el) {
      var tip = U.make('div', 'fx-rt', document.body);
      tip.setAttribute('role', 'tooltip');
      tip.textContent = el.dataset.fxTip || '';
      var id = 'fx-rt-' + Math.random().toString(36).slice(2, 7);
      tip.id = id;
      el.setAttribute('aria-describedby', id);
      if (!el.hasAttribute('tabindex') && !el.matches('a,button,input')) el.tabIndex = 0;
      var to;
      var place = function (x, y) {
        var w = tip.offsetWidth, h = tip.offsetHeight;
        tip.style.left = U.clamp(x + 14, 8, innerWidth - w - 8) + 'px';
        tip.style.top = U.clamp(y + 16, 8, innerHeight - h - 8) + 'px';
      };
      var show = function () { clearTimeout(to); to = setTimeout(function () { tip.classList.add('fx-on'); }, U.num(el, 'fxDelay', 120)); };
      var hide = function () { clearTimeout(to); tip.classList.remove('fx-on'); };
      el.addEventListener('pointermove', function (e) { place(e.clientX, e.clientY); });
      el.addEventListener('pointerenter', show);
      el.addEventListener('pointerleave', hide);
      el.addEventListener('focus', function () { var r = el.getBoundingClientRect(); place(r.left, r.bottom); show(); });
      el.addEventListener('blur', hide);
      el.addEventListener('keydown', function (e) { if (e.key === 'Escape') hide(); });
    }
  });

  // Des pastilles de couleur changent la teinte d'un produit
  FX.register('color-picker-orbit', {
    setup: function (el) {
      var cols = (el.dataset.fxColors || '#e10600|#ffd400|#0047ff|#111111').split('|');
      var names = (el.dataset.fxNames || cols.join('|')).split('|');
      var t = el.dataset.fxTarget && document.querySelector(el.dataset.fxTarget);
      el.setAttribute('role', 'radiogroup');
      el.setAttribute('aria-label', el.getAttribute('aria-label') || 'Couleur');
      cols.forEach(function (c, i) {
        var b = U.make('button', '', el);
        b.type = 'button';
        b.setAttribute('role', 'radio');
        b.setAttribute('aria-label', names[i]);
        b.style.setProperty('--fx-c', c);
        b.addEventListener('click', function () {
          el.querySelectorAll('button').forEach(function (o) { o.setAttribute('aria-checked', o === b); });
          if (t) t.style.setProperty('--fx-color', c);
          el.dispatchEvent(new CustomEvent('fx:change', { bubbles: true, detail: { color: c } }));
        });
        if (!i) b.setAttribute('aria-checked', 'true');
      });
    }
  });

  // Une pagination dont l'indicateur s'étire d'une page à l'autre
  FX.register('pagination-squeeze', {
    setup: function (el) {
      var n = U.num(el, 'fxPages', 5), cur = 1, nav = el;
      nav.setAttribute('aria-label', nav.getAttribute('aria-label') || 'Pagination');
      U.make('i', 'fx-pgs', el).setAttribute('aria-hidden', 'true');
      var bs = [];
      var go = function (p) {
        cur = U.clamp(p, 1, n);
        bs.forEach(function (b, i) { var on = i === cur - 1; b.setAttribute('aria-current', on ? 'page' : 'false'); });
        var a = bs[cur - 1];
        el.style.setProperty('--fx-l', a.offsetLeft + 'px');
        el.style.setProperty('--fx-w', a.offsetWidth + 'px');
        el.dispatchEvent(new CustomEvent('fx:page', { bubbles: true, detail: { page: cur } }));
      };
      for (var i = 1; i <= n; i++) (function (k) {
        var b = U.make('button', '', el);
        b.type = 'button'; b.textContent = k;
        b.addEventListener('click', function () { go(k); });
        bs.push(b);
      })(i);
      go(1);
      el._fxGo = function () { go(cur % n + 1); };
    },
    trigger: function (el) { el._fxGo(); }
  });

  // Une foire aux questions dont le plus se change en moins
  FX.register('accordion-plus-morph', {
    setup: function (el) {
      var single = el.dataset.fxSingle !== 'false';
      var items = Array.prototype.slice.call(el.children);
      items.forEach(function (it) {
        var b = it.querySelector('button');
        if (!b) return;
        b.setAttribute('aria-expanded', 'false');
        U.make('i', 'fx-apm', b).setAttribute('aria-hidden', 'true');
        b.addEventListener('click', function () {
          var on = b.getAttribute('aria-expanded') !== 'true';
          if (single) items.forEach(function (o) { var x = o.querySelector('button'); if (x) x.setAttribute('aria-expanded', 'false'); o.classList.remove('fx-open'); });
          b.setAttribute('aria-expanded', on);
          it.classList.toggle('fx-open', on);
        });
      });
    }
  });
})(window.FX);
