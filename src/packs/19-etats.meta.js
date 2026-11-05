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
  E('citation-pop', 'État',
    'Des pastilles numérotées marquent les sources d\'une réponse, et s\'ouvrent en aperçu au survol.',
    'Sérieux, vérifiable, on peut remonter à l\'origine.',
    '- `data-source` sur un `<a>` ou un `<span>` : titre de la source',
    'Réponses d\'assistants, rapports, articles.',
    'De fausses sources : chaque pastille doit pointer vers une vraie référence.',
    '<p data-fx="citation-pop">Selon l\'étude <a data-source="Rapport 2026" href="…"></a>…</p>',
    '<p data-fx="citation-pop" style="width:220px;color:var(--ink);font-size:15px">Le taux a doublé <span data-source="Rapport annuel 2026"></span> en trois ans <span data-source="Note de synthèse"></span>.</p>',
    { a11y: 'Chaque pastille a un nom complet pour les lecteurs d\'écran.' }),
];
