/* Métadonnées — Pack 20 — Nouvelles entrées */
const E = (id, cat, intent, feel, params, use, avoid, code, demo, extra) =>
  Object.assign({ id, cat, intent, feel, params, use, avoid, code, demo }, extra || {});

module.exports = [
  E('cascade-rows', 'Entrée',
    'Les éléments d\'une grille arrivent rangée par rangée, selon leur position réelle à l\'écran.',
    'Ordonné, un tableau qui se pose.',
    '- `--fx-distance` (24px) : distance de montée',
    'Grilles de cartes, listes de produits.',
    'Un enfant unique : préférez `fade-up`.',
    '<div data-fx="cascade-rows">…</div>',
    '<div class="demo-grid" data-fx="cascade-rows"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>',
    { trigger: 'Rejouer' }),
];
