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
  E('candlestick-draw', 'Présentation',
    'Un graphique en chandeliers se dessine bougie après bougie.',
    'Analyse de marché, sérieux et dense.',
    '- `data-fx-data` : « ouverture,haut,bas,clôture » séparés par `|`\n- `--fx-h` (150px), `--fx-up`, `--fx-down`',
    'Plateformes de bourse, rapports financiers.',
    'Un public non averti : une simple courbe se lit mieux.',
    '<div data-fx="candlestick-draw" data-fx-data="20,26,18,24|24,28,22,23"></div>',
    '<div data-fx="candlestick-draw" style="width:215px"></div>',
    { trigger: 'Rejouer', a11y: 'Le graphique est résumé dans `aria-label`.' }),
  E('balance-mask', 'Micro-interaction',
    'Un bouton masque le solde derrière des points, et le choix peut être retenu.',
    'Discret, on consulte ses comptes dans le métro.',
    '- `data-fx-key` : clé d\'enregistrement du choix',
    'Soldes, salaires, portefeuilles.',
    'De croire que c\'est une sécurité : la valeur reste dans la page.',
    '<span data-fx="balance-mask">2 480,50 €</span>',
    '<span class="demo-number" data-fx="balance-mask" style="color:var(--ink);font-size:38px">2 480,50 €</span>',
    { a11y: 'Le bouton est nommé et expose `aria-pressed`.' }),
];
