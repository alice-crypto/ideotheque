/* Métadonnées — Pack 34 — Agriculture */
const E = (id, cat, intent, feel, params, use, avoid, code, demo, extra) =>
  Object.assign({ id, cat, intent, feel, params, use, avoid, code, demo }, extra || {});

module.exports = [
  E('crop-calendar', 'Présentation',
    'Un calendrier montre semis et récoltes par culture, et dit ce qu\'on fait ce mois-ci.',
    'Le geste juste, au bon moment de l\'année.',
    '- `data-fx-items` : « culture:mois semis:mois récolte » séparés par `|`',
    'Jardinage, coopératives, fruits et légumes de saison.',
    'Des dates universelles : elles varient selon la région.',
    '<div data-fx="crop-calendar" data-fx-items="Tomate:3-5:7-9"></div>',
    '<div data-fx="crop-calendar" style="color:var(--ink)"></div>',
    { trigger: 'Rejouer', a11y: 'La phrase du mois est écrite, et la grille est décorative.' }),
  E('field-rotation', 'Micro-interaction',
    'Un curseur d\'années fait tourner les cultures de parcelle en parcelle.',
    'La ferme, vue du ciel, au fil du temps.',
    '- `data-fx-items` : « culture:couleur » séparés par `|`',
    'Agriculture, coopératives, pédagogie.',
    'D\'y voir un conseil agronomique : la rotation réelle dépend de la terre.',
    '<div data-fx="field-rotation" data-fx-items="Blé:#d6b34a|Trèfle:#5aa35c"></div>',
    '<div data-fx="field-rotation" style="color:var(--ink)"></div>',
    { a11y: 'Curseur étiqueté, rotation écrite et annoncée.' }),
];
