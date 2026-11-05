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
})(window.FX);
