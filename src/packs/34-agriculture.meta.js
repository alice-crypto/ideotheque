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
];
