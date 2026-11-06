/* Métadonnées — Pack 30 — Mobilité */
const E = (id, cat, intent, feel, params, use, avoid, code, demo, extra) =>
  Object.assign({ id, cat, intent, feel, params, use, avoid, code, demo }, extra || {});

module.exports = [
  E('metro-line', 'Navigation',
    'On touche un arrêt sur la ligne pour voir le trajet s\'allumer et le temps de parcours.',
    'Un plan de métro, évident pour tout le monde.',
    '- `data-fx-items` : « arrêt:minutes depuis le précédent » séparés par `|`\n- `data-fx-from` (0), `--fx-line`',
    'Transports, parcours, étapes d\'un programme.',
    'Plus de sept arrêts dans une petite largeur : les noms se chevauchent.',
    '<div data-fx="metro-line" data-fx-items="Gare:0|Parc:4"></div>',
    '<div data-fx="metro-line" style="color:var(--ink)"></div>',
    { a11y: 'Liste ordonnée de boutons, résultat annoncé.' }),
];
