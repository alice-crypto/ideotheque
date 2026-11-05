/* Métadonnées — Pack 22 — Dernières idées */
const E = (id, cat, intent, feel, params, use, avoid, code, demo, extra) =>
  Object.assign({ id, cat, intent, feel, params, use, avoid, code, demo }, extra || {});

module.exports = [
  E('sticky-slideshow', 'Défilement',
    'Le cadre reste fixe à l\'écran, et les images se succèdent au fil du défilement.',
    'Diaporama piloté par le geste, film qu\'on déroule.',
    'Donnez à l\'élément une grande hauteur (par exemple 300vh).\n- `--fx-frame` (100vh), `--fx-top` (0)',
    'Présentation de produit, récit en images.',
    'Des pages déjà très longues.',
    '<section data-fx="sticky-slideshow" style="height:300vh"><div><img…><img…></div></section>',
    '<div data-fx="sticky-slideshow" data-fx-demo="1" style="width:220px;height:150px;--fx-frame:150px"><div><img src="assets/dune.svg" alt=""><img src="assets/city.svg" alt=""><img src="assets/bloom.svg" alt=""></div></div>'),
  E('scroll-clock', 'Défilement',
    'Les aiguilles d\'une horloge tournent au rythme du défilement.',
    'Le temps est entre vos mains.',
    '- `data-fx-hours` (12) : heures parcourues\n- `--fx-size` (130px)',
    'Histoires, frises, sites sur le temps.',
    'Une heure réelle à lire.',
    '<div data-fx="scroll-clock"></div>',
    '<div data-fx="scroll-clock" style="color:var(--ink)"></div>'),
];
