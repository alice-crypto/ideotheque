/* Métadonnées — Pack 17 — Parcours et mises en page */
const E = (id, cat, intent, feel, params, use, avoid, code, demo, extra) =>
  Object.assign({ id, cat, intent, feel, params, use, avoid, code, demo }, extra || {});

module.exports = [
  E('bento-expand', 'Navigation',
    'Une case de la grille s\'agrandit au clic, et les autres glissent pour se ranger autour d\'elle.',
    'Un tableau de bord qui se réorganise, ordre et fluidité.',
    '- `--fx-cols` (3) : nombre de colonnes\n- `--fx-gap` (10px) : écart',
    'Présentation de fonctions, galeries, tableaux de bord.',
    'Une grille de deux colonnes : il n\'y a pas de place pour l\'agrandissement.',
    '<div data-fx="bento-expand"><div>…</div><div>…</div><div>…</div></div>',
    '<div data-fx="bento-expand" style="width:210px;grid-auto-rows:40px;--fx-gap:6px"><div class="demo-box" style="width:auto;height:auto"></div><div class="demo-box alt" style="width:auto;height:auto"></div><div class="demo-box ink" style="width:auto;height:auto"></div><div class="demo-box alt" style="width:auto;height:auto"></div><div class="demo-box" style="width:auto;height:auto"></div><div class="demo-box ink" style="width:auto;height:auto"></div></div>',
    { a11y: 'Chaque case a le rôle `button` et `aria-expanded`, réagit à Entrée, Espace et Échap.' }),
];
