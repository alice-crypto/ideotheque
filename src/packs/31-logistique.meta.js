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
  E('delivery-window', 'État',
    'Un créneau de livraison se pose sur la journée, avec un repère à l\'heure actuelle.',
    'On peut sortir acheter le pain en toute tranquillité.',
    '- `data-fx-from` (14), `data-fx-to` (16), `data-fx-start` (7), `data-fx-end` (21)',
    'Livraisons, techniciens, rendez-vous à domicile.',
    'Un créneau trop large présenté comme précis.',
    '<div data-fx="delivery-window" data-fx-from="14" data-fx-to="16"></div>',
    '<div data-fx="delivery-window" style="color:var(--ink)"></div>',
    { a11y: 'Tout est écrit dans une phrase annoncée.' }),
];
