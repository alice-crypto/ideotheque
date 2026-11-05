/* Pack 19 — États et interfaces d'IA */
(function (FX) {
  'use strict';
  var U = FX.util;

  // Un agent parcourt un graphe d'étapes, nœud après nœud
  FX.register('agent-graph', {
    entrance: true,
    setup: function (el) {
      var names = (el.dataset.fxSteps || 'Lire|Chercher|Écrire|Vérifier').split('|');
      el.setAttribute('role', 'list');
      el._fxN = names.map(function (n, i) {
        var d = U.make('span', 'fx-ag', el);
        d.setAttribute('role', 'listitem');
        d.textContent = n;
        d.style.setProperty('--fx-i', i);
        return d;
      });
    },
    reset: function (el) { el._fxRun2 = (el._fxRun2 || 0) + 1; el._fxN.forEach(function (d) { d.classList.remove('fx-on', 'fx-ok'); }); },
    enter: function (el) {
      var run = el._fxRun2 = (el._fxRun2 || 0) + 1, i = 0, step = U.num(el, 'fxStep', 800);
      if (U.reduced) { el._fxN.forEach(function (d) { d.classList.add('fx-ok'); }); return; }
      (function next() {
        if (run !== el._fxRun2) return;
        if (i) { el._fxN[i - 1].classList.remove('fx-on'); el._fxN[i - 1].classList.add('fx-ok'); }
        if (i >= el._fxN.length) { el.dispatchEvent(new CustomEvent('fx:done', { bubbles: true })); return; }
        el._fxN[i++].classList.add('fx-on');
        setTimeout(next, step);
      })();
    }
  });

  // Une onde vocale qui réagit quand l'assistant écoute
  FX.register('voice-wave', {
    setup: function (el) {
      el.setAttribute('role', 'img');
      el.setAttribute('aria-label', el.getAttribute('aria-label') || "L'assistant écoute");
      el._fxB = [];
      for (var i = 0; i < U.num(el, 'fxBars', 13); i++) el._fxB.push(U.make('i', '', el));
    },
    tick: function (el, dt, t) {
      if (U.reduced) return;
      var level = typeof el.fxLevel === 'number' ? el.fxLevel : .5 + .5 * Math.sin(t * .0023) * Math.sin(t * .0007);
      var n = el._fxB.length;
      el._fxB.forEach(function (b, i) {
        var env = Math.sin((i + .5) / n * 3.14);
        var v = .12 + env * level * (.5 + .5 * Math.sin(t * .012 + i * 1.3));
        b.style.transform = 'scaleY(' + v.toFixed(3) + ')';
      });
    }
  });

  // Des sources numérotées s'ouvrent dans le texte d'une réponse
  FX.register('citation-pop', {
    setup: function (el) {
      el.querySelectorAll('[data-source]').forEach(function (c, i) {
        var n = i + 1, a = document.createElement('a');
        a.className = 'fx-cite';
        a.href = c.getAttribute('href') || '#';
        a.textContent = n;
        a.setAttribute('aria-label', 'Source ' + n + ' : ' + c.dataset.source);
        var tip = U.make('span', 'fx-cite-tip', a);
        tip.textContent = c.dataset.source;
        tip.setAttribute('aria-hidden', 'true');
        a.style.setProperty('--fx-i', i);
        c.replaceWith(a);
      });
    }
  });

  // Une petite barre dit à quel point la réponse est sûre
  FX.register('confidence-meter', {
    entrance: true,
    setup: function (el) {
      var v = U.clamp(U.num(el, 'fxValue', 72), 0, 100);
      var lvl = v >= 75 ? 'Élevée' : v >= 40 ? 'Moyenne' : 'Faible';
      el.classList.add('fx-lvl-' + (v >= 75 ? 'h' : v >= 40 ? 'm' : 'l'));
      el.setAttribute('role', 'meter');
      el.setAttribute('aria-valuenow', v); el.setAttribute('aria-valuemin', 0); el.setAttribute('aria-valuemax', 100);
      el.setAttribute('aria-label', 'Confiance');
      el.innerHTML = '<span>Confiance : ' + lvl + '</span><i><b></b></i>';
      el.style.setProperty('--fx-v', v / 100);
    }
  });

  // Un texte montre ce qui a été retiré puis ajouté
  FX.register('diff-reveal', {
    entrance: true,
    setup: function (el) {
      el.querySelectorAll('del,ins').forEach(function (d, i) { d.style.setProperty('--fx-i', i); });
    }
  });

  // De petites étiquettes montrent ce que l'assistant est en train de lire
  FX.register('context-chips', {
    entrance: true,
    setup: function (el) {
      el._fxList = (el.dataset.fxItems || 'rapport.pdf|notes.md|budget.xlsx').split('|');
      el.setAttribute('aria-live', 'polite');
    },
    reset: function (el) { el._fxK = (el._fxK || 0) + 1; el.textContent = ''; },
    enter: function (el) {
      var run = el._fxK = (el._fxK || 0) + 1, i = 0;
      el.textContent = '';
      (function add() {
        if (run !== el._fxK || i >= el._fxList.length) return;
        var s = U.make('span', 'fx-cc', el);
        s.textContent = el._fxList[i++];
        if (U.reduced) add(); else setTimeout(add, U.num(el, 'fxStep', 500));
      })();
    }
  });

  // Le squelette de chargement se fond dans le vrai contenu
  FX.register('skeleton-morph', {
    entrance: true,
    setup: function (el) {
      el.setAttribute('aria-busy', 'true');
      el._fxDone = function () { el.classList.add('fx-ready'); el.setAttribute('aria-busy', 'false'); };
    },
    reset: function (el) { clearTimeout(el._fxTo); el.classList.remove('fx-ready'); el.setAttribute('aria-busy', 'true'); },
    enter: function (el) { el._fxTo = setTimeout(el._fxDone, U.num(el, 'fxWait', 1500)); }
  });

  // Du code s'écrit tout seul, avec une coloration simple
  FX.register('streaming-code', {
    entrance: true,
    setup: function (el) {
      el._fxSrc = el.textContent.replace(/^\n/, '');
      el.setAttribute('aria-label', el._fxSrc);
      if (!U.reduced) el.textContent = '';
    },
    reset: function (el) { el._fxS = (el._fxS || 0) + 1; el.textContent = ''; },
    enter: function (el) {
      var run = el._fxS = (el._fxS || 0) + 1, src = el._fxSrc, i = 0;
      var esc = function (s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;'); };
      var hl = function (s) {
        return esc(s).replace(/(\/\/.*)|('[^']*'?|"[^"]*"?)|\b(function|const|let|var|return|if|else|for|await|async|import|from)\b/g, function (m, c, q, k) {
          return '<span class="' + (c ? 'c' : q ? 's' : 'k') + '">' + m + '</span>';
        });
      };
      if (U.reduced) { el.innerHTML = hl(src); return; }
      (function next() {
        if (run !== el._fxS) return;
        i = Math.min(src.length, i + 1 + Math.floor(Math.random() * 3));
        el.innerHTML = hl(src.slice(0, i)) + (i < src.length ? '<i class="fx-cur"></i>' : '');
        if (i < src.length) setTimeout(next, U.num(el, 'fxSpeed', 22));
        else el.dispatchEvent(new CustomEvent('fx:done', { bubbles: true }));
      })();
    }
  });

  // Une file d'attente qui avance, avec la place restante
  FX.register('queue-position', {
    setup: function (el) {
      var start = U.num(el, 'fxStart', 6);
      el.setAttribute('role', 'status');
      el.innerHTML = '<div class="fx-q-row"></div><span></span>';
      var row = el.firstChild;
      for (var i = 0; i < start; i++) U.make('i', '', row);
      el._fxQ = { n: start - 1, t: 0, row: row, msg: el.lastChild };
      el._fxPaint = function () {
        var q = el._fxQ;
        Array.prototype.forEach.call(row.children, function (d, i) { d.classList.toggle('fx-me', i === q.n); d.classList.toggle('fx-gone', i > q.n); });
        q.msg.textContent = q.n > 0 ? q.n + (q.n > 1 ? ' personnes devant vous' : ' personne devant vous') : "C'est à vous !";
      };
      el._fxPaint();
    },
    tick: function (el, dt) {
      if (U.reduced) return;
      var q = el._fxQ;
      q.t += dt;
      if (q.t < U.num(el, 'fxEvery', 1.4)) return;
      q.t = 0;
      if (q.n > 0) {
        q.n--;
        el._fxPaint();
        if (!q.n) el.dispatchEvent(new CustomEvent('fx:ready', { bubbles: true }));
      } else if (el.dataset.fxLoop === 'true') { q.n = q.row.children.length - 1; el._fxPaint(); }
    }
  });

  // Un champ refuse avec une secousse et explique pourquoi
  FX.register('error-glitch-shake', {
    trigger: function (el, e) {
      var msg = el.dataset.fxError || 'Cette valeur ne convient pas.', box = el.querySelector('.fx-eg-msg');
      if (!box) { box = U.make('span', 'fx-eg-msg', el); box.setAttribute('role', 'alert'); }
      box.textContent = msg;
      var input = el.querySelector('input,textarea,select');
      if (input) { input.setAttribute('aria-invalid', 'true'); input.focus({ preventScroll: true }); }
      el.classList.remove('fx-err'); void el.offsetWidth; el.classList.add('fx-err');
    },
    setup: function (el) {
      var input = el.querySelector('input,textarea,select');
      if (input) input.addEventListener('input', function () { el.classList.remove('fx-err'); input.removeAttribute('aria-invalid'); var b = el.querySelector('.fx-eg-msg'); if (b) b.textContent = ''; });
    }
  });

  // Un tampon « Validé » s'écrase sur l'élément
  FX.register('success-stamp', {
    setup: function (el) {
      U.ensurePositioned(el);
      var s = el._fxS = U.make('span', 'fx-stamp', el);
      s.textContent = el.dataset.fxStamp || 'Validé';
      s.setAttribute('role', 'status');
      s.style.setProperty('--fx-r', U.rand(-14, -6).toFixed(1) + 'deg');
      if (el.dataset.fxAuto === 'true') FX.trigger(el);
    },
    triggerOn: 'fx:ok',
    trigger: function (el) { el._fxS.classList.remove('fx-on'); void el._fxS.offsetWidth; el._fxS.classList.add('fx-on'); el.classList.add('fx-stamped'); setTimeout(function () { el.classList.remove('fx-stamped'); }, 260); }
  });

  // Faire glisser pour confirmer une action
  FX.register('unlock-slide', {
    setup: function (el) {
      var label = el.dataset.fxLabel || 'Glisser pour confirmer';
      el.innerHTML = '<span class="fx-us-t"></span><button type="button" aria-label="' + label + '">→</button>';
      el.firstChild.textContent = label;
      var b = el.lastChild, sx = 0, x = 0, drag = false;
      var max = function () { return el.clientWidth - b.offsetWidth - 8; };
      var pos = function (v) { x = v; el.style.setProperty('--fx-x', v + 'px'); el.style.setProperty('--fx-p', max() ? (v / max()).toFixed(3) : 0); };
      var done = function () {
        el.classList.add('fx-done');
        el.firstChild.textContent = el.dataset.fxDone || 'Confirmé';
        pos(max());
        el.dispatchEvent(new CustomEvent('fx:unlock', { bubbles: true }));
      };
      b.addEventListener('pointerdown', function (e) { if (el.classList.contains('fx-done')) return; drag = true; sx = e.clientX - x; el.classList.add('fx-drag'); if (e.isTrusted) b.setPointerCapture(e.pointerId); });
      b.addEventListener('pointermove', function (e) { if (drag) pos(U.clamp(e.clientX - sx, 0, max())); });
      b.addEventListener('pointerup', function () { if (!drag) return; drag = false; el.classList.remove('fx-drag'); if (x > max() * .86) done(); else pos(0); });
      b.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); done(); } });
    }
  });

  // Une zone de dépôt qui réagit à l'arrivée de fichiers
  FX.register('upload-drop', {
    setup: function (el) {
      var input = el.querySelector('input[type="file"]');
      var list = U.make('ul', 'fx-ud-list', el);
      var take = function (files) {
        Array.prototype.forEach.call(files, function (f) { var li = U.make('li', '', list); li.textContent = f.name; });
        el.dispatchEvent(new CustomEvent('fx:files', { bubbles: true, detail: { files: files } }));
      };
      ['dragenter', 'dragover'].forEach(function (n) { el.addEventListener(n, function (e) { e.preventDefault(); el.classList.add('fx-over'); }); });
      ['dragleave', 'drop'].forEach(function (n) { el.addEventListener(n, function (e) { e.preventDefault(); el.classList.remove('fx-over'); }); });
      el.addEventListener('drop', function (e) { if (e.dataTransfer) take(e.dataTransfer.files); });
      if (input) input.addEventListener('change', function () { take(input.files); });
    }
  });

  // Un bandeau descend quand la connexion se perd
  FX.register('offline-banner', {
    setup: function (el) {
      el.setAttribute('role', 'status');
      var off = el.dataset.fxOff || 'Vous êtes hors ligne. Vos changements seront envoyés au retour.', on = el.dataset.fxOn || 'De nouveau en ligne.', to;
      var sync = function (state) {
        clearTimeout(to);
        el.textContent = state ? on : off;
        el.classList.add('fx-show');
        el.classList.toggle('fx-ok', state);
        if (state) to = setTimeout(function () { el.classList.remove('fx-show'); }, 2500);
      };
      window.addEventListener('offline', function () { sync(false); });
      window.addEventListener('online', function () { sync(true); });
      if (!navigator.onLine) sync(false);
      el._fxSync = sync; el._fxState = false;
    },
    trigger: function (el) { el._fxSync(el._fxState); el._fxState = !el._fxState; }
  });

  // Une pile qui se remplit et signale un niveau faible
  FX.register('battery-level', {
    entrance: true,
    setup: function (el) {
      var v = U.clamp(U.num(el, 'fxValue', 68), 0, 100);
      el.setAttribute('role', 'meter');
      el.setAttribute('aria-valuenow', v); el.setAttribute('aria-valuemin', 0); el.setAttribute('aria-valuemax', 100);
      el.setAttribute('aria-label', 'Niveau');
      el.innerHTML = '<i></i><b>' + v + ' %</b>';
      el.style.setProperty('--fx-v', v / 100);
      el.classList.toggle('fx-low', v < U.num(el, 'fxLow', 20));
      el.classList.toggle('fx-charge', el.dataset.fxCharging === 'true');
    }
  });

  // « Noa est en train d'écrire… », avec l'accord selon le nombre
  FX.register('typing-indicator-name', {
    setup: function (el) {
      el.setAttribute('role', 'status');
      el._fxSet = function (names) {
        var t = !names.length ? '' : names.length === 1 ? names[0] + " est en train d'écrire" : names.length === 2 ? names[0] + ' et ' + names[1] + " sont en train d'écrire" : names.length + " personnes sont en train d'écrire";
        el.innerHTML = t ? '<span></span><i></i><i></i><i></i>' : '';
        if (t) el.firstChild.textContent = t;
      };
      el._fxSet((el.dataset.fxNames || 'Noa').split('|').filter(Boolean));
      el._fxI = 0;
    },
    trigger: function (el) {
      var seq = [['Noa'], ['Noa', 'Sam'], ['Noa', 'Sam', 'Lou'], []];
      el._fxSet(seq[el._fxI++ % seq.length]);
    }
  });

  // Une pastille discrète indique l'enregistrement automatique
  FX.register('save-pill', {
    setup: function (el) {
      el.setAttribute('role', 'status');
      el._fxSt = function (s) {
        var msg = { saving: 'Enregistrement…', saved: 'Enregistré', error: 'Échec, nouvel essai…', idle: '' };
        el.dataset.fxState = s;
        el.textContent = msg[s];
      };
      el._fxSt('idle');
      el._fxC = 0;
    },
    trigger: function (el) {
      clearTimeout(el._fxTo);
      el._fxSt('saving');
      var fail = el.dataset.fxDemo && ++el._fxC % 3 === 0;
      el._fxTo = setTimeout(function () {
        el._fxSt(fail ? 'error' : 'saved');
        el._fxTo = setTimeout(function () { el._fxSt(fail ? 'saving' : 'idle'); if (fail) el._fxTo = setTimeout(function () { el._fxSt('saved'); }, 700); }, 1500);
      }, 800);
    },
    tick: function (el, dt) {
      if (!el.dataset.fxDemo || U.reduced) return;
      el._fxW = (el._fxW || 3) + dt;
      if (el._fxW > 3.6) { el._fxW = 0; FX.trigger(el); }
    }
  });

  // Une illustration flotte doucement quand il n'y a rien à afficher
  FX.register('empty-state-float', {
    setup: function (el) {
      var s = el._fxS = { x: 0, y: 0, tx: 0, ty: 0 };
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        s.tx = ((e.clientX - r.left) / r.width - .5) * 12;
        s.ty = ((e.clientY - r.top) / r.height - .5) * 12;
      });
      el.addEventListener('pointerleave', function () { s.tx = s.ty = 0; });
    },
    tick: function (el, dt, t) {
      if (U.reduced) return;
      var s = el._fxS;
      s.x = U.lerp(s.x, s.tx, .06); s.y = U.lerp(s.y, s.ty, .06);
      el.style.setProperty('--fx-x', s.x.toFixed(1) + 'px');
      el.style.setProperty('--fx-y', (s.y + Math.sin(t * .0016) * 6).toFixed(1) + 'px');
      el.style.setProperty('--fx-shadow', (1 - (Math.sin(t * .0016) + 1) * .12).toFixed(3));
    }
  });

  // Plusieurs tâches avancent, chacune à son rythme
  FX.register('multi-file-progress', {
    setup: function (el) {
      var names = (el.dataset.fxItems || 'photos.zip|contrat.pdf|notes.md').split('|');
      el._fxRows = names.map(function (n) {
        var r = U.make('div', 'fx-mf', el);
        r.innerHTML = '<span></span><i role="progressbar" aria-valuemin="0" aria-valuemax="100"><b></b></i><em></em>';
        r.firstChild.textContent = n;
        r.children[1].setAttribute('aria-label', n);
        return { el: r, p: 0, s: U.rand(.1, .4) };
      });
      el._fxSet = function (i, v) {
        var r = el._fxRows[i];
        r.p = U.clamp(v, 0, 1);
        r.el.style.setProperty('--fx-v', r.p);
        r.el.children[1].setAttribute('aria-valuenow', Math.round(r.p * 100));
        r.el.lastChild.textContent = r.p >= 1 ? '✓' : Math.round(r.p * 100) + ' %';
        r.el.classList.toggle('fx-ok', r.p >= 1);
      };
      el._fxRows.forEach(function (r, i) { el._fxSet(i, 0); });
      el._fxWait = 0;
    },
    tick: function (el, dt) {
      if (U.reduced || el.dataset.fxManual === 'true') return;
      var all = true;
      el._fxRows.forEach(function (r, i) { if (r.p < 1) { all = false; el._fxSet(i, r.p + r.s * dt); } });
      if (all && (el._fxWait += dt) > 2) { el._fxWait = 0; el._fxRows.forEach(function (r, i) { el._fxSet(i, 0); }); }
    }
  });
})(window.FX);
