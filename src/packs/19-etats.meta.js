/* Métadonnées — Pack 19 — États et interfaces d'IA */
const E = (id, cat, intent, feel, params, use, avoid, code, demo, extra) =>
  Object.assign({ id, cat, intent, feel, params, use, avoid, code, demo }, extra || {});

module.exports = [
  E('agent-graph', 'État',
    'Un agent d\'IA parcourt ses étapes : chaque nœud s\'active, pulse, puis se valide.',
    'Transparence : on voit le travail se faire.',
    '- `data-fx-steps` : étapes séparées par `|`\n- `data-fx-step` (800) : durée d\'une étape en millisecondes\n- L\'élément émet `fx:done`.',
    'Assistants, automatisations, chaînes d\'outils.',
    'Une fausse progression : branchez l\'effet sur les vraies étapes si elles existent.',
    '<div data-fx="agent-graph" data-fx-steps="Lire|Résumer|Envoyer"></div>',
    '<div data-fx="agent-graph" style="width:230px;color:var(--ink)"></div>',
    { trigger: 'Rejouer', a11y: 'Liste sémantique. Avec `prefers-reduced-motion: reduce`, toutes les étapes s\'affichent validées.' }),
  E('voice-wave', 'État',
    'Une onde de barres réagit à la voix, plus haute au centre, quand l\'assistant écoute.',
    'Présence attentive, conversation.',
    '- `data-fx-bars` (13) : nombre de barres\n- `el.fxLevel` (0 à 1) : niveau réel du micro, sinon simulé\n- `--fx-bar`, `--fx-h`, `--fx-w`',
    'Assistants vocaux, enregistrement, dictée.',
    'Faire croire qu\'on enregistre quand ce n\'est pas le cas.',
    '<div data-fx="voice-wave" aria-label="Écoute en cours"></div>',
    '<div data-fx="voice-wave"></div>',
    { a11y: 'Rôle `img` avec un libellé. Avec `prefers-reduced-motion: reduce`, l\'onde reste basse.' }),
];
