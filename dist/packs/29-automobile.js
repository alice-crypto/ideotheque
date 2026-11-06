/* Pack 29 — Automobile */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Choisir une peinture : la voiture se repeint et le prix suit
  FX.register('car-colorizer', {
    setup: function (el) {
      var base = U.num(el, 'fxPrice', 24900), P = (el.dataset.fxItems || 'Blanc nacré:#eef0f2:0|Rouge vif:#c8102e:550|Bleu nuit:#16284f:750|Vert sapin:#1f4d3c:750').split('|').map(function (r) { return r.split(':'); });
      el.innerHTML = '<svg viewBox="0 0 200 80" aria-hidden="true"><path class="fx-cc-b" d="M8 58C8 46 18 44 34 42L62 22C70 16 84 14 104 14C128 14 142 20 154 38C176 40 192 44 192 58V62H8Z"/><path class="fx-cc-g" d="M70 25C76 20 86 19 100 19V38H52ZM106 19C122 19 134 23 144 38H106Z"/><circle cx="52" cy="62" r="14"/><circle cx="52" cy="62" r="6" class="fx-cc-h"/><circle cx="150" cy="62" r="14"/><circle cx="150" cy="62" r="6" class="fx-cc-h"/></svg><div class="fx-cc-s"></div><output aria-live="polite"></output>';
      var s = el.querySelector('.fx-cc-s'), o = el.querySelector('output');
      P.forEach(function (p, i) {
        var b = U.make('button', '', s);
        b.type = 'button'; b.style.background = p[1]; b.setAttribute('aria-label', p[0]);
        b.addEventListener('click', function () {
          s.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
          el.style.setProperty('--fx-paint', p[1]);
          o.innerHTML = '<b>' + (base + +p[2]).toLocaleString('fr-FR') + ' €</b> · ' + p[0] + (+p[2] ? ' (+' + p[2] + ' €)' : '');
        });
        if (!i) b.click();
      });
    }
  });

  // Une voiture qui avance en descendant la page, ses roues tournent juste
  FX.register('wheel-roll', {
    setup: function (el) {
      el.setAttribute('aria-hidden', 'true');
      el.innerHTML = '<div class="fx-wr"><i></i><i></i></div>';
    },
    scroll: function (el, info) {
      var w = el.clientWidth - 110, x = info.pass * w, r = 13;
      el.style.setProperty('--fx-x', x.toFixed(1) + 'px');
      el.style.setProperty('--fx-a', (x / r * 57.3).toFixed(1) + 'deg');
    }
  });

  // L'autonomie selon la température et la vitesse
  FX.register('range-conditions', {
    setup: function (el) {
      var base = U.num(el, 'fxRange', 420);
      el.innerHTML = '<label>Température <b data-o="t"></b><input data-k="t" type="range" min="-10" max="30" value="10"></label><label>Vitesse <b data-o="v"></b><input data-k="v" type="range" min="50" max="130" step="10" value="110"></label><div class="fx-rc" aria-hidden="true"><i></i></div><output aria-live="polite"></output><small>Modèle fictif pour illustrer l\'écart.</small>';
      var T = el.querySelector('[data-k=t]'), V = el.querySelector('[data-k=v]'), o = el.querySelector('output');
      var go = function () {
        var t = +T.value, v = +V.value, ct = t < 20 ? 1 - (20 - t) * .012 : 1, cv = 1 - Math.max(0, v - 70) * .0045, r = Math.round(base * ct * cv);
        el.querySelector('[data-o=t]').textContent = t + ' °C'; el.querySelector('[data-o=v]').textContent = v + ' km/h';
        el.style.setProperty('--fx-q', r / base);
        o.innerHTML = '<b>' + r + ' km</b> sur ' + base + ' km annoncés';
      };
      el.addEventListener('input', go);
      go();
    }
  });
})(window.FX);
