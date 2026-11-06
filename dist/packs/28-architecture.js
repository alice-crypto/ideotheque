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
})(window.FX);
