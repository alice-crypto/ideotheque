/* Métadonnées — Pack 33 — Industrie */
const E = (id, cat, intent, feel, params, use, avoid, code, demo, extra) =>
  Object.assign({ id, cat, intent, feel, params, use, avoid, code, demo }, extra || {});

module.exports = [
  E('oee-gauge', 'Présentation',
    'Trois taux donnent le rendement global d\'une ligne, et le plus faible est désigné.',
    'Le chiffre qu\'un chef d\'atelier regarde chaque matin.',
    '- `data-fx-avail` (88), `data-fx-perf` (92), `data-fx-qual` (97)\n- `--fx-bg` : fond de l\'anneau',
    'Usines, maintenance, indicateurs produits.',
    'D\'en faire le seul indicateur : un bon chiffre peut cacher un problème de sécurité.',
    '<div data-fx="oee-gauge" data-fx-avail="88"></div>',
    '<div data-fx="oee-gauge" style="color:var(--ink);--fx-bg:var(--surface,#16151a)"></div>',
    { a11y: 'Curseurs étiquetés, valeurs écrites et conseil annoncé.' }),
  E('assembly-line', 'Ambiance',
    'Une pièce avance de poste en poste, et se complète à chaque arrêt.',
    'Une usine au travail, ordonnée et continue.',
    '- `data-fx-items` : quatre postes séparés par `|`\n- `data-fx-pace` (1100)',
    'Industrie, explications d\'un processus en étapes.',
    'Plus de quatre postes dans un petit format : la pièce prévoit quatre blocs.',
    '<div data-fx="assembly-line" data-fx-items="Châssis|Moteur|Capot|Contrôle"></div>',
    '<div data-fx="assembly-line" style="color:var(--ink)"></div>',
    { trigger: 'Avancer', a11y: 'Le compte est écrit. En mouvement réduit, l\'avancée se fait au déclenchement.' }),
];
