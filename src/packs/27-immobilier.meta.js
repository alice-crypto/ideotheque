/* Métadonnées — Pack 27 — Immobilier */
const E = (id, cat, intent, feel, params, use, avoid, code, demo, extra) =>
  Object.assign({ id, cat, intent, feel, params, use, avoid, code, demo }, extra || {});

module.exports = [
  E('budget-reach', 'Micro-interaction',
    'Trois curseurs donnent un budget d\'achat possible, recalculé à chaque geste.',
    'On rêve avec des chiffres qui tiennent la route.',
    '- `data-fx-rate` (3.4) : taux annuel en %\n- `data-fx-part` (35) : part du revenu en %',
    'Portails immobiliers, courtiers, banques.',
    'De présenter ce résultat comme un accord de prêt.',
    '<div data-fx="budget-reach" data-fx-rate="3.4"></div>',
    '<div data-fx="budget-reach" style="color:var(--ink)"></div>',
    { a11y: 'Curseurs étiquetés, résultat annoncé.' }),
  E('floorplan-rooms', 'Micro-interaction',
    'Un plan montre le nom et la surface de la pièce survolée, sur le total du logement.',
    'On se promène déjà dans l\'appartement.',
    '- `data-fx-items` : « pièce:x,y,largeur,hauteur:surface » séparés par `|`',
    'Annonces, promoteurs, salles à louer.',
    'Un plan non contractuel présenté comme exact.',
    '<div data-fx="floorplan-rooms" data-fx-items="Séjour:0,0,100,100:28"></div>',
    '<div data-fx="floorplan-rooms" style="color:var(--ink)"></div>',
    { a11y: 'Chaque pièce est un bouton, et le détail est annoncé ; il s\'obtient aussi au focus.' }),
];
