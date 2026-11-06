/* Métadonnées — Pack 36 — Hôtellerie */
const E = (id, cat, intent, feel, params, use, avoid, code, demo, extra) =>
  Object.assign({ id, cat, intent, feel, params, use, avoid, code, demo }, extra || {});

module.exports = [
  E('stay-range', 'Micro-interaction',
    'Deux clics choisissent un séjour, et les nuits et le prix se calculent.',
    'Les vacances se dessinent, dans un calendrier.',
    '- `data-fx-price` (110), `data-fx-weekend` (145) ; événement `fx:stay`',
    'Hôtels, locations, activités à la journée.',
    'Ces prix d\'exemple sans disponibilités réelles derrière.',
    '<div data-fx="stay-range" data-fx-price="110"></div>',
    '<div data-fx="stay-range" style="color:var(--ink)"></div>',
    { a11y: 'Chaque jour est un bouton nommé en toutes lettres, résultat annoncé.' }),
  E('room-type', 'Micro-interaction',
    'Le type de chambre choisi affiche ses détails, et un carré montre sa surface à l\'échelle.',
    'On compare les chambres sans ouvrir trois pages.',
    '- `data-fx-items` : « nom:m²:lit:vue:prix » séparés par `|`',
    'Hôtels, locations, offres à plusieurs niveaux.',
    'Un prix « à partir de » trop éloigné de la réalité du séjour.',
    '<div data-fx="room-type" data-fx-items="Classique:18:1 grand lit:Cour:119"></div>',
    '<div data-fx="room-type" style="color:var(--ink)"></div>',
    { a11y: 'Groupe radio nommé, détails annoncés.' }),
];
