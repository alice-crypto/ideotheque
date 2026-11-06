/* Métadonnées — Pack 28 — Architecture */
const E = (id, cat, intent, feel, params, use, avoid, code, demo, extra) =>
  Object.assign({ id, cat, intent, feel, params, use, avoid, code, demo }, extra || {});

module.exports = [
  E('section-cut', 'Image',
    'Un curseur coupe le bâtiment et montre ses pièces derrière la façade.',
    'Regard d\'architecte, on voit comment c\'est fait.',
    '- `data-fx-floors` (4), `data-fx-value` (55)\n- `--fx-facade`, `--fx-room`',
    'Agences d\'architecture, promoteurs, objets techniques.',
    'Un vrai projet représenté par ce dessin générique : remplacez-le par la vraie coupe.',
    '<div data-fx="section-cut" data-fx-floors="4"></div>',
    '<div data-fx="section-cut"></div>',
    { a11y: 'Vrai curseur nommé, dessin décoratif.' }),
];
