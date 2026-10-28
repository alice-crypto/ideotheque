/* Pack 08 — Navigation et composants d'interface */
(function (FX) {
  'use strict';
  var U = FX.util;

  FX.register('focus-list', {});

  // --- Ouverture / fermeture partagées --------------------------------------

  var openable = ['menu-reveal', 'drawer', 'modal-zoom', 'dropdown'];

  function setOpen(el, open) {
    el.classList.toggle('fx-open', open);
    if (el.dataset.fx !== 'dropdown') el.setAttribute('aria-hidden', open ? 'false' : 'true');
    document.querySelectorAll('[data-fx-toggle]').forEach(function (t) {
      var target = document.querySelector(t.dataset.fxToggle);
      if (target === el) t.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    if (open) {
      var focusable = el.querySelector('a, button, input, [tabindex]');
      if (focusable && el.dataset.fx !== 'dropdown') setTimeout(function () { focusable.focus({ preventScroll: true }); }, 50);
    }
  }
  function toggle(el, e) {
    var open = !el.classList.contains('fx-open');
    var d = el._fxBeforeOpen;
    if (open && d) d(el, e);
    setOpen(el, open);
  }

  // Tout élément [data-fx-toggle="#id"] ouvre ou ferme le composant ciblé
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-fx-toggle]');
    if (t) {
      var target = document.querySelector(t.dataset.fxToggle);
      if (target && FX.has(target.dataset.fx)) { e.preventDefault(); FX.trigger(target, e); }
      return;
    }
    var close = e.target.closest('[data-fx-close]');
    if (close) {
      var host = close.closest('.fx-open');
      if (host) setOpen(host, false);
    }
    // Clic en dehors d'une liste déroulante ouverte : on la ferme
    document.querySelectorAll('[data-fx="dropdown"].fx-open').forEach(function (dd) {
      if (!dd.contains(e.target)) setOpen(dd, false);
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('.fx-open').forEach(function (el) {
      if (openable.indexOf(el.dataset.fx) !== -1) setOpen(el, false);
    });
  });

  function openableDef(extra) {
    return Object.assign({
      setup: function (el) { if (el.dataset.fx !== 'dropdown') el.setAttribute('aria-hidden', 'true'); },
      trigger: toggle
    }, extra || {});
  }

  FX.register('menu-reveal', openableDef({
    setup: function (el) {
      el.setAttribute('aria-hidden', 'true');
      Array.prototype.forEach.call(el.children, function (k, i) { k.style.setProperty('--fx-i', i); });
    }
  }));

  FX.register('drawer', openableDef({
    setup: function (el) {
      el.setAttribute('aria-hidden', 'true');
      // Un clic sur le voile (hors du panneau) ferme le tiroir
      el.addEventListener('click', function (e) { if (e.target === el) setOpen(el, false); });
    }
  }));

  FX.register('modal-zoom', openableDef({
    setup: function (el) {
      el.setAttribute('aria-hidden', 'true');
      el.addEventListener('click', function (e) { if (e.target === el) setOpen(el, false); });
      // Point de départ : le centre de l'élément cliqué, relatif au centre de la fenêtre
      el._fxBeforeOpen = function (modal, e) {
        var src = e && e.target && e.target.getBoundingClientRect ? e.target.getBoundingClientRect() : null;
        var box = modal.getBoundingClientRect();
        if (!src || !box.width) { modal.style.removeProperty('--fx-dx'); modal.style.removeProperty('--fx-dy'); return; }
        modal.style.setProperty('--fx-dx', (src.left + src.width / 2 - (box.left + box.width / 2)).toFixed(0) + 'px');
        modal.style.setProperty('--fx-dy', (src.top + src.height / 2 - (box.top + box.height / 2)).toFixed(0) + 'px');
      };
    }
  }));

  FX.register('dropdown', openableDef({
    setup: function (el) {
      var btn = el.firstElementChild;
      var menu = el.lastElementChild;
      Array.prototype.forEach.call(menu.children, function (k, i) { k.style.setProperty('--fx-i', i); });
      if (btn) {
        btn.setAttribute('aria-expanded', 'false');
        btn.setAttribute('aria-haspopup', 'true');
        btn.addEventListener('click', function (e) {
          e.stopPropagation();
          toggle(el, e);
          btn.setAttribute('aria-expanded', el.classList.contains('fx-open') ? 'true' : 'false');
        });
      }
    }
  }));

  // --- burger-morph ---------------------------------------------------------

  FX.register('burger-morph', {
    setup: function (el) {
      if (!el.children.length) for (var i = 0; i < 3; i++) U.make('span', '', el);
      Array.prototype.forEach.call(el.children, function (s) { s.setAttribute('aria-hidden', 'true'); });
      if (!el.hasAttribute('aria-expanded')) el.setAttribute('aria-expanded', 'false');
      if (!el.hasAttribute('aria-label')) el.setAttribute('aria-label', 'Menu');
    },
    triggerOn: 'click',
    trigger: function (el) {
      // Si le bouton pilote un menu (data-fx-toggle), c'est ce menu qui met à jour aria-expanded
      if (el.dataset.fxToggle) return;
      el.setAttribute('aria-expanded', el.getAttribute('aria-expanded') === 'true' ? 'false' : 'true');
    }
  });

  // --- smart-header / header-shrink -----------------------------------------

  function scrollTopOf(parent) { return parent ? parent.scrollTop : window.scrollY; }

  FX.register('smart-header', {
    setup: function (el) {
      var last = 0;
      U.bindScroll(el, function (v, parent) {
        var y = scrollTopOf(parent);
        var delta = y - last;
        if (Math.abs(delta) > 4) {
          el.classList.toggle('fx-hidden', delta > 0 && y > el.offsetHeight * 1.5);
          last = y;
        }
        el.classList.toggle('fx-scrolled', y > 4);
      });
      el.addEventListener('focusin', function () { el.classList.remove('fx-hidden'); });
    }
  });

  FX.register('header-shrink', {
    setup: function (el) {
      U.bindScroll(el, function (v, parent) {
        el.classList.toggle('fx-small', scrollTopOf(parent) > U.num(el, 'fxAfter', 40));
      });
    }
  });

  // --- tab-slider -----------------------------------------------------------

  FX.register('tab-slider', {
    setup: function (el) {
      var ind = U.make('span', 'fx-indicator');
      ind.setAttribute('aria-hidden', 'true');
      el.insertBefore(ind, el.firstChild);
      el.setAttribute('role', el.getAttribute('role') || 'tablist');
      var tabs = Array.prototype.filter.call(el.children, function (k) { return k !== ind; });
      function place(tab) {
        ind.style.width = tab.offsetWidth + 'px';
        ind.style.height = tab.offsetHeight + 'px';
        ind.style.transform = 'translate(' + tab.offsetLeft + 'px,' + tab.offsetTop + 'px)';
      }
      function select(tab) {
        tabs.forEach(function (t) { t.setAttribute('aria-selected', t === tab ? 'true' : 'false'); });
        place(tab);
      }
      tabs.forEach(function (t) {
        t.setAttribute('role', 'tab');
        t.addEventListener('click', function () { select(t); });
      });
      select(tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0] || tabs[0]);
      U.onResize(function () { var cur = el.querySelector('[aria-selected="true"]'); if (cur) place(cur); });
    }
  });

  // --- dot-nav / scroll-spy (section active selon le défilement) -----------

  function spy(el, onChange) {
    var links = Array.prototype.slice.call(el.querySelectorAll('a[href^="#"]'));
    var targets = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
    var anchor = targets.filter(Boolean)[0] || el;
    U.bindScroll(anchor, function (v) {
      var mid = v.top + v.h * 0.4;
      var current = 0;
      targets.forEach(function (t, i) { if (t && t.getBoundingClientRect().top <= mid) current = i; });
      links.forEach(function (a, i) {
        a.classList.toggle('fx-active', i === current);
        if (i === current) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      });
      if (onChange) onChange(links[current]);
    });
    // Navigation dans une boîte qui défile : on fait défiler la boîte plutôt que la page
    links.forEach(function (a, i) {
      a.addEventListener('click', function (e) {
        var t = targets[i];
        if (!t) return;
        e.preventDefault();
        t.scrollIntoView({ behavior: U.reduced ? 'auto' : 'smooth', block: 'start' });
      });
    });
  }

  FX.register('dot-nav', { setup: function (el) { spy(el); } });

  FX.register('scroll-spy', {
    setup: function (el) {
      var marker = U.make('span', 'fx-marker');
      marker.setAttribute('aria-hidden', 'true');
      el.insertBefore(marker, el.firstChild);
      spy(el, function (a) {
        if (!a) return;
        marker.style.height = a.offsetHeight + 'px';
        marker.style.transform = 'translateY(' + a.offsetTop + 'px)';
      });
    }
  });

  // --- top-ring -------------------------------------------------------------

  FX.register('top-ring', {
    setup: function (el) {
      if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', 'Revenir en haut de la page');
      el.insertAdjacentHTML('afterbegin', '<svg viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="23"/></svg>');
      if (!el.textContent.trim()) el.insertAdjacentHTML('beforeend', '<span aria-hidden="true">↑</span>');
      var circle = el.querySelector('circle');
      var len = 2 * Math.PI * 23;
      circle.style.strokeDasharray = len;
      U.bindScroll(el, function () {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        var p = max > 0 ? window.scrollY / max : 0;
        circle.style.strokeDashoffset = (len * (1 - p)).toFixed(1);
        el.classList.toggle('fx-visible', el.dataset.fxLocal != null || window.scrollY > window.innerHeight * 0.5);
      });
      el.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: U.reduced ? 'auto' : 'smooth' });
      });
    }
  });

  // --- hover-pill -----------------------------------------------------------

  FX.register('hover-pill', {
    setup: function (el) {
      var pill = U.make('span', 'fx-pill');
      pill.setAttribute('aria-hidden', 'true');
      el.insertBefore(pill, el.firstChild);
      function place(item) {
        pill.style.width = item.offsetWidth + 'px';
        pill.style.height = item.offsetHeight + 'px';
        pill.style.transform = 'translate(' + item.offsetLeft + 'px,' + item.offsetTop + 'px)';
      }
      Array.prototype.forEach.call(el.children, function (item) {
        if (item === pill) return;
        item.addEventListener('pointerenter', function () {
          if (!pill.classList.contains('fx-on')) {
            pill.style.transition = 'none';
            place(item);
            void pill.offsetWidth;
            pill.style.transition = '';
          }
          place(item);
          pill.classList.add('fx-on');
        });
        item.addEventListener('focus', function () { place(item); pill.classList.add('fx-on'); });
      });
      el.addEventListener('pointerleave', function () { pill.classList.remove('fx-on'); });
    }
  });

  // --- accordion ------------------------------------------------------------

  FX.register('accordion', {
    setup: function (el) {
      var summary = el.querySelector('summary');
      if (!summary || !el.animate) return;
      summary.addEventListener('click', function (e) {
        if (U.reduced) return;
        e.preventDefault();
        var start = el.offsetHeight;
        var opening = !el.open;
        if (opening) el.open = true;
        var end = opening ? el.scrollHeight : summary.offsetHeight;
        if (opening) {
          el.style.height = start + 'px';
          end = el.scrollHeight;
        }
        var anim = el.animate({ height: [start + 'px', end + 'px'] }, { duration: 380, easing: 'cubic-bezier(.16,1,.3,1)' });
        anim.onfinish = function () {
          el.style.height = '';
          if (!opening) el.open = false;
        };
      });
    }
  });

  // --- dots-morph -----------------------------------------------------------

  FX.register('dots-morph', {
    setup: function (el) {
      var n = U.num(el, 'fxCount', el.children.length || 4);
      if (!el.children.length) for (var i = 0; i < n; i++) U.make('button', '', el);
      var dots = Array.prototype.slice.call(el.children);
      var interval = U.num(el, 'fxInterval', 3000);
      el.style.setProperty('--fx-interval', interval + 'ms');
      el.setAttribute('role', el.getAttribute('role') || 'group');
      var cur = 0;
      function go(i) {
        cur = i;
        dots.forEach(function (d, k) {
          d.setAttribute('aria-current', k === i ? 'true' : 'false');
          d.setAttribute('aria-label', 'Diapositive ' + (k + 1));
        });
        el.dispatchEvent(new CustomEvent('fx:change', { detail: { index: i }, bubbles: true }));
      }
      dots.forEach(function (d, k) { d.type = 'button'; d.addEventListener('click', function () { go(k); restart(); }); });
      var timer = null;
      function restart() {
        clearInterval(timer);
        if (U.reduced || el.dataset.fxAuto === 'false') return;
        timer = setInterval(function () {
          if (!el.isConnected) { clearInterval(timer); return; }
          go((cur + 1) % dots.length);
        }, interval);
      }
      go(0);
      restart();
    }
  });
})(window.FX);
