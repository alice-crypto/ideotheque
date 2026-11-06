/* Métadonnées — Pack 31 — Logistique */
const E = (id, cat, intent, feel, params, use, avoid, code, demo, extra) =>
  Object.assign({ id, cat, intent, feel, params, use, avoid, code, demo }, extra || {});

module.exports = [
  E('parcel-journey', 'Présentation',
    'Un camion avance sur le trajet d\'un colis jusqu\'à l\'étape en cours.',
    'On voit son colis se rapprocher, c\'est tout le plaisir.',
    '- `data-fx-items` : « étape:date » séparés par `|`\n- `data-fx-current` (2)',
    'Livraison, commandes, retours.',
    'Une étape annoncée sans donnée réelle derrière.',
    '<div data-fx="parcel-journey" data-fx-current="2"></div>',
    '<div data-fx="parcel-journey" style="color:var(--ink)"></div>',
    { trigger: 'Rejouer', a11y: 'Étape et rang écrits, ligne décorative.' }),
];
