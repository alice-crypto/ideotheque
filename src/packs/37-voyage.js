/* Pack 37 — Voyage */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Un arc de vol avec la vraie distance entre deux villes
  FX.register('flight-arc', {
    entrance: true,
    setup: function (el) {
      var A = (el.dataset.fxFrom || 'Paris:48.86:2.35').split(':'), B = (el.dataset.fxTo || 'Tokyo:35.68:139.69').split(':'), R = 6371, r = Math.PI / 180, la1 = A[1] * r, la2 = B[1] * r, dl = (B[2] - A[2]) * r, h = Math.pow(Math.sin((la2 - la1) / 2), 2) + Math.cos(la1) * Math.cos(la2) * Math.pow(Math.sin(dl / 2), 2), km = 2 * R * Math.asin(Math.sqrt(h)), hr = km / 850 + .5;
      el.innerHTML = '<svg viewBox="0 0 200 90" aria-hidden="true"><path class="fx-fa-l" pathLength="1" d="M18 72Q100 -22 182 72"/><circle cx="18" cy="72" r="4"/><circle cx="182" cy="72" r="4"/><path class="fx-fa-p" d="M-6 0 6 0M0 -5 3 0 0 5"/></svg><div class="fx-fa2"><b>' + A[0] + '</b><b>' + B[0] + '</b></div><p>' + Math.round(km).toLocaleString('fr-FR') + ' km · environ ' + Math.floor(hr) + ' h ' + String(Math.round(hr % 1 * 60)).padStart(2, '0') + ' de vol direct</p>';
    }
  });

  // Une carte d'embarquement, avec le temps avant la fermeture
  FX.register('boarding-pass', {
    entrance: true,
    setup: function (el) {
      var d = el.dataset, min = U.num(el, 'fxIn', 48), at = new Date(Date.now() + min * 60000), f = function (x) { return x.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }); };
      el.innerHTML = '<div class="fx-bp"><header><b>' + (d.fxFrom || 'CDG') + '</b><i aria-hidden="true">→</i><b>' + (d.fxTo || 'LIS') + '</b></header><dl><div><dt>Vol</dt><dd>' + (d.fxFlight || 'FX 042') + '</dd></div><div><dt>Porte</dt><dd>' + (d.fxGate || 'B12') + '</dd></div><div><dt>Siège</dt><dd>' + (d.fxSeat || '14C') + '</dd></div><div><dt>Embarquement</dt><dd>' + f(at) + '</dd></div></dl></div><small>Exemple fictif. Fermeture dans ' + min + ' min.</small>';
    }
  });
})(window.FX);
