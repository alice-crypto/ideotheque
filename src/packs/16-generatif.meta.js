/* Métadonnées — Pack 16 — Fonds génératifs */
const E = (id, cat, intent, feel, params, use, avoid, code, demo, extra) =>
  Object.assign({ id, cat, intent, feel, params, use, avoid, code, demo }, extra || {});

module.exports = [
  E('flow-field', 'Ambiance',
    'Des milliers de petits traits suivent un courant invisible et dessinent des veines qui s\'effacent lentement.',
    'Vent sur le sable, topographie vivante.',
    '- `data-fx-count` (140) : nombre de particules\n- `data-fx-scale` (.006) : taille des tourbillons\n- `--fx-line` : couleur',
    'Fonds d\'accueil, sections sans image.',
    'Sous un texte fin, et sur les appareils modestes avec un grand nombre de particules.',
    '<section data-fx="flow-field">…</section>',
    '<div data-fx="flow-field" style="width:230px;height:170px"></div>',
    { a11y: 'Le canvas est décoratif. Avec `prefers-reduced-motion: reduce`, il affiche une image fixe.' }),
  E('metaballs', 'Ambiance',
    'Des bulles se rencontrent, s\'étirent et fusionnent en une masse liquide.',
    'Lampe à lave, calme hypnotique.',
    '- `data-fx-count` (7) : nombre de bulles\n- `--fx-blob` : couleur',
    'Fonds de section, écrans d\'attente, marques ludiques.',
    'Plusieurs fonds de ce type par page.',
    '<section data-fx="metaballs">…</section>',
    '<div data-fx="metaballs" style="width:230px;height:170px"></div>'),
  E('voronoi-cells', 'Ambiance',
    'Un réseau de cellules se déforme lentement, comme un tissu vivant vu au microscope.',
    'Biologie, cellules, nature calculée.',
    '- `data-fx-count` (14) : nombre de cellules\n- `--fx-cell` (hexadécimal) : couleur des contours',
    'Sites de science, de santé, d\'environnement.',
    'Les pages déjà denses : le motif attire l\'œil.',
    '<section data-fx="voronoi-cells" style="--fx-cell:#0047ff">…</section>',
    '<div data-fx="voronoi-cells" style="width:230px;height:170px"></div>'),
];
