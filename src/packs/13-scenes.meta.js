/* Métadonnées — Pack 13 — Scènes de défilement */
const E = (id, cat, intent, feel, params, use, avoid, code, demo, extra) =>
  Object.assign({ id, cat, intent, feel, params, use, avoid, code, demo }, extra || {});

module.exports = [
  E('circle-unveil', 'Défilement',
    'Une image apparaît dans un cercle qui s\'agrandit à mesure qu\'on défile.',
    'Un œil qui s\'ouvre, une révélation lente.',
    '- `--fx-min` (6%) : taille du cercle au départ\n- `--fx-at` (50% 50%) : centre du cercle',
    'Grande image de transition entre deux chapitres.',
    'Un contenu à lire dès l\'arrivée à l\'écran.',
    '<img data-fx="circle-unveil" src="photo.jpg" alt="">',
    '<div class="demo-box" data-fx="circle-unveil" style="width:200px;height:150px"></div>',
    { a11y: 'Avec `prefers-reduced-motion: reduce`, l\'élément suit toujours le défilement, sans animation en boucle.' }),
  E('slat-scroll', 'Défilement',
    'Des lames horizontales recouvrent l\'image et s\'ouvrent une à une au défilement.',
    'Un store qu\'on remonte, la lumière entre par tranches.',
    '- `data-fx-slats` (7) : nombre de lames\n- `--fx-slat` : couleur des lames',
    'Images plein cadre, ouvertures de sections.',
    'Les éléments de moins de 120 px de haut.',
    '<figure data-fx="slat-scroll"><img src="photo.jpg" alt=""></figure>',
    '<div class="demo-box" data-fx="slat-scroll" style="width:200px;height:150px"></div>'),
];
