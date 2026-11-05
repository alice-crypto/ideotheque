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
  E('mega-index', 'Navigation',
    'Une liste de très grands liens : l\'aperçu du lien survolé apparaît à côté, les autres s\'estompent.',
    'Sommaire de magazine, navigation comme un choix à faire.',
    '- `data-fx-img` sur chaque lien : image d\'aperçu\n- `--fx-pv` (44%) : largeur de l\'aperçu',
    'Menus plein écran, listes de projets.',
    'Les menus longs : au-delà de 7 liens, la hauteur manque.',
    '<nav data-fx="mega-index"><a href="#" data-fx-img="a.jpg">Projets</a><a href="#" data-fx-img="b.jpg">Studio</a></nav>',
    '<nav data-fx="mega-index" style="width:230px;font-size:30px;font-weight:600;color:var(--ink)"><a href="#" data-fx-img="assets/dune.svg">Dunes</a><a href="#" data-fx-img="assets/city.svg">Villes</a><a href="#" data-fx-img="assets/bloom.svg">Fleurs</a></nav>',
    { a11y: 'L\'aperçu réagit aussi au focus clavier. Il est décoratif et masqué aux lecteurs d\'écran.' }),
];
