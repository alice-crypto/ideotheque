/* Pack 20 — Nouvelles entrées */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Les enfants arrivent selon leur position réelle à l'écran
  FX.register('cascade-rows', {
    entrance: true,
    setup: function (el) {
      var tops = [];
      Array.prototype.forEach.call(el.children, function (c) { if (tops.indexOf(c.offsetTop) < 0) tops.push(c.offsetTop); });
      Array.prototype.forEach.call(el.children, function (c) { c.style.setProperty('--fx-rw', tops.indexOf(c.offsetTop)); });
    }
  });

  // Un projecteur balaye l'élément puis l'éclaire en entier
  FX.register('spotlight-in', {
    entrance: true,
    setup: function (el) { el.style.setProperty('--fx-r', '0%'); },
    reset: function (el) { el.style.setProperty('--fx-r', '0%'); },
    enter: function (el) {
      U.tween(el, U.num(el, 'fxDuration', 1400), function (p) {
        var e = U.easeInOut(p);
        el.style.setProperty('--fx-x', (15 + Math.sin(e * 3.14) * 70).toFixed(1) + '%');
        el.style.setProperty('--fx-y', (30 + e * 20).toFixed(1) + '%');
        el.style.setProperty('--fx-r', (10 + e * e * 130).toFixed(1) + '%');
      });
    }
  });

  // Les lignes glissent de chaque côté et se calent sur la marge
  FX.register('typeset-lines', {
    entrance: true,
    setup: function (el) {
      var run = function () { U.splitLines(el); el.querySelectorAll('.fx-line > span').forEach(function (s, i) { s.style.setProperty('--fx-dir', i % 2 ? 1 : -1); }); };
      run();
      U.onResize(run);
    }
  });

  // Les cases rebondissent en onde depuis le centre
  FX.register('bounce-grid', {
    entrance: true,
    setup: function (el) {
      var b = el.getBoundingClientRect(), cx = b.left + b.width / 2, cy = b.top + b.height / 2;
      Array.prototype.forEach.call(el.children, function (c) {
        var r = c.getBoundingClientRect();
        c.style.setProperty('--fx-d', (Math.hypot(r.left + r.width / 2 - cx, r.top + r.height / 2 - cy) * 1.6).toFixed(0) + 'ms');
      });
    }
  });

  // Un cadre s'ouvre vers le haut, et l'image se pose en même temps
  FX.register('mask-rise-image', {
    entrance: true,
    setup: function (el) { if (!el.firstElementChild) U.make('div', '', el); el.firstElementChild.classList.add('fx-mri'); }
  });

  // Des panneaux se déplient comme un paravent
  FX.register('accordion-unfold', {
    entrance: true,
    setup: function (el) { Array.prototype.forEach.call(el.children, function (c, i) { c.style.setProperty('--fx-i', i); c.classList.add(i % 2 ? 'fx-odd' : 'fx-even'); }); }
  });

  // Les mots sortent du flou l'un après l'autre
  FX.register('blur-words', { entrance: true, setup: function (el) { U.splitWords(el); } });

  // Des cartes sont distribuées depuis un même point
  FX.register('card-deal', {
    entrance: true,
    setup: function (el) {
      var b = el.getBoundingClientRect();
      Array.prototype.forEach.call(el.children, function (c, i) {
        var r = c.getBoundingClientRect();
        c.style.setProperty('--fx-dx', (b.left + b.width / 2 - r.left - r.width / 2).toFixed(0) + 'px');
        c.style.setProperty('--fx-dy', (b.top + b.height + 40 - r.top).toFixed(0) + 'px');
        c.style.setProperty('--fx-r', U.rand(-22, 22).toFixed(0) + 'deg');
        c.style.setProperty('--fx-i', i);
      });
    }
  });

  // Des bandes s'ouvrent comme un obturateur sur l'élément
  FX.register('shutter-text', {
    entrance: true,
    setup: function (el) {
      U.ensurePositioned(el);
      var b = U.make('span', 'fx-sht', el), n = U.num(el, 'fxBands', 6);
      b.setAttribute('aria-hidden', 'true');
      for (var i = 0; i < n; i++) U.make('i', '', b).style.setProperty('--fx-i', i);
    }
  });

  // Un cadre se dessine autour du contenu, puis le contenu apparaît
  FX.register('line-draw-box', {
    entrance: true,
    setup: function (el) {
      U.ensurePositioned(el);
      var host = U.make('span', 'fx-ldb', el);
      host.setAttribute('aria-hidden', 'true');
      host.innerHTML = '<svg><rect pathLength="1" x="1" y="1"/></svg>';
      var fit = function () {
        var r = host.querySelector('rect');
        r.setAttribute('width', Math.max(0, el.offsetWidth - 2));
        r.setAttribute('height', Math.max(0, el.offsetHeight - 2));
        r.setAttribute('rx', U.num(el, 'fxRadius', 10));
      };
      fit();
      U.onResize(fit);
    }
  });

  // Une rangée s'ouvre depuis son centre
  FX.register('stagger-scale-row', {
    entrance: true,
    setup: function (el) {
      var n = el.children.length;
      Array.prototype.forEach.call(el.children, function (c, i) { c.style.setProperty('--fx-o', Math.abs(i - (n - 1) / 2).toFixed(1)); });
    }
  });

  // L'image apparaît à travers un grain de pellicule
  FX.register('grain-fade', {
    entrance: true,
    setup: function (el) {
      if (!FX._fxGrainUrl) {
        var c = document.createElement('canvas');
        c.width = c.height = 128;
        var x = c.getContext('2d'), im = x.createImageData(128, 128);
        for (var i = 0; i < im.data.length; i += 4) { im.data[i + 3] = Math.random() * 255; }
        x.putImageData(im, 0, 0);
        FX._fxGrainUrl = 'url(' + c.toDataURL() + ')';
      }
      el.style.setProperty('--fx-noise', FX._fxGrainUrl);
    }
  });

  // Les tuiles pivotent d'un quart de tour pour se ranger
  FX.register('rotate-tile-in', {
    entrance: true,
    setup: function (el) {
      Array.prototype.forEach.call(el.children, function (c, i) {
        c.style.setProperty('--fx-r', [90, 180, 270, -90][Math.floor(Math.random() * 4)] + 'deg');
        c.style.setProperty('--fx-i', i);
      });
    }
  });

  // Une ligne se dessine, puis le contenu se lève derrière elle
  FX.register('horizon-rise', {
    entrance: true,
    setup: function (el) {
      var w = document.createElement('span');
      w.className = 'fx-hr-in';
      while (el.firstChild) w.appendChild(el.firstChild);
      el.appendChild(w);
      U.make('i', 'fx-hr', el).setAttribute('aria-hidden', 'true');
    }
  });

  // Plusieurs copies d'un grand numéro se rassemblent
  FX.register('number-stack-in', {
    entrance: true,
    setup: function (el) {
      var t = el.textContent.trim(), n = 4;
      el.textContent = '';
      el.setAttribute('aria-label', t);
      for (var i = n; i >= 0; i--) {
        var s = U.make('span', i ? 'fx-ns-c' : 'fx-ns-t', el);
        s.textContent = t;
        s.setAttribute('aria-hidden', 'true');
        s.style.setProperty('--fx-i', i);
      }
    }
  });

  // Des filets se dessinent et les lignes de la liste arrivent
  FX.register('list-strike-in', {
    entrance: true,
    setup: function (el) {
      Array.prototype.forEach.call(el.children, function (c, i) {
        c.style.setProperty('--fx-i', i);
        U.ensurePositioned(c);
        U.make('i', 'fx-lsi', c).setAttribute('aria-hidden', 'true');
      });
    }
  });

  // Les éléments arrivent du fond et deviennent nets
  FX.register('depth-focus-in', {
    entrance: true,
    setup: function (el) { Array.prototype.forEach.call(el.children, function (c, i) { c.style.setProperty('--fx-i', i); }); }
  });

  // Un surligneur traverse chaque ligne l'une après l'autre
  FX.register('marker-swipe-in', {
    entrance: true,
    setup: function (el) { var r = function () { U.splitLines(el); }; r(); U.onResize(r); }
  });
})(window.FX);
