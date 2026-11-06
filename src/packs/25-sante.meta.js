/* Métadonnées — Pack 25 — Santé */
const E = (id, cat, intent, feel, params, use, avoid, code, demo, extra) =>
  Object.assign({ id, cat, intent, feel, params, use, avoid, code, demo }, extra || {});

module.exports = [
  E('appointment-week', 'Micro-interaction',
    'On choisit un jour de la semaine, puis une heure, et le rendez-vous s\'écrit en toutes lettres.',
    'Rapide, deux gestes et c\'est réservé.',
    '- `data-fx-hours` : heures séparées par des virgules\n- `data-fx-days` (5) ; événement `fx:slot`',
    'Cabinets, garages, coiffeurs, services.',
    'De laisser ces créneaux d\'exemple : ils doivent venir d\'un vrai agenda.',
    '<div data-fx="appointment-week" data-fx-hours="9:00,14:00"></div>',
    '<div data-fx="appointment-week" style="color:var(--ink)"></div>',
    { a11y: 'Vrais boutons, choix du jour exposé par `aria-pressed`, et rendez-vous annoncé.' }),
];
