/* Pack 07 — Images et médias */
(function (FX) {
  'use strict';
  var U = FX.util;
  var NS = 'http://www.w3.org/2000/svg';
  var uid = 0;

  ['ken-burns', 'color-reveal', 'blob-mask'].forEach(function (n) { FX.register(n, {}); });

  // --- Filtres SVG partagés -------------------------------------------------

  var defs = null;
  function svgDefs() {
    if (defs) return defs;
    var s = document.createElementNS(NS, 'svg');
    s.setAttribute('width', '0');
    s.setAttribute('height', '0');
    s.setAttribute('aria-hidden', 'true');
    s.style.position = 'absolute';
    defs = document.createElementNS(NS, 'defs');
    s.appendChild(defs);
    document.body.appendChild(s);
    return defs;
  }
  function addFilter(id, inner) {
    var f = document.createElementNS(NS, 'filter');
    f.setAttribute('id', id);
    f.setAttribute('x', '-10%');
    f.setAttribute('y', '-10%');
    f.setAttribute('width', '120%');
    f.setAttribute('height', '120%');
    f.setAttribute('color-interpolation-filters', 'sRGB');
    f.innerHTML = inner;
    svgDefs().appendChild(f);
    return f;
  }
  function imgOf(el) { return el.tagName === 'IMG' ? el : el.querySelector('img'); }
  function srcOf(img) { return img ? (img.currentSrc || img.src) : ''; }

  // --- svg-draw -------------------------------------------------------------

  FX.register('svg-draw', {
    entrance: true,
    setup: function (el) {
      el._fxShapes = Array.prototype.map.call(el.querySelectorAll('path, circle, line, polyline, rect'), function (s, i) {
        var len = s.getTotalLength ? s.getTotalLength() : 0;
        s.style.strokeDasharray = len;
        s.style.strokeDashoffset = U.reduced ? 0 : len;
        s.style.transitionDelay = (i * U.num(el, 'fxStagger', 120)) + 'ms';
        return { s: s, len: len };
      });
    },
    reset: function (el) { el._fxShapes.forEach(function (o) { o.s.style.strokeDashoffset = o.len; }); },
    enter: function (el) { el._fxShapes.forEach(function (o) { o.s.style.strokeDashoffset = 0; }); }
  });

  // --- image-trail ----------------------------------------------------------

  FX.register('image-trail', {
    setup: function (el) {
      var list = (el.dataset.fxImages || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
      if (!list.length) return;
      var gap = U.num(el, 'fxGap', 70);
      var last = null;
      var i = 0;
      el.addEventListener('pointermove', function (e) {
        if (U.reduced) return;
        var r = el.getBoundingClientRect();
        var x = e.clientX - r.left;
        var y = e.clientY - r.top;
        if (last && Math.hypot(x - last.x, y - last.y) < gap) return;
        last = { x: x, y: y };
        var img = U.make('img', 'fx-trail', el);
        img.src = list[i++ % list.length];
        img.alt = '';
        img.style.left = x + 'px';
        img.style.top = y + 'px';
        img.style.setProperty('--r', U.rand(-12, 12).toFixed(0) + 'deg');
        setTimeout(function () { img.remove(); }, 1150);
      });
    }
  });

  // --- hover-preview --------------------------------------------------------

  FX.register('hover-preview', {
    setup: function (el) {
      var p = el._fxP = { box: U.make('div', 'fx-preview', el), x: 0, y: 0, tx: 0, ty: 0 };
      p.box.setAttribute('aria-hidden', 'true');
      el.querySelectorAll('[data-fx-image]').forEach(function (item) {
        item.addEventListener('pointerenter', function () {
          p.box.style.backgroundImage = 'url("' + item.dataset.fxImage + '")';
          p.box.classList.add('fx-on');
        });
      });
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        p.tx = e.clientX - r.left + 24;
        p.ty = e.clientY - r.top - p.box.offsetHeight / 2;
        if (!p.box.classList.contains('fx-on')) { p.x = p.tx; p.y = p.ty; }
      });
      el.addEventListener('pointerleave', function () { p.box.classList.remove('fx-on'); });
    },
    tick: function (el) {
      var p = el._fxP;
      var k = U.reduced ? 1 : 0.16;
      p.x += (p.tx - p.x) * k;
      p.y += (p.ty - p.y) * k;
      p.box.style.transform = 'translate(' + p.x.toFixed(1) + 'px,' + p.y.toFixed(1) + 'px)';
    }
  });

  // --- slice-in -------------------------------------------------------------

  FX.register('slice-in', {
    entrance: true,
    setup: function (el) {
      var img = imgOf(el);
      if (!img) return;
      var n = U.num(el, 'fxSlices', 6);
      for (var i = 0; i < n; i++) {
        var s = U.make('div', 'fx-slice', el);
        s.style.left = (i * 100 / n) + '%';
        s.style.width = 'calc(' + (100 / n) + '% + 1px)';
        s.style.setProperty('--fx-i', i);
        s.style.setProperty('--fx-dir', i % 2 ? -1 : 1);
        var inner = U.make('i', '', s);
        inner.style.left = (-i * 100) + '%';
        inner.style.width = (n * 100) + '%';
        inner.style.backgroundImage = 'url("' + srcOf(img) + '")';
      }
    }
  });

  // --- rgb-split ------------------------------------------------------------

  FX.register('rgb-split', {
    setup: function () {
      if (document.getElementById('fx-rgb-split')) return;
      addFilter('fx-rgb-split',
        '<feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r"/>' +
        '<feOffset in="r" dx="-6" result="ro"/>' +
        '<feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g"/>' +
        '<feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b"/>' +
        '<feOffset in="b" dx="6" result="bo"/>' +
        '<feBlend in="ro" in2="g" mode="screen" result="rg"/>' +
        '<feBlend in="rg" in2="bo" mode="screen"/>');
    }
  });

  // --- compare --------------------------------------------------------------

  FX.register('compare', {
    setup: function (el) {
      var handle = U.make('div', 'fx-handle', el);
      handle.setAttribute('aria-hidden', 'true');
      var range = U.make('input', '', el);
      range.type = 'range';
      range.min = 0;
      range.max = 100;
      range.value = U.num(el, 'fxStart', 50);
      range.setAttribute('aria-label', el.dataset.fxLabel || 'Comparer avant et après');
      function set() { el.style.setProperty('--fx-pos', range.value + '%'); }
      range.addEventListener('input', set);
      set();
    }
  });

  // --- glare ----------------------------------------------------------------

  FX.register('glare', {
    setup: function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--fx-mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
        el.style.setProperty('--fx-my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
      });
    }
  });

  // --- lens -----------------------------------------------------------------

  FX.register('lens', {
    setup: function (el) {
      var img = imgOf(el);
      if (!img) return;
      var lens = U.make('div', 'fx-lens', el);
      lens.setAttribute('aria-hidden', 'true');
      var zoom = U.num(el, 'fxZoom', 2.4);
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = e.clientX - r.left;
        var y = e.clientY - r.top;
        var size = lens.offsetWidth;
        lens.style.backgroundImage = 'url("' + srcOf(img) + '")';
        lens.style.backgroundSize = (r.width * zoom) + 'px ' + (r.height * zoom) + 'px';
        lens.style.backgroundPosition = (-(x * zoom - size / 2)) + 'px ' + (-(y * zoom - size / 2)) + 'px';
        lens.style.transform = 'translate(' + (x - size / 2) + 'px,' + (y - size / 2) + 'px)';
      });
    }
  });

  // --- photo-stack ----------------------------------------------------------

  function nextPhoto(el) {
    var top = el.lastElementChild;
    if (!top || el._fxBusy) return;
    el._fxBusy = true;
    top.classList.add('fx-out');
    setTimeout(function () {
      el.insertBefore(top, el.firstElementChild);
      top.classList.remove('fx-out');
      el._fxBusy = false;
    }, U.reduced ? 0 : 420);
  }

  FX.register('photo-stack', {
    setup: function (el) {
      Array.prototype.forEach.call(el.children, function (k, i, all) {
        k.style.setProperty('--r', (i === all.length - 1 ? 0 : U.rand(-9, 9)).toFixed(1) + 'deg');
      });
      if (!el.hasAttribute('tabindex')) el.tabIndex = 0;
      el.setAttribute('role', 'button');
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); nextPhoto(el); }
      });
    },
    triggerOn: 'click',
    trigger: nextPhoto
  });

  // --- liquid-hover ---------------------------------------------------------

  FX.register('liquid-hover', {
    setup: function (el) {
      var id = 'fx-liquid-' + (++uid);
      var f = addFilter(id,
        '<feTurbulence type="fractalNoise" baseFrequency="0.012 0.04" numOctaves="2" seed="3" result="t"/>' +
        '<feDisplacementMap in="SourceGraphic" in2="t" scale="0" xChannelSelector="R" yChannelSelector="G"/>');
      var map = f.querySelector('feDisplacementMap');
      var turb = f.querySelector('feTurbulence');
      el.addEventListener('pointerenter', function () {
        if (U.reduced) return;
        el.style.filter = 'url(#' + id + ')';
        U.tween(el, 1100, function (p) {
          map.setAttribute('scale', (34 * Math.sin(p * Math.PI) * (1 - p * 0.4)).toFixed(2));
          turb.setAttribute('baseFrequency', (0.012 + p * 0.008).toFixed(4) + ' ' + (0.04 - p * 0.015).toFixed(4));
        }, function () { el.style.filter = ''; });
      });
    }
  });

  // --- pixelate -------------------------------------------------------------

  FX.register('pixelate', {
    setup: function (el) {
      var img = imgOf(el);
      if (!img || U.reduced) return;
      var c = U.make('canvas', '', el);
      c.setAttribute('aria-hidden', 'true');
      var small = document.createElement('canvas');
      var max = U.num(el, 'fxBlock', 22);
      function draw(block) {
        var w = el.clientWidth;
        var h = el.clientHeight;
        if (!w || !h) return;
        c.width = w;
        c.height = h;
        var sw = Math.max(1, Math.ceil(w / block));
        var sh = Math.max(1, Math.ceil(h / block));
        small.width = sw;
        small.height = sh;
        var iw = img.naturalWidth || w;
        var ih = img.naturalHeight || h;
        var k = Math.max(sw / iw, sh / ih);
        var sctx = small.getContext('2d');
        sctx.drawImage(img, (sw - iw * k) / 2, (sh - ih * k) / 2, iw * k, ih * k);
        var ctx = c.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(small, 0, 0, sw, sh, 0, 0, w, h);
      }
      el._fxBlock = max;
      function animateTo(target, done) {
        var from = el._fxBlock;
        U.tween(el, 600, function (p) {
          el._fxBlock = Math.max(1, Math.round(from + (target - from) * U.easeOut(p)));
          draw(el._fxBlock);
        }, done);
      }
      if (img.complete) draw(max); else img.addEventListener('load', function () { draw(max); });
      el.addEventListener('pointerenter', function () {
        animateTo(1, function () { c.style.opacity = 0; });
      });
      el.addEventListener('pointerleave', function () {
        c.style.opacity = 1;
        animateTo(max);
      });
    }
  });

  // --- flip-card ------------------------------------------------------------

  FX.register('flip-card', {
    setup: function (el) {
      if (!el.hasAttribute('tabindex')) el.tabIndex = 0;
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.classList.toggle('fx-flipped'); }
      });
    },
    triggerOn: 'click',
    trigger: function (el) { el.classList.toggle('fx-flipped'); }
  });

  // --- carousel-ring --------------------------------------------------------

  FX.register('carousel-ring', {
    setup: function (el) {
      var ring = U.make('div', 'fx-ring');
      var kids = Array.prototype.slice.call(el.children);
      kids.forEach(function (k, i) {
        k.style.setProperty('--fx-i', i);
        ring.appendChild(k);
      });
      el.appendChild(ring);
      ring.style.setProperty('--fx-n', kids.length);
      var w = kids[0] ? kids[0].offsetWidth : 120;
      var gap = U.num(el, 'fxGap', 18);
      el.style.setProperty('--fx-radius', ((w / 2 + gap) / Math.tan(Math.PI / Math.max(3, kids.length))).toFixed(0) + 'px');
    }
  });

  // --- drag-gallery ---------------------------------------------------------

  FX.register('drag-gallery', {
    setup: function (el) {
      var track = U.make('div', 'fx-track');
      while (el.firstChild) track.appendChild(el.firstChild);
      el.appendChild(track);
      var s = el._fxG = { track: track, x: 0, v: 0, drag: false, lx: 0, lt: 0 };
      if (!el.hasAttribute('tabindex')) el.tabIndex = 0;
      el.setAttribute('aria-roledescription', 'galerie défilante');
      el.addEventListener('pointerdown', function (e) {
        s.drag = true;
        s.lx = e.clientX;
        s.lt = performance.now();
        s.v = 0;
        el.classList.add('fx-dragging');
        el.setPointerCapture(e.pointerId);
      });
      el.addEventListener('pointermove', function (e) {
        if (!s.drag) return;
        var now = performance.now();
        var dx = e.clientX - s.lx;
        s.x += dx;
        s.v = dx / Math.max(1, now - s.lt) * 1000;
        s.lx = e.clientX;
        s.lt = now;
      });
      function release() { s.drag = false; el.classList.remove('fx-dragging'); }
      el.addEventListener('pointerup', release);
      el.addEventListener('pointercancel', release);
      el.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') s.v = -900;
        if (e.key === 'ArrowLeft') s.v = 900;
      });
    },
    tick: function (el, dt) {
      var s = el._fxG;
      var min = Math.min(0, el.clientWidth - s.track.scrollWidth);
      if (!s.drag) {
        s.x += s.v * dt;
        s.v *= Math.pow(0.05, dt);
        if (s.x > 0) { s.x += (0 - s.x) * 0.2; s.v = 0; }
        if (s.x < min) { s.x += (min - s.x) * 0.2; s.v = 0; }
      }
      s.track.style.transform = 'translate3d(' + s.x.toFixed(1) + 'px,0,0)';
    }
  });

  // --- noise-reveal ---------------------------------------------------------

  FX.register('noise-reveal', {
    entrance: true,
    setup: function (el) {
      var id = 'fx-noise-' + (++uid);
      var f = addFilter(id,
        '<feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="3" seed="7" result="t"/>' +
        '<feDisplacementMap in="SourceGraphic" in2="t" scale="160" xChannelSelector="R" yChannelSelector="B"/>');
      el._fxMap = f.querySelector('feDisplacementMap');
      el._fxId = id;
      if (!U.reduced) el.style.filter = 'url(#' + id + ')';
    },
    reset: function (el) {
      el._fxMap.setAttribute('scale', 160);
      el.style.filter = 'url(#' + el._fxId + ')';
    },
    enter: function (el) {
      U.tween(el, U.num(el, 'fxDuration', 1400), function (p) {
        el._fxMap.setAttribute('scale', (160 * Math.pow(1 - p, 3)).toFixed(1));
      }, function () { el.style.filter = ''; });
    }
  });
})(window.FX);
