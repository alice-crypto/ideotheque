/* Métadonnées — Pack 16 — Fonds génératifs */
const E = (id, cat, intent, feel, params, use, avoid, code, demo, extra) =>
  Object.assign({ id, cat, intent, feel, params, use, avoid, code, demo }, extra || {});

module.exports = [
  E('flow-field', 'Ambiance',
    'Des milliers de petits traits suivent un courant invisible et dessinent des veines qui s\'effacent lentement.',
    'Vent sur le sable, topographie vivante.',
    '- `data-fx-count` (140) : nombre de particules\n- `data-fx-scale` (.006) : taille des tourbillons\n- `--fx-line` : couleur',
    'Fonds d\'accueil, sections sans image.',
    'Sous un texte fin, et sur les appareils modestes avec un grand nombre de particules.',
    '<section data-fx="flow-field">…</section>',
    '<div data-fx="flow-field" style="width:230px;height:170px"></div>',
    { a11y: 'Le canvas est décoratif. Avec `prefers-reduced-motion: reduce`, il affiche une image fixe.' }),
];
