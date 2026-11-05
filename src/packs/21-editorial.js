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
})(window.FX);
