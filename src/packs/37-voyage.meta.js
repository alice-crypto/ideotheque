/* Métadonnées — Pack 37 — Voyage */
const E = (id, cat, intent, feel, params, use, avoid, code, demo, extra) =>
  Object.assign({ id, cat, intent, feel, params, use, avoid, code, demo }, extra || {});

module.exports = [
  E('flight-arc', 'Présentation',
    'Un arc relie deux villes, et donne la vraie distance et une durée de vol estimée.',
    'Le voyage commence avant même de décoller.',
    '- `data-fx-from`, `data-fx-to` : « ville:latitude:longitude »',
    'Compagnies, récits de voyage, livraison internationale.',
    'De donner cette durée pour un horaire : les routes et les vents la changent.',
    '<div data-fx="flight-arc" data-fx-from="Paris:48.86:2.35" data-fx-to="Tokyo:35.68:139.69"></div>',
    '<div data-fx="flight-arc" style="color:var(--ink)"></div>',
    { trigger: 'Rejouer', a11y: 'Villes, distance et durée sont écrites.' }),
];
