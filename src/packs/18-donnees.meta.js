/* Métadonnées — Pack 18 — Données et présentation */
const E = (id, cat, intent, feel, params, use, avoid, code, demo, extra) =>
  Object.assign({ id, cat, intent, feel, params, use, avoid, code, demo }, extra || {});

module.exports = [
  E('radial-bars', 'Présentation',
    'Des barres rayonnent autour d\'un centre et poussent une à une vers l\'extérieur.',
    'Soleil de données, cycle, rythme d\'une journée.',
    '- `data-fx-values` : valeurs séparées par des virgules\n- `--fx-size` (160px), `--fx-w` (6px), `--fx-bar`',
    'Données cycliques : heures, mois, semaines.',
    'Une comparaison précise : les barres longues semblent plus importantes qu\'elles ne le sont.',
    '<div data-fx="radial-bars" data-fx-values="40,70,55,90"></div>',
    '<div data-fx="radial-bars"></div>',
    { trigger: 'Rejouer', a11y: 'Les valeurs sont dans `aria-label`.' }),
  E('sparkline-draw', 'Présentation',
    'Une petite courbe de tendance se dessine, sa zone apparaît et un point marque la dernière valeur.',
    'Compact et précis, l\'essentiel d\'un coup d\'œil.',
    '- `data-fx-values` : valeurs\n- `--fx-w` (160px), `--fx-h` (48px), `--fx-line`',
    'Indicateurs de tableau de bord, lignes de tableau.',
    'Une analyse détaillée : il n\'y a pas d\'axes.',
    '<span data-fx="sparkline-draw" data-fx-values="3,5,4,8"></span>',
    '<span data-fx="sparkline-draw"></span>',
    { trigger: 'Rejouer', a11y: 'La tendance est résumée dans `aria-label`.' }),
];
