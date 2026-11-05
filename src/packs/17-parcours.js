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

  // Une barre en pilule qui se réduit quand on descend
  FX.register('pill-nav-morph', {
    setup: function (el) {
      var lastY = window.scrollY;
      var upd = function () {
        var y = window.scrollY;
        if (Math.abs(y - lastY) < 6) return;
        el.classList.toggle('fx-small', y > lastY && y > U.num(el, 'fxAfter', 120));
        lastY = y;
      };
      window.addEventListener('scroll', upd, { passive: true });
      el.addEventListener('pointerenter', function () { el.classList.remove('fx-small'); });
      el.addEventListener('focusin', function () { el.classList.remove('fx-small'); });
      if (el.dataset.fxDemo) setInterval(function () { el.classList.toggle('fx-small'); }, 1800);
    }
  });

  // Un rail vertical indique la section et la progression
  FX.register('rail-progress-nav', {
    setup: function (el) {
      var links = Array.prototype.slice.call(el.querySelectorAll('a[href^="#"]'));
      el._fxL = links.map(function (a) { return { a: a, t: document.querySelector(a.getAttribute('href').length > 1 ? a.getAttribute('href') : null) }; }).filter(function (o) { return o.t; });
      links.forEach(function (a) { U.make('i', '', a).setAttribute('aria-hidden', 'true'); });
      if (!el._fxL.length && links.length) links[0].classList.add('fx-cur');
    },
    scroll: function (el, info) {
      if (!el._fxL.length) { el.style.setProperty('--fx-q', info.pass.toFixed(3)); return; }
      var cur = 0, mid = info.vh / 2;
      el._fxL.forEach(function (o, i) { if (o.t.getBoundingClientRect().top < mid) cur = i; });
      el._fxL.forEach(function (o, i) {
        var on = i === cur;
        o.a.classList.toggle('fx-cur', on);
        if (on) { o.a.setAttribute('aria-current', 'true'); var r = o.t.getBoundingClientRect(); o.a.style.setProperty('--fx-q', U.clamp((mid - r.top) / r.height, 0, 1).toFixed(3)); }
        else o.a.removeAttribute('aria-current');
      });
    }
  });

  // Une palette de commandes qui filtre en direct
  FX.register('command-dock', {
    setup: function (el) {
      var input = el.querySelector('input'), items = Array.prototype.slice.call(el.querySelectorAll('li')), cur = 0;
      if (!input) return;
      input.setAttribute('role', 'combobox');
      input.setAttribute('aria-expanded', 'true');
      var list = el.querySelector('ul');
      if (list) list.setAttribute('role', 'listbox');
      var vis = function () { return items.filter(function (i) { return !i.hidden; }); };
      var mark = function () {
        var v = vis();
        items.forEach(function (i) { i.classList.remove('fx-cur'); i.setAttribute('role', 'option'); i.setAttribute('aria-selected', 'false'); });
        if (v[cur]) { v[cur].classList.add('fx-cur'); v[cur].setAttribute('aria-selected', 'true'); }
      };
      input.addEventListener('input', function () {
        var q = input.value.trim().toLowerCase();
        items.forEach(function (i) { i.hidden = i.textContent.toLowerCase().indexOf(q) === -1; });
        cur = 0; mark();
      });
      input.addEventListener('keydown', function (e) {
        var v = vis();
        if (e.key === 'ArrowDown') { e.preventDefault(); cur = (cur + 1) % Math.max(1, v.length); mark(); }
        if (e.key === 'ArrowUp') { e.preventDefault(); cur = (cur - 1 + v.length) % Math.max(1, v.length); mark(); }
        if (e.key === 'Enter' && v[cur]) { e.preventDefault(); el.dispatchEvent(new CustomEvent('fx:pick', { bubbles: true, detail: { text: v[cur].textContent.trim() } })); var a = v[cur].querySelector('a'); if (a) a.click(); }
      });
      items.forEach(function (i, k) { i.style.setProperty('--fx-i', k); i.addEventListener('pointerenter', function () { cur = vis().indexOf(i); mark(); }); });
      mark();
      window.addEventListener('keydown', function (e) { if ((e.ctrlKey || e.metaKey) && e.key === 'k' && el.dataset.fxShortcut === 'true') { e.preventDefault(); input.focus(); } });
    }
  });

  // Un fil d'Ariane qui replie ses niveaux intermédiaires
  FX.register('breadcrumb-fold', {
    setup: function (el) {
      var items = Array.prototype.slice.call(el.children);
      if (items.length <= U.num(el, 'fxKeep', 3)) return;
      var mid = items.slice(1, -1);
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'fx-bc-more';
      btn.textContent = '…';
      btn.setAttribute('aria-label', 'Afficher ' + mid.length + ' niveaux');
      btn.setAttribute('aria-expanded', 'false');
      el.insertBefore(btn, items[1]);
      mid.forEach(function (m, i) { m.classList.add('fx-bc-mid'); m.style.setProperty('--fx-i', i); });
      btn.addEventListener('click', function () {
        el.classList.add('fx-open');
        btn.setAttribute('aria-expanded', 'true');
        btn.hidden = true;
        if (mid[0].querySelector('a')) mid[0].querySelector('a').focus();
      });
    }
  });

  // Les titres de section s'empilent en haut de l'écran
  FX.register('sticky-stack-nav', {
    setup: function (el) {
      var layout = function () {
        var heads = el.querySelectorAll(el.dataset.fxHead || 'h2,h3');
        var top = U.num(el, 'fxTop', 0);
        heads.forEach(function (h, i) { h.style.setProperty('--fx-top', top + 'px'); h.style.zIndex = 10 + i; top += h.offsetHeight; });
        heads.forEach(function (h, i) { h.style.setProperty('--fx-bot', (top - parseFloat(h.style.getPropertyValue('--fx-top')) - h.offsetHeight) + 'px'); });
      };
      layout();
      U.onResize(layout);
    }
  });

  // Un panneau qu'on tire vers le haut depuis le bas de l'écran
  FX.register('page-peek', {
    setup: function (el) {
      var handle = el.querySelector('button') || el.firstElementChild, startY = 0, base = 0, drag = false, stops = [0, .5, 1], cur = 0;
      var H = function () { return el.offsetHeight - U.num(el, 'fxPeek', 56); };
      var go = function (i) {
        cur = i;
        el.style.setProperty('--fx-pos', (H() * (1 - stops[i])) + 'px');
        if (handle) handle.setAttribute('aria-expanded', i > 0);
      };
      go(0);
      if (!handle) return;
      handle.addEventListener('pointerdown', function (e) { drag = true; startY = e.clientY; base = H() * (1 - stops[cur]); el.classList.add('fx-drag'); if (e.isTrusted) handle.setPointerCapture(e.pointerId); });
      handle.addEventListener('pointermove', function (e) { if (drag) el.style.setProperty('--fx-pos', U.clamp(base + e.clientY - startY, 0, H()) + 'px'); });
      handle.addEventListener('pointerup', function (e) {
        if (!drag) return;
        drag = false; el.classList.remove('fx-drag');
        var moved = Math.abs(e.clientY - startY) > 6;
        if (!moved) return go((cur + 1) % stops.length);
        var q = 1 - parseFloat(el.style.getPropertyValue('--fx-pos')) / H(), best = 0;
        stops.forEach(function (s, i) { if (Math.abs(s - q) < Math.abs(stops[best] - q)) best = i; });
        go(best);
      });
      handle.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go((cur + 1) % stops.length); } });
    }
  });

  // Une rangée horizontale avec accroche et commandes
  FX.register('horizontal-snap', {
    setup: function (el) {
      var track = el.firstElementChild, items = Array.prototype.slice.call(track.children), cur = 0;
      var bar = U.make('div', 'fx-hs-bar', el);
      bar.innerHTML = '<button type="button" aria-label="Précédent">←</button><span class="fx-hs-dots"></span><button type="button" aria-label="Suivant">→</button>';
      var dots = bar.querySelector('.fx-hs-dots');
      items.forEach(function (it, i) {
        var d = U.make('i', '', dots);
        d.addEventListener('click', function () { go(i); });
      });
      var go = function (i) {
        i = U.clamp(i, 0, items.length - 1);
        track.scrollTo({ left: items[i].offsetLeft - track.offsetLeft, behavior: U.reduced ? 'auto' : 'smooth' });
      };
      bar.firstChild.addEventListener('click', function () { go(cur - 1); });
      bar.lastChild.addEventListener('click', function () { go(cur + 1); });
      var mark = function () {
        var best = 0, bd = 1e9;
        items.forEach(function (it, i) { var d = Math.abs(it.offsetLeft - track.offsetLeft - track.scrollLeft); if (d < bd) { bd = d; best = i; } });
        cur = best;
        Array.prototype.forEach.call(dots.children, function (d, i) { d.classList.toggle('fx-on', i === best); });
      };
      track.addEventListener('scroll', function () { U.raf(mark); }, { passive: true });
      mark();
    }
  });

  // Deux panneaux : celui qu'on survole prend presque toute la place
  FX.register('split-hover-hero', {
    setup: function (el) {
      var k = Array.prototype.slice.call(el.children);
      var set = function (i) { k.forEach(function (c, j) { c.style.setProperty('--fx-g', i === j ? U.num(el, 'fxGrow', 3) : 1); c.classList.toggle('fx-on', i === j); }); };
      k.forEach(function (c, i) {
        c.addEventListener('pointerenter', function () { set(i); });
        c.addEventListener('focusin', function () { set(i); });
      });
      el.addEventListener('pointerleave', function () { set(-1); });
    }
  });

  // Un mur dont les colonnes se remplissent et se réorganisent en douceur
  FX.register('masonry-flow', {
    setup: function (el) {
      var kids = Array.prototype.slice.call(el.children);
      var layout = function () {
        var w = el.clientWidth, gap = U.num(el, 'fxGap', 8), min = U.num(el, 'fxMin', 80);
        var cols = Math.max(1, Math.floor((w + gap) / (min + gap))), cw = (w - gap * (cols - 1)) / cols, H = new Array(cols).fill(0);
        kids.forEach(function (k) {
          k.style.width = cw + 'px';
          var c = H.indexOf(Math.min.apply(null, H));
          k.style.transform = 'translate(' + (c * (cw + gap)) + 'px,' + H[c] + 'px)';
          H[c] += k.offsetHeight + gap;
        });
        el.style.height = Math.max.apply(null, H) + 'px';
      };
      layout();
      U.onResize(layout);
      el.querySelectorAll('img').forEach(function (i) { if (!i.complete) i.addEventListener('load', layout); });
    }
  });

  // Le trait d'onglet s'étire jusqu'au suivant avant de se rétracter
  FX.register('tab-underline-ink', {
    setup: function (el) {
      var tabs = Array.prototype.slice.call(el.querySelectorAll('[role="tab"],button,a'));
      var ink = U.make('i', 'fx-ink', el);
      ink.setAttribute('aria-hidden', 'true');
      var L = 0, R = 0;
      var move = function (t, instant) {
        var r = t.getBoundingClientRect(), o = el.getBoundingClientRect();
        var nl = r.left - o.left, nr = o.right - r.right;
        var right = nl > L;
        ink.style.transitionDelay = instant ? '0s' : (right ? '.09s, 0s' : '0s, .09s');
        if (instant) ink.style.transitionDuration = '0s';
        el.style.setProperty('--fx-l', nl + 'px');
        el.style.setProperty('--fx-r', nr + 'px');
        L = nl; R = nr;
        if (instant) { void ink.offsetWidth; ink.style.transitionDuration = ''; }
      };
      tabs.forEach(function (t) {
        t.addEventListener('click', function () {
          tabs.forEach(function (o) { o.setAttribute('aria-selected', o === t); });
          move(t);
        });
      });
      var first = tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0] || tabs[0];
      if (first) { first.setAttribute('aria-selected', 'true'); move(first, true); }
      U.onResize(function () { var a = el.querySelector('[aria-selected="true"]'); if (a) move(a, true); });
    }
  });

  // Une barre d'onglets dont le renflement glisse sous l'icône active
  FX.register('mobile-tabbar-bump', {
    setup: function (el) {
      var tabs = Array.prototype.slice.call(el.querySelectorAll('button,a'));
      U.make('i', 'fx-bump', el).setAttribute('aria-hidden', 'true');
      var set = function (t) {
        tabs.forEach(function (o) { o.classList.toggle('fx-cur', o === t); if (o === t) o.setAttribute('aria-current', 'page'); else o.removeAttribute('aria-current'); });
        el.style.setProperty('--fx-x', (t.offsetLeft + t.offsetWidth / 2) + 'px');
      };
      tabs.forEach(function (t) { t.addEventListener('click', function (e) { if (t.tagName === 'A' && t.getAttribute('href') === '#') e.preventDefault(); set(t); }); });
      if (tabs[0]) set(tabs[0]);
      U.onResize(function () { var c = el.querySelector('.fx-cur'); if (c) set(c); });
    }
  });

  // Une miniature de la page montre où se trouve l'écran
  FX.register('toc-minimap', {
    setup: function (el) {
      var secs = Array.prototype.slice.call(document.querySelectorAll(el.dataset.fxTarget || 'main > section'));
      el._fxV = U.make('i', 'fx-mm-view', el);
      el._fxSecs = secs;
      el.setAttribute('role', 'navigation');
      el.setAttribute('aria-label', 'Plan de la page');
      if (!secs.length) { for (var i = 0; i < 6; i++) U.make('b', '', el).style.flex = 1 + i % 3; return; }
      var tot = document.documentElement.scrollHeight;
      secs.forEach(function (s, i) {
        var b = document.createElement('a');
        b.href = s.id ? '#' + s.id : '#';
        b.style.flex = s.offsetHeight / tot;
        b.setAttribute('aria-label', (s.querySelector('h1,h2,h3') || {}).textContent || 'Section ' + (i + 1));
        el.appendChild(b);
      });
    },
    scroll: function (el, info) {
      var tot = document.documentElement.scrollHeight;
      el._fxV.style.setProperty('--fx-t', (window.scrollY / tot * 100).toFixed(2) + '%');
      el._fxV.style.setProperty('--fx-h', Math.max(6, info.vh / tot * 100).toFixed(2) + '%');
    }
  });

  // Un menu radial qui s'ouvre sous le curseur
  FX.register('cursor-menu-ring', {
    setup: function (el) {
      var items = Array.prototype.slice.call(el.querySelectorAll('button,a')), n = items.length, cur = -1;
      items.forEach(function (b, i) {
        var a = i / n * 6.283 - 1.571;
        b.style.setProperty('--fx-x', (Math.cos(a) * U.num(el, 'fxRadius', 62)).toFixed(1) + 'px');
        b.style.setProperty('--fx-y', (Math.sin(a) * U.num(el, 'fxRadius', 62)).toFixed(1) + 'px');
        b.style.setProperty('--fx-i', i);
      });
      var open = function (x, y) {
        var o = (el.offsetParent || el.parentElement).getBoundingClientRect();
        el.style.left = (x - o.left) + 'px';
        el.style.top = (y - o.top) + 'px';
        el.classList.add('fx-open');
      };
      var close = function () { el.classList.remove('fx-open'); items.forEach(function (b) { b.classList.remove('fx-cur'); }); cur = -1; };
      var host = el.parentElement;
      host.addEventListener('contextmenu', function (e) { e.preventDefault(); open(e.clientX, e.clientY); items[0].focus({ preventScroll: true }); });
      document.addEventListener('pointerdown', function (e) { if (!el.contains(e.target)) close(); });
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') close();
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); items[(items.indexOf(document.activeElement) + 1) % n].focus(); }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); items[(items.indexOf(document.activeElement) - 1 + n) % n].focus(); }
      });
      if (el.dataset.fxDemo) { var r = el.parentElement.getBoundingClientRect(); open(r.left + r.width / 2, r.top + r.height / 2); }
      el._fxOpen = open;
    },
    trigger: function (el, e) { var r = el.parentElement.getBoundingClientRect(); el._fxOpen(r.left + r.width / 2, r.top + r.height / 2); }
  });

  // Des sections empilées comme des onglets de classeur
  FX.register('stacked-sections-tabs', {
    setup: function (el) {
      var secs = Array.prototype.slice.call(el.children), n = secs.length;
      el.style.setProperty('--fx-n', n);
      var open = function (i) {
        secs.forEach(function (s, j) {
          var on = i === j;
          s.classList.toggle('fx-open', on);
          var b = s.querySelector('button');
          if (b) b.setAttribute('aria-expanded', on);
        });
      };
      secs.forEach(function (s, i) {
        var b = s.querySelector('button');
        if (b) b.addEventListener('click', function () { open(i); });
      });
      open(0);
    }
  });

  // Des couvertures en perspective autour de l'élément central
  FX.register('carousel-3d-coverflow', {
    setup: function (el) {
      var k = Array.prototype.slice.call(el.children), cur = Math.floor(k.length / 2);
      el.tabIndex = 0;
      el.setAttribute('role', 'group');
      el.setAttribute('aria-roledescription', 'carrousel');
      var show = function () {
        k.forEach(function (c, i) {
          var d = i - cur;
          c.style.setProperty('--fx-d', d);
          c.style.setProperty('--fx-a', Math.abs(d));
          c.style.zIndex = 20 - Math.abs(d);
          c.setAttribute('aria-hidden', d !== 0);
        });
      };
      k.forEach(function (c, i) { c.addEventListener('click', function () { cur = i; show(); }); });
      el.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') { cur = Math.max(0, cur - 1); show(); }
        if (e.key === 'ArrowRight') { cur = Math.min(k.length - 1, cur + 1); show(); }
      });
      show();
    }
  });

  // Un lien d'évitement qui apparaît au clavier et emmène au contenu
  FX.register('skip-link-reveal', {
    setup: function (el) {
      el.addEventListener('click', function (e) {
        var href = el.getAttribute('href');
        if (!href || href.charAt(0) !== '#' || href.length < 2) return;
        var t = document.querySelector(href);
        if (!t) return;
        e.preventDefault();
        if (!t.hasAttribute('tabindex')) t.setAttribute('tabindex', '-1');
        t.focus({ preventScroll: true });
        t.scrollIntoView({ behavior: U.reduced ? 'auto' : 'smooth' });
      });
    }
  });

  // Un sélecteur de langue dont les sigles se croisent
  FX.register('language-switch-flip', {
    setup: function (el) {
      var langs = (el.dataset.fxLangs || 'FR|EN|ES').split('|'), cur = 0;
      el.setAttribute('aria-label', 'Choisir la langue');
      el.innerHTML = '<span class="fx-ls-now"></span>';
      var now = el.firstChild;
      var render = function (dir) {
        var s = document.createElement('span');
        s.className = 'fx-ls-in';
        s.textContent = langs[cur];
        now.innerHTML = '';
        now.appendChild(s);
      };
      render();
      el.addEventListener('click', function () {
        cur = (cur + 1) % langs.length;
        render();
        document.documentElement.lang = langs[cur].toLowerCase();
        el.dispatchEvent(new CustomEvent('fx:change', { bubbles: true, detail: { lang: langs[cur] } }));
      });
    }
  });
})(window.FX);
