/* Pack 14 — Gestes et curseur */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Un point suit le curseur à l'intérieur de l'élément, retenu par un ressort
  FX.register('spring-follow', {
    setup: function (el) {
      U.ensurePositioned(el);
      var dot = U.make('i', 'fx-spring-dot', el);
      dot.setAttribute('aria-hidden', 'true');
      var s = el._fxS = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0, dot: dot };
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        s.tx = e.clientX - r.left; s.ty = e.clientY - r.top;
        el.classList.add('fx-on');
      });
      el.addEventListener('pointerleave', function () { el.classList.remove('fx-on'); });
    },
    tick: function (el, dt) {
      var s = el._fxS, k = U.num(el, 'fxStiff', 90), d = U.num(el, 'fxDamp', 11);
      if (U.reduced) { s.x = s.tx; s.y = s.ty; }
      else {
        s.vx += ((s.tx - s.x) * k - s.vx * d) * dt; s.vy += ((s.ty - s.y) * k - s.vy * d) * dt;
        s.x += s.vx * dt; s.y += s.vy * dt;
      }
      s.dot.style.transform = 'translate(' + s.x.toFixed(1) + 'px,' + s.y.toFixed(1) + 'px)';
    }
  });

  // On attrape l'élément, il s'étire, puis revient comme un élastique
  FX.register('squish-drag', {
    setup: function (el) {
      var s = el._fxS = { x: 0, y: 0, vx: 0, vy: 0, drag: false, sx: 0, sy: 0 };
      el.style.touchAction = 'none';
      el.addEventListener('pointerdown', function (e) {
        s.drag = true; s.sx = e.clientX - s.x; s.sy = e.clientY - s.y;
        if (el.setPointerCapture && e.isTrusted) el.setPointerCapture(e.pointerId);
        el.classList.add('fx-grab');
      });
      el.addEventListener('pointermove', function (e) {
        if (!s.drag) return;
        var nx = e.clientX - s.sx, ny = e.clientY - s.sy;
        s.vx = (nx - s.x) * 60; s.vy = (ny - s.y) * 60; s.x = nx; s.y = ny;
      });
      var up = function () { s.drag = false; el.classList.remove('fx-grab'); };
      el.addEventListener('pointerup', up);
      el.addEventListener('pointercancel', up);
    },
    tick: function (el, dt) {
      var s = el._fxS;
      if (!s.drag) {
        s.vx += (-s.x * 120 - s.vx * 10) * dt; s.vy += (-s.y * 120 - s.vy * 10) * dt;
        s.x += s.vx * dt; s.y += s.vy * dt;
        if (U.reduced) { s.x = s.y = 0; }
      }
      var sp = U.clamp(Math.sqrt(s.vx * s.vx + s.vy * s.vy) * .0003, 0, .35);
      var a = Math.atan2(s.vy, s.vx) * 57.3;
      el.style.transform = 'translate(' + s.x.toFixed(1) + 'px,' + s.y.toFixed(1) + 'px) rotate(' + a.toFixed(1) + 'deg) scale(' + (1 + sp).toFixed(3) + ',' + (1 - sp).toFixed(3) + ') rotate(' + (-a).toFixed(1) + 'deg)';
      if (s.drag) { s.vx *= .8; s.vy *= .8; }
    }
  });

  // Une étiquette accompagne le curseur au survol
  FX.register('cursor-label', {
    setup: function (el) {
      U.ensurePositioned(el);
      var l = U.make('span', 'fx-cl', el);
      l.textContent = el.dataset.fxLabel || 'Voir';
      l.setAttribute('aria-hidden', 'true');
      var s = el._fxS = { x: 0, y: 0, tx: 0, ty: 0, l: l };
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        s.tx = e.clientX - r.left; s.ty = e.clientY - r.top;
        el.classList.add('fx-on');
      });
      el.addEventListener('pointerleave', function () { el.classList.remove('fx-on'); });
    },
    tick: function (el) {
      var s = el._fxS;
      s.x = U.lerp(s.x, s.tx, .16); s.y = U.lerp(s.y, s.ty, .16);
      s.l.style.setProperty('--fx-x', s.x.toFixed(1) + 'px');
      s.l.style.setProperty('--fx-y', s.y.toFixed(1) + 'px');
    }
  });

  // Le texte pivote en 3D vers le curseur, avec un reflet qui glisse
  FX.register('hover-tilt-text', {
    setup: function (el) {
      var s = el._fxS = { rx: 0, ry: 0, tx: 0, ty: 0 };
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        s.ty = ((e.clientX - r.left) / r.width - .5) * U.num(el, 'fxMax', 26);
        s.tx = -((e.clientY - r.top) / r.height - .5) * U.num(el, 'fxMax', 26);
      });
      el.addEventListener('pointerleave', function () { s.tx = s.ty = 0; });
    },
    tick: function (el) {
      var s = el._fxS;
      if (U.reduced) return;
      s.rx = U.lerp(s.rx, s.tx, .1); s.ry = U.lerp(s.ry, s.ty, .1);
      el.style.setProperty('--fx-rx', s.rx.toFixed(2) + 'deg');
      el.style.setProperty('--fx-ry', s.ry.toFixed(2) + 'deg');
      el.style.setProperty('--fx-sx', (s.ry * -.5).toFixed(1) + 'px');
      el.style.setProperty('--fx-sy', (s.rx * .5).toFixed(1) + 'px');
    }
  });

  // Au clic, un cercle part du doigt et inverse la couleur du bouton
  FX.register('press-ripple-text', {
    setup: function (el) {
      var text = el.textContent;
      el.innerHTML = '<span class="fx-prt-a"></span><span class="fx-prt-b" aria-hidden="true"></span>';
      el.firstChild.textContent = text; el.lastChild.textContent = text;
    },
    triggerOn: 'click',
    trigger: function (el, e) {
      var r = el.getBoundingClientRect();
      var keyboard = !e || !e.clientX;
      el.style.setProperty('--fx-x', (keyboard ? r.width / 2 : e.clientX - r.left) + 'px');
      el.style.setProperty('--fx-y', (keyboard ? r.height / 2 : e.clientY - r.top) + 'px');
      el.classList.remove('fx-go');
      void el.offsetWidth;
      el.classList.add('fx-go');
      setTimeout(function () { el.classList.remove('fx-go'); }, 800);
    }
  });

  // Un bandeau unique glisse d'une ligne à l'autre
  FX.register('swipe-reveal-row', {
    setup: function (el) {
      U.ensurePositioned(el);
      var bg = U.make('i', 'fx-srr', el);
      bg.setAttribute('aria-hidden', 'true');
      el.insertBefore(bg, el.firstChild);
      var go = function (row) {
        el.style.setProperty('--fx-y', row.offsetTop + 'px');
        el.style.setProperty('--fx-h', row.offsetHeight + 'px');
        el.classList.add('fx-on');
      };
      Array.prototype.forEach.call(el.children, function (row) {
        if (row === bg) return;
        row.addEventListener('pointerenter', function () { go(row); });
        row.addEventListener('focusin', function () { go(row); });
      });
      el.addEventListener('pointerleave', function () { el.classList.remove('fx-on'); });
    }
  });

  // Une chaîne de perles suit le curseur
  FX.register('trail-dots', {
    setup: function (el) {
      U.ensurePositioned(el);
      var n = U.num(el, 'fxCount', 10), s = el._fxS = { pts: [], tx: 0, ty: 0 };
      for (var i = 0; i < n; i++) {
        var d = U.make('i', 'fx-td', el);
        d.setAttribute('aria-hidden', 'true');
        d.style.setProperty('--fx-q', 1 - i / n);
        s.pts.push({ x: 0, y: 0, el: d });
      }
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        s.tx = e.clientX - r.left; s.ty = e.clientY - r.top;
        el.classList.add('fx-on');
      });
      el.addEventListener('pointerleave', function () { el.classList.remove('fx-on'); });
    },
    tick: function (el) {
      var s = el._fxS, px = s.tx, py = s.ty;
      if (U.reduced) return;
      s.pts.forEach(function (p) {
        p.x = U.lerp(p.x, px, .34); p.y = U.lerp(p.y, py, .34);
        p.el.style.transform = 'translate(' + p.x.toFixed(1) + 'px,' + p.y.toFixed(1) + 'px)';
        px = p.x; py = p.y;
      });
    }
  });

  // Il faut maintenir le bouton pour confirmer
  FX.register('hold-confirm', {
    setup: function (el) {
      var t = 0, holding = false, done = false, dur = U.num(el, 'fxHold', 1200);
      var start = function () { if (done) return; holding = true; el.classList.add('fx-hold'); };
      var stop = function () { holding = false; if (!done) { t = 0; el.style.setProperty('--fx-h', 0); el.classList.remove('fx-hold'); } };
      el.addEventListener('pointerdown', start);
      ['pointerup', 'pointerleave', 'pointercancel', 'blur'].forEach(function (n) { el.addEventListener(n, stop); });
      el.addEventListener('keydown', function (e) { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); start(); } });
      el.addEventListener('keyup', stop);
      el._fxStep = function (dt) {
        if (!holding || done) return;
        t += dt * 1000;
        el.style.setProperty('--fx-h', Math.min(1, t / dur).toFixed(3));
        if (t >= dur) {
          done = true;
          el.classList.add('fx-confirmed');
          el.dispatchEvent(new CustomEvent('fx:confirm', { bubbles: true }));
          setTimeout(function () { done = false; holding = false; t = 0; el.style.setProperty('--fx-h', 0); el.classList.remove('fx-confirmed', 'fx-hold'); }, 1600);
        }
      };
    },
    tick: function (el, dt) { el._fxStep(dt); }
  });

  // Un interrupteur dont le bouton s'étire avant de sauter de l'autre côté
  FX.register('snap-toggle', {
    setup: function (el) {
      el.setAttribute('role', 'switch');
      el.tabIndex = 0;
      el.setAttribute('aria-checked', el.dataset.fxOn === 'true' ? 'true' : 'false');
      U.make('i', '', el).setAttribute('aria-hidden', 'true');
      el.addEventListener('keydown', function (e) { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); FX.trigger(el); } });
    },
    triggerOn: 'click',
    trigger: function (el) {
      var on = el.getAttribute('aria-checked') !== 'true';
      el.setAttribute('aria-checked', on);
      el.dispatchEvent(new CustomEvent('fx:change', { bubbles: true, detail: { on: on } }));
    }
  });

  // Un compteur dont le chiffre glisse dans le sens du changement
  FX.register('stepper-pop', {
    setup: function (el) {
      var v = U.num(el, 'fxValue', 1), min = U.num(el, 'fxMin', 0), max = U.num(el, 'fxMax', 99);
      el.setAttribute('role', 'group');
      el.innerHTML = '<button type="button" aria-label="Moins">−</button><output aria-live="polite"><span></span></output><button type="button" aria-label="Plus">+</button>';
      var out = el.querySelector('output');
      out.firstChild.textContent = v;
      var change = function (d) {
        var nv = U.clamp(v + d, min, max);
        if (nv === v) { el.classList.remove('fx-stop'); void el.offsetWidth; el.classList.add('fx-stop'); return; }
        v = nv;
        var s = document.createElement('span');
        s.textContent = v;
        s.className = d > 0 ? 'fx-up' : 'fx-down';
        out.textContent = '';
        out.appendChild(s);
        el.dispatchEvent(new CustomEvent('fx:change', { bubbles: true, detail: { value: v } }));
      };
      el.firstChild.addEventListener('click', function () { change(-1); });
      el.lastChild.addEventListener('click', function () { change(1); });
    }
  });

  // Une note dont les étoiles s'allument en vague
  FX.register('star-rate', {
    setup: function (el) {
      var n = U.num(el, 'fxMax', 5), val = U.num(el, 'fxValue', 0);
      el.setAttribute('role', 'slider');
      el.setAttribute('aria-valuemin', 0); el.setAttribute('aria-valuemax', n);
      el.setAttribute('aria-label', el.getAttribute('aria-label') || 'Note');
      el.tabIndex = 0;
      var stars = [];
      for (var i = 0; i < n; i++) { var s = U.make('i', '', el); s.textContent = '★'; s.style.setProperty('--fx-i', i); stars.push(s); }
      var paint = function (k) { stars.forEach(function (s, i) { s.classList.toggle('fx-on', i < k); }); };
      var set = function (k) {
        val = U.clamp(k, 0, n); paint(val);
        el.setAttribute('aria-valuenow', val);
        el.dispatchEvent(new CustomEvent('fx:change', { bubbles: true, detail: { value: val } }));
      };
      stars.forEach(function (s, i) {
        s.addEventListener('pointerenter', function () { paint(i + 1); });
        s.addEventListener('click', function () { set(i + 1); });
      });
      el.addEventListener('pointerleave', function () { paint(val); });
      el.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); set(val + 1); }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); set(val - 1); }
      });
      paint(val); el.setAttribute('aria-valuenow', val);
    }
  });

  // Une goutte de couleur entre par le côté où arrive le curseur
  FX.register('ink-button', {
    setup: function (el) {
      var mark = function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--fx-x', (e.clientX - r.left) + 'px');
        el.style.setProperty('--fx-y', (e.clientY - r.top) + 'px');
      };
      el.addEventListener('pointerenter', mark);
      el.addEventListener('pointerleave', mark);
    }
  });

  // Un bouton dont les actions s'échappent comme des gouttes
  FX.register('gooey-menu', {
    setup: function (el) {
      if (!document.getElementById('fx-goo')) {
        var d = document.createElement('div');
        d.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
        d.innerHTML = '<svg aria-hidden="true"><filter id="fx-goo"><feGaussianBlur in="SourceGraphic" stdDeviation="7"/><feColorMatrix values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 22 -9"/></filter></svg>';
        document.body.appendChild(d);
      }
      var btn = el.querySelector('button');
      var items = el.querySelectorAll('a,[data-item]');
      // Les gouttes sont dans un calque filtré à part : les icônes restent nettes au-dessus
      var layer = U.make('span', 'fx-goo-l', el);
      layer.setAttribute('aria-hidden', 'true');
      el.insertBefore(layer, el.firstChild);
      U.make('i', '', layer);
      items.forEach(function (a, i) {
        a.style.setProperty('--fx-i', i + 1);
        U.make('i', '', layer).style.setProperty('--fx-i', i + 1);
      });
      btn.setAttribute('aria-expanded', 'false');
      btn.addEventListener('click', function () {
        var on = !el.classList.contains('fx-open');
        el.classList.toggle('fx-open', on);
        btn.setAttribute('aria-expanded', on);
      });
    }
  });

  // Une plaque de verre dont le reflet suit le curseur
  FX.register('liquid-glass', {
    setup: function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--fx-gx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
        el.style.setProperty('--fx-gy', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
      });
      el.addEventListener('pointerleave', function () { el.style.removeProperty('--fx-gx'); el.style.removeProperty('--fx-gy'); });
    }
  });

  // Les éléments grossissent à l'approche du curseur, comme un dock
  FX.register('jelly-list', {
    setup: function (el) {
      var items = Array.prototype.slice.call(el.children);
      var R = U.num(el, 'fxRadius', 110);
      el.addEventListener('pointermove', function (e) {
        items.forEach(function (it) {
          var r = it.getBoundingClientRect();
          var d = Math.abs(r.left + r.width / 2 - e.clientX);
          it.style.setProperty('--fx-k', Math.max(0, 1 - d / R).toFixed(3));
        });
      });
      el.addEventListener('pointerleave', function () { items.forEach(function (it) { it.style.setProperty('--fx-k', 0); }); });
    }
  });

  // Un cadre lumineux glisse d'un champ au suivant
  FX.register('focus-beam', {
    setup: function (el) {
      U.ensurePositioned(el);
      var b = U.make('i', 'fx-beam', el);
      b.setAttribute('aria-hidden', 'true');
      el.addEventListener('focusin', function (e) {
        var r = e.target.getBoundingClientRect(), o = el.getBoundingClientRect();
        b.style.transform = 'translate(' + (r.left - o.left) + 'px,' + (r.top - o.top) + 'px)';
        b.style.width = r.width + 'px';
        b.style.height = r.height + 'px';
        el.classList.add('fx-on');
      });
      el.addEventListener('focusout', function (e) { if (!el.contains(e.relatedTarget)) el.classList.remove('fx-on'); });
    }
  });

  // Une lumière fait le tour de la carte, plus vite au survol
  FX.register('border-chase', {
    setup: function (el) { el._fxA = 0; el._fxV = 40; },
    tick: function (el, dt) {
      if (U.reduced) return;
      var target = el.matches(':hover') ? 240 : U.num(el, 'fxIdle', 50);
      el._fxV = U.lerp(el._fxV, target, .05);
      el._fxA = (el._fxA + el._fxV * dt) % 360;
      el.style.setProperty('--fx-ang', el._fxA.toFixed(1) + 'deg');
    }
  });

  // Le coin d'une note se soulève à l'approche du curseur
  FX.register('sticky-note-peel', {
    setup: function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var d = Math.hypot(r.right - e.clientX, r.bottom - e.clientY);
        el.style.setProperty('--fx-lift', U.clamp(1 - d / (r.width * .9), .12, 1).toFixed(3));
      });
      el.addEventListener('pointerleave', function () { el.style.setProperty('--fx-lift', 0); });
    }
  });

  // Une petite image s'ouvre au milieu de la ligne au survol du lien
  FX.register('image-pop-link', {
    setup: function (el) {
      var i = document.createElement('img');
      i.src = el.dataset.fxImg || 'assets/dune.svg';
      i.alt = '';
      i.className = 'fx-ipl';
      i.setAttribute('aria-hidden', 'true');
      var at = U.num(el, 'fxAt', -1);
      var words = el.textContent.trim().split(' ');
      if (at < 0) at = Math.ceil(words.length / 2);
      el.textContent = words.slice(0, at).join(' ') + ' ';
      el.appendChild(i);
      el.appendChild(document.createTextNode(' ' + words.slice(at).join(' ')));
    }
  });

  // Une liste que l'on réorganise en faisant glisser, et les voisins s'écartent
  FX.register('drag-reorder', {
    setup: function (el) {
      Array.prototype.forEach.call(el.children, function (it) {
        it.tabIndex = 0;
        var startY = 0, drag = false;
        it.addEventListener('pointerdown', function (e) {
          drag = true; startY = e.clientY; it.classList.add('fx-drag');
          if (it.setPointerCapture && e.isTrusted) it.setPointerCapture(e.pointerId);
        });
        it.addEventListener('pointermove', function (e) {
          if (!drag) return;
          var dy = e.clientY - startY;
          it.style.transform = 'translateY(' + dy + 'px) scale(1.03)';
          var h = it.offsetHeight;
          if (dy > h * .6 && it.nextElementSibling) { el.insertBefore(it.nextElementSibling, it); startY += h; flash(it); }
          else if (dy < -h * .6 && it.previousElementSibling) { el.insertBefore(it, it.previousElementSibling); startY -= h; flash(it); }
        });
        var end = function () { drag = false; it.classList.remove('fx-drag'); it.style.transform = ''; };
        it.addEventListener('pointerup', end);
        it.addEventListener('pointercancel', end);
        it.addEventListener('keydown', function (e) {
          if (!e.altKey) return;
          if (e.key === 'ArrowDown' && it.nextElementSibling) { e.preventDefault(); el.insertBefore(it.nextElementSibling, it); it.focus(); }
          if (e.key === 'ArrowUp' && it.previousElementSibling) { e.preventDefault(); el.insertBefore(it, it.previousElementSibling); it.focus(); }
        });
      });
      function flash() { el.dispatchEvent(new CustomEvent('fx:change', { bubbles: true })); }
    }
  });

  // Une pile de cartes qu'on balaye vers la gauche ou la droite
  FX.register('swipe-card', {
    setup: function (el) {
      var layout = function () { Array.prototype.forEach.call(el.children, function (c, i) { c.style.setProperty('--fx-pos', i); c.style.zIndex = 20 - i; }); };
      layout();
      var top = function () { return el.firstElementChild; }, sx = 0, dx = 0, drag = false;
      var send = function (dir) {
        var c = top();
        el.classList.add('fx-fly');
        c.style.transform = 'translateX(' + (dir * 340) + 'px) rotate(' + (dir * 24) + 'deg)';
        c.style.opacity = 0;
        el.dispatchEvent(new CustomEvent('fx:swipe', { bubbles: true, detail: { dir: dir > 0 ? 'right' : 'left' } }));
        setTimeout(function () { el.classList.remove('fx-fly'); c.style.transform = ''; c.style.opacity = ''; el.appendChild(c); layout(); }, 300);
      };
      el.tabIndex = 0;
      el.addEventListener('pointerdown', function (e) { drag = true; sx = e.clientX; dx = 0; if (e.isTrusted) el.setPointerCapture(e.pointerId); });
      el.addEventListener('pointermove', function (e) {
        if (!drag) return;
        dx = e.clientX - sx;
        top().style.transform = 'translateX(' + dx + 'px) rotate(' + dx * .08 + 'deg)';
      });
      var up = function () {
        if (!drag) return;
        drag = false;
        if (Math.abs(dx) > U.num(el, 'fxDistance', 80)) send(dx > 0 ? 1 : -1);
        else top().style.transform = '';
      };
      el.addEventListener('pointerup', up);
      el.addEventListener('pointercancel', up);
      el.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') send(-1);
        if (e.key === 'ArrowRight') send(1);
      });
    }
  });

  // Un petit égaliseur s'anime au survol
  FX.register('sound-bars-hover', {
    setup: function (el) {
      var n = U.num(el, 'fxBars', 5);
      el.setAttribute('aria-hidden', 'true');
      el._fxB = [];
      for (var i = 0; i < n; i++) el._fxB.push({ el: U.make('i', '', el), v: .2, a: U.rand(.006, .012), b: U.rand(.002, .006) });
      el._fxAll = el.dataset.fxAuto === 'true';
    },
    tick: function (el, dt, t) {
      if (U.reduced) return;
      var hot = el._fxAll || el.matches(':hover') || (el.parentElement && el.parentElement.matches(':hover'));
      el._fxB.forEach(function (b) {
        var tg = hot ? .25 + .75 * Math.abs(Math.sin(t * b.a) * Math.cos(t * b.b)) : .18;
        b.v = U.lerp(b.v, tg, .22);
        b.el.style.transform = 'scaleY(' + b.v.toFixed(3) + ')';
      });
    }
  });

  // Plus on appuie longtemps, plus le mot s'écrase
  FX.register('pressure-word', {
    setup: function (el) {
      el._fxP = 0; el._fxDown = false;
      el.addEventListener('pointerdown', function () { el._fxDown = true; });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (n) { el.addEventListener(n, function () { el._fxDown = false; }); });
    },
    tick: function (el, dt) {
      if (U.reduced) return;
      el._fxP = el._fxDown ? Math.min(1, el._fxP + dt * 1.2) : el._fxP * .86;
      el.style.setProperty('--fx-press', el._fxP.toFixed(3));
    }
  });

  // Un prix qui change avec un défilement de chiffres
  FX.register('price-flip', {
    setup: function (el) {
      var vals = (el.dataset.fxValues || '19|190').split('|'), i = 0;
      el.setAttribute('aria-live', 'polite');
      var show = function (txt, dir) {
        var o = el.firstElementChild;
        if (o) { o.className = 'fx-pf-out' + (dir > 0 ? ' up' : ''); setTimeout(function () { o.remove(); }, 300); }
        var n = document.createElement('span');
        n.className = 'fx-pf-in' + (dir > 0 ? ' up' : '');
        n.textContent = txt;
        el.appendChild(n);
      };
      show(vals[0], 1);
      el._fxNext = function () { i = (i + 1) % vals.length; show(vals[i], i ? 1 : -1); el.dispatchEvent(new CustomEvent('fx:change', { bubbles: true, detail: { value: vals[i] } })); };
      var tog = el.dataset.fxToggle && document.querySelector(el.dataset.fxToggle);
      if (tog) tog.addEventListener('click', el._fxNext);
    },
    trigger: function (el) { el._fxNext(); }
  });

  // Une case qui coche d'un trait de stylo et biffe le texte
  FX.register('checkbox-scribble', {
    setup: function (el) {
      var input = el.querySelector('input');
      if (!input) return;
      var i = document.createElement('i');
      i.className = 'fx-cs-box';
      i.setAttribute('aria-hidden', 'true');
      i.innerHTML = '<svg viewBox="0 0 24 24"><path pathLength="1" d="M4 13 C7 15, 9 18, 10 20 C13 13, 16 8, 21 4"/></svg>';
      input.after(i);
      var txt = el.querySelector('span');
      if (txt) {
        var w = document.createElement('span');
        w.className = 'fx-cs-line';
        w.setAttribute('aria-hidden', 'true');
        w.innerHTML = '<svg viewBox="0 0 100 10" preserveAspectRatio="none"><path pathLength="1" d="M0 5 C20 2, 40 9, 60 5 S 90 2, 100 6"/></svg>';
        txt.style.position = 'relative';
        txt.appendChild(w);
      }
    }
  });

  // Une icône de recherche qui s'ouvre en champ de saisie
  FX.register('search-expand', {
    setup: function (el) {
      var input = el.querySelector('input'), btn = el.querySelector('button');
      if (!input || !btn) return;
      btn.setAttribute('aria-expanded', 'false');
      var set = function (on) { el.classList.toggle('fx-open', on); btn.setAttribute('aria-expanded', on); };
      btn.addEventListener('click', function () {
        var on = !el.classList.contains('fx-open');
        set(on);
        if (on) input.focus();
      });
      input.addEventListener('keydown', function (e) { if (e.key === 'Escape') { set(false); btn.focus(); } });
      input.addEventListener('blur', function () { if (!input.value) set(false); });
    }
  });

  // L'étiquette supprimée s'envole et les autres comblent la place
  FX.register('tag-delete', {
    setup: function (el) {
      el.addEventListener('click', function (e) {
        var b = e.target.closest('button');
        if (!b || !el.contains(b)) return;
        var tag = b.parentElement;
        tag.style.width = tag.offsetWidth + 'px';
        void tag.offsetWidth;
        tag.classList.add('fx-out');
        var next = tag.nextElementSibling || tag.previousElementSibling;
        setTimeout(function () {
          tag.remove();
          if (next && next.querySelector('button')) next.querySelector('button').focus({ preventScroll: true });
          el.dispatchEvent(new CustomEvent('fx:remove', { bubbles: true }));
        }, 340);
      });
    }
  });
})(window.FX);
