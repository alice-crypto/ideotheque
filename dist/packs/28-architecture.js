/* Pack 28 — Architecture */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Un curseur coupe le bâtiment et montre ce qu'il y a dedans
  FX.register('section-cut', {
    setup: function (el) {
      var n = U.num(el, 'fxFloors', 4), h = '', w = '';
      for (var i = 0; i < n; i++) { h += '<div><i></i><i></i><i></i></div>'; w += '<div><em></em><em></em></div>'; }
      el.innerHTML = '<div class="fx-sc"><div class="fx-sc-i" aria-hidden="true">' + h + '</div><div class="fx-sc-o" aria-hidden="true">' + w + '</div><span class="fx-sc-l" aria-hidden="true"></span></div><input type="range" min="0" max="100" value="' + U.num(el, 'fxValue', 55) + '" aria-label="Position de la coupe">';
      var r = el.querySelector('input'), go = function () { el.style.setProperty('--fx-q', r.value + '%'); };
      r.addEventListener('input', go);
      go();
    }
  });

  // Des étages en axonométrie qui s'écartent pour se présenter
  FX.register('axo-explode', {
    setup: function (el) {
      var L = (el.dataset.fxItems || 'Toiture|Logements|Bureaux|Socle').split('|'), box = U.make('div', 'fx-ax', el), o = U.make('output', '', el);
      o.setAttribute('aria-live', 'polite');
      o.textContent = L.length + ' niveaux';
      L.slice().reverse().forEach(function (t, i) {
        var b = U.make('button', '', box);
        b.type = 'button'; b.setAttribute('aria-label', t); b.style.setProperty('--fx-i', i);
        var say = function () { o.textContent = t; box.querySelectorAll('button').forEach(function (x) { x.classList.toggle('fx-on', x === b); }); };
        b.addEventListener('mouseenter', say); b.addEventListener('focus', say); b.addEventListener('click', say);
      });
    }
  });

  // Choisir un matériau et voir la façade changer
  FX.register('material-swatch', {
    setup: function (el) {
      var M = { Béton: 'linear-gradient(#a3a5a7,#8d8f91)', Bois: 'repeating-linear-gradient(92deg,#a06a39 0 8px,#8b5a2d 8px 13px,#b47a44 13px 22px)', Brique: 'repeating-linear-gradient(0deg,#e8dbcb 0 2px,transparent 2px 13px),repeating-linear-gradient(90deg,#b0502d 0 26px,#a34827 26px 28px)', Zinc: 'repeating-linear-gradient(90deg,#6a7680 0 22px,#3f4850 22px 24px)' };
      var box = U.make('div', 'fx-ms', el), row = U.make('div', 'fx-ms-r', el), o = U.make('output', '', el);
      o.setAttribute('aria-live', 'polite');
      Object.keys(M).forEach(function (k, i) {
        var b = U.make('button', '', row);
        b.type = 'button'; b.setAttribute('aria-label', k); b.title = k; b.style.background = M[k];
        b.addEventListener('click', function () {
          row.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
          var f = U.make('i', '', box);
          f.style.background = M[k];
          setTimeout(function () { while (box.children.length > 1) box.firstChild.remove(); }, U.reduced ? 0 : 750);
          o.textContent = k;
        });
        if (!i) b.click();
      });
    }
  });

  // Un index de projets dont une seule ligne s'ouvre sur son image
  FX.register('project-index', {
    setup: function (el) {
      var rows = (el.dataset.fxItems || 'Halle des Sources:2026:Lille:assets/city.svg|École des Pins:2025:Nantes:assets/bloom.svg|Maison Blanche:2024:Sète:assets/dune.svg').split('|').map(function (r) { return r.split(':'); });
      rows.sort(function (a, b) { return b[1] - a[1]; }).forEach(function (r) {
        var b = U.make('button', '', el), p = U.make('div', 'fx-pi', el);
        b.type = 'button'; b.setAttribute('aria-expanded', 'false');
        b.innerHTML = '<span>' + r[0] + '</span><small>' + r[2] + '</small><small>' + r[1] + '</small>';
        p.innerHTML = '<img alt="" loading="lazy" src="' + r[3] + '">';
        b.addEventListener('click', function () {
          var was = b.getAttribute('aria-expanded') === 'true';
          el.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-expanded', 'false'); });
          b.setAttribute('aria-expanded', !was);
        });
      });
      el.querySelector('button').setAttribute('aria-expanded', 'true');
    }
  });

  // Une barre d'échelle qui reste juste quand on zoome
  FX.register('scale-bar', {
    setup: function (el) {
      el.innerHTML = '<div class="fx-sb"><div class="fx-sb-p"></div></div><label>Zoom <input type="range" min="1" max="8" step=".1"></label><div class="fx-sb-m"><i></i><b></b></div>';
      var r = el.querySelector('input'), p = el.querySelector('.fx-sb-p'), bar = el.querySelector('.fx-sb-m i'), b = el.querySelector('.fx-sb-m b'), base = U.num(el, 'fxPxPerM', 6), S = [1, 2, 5, 10, 20, 50, 100];
      r.value = U.num(el, 'fxZoom', 2);
      var go = function () {
        var z = +r.value, ppm = base * z, m = S.filter(function (s) { return s * ppm >= 40; })[0] || 100;
        p.style.transform = 'scale(' + z + ')';
        bar.style.width = m * ppm + 'px';
        b.textContent = m + ' m';
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Un titre qui se remplit, depuis une hachure de plan
  FX.register('hatch-reveal', {
    entrance: true,
    setup: function (el) {
      var t = el.textContent;
      el.setAttribute('aria-label', t);
      el.innerHTML = '<span class="fx-hr-a" aria-hidden="true">' + t + '</span><span class="fx-hr-b" aria-hidden="true">' + t + '</span>';
    }
  });

  // Une flèche de nord qui tourne en descendant la page
  FX.register('north-arrow', {
    setup: function (el) {
      el.setAttribute('aria-hidden', 'true');
      el.innerHTML = '<svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="26"/><path d="M30 6 38 34 30 28 22 34Z"/><text x="30" y="52">N</text></svg>';
    },
    scroll: function (el, info) { el.style.setProperty('--fx-a', (info.pass * U.num(el, 'fxTurn', 360)).toFixed(1) + 'deg'); }
  });

  // Afficher la grille modulaire derrière une mise en page
  FX.register('modular-grid', {
    setup: function (el) {
      var cols = U.num(el, 'fxCols', 6), g = U.make('div', 'fx-mg', el), b = U.make('button', 'fx-mg-b', el);
      g.setAttribute('aria-hidden', 'true');
      g.style.setProperty('--fx-c', cols);
      for (var i = 0; i < cols; i++) U.make('i', '', g).style.setProperty('--fx-i', i);
      U.ensurePositioned(el);
      b.type = 'button'; b.setAttribute('aria-pressed', 'false'); b.textContent = 'Grille';
      b.addEventListener('click', function () { var o = !el.classList.contains('fx-on'); el.classList.toggle('fx-on', o); b.setAttribute('aria-pressed', o); b.textContent = o ? cols + ' colonnes' : 'Grille'; });
    }
  });

  // Un papier calque à faire glisser sur une image
  FX.register('tracing-overlay', {
    setup: function (el) {
      var img = el.dataset.fxImage || 'assets/orbit.svg', x = 20, y = 20, st = null;
      el.innerHTML = '<div class="fx-to" style="background-image:url(' + img + ')"><div class="fx-to-c" tabindex="0" role="application" aria-label="Calque à déplacer avec les flèches"><span>Calque</span></div></div>';
      var c = el.querySelector('.fx-to-c');
      var put = function () { c.style.transform = 'translate(' + x + 'px,' + y + 'px)'; };
      c.addEventListener('pointerdown', function (e) { st = [e.clientX - x, e.clientY - y]; e.target.setPointerCapture && e.isTrusted && e.target.setPointerCapture(e.pointerId); });
      c.addEventListener('pointermove', function (e) { if (!st) return; x = e.clientX - st[0]; y = e.clientY - st[1]; put(); });
      c.addEventListener('pointerup', function () { st = null; });
      c.addEventListener('keydown', function (e) { var k = { ArrowLeft: [-8, 0], ArrowRight: [8, 0], ArrowUp: [0, -8], ArrowDown: [0, 8] }[e.key]; if (k) { x += k[0]; y += k[1]; put(); e.preventDefault(); } });
      put();
    }
  });

  // Une image qui passe de l'esquisse à la vue finale en descendant
  FX.register('sketch-render', {
    setup: function (el) {
      var img = el.querySelector('img');
      if (!img) return;
      var sk = img.cloneNode();
      sk.setAttribute('alt', ''); sk.setAttribute('aria-hidden', 'true');
      sk.className = 'fx-skr';
      el.appendChild(sk);
      U.ensurePositioned(el);
    },
    scroll: function (el, info) { el.style.setProperty('--fx-q', U.clamp(info.pass * 1.8 - .25, 0, 1).toFixed(3)); },
    trigger: function (el) { var on = el.style.getPropertyValue('--fx-q') === '1'; U.tween(el, 900, function (p) { el.style.setProperty('--fx-q', on ? 1 - p : p); }); }
  });

  // Un bâtiment qui se construit phase après phase
  FX.register('construction-phases', {
    setup: function (el) {
      var P = (el.dataset.fxItems || 'Terrassement:2026|Structure:2026|Enveloppe:2027|Livraison:2028').split('|').map(function (r) { return r.split(':'); });
      el.innerHTML = '<div class="fx-cp2" aria-hidden="true"><b class="p0"></b><b class="p1"></b><b class="p1 u"></b><b class="p2"></b><b class="p3"></b></div><input type="range" min="0" max="' + (P.length - 1) + '" aria-label="Phase du chantier"><output aria-live="polite"></output>';
      var r = el.querySelector('input'), o = el.querySelector('output');
      r.value = U.num(el, 'fxPhase', 1);
      var go = function () {
        var n = +r.value;
        el.dataset.fxPhase = n;
        o.innerHTML = '<b>' + P[n][0] + '</b> · ' + P[n][1];
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Une grue dépose le contenu à sa place
  FX.register('crane-lift', {
    entrance: true,
    setup: function (el) {
      var t = el.innerHTML;
      el.innerHTML = '<div class="fx-cl-c" aria-hidden="true"><i class="m"></i><i class="b"></i><i class="h"></i></div><div class="fx-cl-l">' + t + '</div>';
    }
  });

  // Une silhouette à côté d'une hauteur pour la rendre concrète
  FX.register('scale-figure', {
    setup: function (el) {
      el.innerHTML = '<div class="fx-sf" aria-hidden="true"><em></em><i></i></div><label>Hauteur <input type="range" min="2.2" max="12" step=".1"></label><output aria-live="polite"></output>';
      var r = el.querySelector('input'), o = el.querySelector('output');
      r.value = U.num(el, 'fxHeight', 5.2);
      var go = function () {
        var h = +r.value;
        el.style.setProperty('--fx-q', 1.75 / h);
        o.innerHTML = '<b>' + String(h.toFixed(1)).replace('.', ',') + ' m</b>, soit ' + String((h / 1.75).toFixed(1)).replace('.', ',') + ' personnes debout l\'une sur l\'autre';
      };
      r.addEventListener('input', go);
      go();
    }
  });

  // Une rangée de colonnes dont on traverse le rythme en descendant
  FX.register('colonnade', {
    setup: function (el) {
      var n = U.num(el, 'fxCols', 9), box = U.make('div', 'fx-co', el);
      box.setAttribute('aria-hidden', 'true');
      for (var i = 0; i < n; i++) { var c = U.make('i', '', box), d = Math.abs(i - (n - 1) / 2) / ((n - 1) / 2); c.style.setProperty('--fx-d', d.toFixed(3)); }
    },
    scroll: function (el, info) { el.style.setProperty('--fx-o', info.pass.toFixed(3)); }
  });

  // Un mur qui se monte brique après brique
  FX.register('brick-lay', {
    entrance: true,
    setup: function (el) {
      var R = U.num(el, 'fxRows', 7), C = U.num(el, 'fxCols', 8), box = U.make('div', 'fx-bl2', el), t = el.dataset.fxText;
      box.setAttribute('aria-hidden', 'true');
      for (var y = 0; y < R; y++) {
        var row = U.make('div', y % 2 ? 'fx-off' : '', box);
        for (var x = 0; x < C + (y % 2); x++) {
          var b = U.make('i', '', row);
          b.style.setProperty('--fx-i', (R - 1 - y) * 4 + x * .55);
          b.style.setProperty('--fx-t', U.rand(-3, 3).toFixed(1) + '%');
        }
      }
      if (t) { var s = U.make('strong', '', el); s.textContent = t; }
    }
  });

  // Des arches emboîtées qu'on traverse en descendant la page
  FX.register('arch-tunnel', {
    setup: function (el) {
      var n = U.num(el, 'fxCount', 7), box = U.make('div', 'fx-at', el);
      box.setAttribute('aria-hidden', 'true');
      for (var i = 0; i < n; i++) { var a = U.make('i', '', box); a.style.setProperty('--fx-i', i / (n - 1)); a.style.zIndex = i; }
    },
    scroll: function (el, info) { el.style.setProperty('--fx-z', (info.pass * .9).toFixed(3)); }
  });

  // Une silhouette qui monte l'escalier au fil de la lecture
  FX.register('stair-climb', {
    setup: function (el) {
      var n = U.num(el, 'fxSteps', 10), s = '';
      for (var i = 0; i < n; i++) s += '<i style="height:' + (i + 1) / n * 88 + '%"></i>';
      el.innerHTML = '<div class="fx-sc2" aria-hidden="true">' + s + '<b></b></div>';
      el.style.setProperty('--fx-n', n);
      el._fxN = n;
    },
    scroll: function (el, info) {
      var s = Math.min(el._fxN - 1, Math.floor(info.pass * el._fxN));
      el.style.setProperty('--fx-s', s);
      var l = el.querySelectorAll('i');
      l.forEach(function (x, i) { x.classList.toggle('fx-on', i <= s); });
    }
  });

  // Des lames de façade qui s'ouvrent quand on descend vers elles
  FX.register('louver-facade', {
    setup: function (el) {
      var n = U.num(el, 'fxBlades', 11), b = U.make('div', 'fx-lf', el);
      b.setAttribute('aria-hidden', 'true');
      U.ensurePositioned(el);
      for (var i = 0; i < n; i++) U.make('i', '', b);
    },
    scroll: function (el, info) { el.style.setProperty('--fx-q', U.clamp(info.enter * 1.5, 0, 1).toFixed(3)); },
    trigger: function (el) { var on = el.classList.toggle('fx-open'); el.style.setProperty('--fx-q', on ? 1 : 0); }
  });
})(window.FX);
