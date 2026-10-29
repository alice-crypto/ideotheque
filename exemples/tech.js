/* Assistant IA et palette de commandes des exemples.
 * À charger AVANT dist/fx.js : le balisage est posé ici, fx.js l'anime ensuite.
 *
 * window.AI = {
 *   name: 'Brume IA', status: 'Répond en 2 s', fab: 'Demander à Brume',
 *   intro: 'Bonjour…',
 *   suggestions: [{ q: 'Question', steps: ['Étape 1', 'Étape 2'], a: 'Réponse' }],
 *   fallback: 'Réponse par défaut'
 * };
 * window.CMDK = [{ group: 'Pages', items: [{ icon: '◐', label: 'Mes nuits', hint: 'Aller', href: '#' }] }];
 *   un élément peut aussi avoir ask: 'question' (ouvre l'assistant) ou toast: 'message'.
 */
(function () {
  'use strict';
  var AI = window.AI;
  var CMDK = window.CMDK;
  var isMac = /Mac|iPhone|iPad/.test(navigator.platform);
  var mod = isMac ? '⌘' : 'Ctrl';

  function norm(s) { return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  function el(html) { var t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstChild; }

  // --- Assistant -----------------------------------------------------------

  var panel, thread, sugg, fabOrb, busy = false;

  if (AI) {
    var fab = el('<button class="ai-fab glass" type="button" aria-haspopup="dialog" aria-expanded="false">' +
      '<span data-fx="ai-orb" aria-hidden="true"></span><span class="ai-fab-label">' + esc(AI.fab || 'Demander à l\'IA') + '</span><span class="kbd">' + mod + ' J</span></button>');
    panel = el('<div class="ai-panel glass" role="dialog" aria-label="' + esc(AI.name) + '">' +
      '<div class="ai-head"><span data-fx="ai-orb" aria-hidden="true"></span><span><b>' + esc(AI.name) + '</b><small>' + esc(AI.status || 'En ligne') + '</small></span>' +
      '<button type="button" aria-label="Fermer">×</button></div>' +
      '<div class="ai-thread" aria-live="polite"></div>' +
      '<div class="ai-sugg"></div>' +
      '<form class="ai-input"><input placeholder="Posez une question…" aria-label="Votre question"><button aria-label="Envoyer">↑</button></form>' +
      '</div>');
    document.body.appendChild(fab);
    document.body.appendChild(panel);
    fabOrb = fab.querySelector('[data-fx="ai-orb"]');
    thread = panel.querySelector('.ai-thread');
    sugg = panel.querySelector('.ai-sugg');

    thread.appendChild(el('<div class="msg ai"><div class="who"><span data-fx="ai-orb" aria-hidden="true"></span>' + esc(AI.name) + '</div>' + esc(AI.intro || 'Bonjour ! Que puis-je faire pour vous ?') + '</div>'));
    (AI.suggestions || []).forEach(function (s) {
      var b = el('<button type="button"></button>');
      b.textContent = s.q;
      b.onclick = function () { ask(s.q); };
      sugg.appendChild(b);
    });

    fab.onclick = function () { toggle(); };
    panel.querySelector('.ai-head button').onclick = function () { toggle(false); };
    panel.querySelector('form').onsubmit = function (e) {
      e.preventDefault();
      var input = this.querySelector('input');
      if (input.value.trim()) ask(input.value.trim());
      input.value = '';
    };
    // Tout élément [data-ask] ouvre l'assistant avec sa question
    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-ask]');
      if (!t) return;
      e.preventDefault();
      ask(t.getAttribute('data-ask'));
    });
    new MutationObserver(function () { thread.scrollTop = thread.scrollHeight; }).observe(thread, { childList: true, subtree: true });
  }

  function toggle(force) {
    var open = force === undefined ? !panel.classList.contains('open') : force;
    panel.classList.toggle('open', open);
    document.querySelector('.ai-fab').setAttribute('aria-expanded', open);
    if (open) setTimeout(function () { panel.querySelector('input').focus({ preventScroll: true }); }, 200);
  }

  function ask(q) {
    if (!panel) return;
    toggle(true);
    if (busy) return;
    busy = true;
    var s = (AI.suggestions || []).filter(function (x) { return x.q === q; })[0] || { steps: ['Lecture de la question', 'Recherche dans vos données'], a: AI.fallback || 'Je n\'ai pas encore la réponse, mais je la note pour la prochaine version.' };
    var me = el('<div class="msg me"></div>');
    me.textContent = q;
    thread.appendChild(me);
    var bubble = el('<div class="msg ai"><div class="who"><span data-fx="ai-orb" data-fx-state="thinking" aria-hidden="true"></span><span data-fx="text-shimmer">Réflexion…</span></div></div>');
    thread.appendChild(bubble);
    fabOrb.setAttribute('data-fx-state', 'thinking');
    var who = bubble.querySelector('.who');

    function answer() {
      who.lastChild.removeAttribute('data-fx');
      who.lastChild.textContent = AI.name;
      var p = el('<p data-fx="stream-text" style="margin:0"></p>');
      p.dataset.fxText = s.a;
      p.textContent = s.a;
      bubble.appendChild(p);
      p.addEventListener('fx:done', function () {
        who.firstChild.removeAttribute('data-fx-state');
        fabOrb.removeAttribute('data-fx-state');
        busy = false;
      });
      window.FX.init(bubble);
    }

    if (s.steps && s.steps.length) {
      var ol = el('<ol data-fx="thinking-steps" data-fx-step="650"></ol>');
      s.steps.forEach(function (t) { var li = document.createElement('li'); li.textContent = t; ol.appendChild(li); });
      bubble.appendChild(ol);
      ol.addEventListener('fx:done', answer);
      window.FX.init(bubble);
    } else {
      window.FX.init(bubble);
      setTimeout(answer, 700);
    }
  }

  // --- Palette de commandes --------------------------------------------------

  var cmdk, opener;
  var openCmdk = function () {};
  if (CMDK) {
    var html = '<div id="cmdk" data-fx="modal-zoom" role="dialog" aria-modal="true" aria-label="Rechercher ou demander">' +
      '<div class="fenetre glass"><div class="search"><span data-fx="ai-orb" aria-hidden="true"></span>' +
      '<input placeholder="Rechercher, aller à, ou demander à l\'IA…" aria-label="Rechercher"><span class="kbd">Échap</span></div><ul role="listbox"></ul></div>' +
      '<button hidden data-fx-close></button></div>';
    cmdk = el(html);
    opener = el('<button hidden data-fx-toggle="#cmdk"></button>');
    document.body.appendChild(cmdk);
    document.body.appendChild(opener);
    var list = cmdk.querySelector('ul');
    var input = cmdk.querySelector('input');
    var flat = [];

    var render = function (filter) {
      var f = norm(filter || '');
      list.innerHTML = '';
      flat = [];
      CMDK.forEach(function (g) {
        var items = g.items.filter(function (i) { return !f || norm(i.label).indexOf(f) !== -1; });
        if (!items.length) return;
        list.appendChild(el('<li class="group" role="presentation">' + esc(g.group) + '</li>'));
        items.forEach(function (i) { flat.push(i); list.appendChild(row(i)); });
      });
      if (f && AI) {
        var q = { icon: '✦', label: 'Demander à l\'IA : « ' + filter + ' »', hint: 'Entrée', ask: filter };
        flat.unshift(q);
        list.insertBefore(row(q), list.firstChild);
      }
      select(0);
    };
    function row(i) {
      var li = el('<li role="option"><span class="ic">' + esc(i.icon || '→') + '</span><span>' + esc(i.label) + '</span><small>' + esc(i.hint || '') + '</small></li>');
      li._item = i;
      li.onclick = function () { run(i); };
      li.onmouseenter = function () { select(flat.indexOf(i)); };
      return li;
    }
    var sel = 0;
    function select(n) {
      var rows = list.querySelectorAll('li[role="option"]');
      if (!rows.length) return;
      sel = (n + rows.length) % rows.length;
      rows.forEach(function (r, k) { r.classList.toggle('sel', k === sel); });
    }
    function run(i) {
      cmdk.querySelector('[data-fx-close]').click();
      if (i.ask) setTimeout(function () { ask(i.ask); }, 250);
      else if (i.toast) { var t = document.querySelector('[data-fx="toast"]'); var b = document.createElement('button'); b.hidden = true; b.setAttribute('data-fx-toggle', '#' + t.id); b.setAttribute('data-fx-message', i.toast); document.body.appendChild(b); b.click(); b.remove(); }
      else if (i.href) location.href = i.href;
    }
    input.addEventListener('input', function () { render(input.value); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); select(sel + 1); }
      if (e.key === 'ArrowUp') { e.preventDefault(); select(sel - 1); }
      if (e.key === 'Enter' && flat[sel]) { e.preventDefault(); run(flat[sel]); }
    });
    render('');
    openCmdk = function () {
      if (!cmdk.classList.contains('fx-open')) opener.click();
      input.value = '';
      render('');
      setTimeout(function () { input.focus(); }, 60);
    };
    // Les boutons [data-cmdk] ouvrent la palette
    document.addEventListener('click', function (e) { if (e.target.closest('[data-cmdk]')) openCmdk(); });
    document.querySelectorAll('[data-cmdk] .kbd').forEach(function (k) { k.textContent = mod + ' K'; });
  }

  document.addEventListener('keydown', function (e) {
    if (!(e.metaKey || e.ctrlKey)) return;
    var k = e.key.toLowerCase();
    if (k === 'k' && cmdk) { e.preventDefault(); openCmdk(); }
    if (k === 'j' && panel) { e.preventDefault(); toggle(); }
  });
})();
