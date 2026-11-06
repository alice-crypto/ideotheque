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
];
