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
  E('body-map', 'Micro-interaction',
    'Une silhouette se découpe en zones, et toucher une zone oriente vers le bon contenu.',
    'Immédiat, pas besoin de connaître le mot juste.',
    '- `data-fx-items` : JSON « zone : texte »\n- `--fx-s` (84px) ; événement `fx:zone`',
    'Kinésithérapie, sport, orientation dans un site de santé.',
    'De donner un diagnostic : l\'effet oriente vers un contenu, il ne soigne pas.',
    '<div data-fx="body-map" data-fx-items=\'{"Dos":"Exercices pour le dos"}\'></div>',
    '<div data-fx="body-map" style="color:var(--ink)"></div>',
    { a11y: 'Chaque zone est focalisable, nommée et activable au clavier.' }),
  E('pain-scale', 'Micro-interaction',
    'Un curseur de 0 à 10 fait changer un visage et le mot qui décrit la douleur.',
    'Doux pour un sujet difficile.',
    '- `data-fx-value` (3), `--fx-s` (64px)',
    'Suivi post-opératoire, formulaires de santé, satisfaction.',
    'Le ton léger dans un contexte grave : retirez le visage si besoin.',
    '<div data-fx="pain-scale" data-fx-value="3"></div>',
    '<div data-fx="pain-scale" style="color:var(--ink)"></div>',
    { a11y: 'Vrai curseur, niveau et mot annoncés ; le visage est décoratif.' }),
];
