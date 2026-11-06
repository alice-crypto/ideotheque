/* Métadonnées — Pack 23 — Banque et finance */
const E = (id, cat, intent, feel, params, use, avoid, code, demo, extra) =>
  Object.assign({ id, cat, intent, feel, params, use, avoid, code, demo }, extra || {});

module.exports = [
  E('ticker-tape', 'Présentation',
    'Un bandeau fait défiler des cours, avec le sens de chaque variation écrit par une flèche et un signe.',
    'Salle de marché, information en continu.',
    '- `data-fx-items` : « nom:valeur:variation » séparés par `|`\n- `data-fx-pace` (4) : secondes par valeur\n- `--fx-up`, `--fx-down` : couleurs',
    'Pages de marchés, taux, matières premières.',
    'Des cours présentés comme réels sans source à jour.',
    '<div data-fx="ticker-tape" data-fx-items="OR:2310:0.4|EUR:1,08:-0.1"></div>',
    '<div data-fx="ticker-tape" style="width:100%;color:var(--ink);font-size:14px"></div>',
    { a11y: 'Les valeurs sont dans `aria-label`. Le sens est donné par la flèche, pas seulement par la couleur.' }),
];
