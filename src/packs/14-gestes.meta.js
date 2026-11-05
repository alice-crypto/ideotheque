/* Métadonnées — Pack 14 — Gestes et curseur */
const E = (id, cat, intent, feel, params, use, avoid, code, demo, extra) =>
  Object.assign({ id, cat, intent, feel, params, use, avoid, code, demo }, extra || {});

module.exports = [
  E('spring-follow', 'Micro-interaction',
    'Un point coloré suit le curseur dans l\'élément, avec le retard souple d\'un ressort.',
    'Un petit compagnon, du poids et du rebond.',
    '- `data-fx-stiff` (90) : raideur du ressort\n- `data-fx-damp` (11) : amorti\n- `--fx-size` (28px) : taille du point',
    'Cartes de projet, zones d\'image, sections d\'accueil.',
    'Les interfaces de travail où chaque clic doit être précis.',
    '<div data-fx="spring-follow">…</div>',
    '<div class="demo-card" data-fx="spring-follow" style="height:130px;overflow:hidden"><b>Survolez</b>Le point vous suit.</div>'),
];
