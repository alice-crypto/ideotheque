/* Pack 12 — Typographie cinétique */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Une vague de graisse parcourt le mot, lettre après lettre
  FX.register('weight-wave', {
    setup: function (el) { U.splitChars(el); el._fxChars = el.querySelectorAll('.fx-char'); },
    tick: function (el, dt, t) {
      if (U.reduced) return;
      var speed = U.num(el, 'fxSpeed', 1);
      el._fxChars.forEach(function (c, i) {
        c.style.setProperty('--fx-w', ((Math.sin(t * .003 * speed - i * .55) + 1) / 2).toFixed(3));
      });
    }
  });

  // Les lettres tombent du haut et rebondissent sur la ligne de base
  FX.register('letter-rain', {
    entrance: true,
    setup: function (el) { U.splitChars(el); el._fxChars = Array.prototype.slice.call(el.querySelectorAll('.fx-char')); },
    reset: function (el) { el._fxRun = (el._fxRun || 0) + 1; el._fxChars.forEach(function (c) { c.style.transform = ''; c.style.opacity = 0; }); },
    enter: function (el) {
      if (U.reduced) { el._fxChars.forEach(function (c) { c.style.opacity = 1; }); return; }
      var run = el._fxRun = (el._fxRun || 0) + 1;
      var g = U.num(el, 'fxGravity', 2600);
      var bits = el._fxChars.map(function () { return { y: -U.rand(120, 260), v: 0, wait: U.rand(0, .5), n: 0 }; });
      var last = 0;
      (function frame(t) {
        if (run !== el._fxRun) return;
        var dt = last ? Math.min((t - last) / 1000, .04) : 0;
        last = t;
        var moving = false;
        bits.forEach(function (b, i) {
          var c = el._fxChars[i];
          if (b.wait > 0) { b.wait -= dt; moving = true; return; }
          c.style.opacity = 1;
          if (b.n > 3) return;
          moving = true;
          b.v += g * dt;
          b.y += b.v * dt;
          if (b.y > 0) { b.y = 0; b.v *= -.42; b.n++; }
          c.style.transform = 'translateY(' + b.y.toFixed(1) + 'px)';
        });
        if (moving) U.raf(frame);
      })(0);
    }
  });

  // Le titre se resserre pendant qu'on défile vers lui
  FX.register('headline-collapse', {
    scroll: true,
    setup: function (el) { el.style.setProperty('--fx-gap', U.num(el, 'fxGap', .6) + 'em'); }
  });

  // Les lettres s'écartent du curseur et reviennent en douceur
  FX.register('cursor-repel', {
    setup: function (el) {
      U.splitChars(el);
      var s = el._fxS = { chars: Array.prototype.slice.call(el.querySelectorAll('.fx-char')).map(function (c) { return { el: c, x: 0, y: 0 }; }), mx: -9999, my: -9999 };
      if (!U.canHover || U.reduced) return;
      el.addEventListener('pointermove', function (e) { s.mx = e.clientX; s.my = e.clientY; });
      el.addEventListener('pointerleave', function () { s.mx = s.my = -9999; });
    },
    tick: function (el) {
      var s = el._fxS, R = U.num(el, 'fxRadius', 110), F = U.num(el, 'fxForce', 34);
      if (U.reduced) return;
      s.chars.forEach(function (c) {
        var r = c.el.getBoundingClientRect();
        var dx = r.left + r.width / 2 - c.x - s.mx, dy = r.top + r.height / 2 - c.y - s.my;
        var d = Math.sqrt(dx * dx + dy * dy) || 1;
        var k = Math.max(0, 1 - d / R);
        c.x += (dx / d * F * k - c.x) * .14;
        c.y += (dy / d * F * k - c.y) * .14;
        c.el.style.transform = 'translate(' + c.x.toFixed(1) + 'px,' + c.y.toFixed(1) + 'px)';
      });
    }
  });

  // Le mot est le plus gras quand il passe au centre de l'écran
  FX.register('scroll-weight', {
    scroll: function (el, info) {
      el.style.setProperty('--fx-peak', (1 - Math.abs(info.pass * 2 - 1)).toFixed(3));
    }
  });

  // La lettre survolée s'étire et ses voisines suivent, comme un accordéon
  FX.register('letter-accordion', {
    setup: function (el) {
      U.splitChars(el);
      var cs = Array.prototype.slice.call(el.querySelectorAll('.fx-char'));
      function set(active) {
        cs.forEach(function (c, i) {
          var d = active < 0 ? 9 : Math.abs(i - active);
          c.style.setProperty('--fx-a', Math.max(0, 1 - d / 3).toFixed(2));
        });
      }
      cs.forEach(function (c, i) { c.addEventListener('pointerenter', function () { set(i); }); });
      el.addEventListener('pointerleave', function () { set(-1); });
      el.addEventListener('focusin', function () { set(0); });
      el.addEventListener('focusout', function () { set(-1); });
    }
  });

  // Texte en contour, rempli seulement autour du curseur
  FX.register('spot-fill', {
    setup: function (el) {
      var txt = el.textContent.trim();
      el.textContent = '';
      var box = el._fxBox = U.make('span', 'fx-sf', el);
      box.textContent = txt;
      box.dataset.fxLabel = txt;
      el._fxHover = false;
      el.addEventListener('pointermove', function (e) {
        var r = box.getBoundingClientRect();
        el._fxHover = true;
        el.style.setProperty('--fx-mx', (e.clientX - r.left) + 'px');
        el.style.setProperty('--fx-my', (e.clientY - r.top) + 'px');
      });
      el.addEventListener('pointerleave', function () { el._fxHover = false; });
    },
    tick: function (el, dt, t) {
      if (el._fxHover || U.reduced) return;
      var r = el._fxBox.getBoundingClientRect();
      el.style.setProperty('--fx-mx', ((Math.sin(t * .001) + 1) / 2 * r.width).toFixed(0) + 'px');
      el.style.setProperty('--fx-my', (r.height / 2).toFixed(0) + 'px');
    }
  });

  // Les lettres tournent en cercle puis se posent sur la ligne
  FX.register('letter-orbit', {
    entrance: true,
    setup: function (el) { U.splitChars(el); el._fxChars = Array.prototype.slice.call(el.querySelectorAll('.fx-char')); el._fxPlace = function (p) {
      var n = el._fxChars.length, R = U.num(el, 'fxRadius', 70);
      el._fxChars.forEach(function (c, i) {
        var q = U.easeInOut(U.clamp(p * 1.4 - i / n * .4, 0, 1));
        var a = i / n * Math.PI * 2 + (1 - q) * 3;
        var dx = Math.cos(a) * R * (1 - q), dy = Math.sin(a) * R * (1 - q);
        c.style.transform = 'translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px) rotate(' + ((1 - q) * a * 57.3).toFixed(0) + 'deg)';
        c.style.opacity = Math.min(1, p * 4);
      });
    }; el._fxPlace(0); },
    reset: function (el) { el._fxPlace(0); },
    enter: function (el) { U.tween(el, U.num(el, 'fxDuration', 1500), el._fxPlace); }
  });

  // Le titre se reflète dessous, comme sur l'eau
  FX.register('mirror-type', {
    setup: function (el) {
      var txt = el.textContent.trim();
      el.innerHTML = '';
      U.make('span', 'fx-mir-top', el).textContent = txt;
      var m = U.make('span', 'fx-mir-low', el);
      m.textContent = txt;
      m.setAttribute('aria-hidden', 'true');
      el._fxLow = m;
    },
    tick: function (el, dt, t) {
      if (U.reduced) return;
      el._fxLow.style.setProperty('--fx-sk', (Math.sin(t * .0016) * 4).toFixed(2) + 'deg');
    }
  });

  // Le titre se répète en éventail derrière lui
  FX.register('echo-stack', {
    setup: function (el) {
      var txt = el.textContent.trim(), n = U.num(el, 'fxCount', 5);
      el.textContent = '';
      var box = U.make('span', 'fx-echo-box', el);
      box.textContent = txt;
      for (var i = 1; i <= n; i++) {
        var s = U.make('span', 'fx-echo', box);
        s.textContent = txt;
        s.setAttribute('aria-hidden', 'true');
        s.style.setProperty('--fx-i', i);
      }
      el.style.setProperty('--fx-n', n);
    },
    tick: function (el, dt, t) {
      if (U.reduced) return;
      el.style.setProperty('--fx-open', ((Math.sin(t * .0012) + 1) / 2).toFixed(3));
    }
  });

  // Chaque lettre est un rouleau de machine à sous qui s'arrête à son tour
  FX.register('slot-letters', {
    entrance: true,
    setup: function (el) {
      var txt = el.textContent.trim(), rolls = U.num(el, 'fxRolls', 8);
      el.setAttribute('aria-label', txt);
      el.textContent = '';
      Array.from(txt).forEach(function (ch, i) {
        var box = U.make('span', 'fx-slot', el);
        box.setAttribute('aria-hidden', 'true');
        var col = U.make('span', 'fx-slot-col', box);
        var s = '';
        for (var k = 0; k < rolls; k++) s += U.GLYPHS.charAt(Math.floor(Math.random() * U.GLYPHS.length)) + '\n';
        col.textContent = s + ch;
        col.style.setProperty('--fx-rolls', rolls);
        col.style.setProperty('--fx-i', i);
      });
    }
  });

  // Le titre s'allume point par point, comme un panneau d'affichage
  FX.register('dot-matrix', {
    entrance: true,
    setup: function (el) {
      var txt = el.textContent.trim();
      el.setAttribute('aria-label', txt);
      el.setAttribute('role', 'img');
      el.textContent = '';
      var cv = U.make('canvas', '', el), ctx = cv.getContext('2d');
      var cs = getComputedStyle(el), fs = parseFloat(cs.fontSize);
      var step = U.num(el, 'fxStep', 4), w, h, dots, last = 0;
      var font = cs.fontWeight + ' ' + fs + 'px ' + cs.fontFamily;
      var scan = function () {
        var off = document.createElement('canvas').getContext('2d');
        off.font = font;
        w = Math.ceil(off.measureText(txt).width); h = Math.ceil(fs * 1.2);
        off.canvas.width = w; off.canvas.height = h;
        off.font = font; off.textBaseline = 'middle'; off.fillText(txt, 0, h / 2);
        var data = off.getImageData(0, 0, w, h).data;
        dots = [];
        for (var y = 0; y < h; y += step) for (var x = 0; x < w; x += step) if (data[(y * w + x) * 4 + 3] > 120) dots.push([x, y]);
        cv.width = w; cv.height = h;
      };
      scan();
      if (document.fonts) document.fonts.load(font).then(function () { scan(); el._fxPaint(last); });
      el._fxPaint = function (p) {
        last = p;
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = cs.color;
        dots.forEach(function (d) {
          var a = U.clamp(p * 1.5 - d[0] / w * .5, 0, 1);
          if (a <= 0) return;
          ctx.globalAlpha = a;
          ctx.beginPath();
          ctx.arc(d[0], d[1], step * .4, 0, 7);
          ctx.fill();
        });
      };
      el._fxPaint(0);
    },
    reset: function (el) { el._fxPaint(0); },
    enter: function (el) { U.tween(el, U.num(el, 'fxDuration', 1200), el._fxPaint); }
  });

  // Les lettres se résolvent à travers des blocs de densité
  FX.register('ascii-decay', {
    entrance: true,
    setup: function (el) {
      var txt = el.textContent.trim();
      el._fxTxt = txt;
      el.setAttribute('aria-label', txt);
      el._fxShow = function (p) {
        var ramp = '█▓▒░', out = '';
        for (var i = 0; i < txt.length; i++) {
          var q = U.clamp(p * 1.6 - i / txt.length * .6, 0, 1);
          if (txt[i] === ' ' || q >= 1) out += txt[i];
          else out += q <= 0 ? ' ' : ramp.charAt(Math.floor(q * ramp.length));
        }
        el.textContent = out;
      };
      if (!U.reduced) el._fxShow(0);
    },
    reset: function (el) { el._fxShow(0); },
    enter: function (el) { U.tween(el, U.num(el, 'fxDuration', 1400), el._fxShow); }
  });

  // Au survol, un saut se propage depuis la lettre touchée
  FX.register('hop-row', {
    setup: function (el) {
      U.splitChars(el);
      var cs = Array.prototype.slice.call(el.querySelectorAll('.fx-char'));
      cs.forEach(function (c, i) {
        c.addEventListener('pointerenter', function () {
          if (el.classList.contains('fx-hop')) return;
          cs.forEach(function (o, k) { o.style.setProperty('--fx-d', Math.abs(k - i)); });
          el.classList.add('fx-hop');
          setTimeout(function () { el.classList.remove('fx-hop'); }, 500 + cs.length * 40);
        });
      });
    }
  });

  // Le haut et le bas du mot glissent en sens contraire au défilement
  FX.register('half-shift', {
    scroll: function (el, info) { el.style.setProperty('--fx-shift', ((info.pass - .5) * U.num(el, 'fxShift', 60)).toFixed(1) + 'px'); },
    setup: function (el) {
      var t = el.textContent.trim();
      el.setAttribute('aria-label', t);
      el.innerHTML = '';
      ['fx-h-a', 'fx-h-b'].forEach(function (c) { var s = U.make('span', c, el); s.textContent = t; s.setAttribute('aria-hidden', 'true'); });
    }
  });

  // Au survol, la ligne de texte défile en continu
  FX.register('hover-marquee', {
    setup: function (el) {
      var txt = el.textContent.trim();
      el.setAttribute('aria-label', txt);
      el.textContent = '';
      var track = U.make('span', 'fx-hm-track', el);
      track.setAttribute('aria-hidden', 'true');
      var one = U.make('span', '', track);
      one.textContent = txt + ' — ';
      var w = one.offsetWidth || 120;
      var copies = Math.ceil((el.offsetWidth || 300) / w) + 1;
      for (var i = 0; i < copies; i++) track.appendChild(one.cloneNode(true));
      el.style.setProperty('--fx-w', w + 'px');
      el.style.setProperty('--fx-t', (w / U.num(el, 'fxSpeed', 80)).toFixed(2) + 's');
    }
  });

  // Les mots sont posés sur un cube qui tourne d'un quart de tour
  FX.register('cube-words', {
    setup: function (el) {
      var words = (el.dataset.fxWords || el.textContent).split('|').map(function (s) { return s.trim(); }).slice(0, 4);
      el.setAttribute('aria-label', words.join(', '));
      el.textContent = '';
      var cube = U.make('span', 'fx-cube', el);
      cube.setAttribute('aria-hidden', 'true');
      words.forEach(function (w, i) { var f = U.make('span', 'fx-face', cube); f.textContent = w; f.style.setProperty('--fx-i', i); });
      el._fxCube = { cube: cube, n: 0, t: 0, count: words.length };
    },
    tick: function (el, dt) {
      if (U.reduced) return;
      var s = el._fxCube;
      s.t += dt * 1000;
      if (s.t < U.num(el, 'fxHold', 1800)) return;
      s.t = 0;
      s.n++;
      if (s.n % 4 >= s.count) s.n += 4 - s.n % 4;
      s.cube.style.setProperty('--fx-turn', s.n);
    }
  });

  // La casse des lettres hésite, puis se fixe au repos
  FX.register('case-shuffle', {
    setup: function (el) {
      el._fxOrig = el.textContent.trim();
      el._fxOn = true; el._fxT = 0;
      el.setAttribute('aria-label', el._fxOrig);
      el.addEventListener('pointerenter', function () { el._fxOn = true; });
      el.addEventListener('pointerleave', function () { el._fxOn = false; el.textContent = el._fxOrig; });
      setTimeout(function () { if (!el.matches(':hover')) { el._fxOn = false; el.textContent = el._fxOrig; } }, 1400);
    },
    tick: function (el, dt) {
      if (!el._fxOn || U.reduced) return;
      el._fxT += dt * 1000;
      if (el._fxT < U.num(el, 'fxRate', 90)) return;
      el._fxT = 0;
      el.textContent = Array.from(el._fxOrig).map(function (c) { return Math.random() < .5 ? c.toUpperCase() : c.toLowerCase(); }).join('');
    }
  });

  // L'espacement des lettres inspire et expire
  FX.register('breathe-track', {
    tick: function (el, dt, t) {
      if (U.reduced) return;
      var c = (t / U.num(el, 'fxCycle', 6000)) % 1;
      var v = c < .45 ? U.easeInOut(c / .45) : c < .55 ? 1 : 1 - U.easeInOut((c - .55) / .45);
      el.style.setProperty('--fx-b', v.toFixed(3));
    }
  });

  // L'encre se répand depuis un trait fin jusqu'à la lettre nette
  FX.register('ink-bleed', {
    entrance: true,
    setup: function (el) {
      var root = document.getElementById('fx-ink-svg');
      if (!root) {
        root = document.createElement('div');
        root.id = 'fx-ink-svg';
        root.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
        root.innerHTML = '<svg aria-hidden="true"><filter id="fx-ink"><feTurbulence type="fractalNoise" baseFrequency=".04" numOctaves="3"/><feDisplacementMap in="SourceGraphic" scale="0"/></filter></svg>';
        document.body.appendChild(root);
      }
      el._fxMap = root.querySelector('feDisplacementMap');
    },
    enter: function (el) {
      var m = el._fxMap;
      U.tween(el, U.num(el, 'fxDuration', 1600), function (p) {
        m.setAttribute('scale', (U.num(el, 'fxScale', 40) * (1 - U.easeOut(p))).toFixed(1));
        el.style.opacity = Math.min(1, p * 3);
        if (p === 1) el.style.filter = 'none';
      });
    },
    reset: function (el) { el.style.filter = ''; el.style.opacity = 0; }
  });

  // Des barres noires se retirent des mots, dans le désordre
  FX.register('redact-reveal', {
    entrance: true,
    setup: function (el) {
      U.splitWords(el);
      var ws = Array.prototype.slice.call(el.querySelectorAll('.fx-word'));
      ws.map(function (w) { return { w: w, r: Math.random() }; })
        .sort(function (a, b) { return a.r - b.r; })
        .forEach(function (o, i) { o.w.style.setProperty('--fx-o', i); });
    }
  });

  // Chaque lettre est une étiquette collée de travers
  FX.register('sticker-letters', {
    entrance: true,
    setup: function (el) {
      U.splitChars(el);
      var pal = (el.dataset.fxColors || '').split(',').filter(Boolean);
      el.querySelectorAll('.fx-char').forEach(function (c, i) {
        c.style.setProperty('--fx-r', U.rand(-9, 9).toFixed(1) + 'deg');
        if (pal.length) c.style.background = pal[i % pal.length];
      });
    }
  });

  // Le titre glisse de côté quand on défile vite, puis revient
  FX.register('drift-title', {
    setup: function (el) { el._fxX = 0; },
    tick: function (el) {
      if (U.reduced) return;
      var target = U.velocity() * U.num(el, 'fxDrift', 3);
      el._fxX += (target - el._fxX) * .08;
      el.style.setProperty('--fx-x', el._fxX.toFixed(1) + 'px');
      el.style.setProperty('--fx-s', U.clamp(el._fxX * .05, -8, 8).toFixed(2) + 'deg');
    }
  });

  // Le texte suit une courbe et y avance en continu
  FX.register('path-type', {
    setup: function (el) {
      var txt = el.textContent.trim();
      var id = 'fx-path-' + Math.random().toString(36).slice(2, 8);
      el.setAttribute('aria-label', txt);
      el.setAttribute('role', 'img');
      el.innerHTML = '<svg viewBox="0 0 600 160" aria-hidden="true"><path id="' + id + '" d="' + (el.dataset.fxPath || 'M-20 90 C 120 -10, 220 190, 320 90 S 520 -10, 640 90') + '" fill="none"/><text><textPath href="#' + id + '"></textPath></text></svg>';
      el._fxTp = el.querySelector('textPath');
      el._fxTp.textContent = (txt + ' · ').repeat(4);
      el._fxO = 0;
    },
    tick: function (el, dt) {
      if (U.reduced) return;
      el._fxO = (el._fxO + dt * U.num(el, 'fxSpeed', 2.4)) % 25;
      el._fxTp.setAttribute('startOffset', (-el._fxO) + '%');
    }
  });

  // Une couleur vive passe de mot en mot dans la phrase
  FX.register('color-cycle-words', {
    setup: function (el) {
      U.splitWords(el);
      el._fxW = el.querySelectorAll('.fx-word');
      el._fxT = 0; el._fxI = -1;
    },
    tick: function (el, dt) {
      if (U.reduced) return;
      el._fxT += dt * 1000;
      if (el._fxT < U.num(el, 'fxStep', 500) && el._fxI >= 0) return;
      el._fxT = 0;
      if (el._fxI >= 0) el._fxW[el._fxI].classList.remove('fx-on');
      el._fxI = (el._fxI + 1) % el._fxW.length;
      el._fxW[el._fxI].classList.add('fx-on');
    }
  });

  // Le curseur est un soleil : l'ombre du titre part à l'opposé
  FX.register('sun-shadow', {
    setup: function (el) {
      var cast = function (dx, dy) {
        var n = U.num(el, 'fxLength', 18), col = U.cssVar(el, '--fx-shadow', 'rgba(0,0,0,.35)'), s = [];
        for (var i = 1; i <= n; i++) s.push((dx * i).toFixed(1) + 'px ' + (dy * i).toFixed(1) + 'px 0 ' + col);
        el.style.textShadow = s.join(',');
      };
      cast(.7, .7);
      if (!U.canHover || U.reduced) return;
      window.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > innerHeight + 200) return;
        var dx = r.left + r.width / 2 - e.clientX, dy = r.top + r.height / 2 - e.clientY;
        var d = Math.sqrt(dx * dx + dy * dy) || 1;
        cast(dx / d, dy / d);
      }, { passive: true });
    }
  });

  // Le texte s'éloigne vers l'horizon, en perspective
  FX.register('depth-crawl', {
    setup: function (el) { el._fxY = el.offsetHeight * .75; },
    tick: function (el, dt) {
      if (U.reduced) return;
      var inner = el.firstElementChild;
      if (!inner) return;
      el._fxY += dt * U.num(el, 'fxSpeed', 22);
      if (el._fxY > inner.offsetHeight + el.offsetHeight) el._fxY = 0;
      inner.style.setProperty('--fx-y', (el.offsetHeight - el._fxY).toFixed(1) + 'px');
    }
  });

  // Au clic, les lettres se décrochent et tombent, puis reviennent
  FX.register('gravity-letters', {
    setup: function (el) { U.splitChars(el); el._fxChars = Array.prototype.slice.call(el.querySelectorAll('.fx-char')); },
    triggerOn: 'click',
    trigger: function (el) {
      if (U.reduced || el._fxFalling) return;
      el._fxFalling = true;
      var bits = el._fxChars.map(function () { return { x: 0, y: 0, vx: U.rand(-140, 140), vy: U.rand(-420, -120), r: 0, vr: U.rand(-300, 300) }; });
      var start = 0, last = 0;
      U.raf(function frame(t) {
        if (!start) start = last = t;
        var dt = (t - last) / 1000; last = t;
        bits.forEach(function (b, i) {
          b.vy += 1800 * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.r += b.vr * dt;
          el._fxChars[i].style.transform = 'translate(' + b.x.toFixed(0) + 'px,' + b.y.toFixed(0) + 'px) rotate(' + b.r.toFixed(0) + 'deg)';
        });
        if (t - start < 1000) return U.raf(frame);
        el._fxChars.forEach(function (c) { c.style.transition = 'transform .6s var(--fx-ease-spring)'; c.style.transform = ''; });
        setTimeout(function () { el._fxChars.forEach(function (c) { c.style.transition = ''; }); el._fxFalling = false; }, 650);
      });
    }
  });

  // Le mot passe de gros pixels à une image nette, par paliers
  FX.register('pixel-type', {
    entrance: true,
    setup: function (el) {
      var txt = el.textContent.trim();
      el.setAttribute('aria-label', txt); el.setAttribute('role', 'img');
      var cs = getComputedStyle(el), fs = parseFloat(cs.fontSize);
      var font = cs.fontWeight + ' ' + fs + 'px ' + cs.fontFamily, color = cs.color;
      el.textContent = '';
      var cv = U.make('canvas', '', el), ctx = cv.getContext('2d');
      var w, h, lastBlock = U.reduced ? 1 : 16;
      var size = function () {
        ctx.font = font;
        w = Math.ceil(ctx.measureText(txt).width); h = Math.ceil(fs * 1.25);
        cv.width = w; cv.height = h;
      };
      size();
      var off = document.createElement('canvas'), o = off.getContext('2d');
      if (document.fonts) document.fonts.load(font).then(function () { size(); el._fxDraw(lastBlock); });
      el._fxDraw = function (block) {
        lastBlock = block;
        ctx.font = font;
        if (Math.ceil(ctx.measureText(txt).width) !== w) size();
        var sw = Math.max(1, Math.ceil(w / block)), sh = Math.max(1, Math.ceil(h / block));
        off.width = sw; off.height = sh;
        o.setTransform(sw / w, 0, 0, sh / h, 0, 0);
        o.font = font; o.fillStyle = color; o.textBaseline = 'middle';
        o.fillText(txt, 0, h / 2);
        ctx.clearRect(0, 0, w, h);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(off, 0, 0, w, h);
      };
      el._fxDraw(U.reduced ? 1 : 16);
    },
    reset: function (el) { el._fxDraw(16); },
    enter: function (el) {
      var steps = [16, 8, 4, 2, 1];
      U.tween(el, U.num(el, 'fxDuration', 900), function (p) { el._fxDraw(steps[Math.min(4, Math.floor(p * 5))]); });
    }
  });

  // Un cercle dessiné à la main entoure le mot important
  FX.register('scribble-circle', {
    entrance: true,
    setup: function (el) {
      var j = function () { return U.rand(-3, 3).toFixed(1); };
      var d = 'M' + (12 + +j()) + ' 26 C 20 ' + (4 + +j()) + ', 170 ' + (2 + +j()) + ', 192 24 C 208 ' + (44 + +j()) + ', 110 ' + (58 + +j()) + ', 40 50 C -4 ' + (44 + +j()) + ', 2 ' + (14 + +j()) + ', 60 7 C 100 2, 150 3, 180 12';
      var w = document.createElement('span');
      w.className = 'fx-scribble';
      w.setAttribute('aria-hidden', 'true');
      w.innerHTML = '<svg viewBox="0 0 200 60" preserveAspectRatio="none"><path d="' + d + '" pathLength="1" fill="none"/></svg>';
      el.appendChild(w);
    }
  });
})(window.FX);
