/* Métadonnées — Pack 29 — Automobile */
const E = (id, cat, intent, feel, params, use, avoid, code, demo, extra) =>
  Object.assign({ id, cat, intent, feel, params, use, avoid, code, demo }, extra || {});

module.exports = [
  E('car-colorizer', 'Micro-interaction',
    'Des pastilles repeignent la voiture, et le prix suit la peinture choisie.',
    'On imagine déjà la voiture devant chez soi.',
    '- `data-fx-price` (24900)\n- `data-fx-items` : « nom:couleur:supplément » séparés par `|`',
    'Configurateurs, vélos, meubles.',
    'Une couleur écran présentée comme fidèle : le rendu réel diffère.',
    '<div data-fx="car-colorizer" data-fx-price="24900"></div>',
    '<div data-fx="car-colorizer" style="color:var(--ink)"></div>',
    { a11y: 'Pastilles nommées, `aria-pressed`, prix et couleur annoncés.' }),
  E('wheel-roll', 'Défilement',
    'Une voiture avance au fil du défilement, et ses roues tournent en proportion exacte.',
    'Un petit fil rouge, juste assez joueur.',
    '- `--fx-h` (66px), `--fx-accent`',
    'Lancement de véhicule, indicateur de lecture.',
    'Comme seule indication de progression : le dessin reste décoratif.',
    '<div data-fx="wheel-roll"></div>',
    '<div data-fx="wheel-roll" style="color:var(--ink);width:220px"></div>',
    { a11y: 'Décoratif, masqué aux lecteurs d\'écran.' }),
  E('range-conditions', 'Micro-interaction',
    'Température et vitesse font varier l\'autonomie réelle d\'un véhicule électrique.',
    'Sans discours, l\'honnêteté sur l\'autonomie rassure.',
    '- `data-fx-range` (420) : autonomie annoncée',
    'Constructeurs, comparateurs, sites de bornes.',
    'De présenter ce modèle comme un vrai calcul : remplacez les coefficients par vos essais.',
    '<div data-fx="range-conditions" data-fx-range="420"></div>',
    '<div data-fx="range-conditions" style="color:var(--ink)"></div>',
    { a11y: 'Curseurs étiquetés, résultat annoncé.' }),
];
