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
  E('boarding-pass', 'Présentation',
    'Une carte d\'embarquement sort d\'une fente, avec ses informations de vol.',
    'Le geste qui lance les vacances.',
    '- `data-fx-from`, `data-fx-to`, `data-fx-flight`, `data-fx-gate`, `data-fx-seat`, `data-fx-in` (48)',
    'Compagnies, événements, billets, pages de confirmation.',
    'De reproduire une vraie carte de compagnie : ce gabarit reste générique et fictif.',
    '<div data-fx="boarding-pass" data-fx-from="CDG" data-fx-to="LIS"></div>',
    '<div data-fx="boarding-pass"></div>',
    { trigger: 'Rejouer', a11y: 'Vraie liste de définitions. La flèche décorative est masquée.' }),
];
