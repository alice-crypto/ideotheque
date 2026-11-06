/* Métadonnées — Pack 24 — Assurance */
const E = (id, cat, intent, feel, params, use, avoid, code, demo, extra) =>
  Object.assign({ id, cat, intent, feel, params, use, avoid, code, demo }, extra || {});

module.exports = [
  E('premium-builder', 'Micro-interaction',
    'Des garanties à cocher font varier la cotisation mensuelle, annoncée à chaque changement.',
    'Clair, on sait ce que chaque option coûte.',
    '- `data-fx-base` (18) : prix de base\n- `data-fx-items` : « nom:prix » séparés par `|`\n- `--fx-w` (230px)',
    'Devis d\'assurance, abonnements à options.',
    'Un tarif qui dépend d\'un calcul de risque : ce total serait trompeur.',
    '<div data-fx="premium-builder" data-fx-base="18" data-fx-items="Vol:6|Assistance:5"></div>',
    '<div data-fx="premium-builder" style="color:var(--ink)"></div>',
    { a11y: 'Vraies cases à cocher, et le total est dans une région `aria-live`.' }),
];
