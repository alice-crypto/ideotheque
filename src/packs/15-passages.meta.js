/* Métadonnées — Pack 15 — Passages et images */
const E = (id, cat, intent, feel, params, use, avoid, code, demo, extra) =>
  Object.assign({ id, cat, intent, feel, params, use, avoid, code, demo }, extra || {});

module.exports = [
  E('diagonal-tiles', 'Transition',
    'Une grille de tuiles couvre l\'écran en une vague qui part d\'un coin.',
    'Géométrique, précis, mosaïque qui se pose.',
    '- `--fx-tr-color` : couleur des tuiles',
    'Portfolios, sites d\'architecture.',
    'Les applications où l\'on change souvent de page.',
    '<a href="/projets" data-fx="diagonal-tiles">Projets</a>',
    '<button class="demo-ghost" onclick="FX.play(\'diagonal-tiles\', null, event)">Lancer la transition</button>',
    { a11y: 'Avec `prefers-reduced-motion: reduce`, le changement de page se fait sans transition.' }),
];
