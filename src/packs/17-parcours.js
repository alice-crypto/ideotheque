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
})(window.FX);
