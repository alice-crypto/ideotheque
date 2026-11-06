/* Métadonnées — Pack 32 — Énergie */
const E = (id, cat, intent, feel, params, use, avoid, code, demo, extra) =>
  Object.assign({ id, cat, intent, feel, params, use, avoid, code, demo }, extra || {});

module.exports = [
  E('solar-roof', 'Micro-interaction',
    'Un curseur pose des panneaux sur le toit et donne production, économie et rentabilité.',
    'Son toit devient une petite centrale.',
    '- `data-fx-count` (8), `data-fx-yield` (1200), `data-fx-kwh` (0.21), `data-fx-cost` (650)',
    'Installateurs, fournisseurs d\'énergie, aides.',
    'De reprendre ces chiffres comme un devis : l\'orientation et la région comptent beaucoup.',
    '<div data-fx="solar-roof" data-fx-count="8"></div>',
    '<div data-fx="solar-roof" style="color:var(--ink)"></div>',
    { a11y: 'Curseur étiqueté, résultat annoncé.' }),
  E('bill-slices', 'Présentation',
    'Une barre découpe la facture en postes, et chacun s\'explique au clic.',
    'Enfin comprendre où part l\'argent.',
    '- `data-fx-items` : « poste:montant:explication » séparés par `|`',
    'Énergie, télécoms, impôts, tout budget.',
    'Des parts d\'exemple comme parts réelles : affichez la vraie facture.',
    '<div data-fx="bill-slices" data-fx-items="Énergie:42:Consommation|Taxes:24:Taxes"></div>',
    '<div data-fx="bill-slices" style="color:var(--ink)"></div>',
    { trigger: 'Rejouer', a11y: 'Chaque part est un bouton nommé avec son pourcentage, détail annoncé.' }),
];
