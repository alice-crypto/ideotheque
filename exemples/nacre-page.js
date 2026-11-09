/* Nacre — ce qui ne dépend pas de WebGL : la collection épinglée et le formulaire */
(function () {
  'use strict';

  var U = window.FX.util;
  var col = document.getElementById('collection');
  var track = document.getElementById('railTrack');
  var bar = document.getElementById('railBar');
  var num = document.getElementById('railN');
  var items = track.children;
  var shown = -1;
  var smooth = 0;
  var wide = window.matchMedia('(min-width: 821px)');

  function target() {
    var r = col.getBoundingClientRect();
    return U.clamp(-r.top / Math.max(1, r.height - window.innerHeight), 0, 1);
  }
  function paint(p) {
    var n = items.length, x = p * (n - 1);
    track.style.transform = 'translate3d(' + (-x * 100 / n).toFixed(3) + '%,0,0)';
    bar.style.transform = 'scaleX(' + ((p * (n - 1) + 1) / n).toFixed(3) + ')';
    var cur = Math.round(x);
    if (cur !== shown) {
      shown = cur;
      num.textContent = '0' + (cur + 1);
      for (var i = 0; i < n; i++) items[i].classList.toggle('is-on', i === cur);
    }
    for (var j = 0; j < n; j++) {
      items[j].firstElementChild.style.transform = 'translate3d(' + ((j - x) * 18).toFixed(2) + 'vw,0,0)';
    }
  }
  function frame() {
    smooth += (target() - smooth) * .11;
    if (wide.matches) paint(smooth);
    else if (track.style.transform) track.style.transform = '';
    requestAnimationFrame(frame);
  }
  if (U.reduced) col.classList.add('is-static');
  else frame();

  // Les notes montent quand le parfum arrive
  if ('IntersectionObserver' in window) {
    var seen = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) e.target.classList.add('is-seen'); });
    }, { threshold: .4 });
    document.querySelectorAll('.notes').forEach(function (n) { seen.observe(n); });
  } else {
    document.querySelectorAll('.notes').forEach(function (n) { n.classList.add('is-seen'); });
  }

  // Le formulaire reste local : il n'envoie rien, c'est une page d'exemple
  var form = document.getElementById('box'), input = document.getElementById('mail'), status = document.getElementById('boxStatus');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!input.checkValidity()) {
      status.textContent = 'Il manque une adresse e-mail valide.';
      input.setAttribute('aria-invalid', 'true');
      input.focus();
      return;
    }
    input.removeAttribute('aria-invalid');
    status.textContent = 'Votre coffret est réservé. Rendez-vous à la surface.';
    input.value = '';
  });
})();
