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
];
