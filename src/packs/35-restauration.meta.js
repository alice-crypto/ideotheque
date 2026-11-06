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
  E('table-booking', 'Micro-interaction',
    'On choisit le nombre de couverts, seuls les créneaux possibles restent et la réservation se confirme.',
    'La table est à vous en trois gestes.',
    '- `data-fx-items` : « h:m:places » séparés par `|`\n- `data-fx-party` (2) ; événement `fx:booking`',
    'Restaurants, salles, activités.',
    'De montrer une disponibilité qui ne vient pas de votre outil de réservation.',
    '<div data-fx="table-booking" data-fx-items="19:00:8|20:00:2"></div>',
    '<div data-fx="table-booking" style="color:var(--ink)"></div>',
    { a11y: 'Boutons nommés, créneaux pleins désactivés, choix annoncé.' }),
  E('floor-tables', 'Micro-interaction',
    'Sur un plan de salle, on choisit une table libre, et sa capacité s\'écrit.',
    'On se voit déjà assis près de la fenêtre.',
    '- `data-fx-items` : « x:y:places:état (f ou o) » séparés par `|`',
    'Restaurants, cinémas, coworkings.',
    'Un plan non tenu à jour : le choix promis doit rester disponible.',
    '<div data-fx="floor-tables" data-fx-items="12:18:2:f|38:18:2:o"></div>',
    '<div data-fx="floor-tables" style="color:var(--ink)"></div>',
    { a11y: 'Boutons nommés avec capacité et état, tables occupées désactivées.' }),
];
