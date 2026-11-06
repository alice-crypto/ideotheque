/* Métadonnées — Pack 35 — Restauration */
const E = (id, cat, intent, feel, params, use, avoid, code, demo, extra) =>
  Object.assign({ id, cat, intent, feel, params, use, avoid, code, demo }, extra || {});

module.exports = [
  E('menu-diet-filter', 'Micro-interaction',
    'Des filtres de régime retirent les plats incompatibles, et le compte s\'écrit.',
    'Plus besoin de demander au serveur pour chaque plat.',
    '- `data-fx-items` : « plat:prix:lettres » séparés par `|` (v, g, l)',
    'Restaurants, traiteurs, cantines.',
    'D\'affirmer l\'absence d\'un allergène sans vérification en cuisine.',
    '<div data-fx="menu-diet-filter" data-fx-items="Velouté:12:vgl"></div>',
    '<div data-fx="menu-diet-filter" style="color:var(--ink)"></div>',
    { a11y: 'Boutons `aria-pressed`, compte annoncé, lignes masquées retirées pour les lecteurs d\'écran.' }),
];
