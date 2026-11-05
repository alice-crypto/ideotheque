/* Métadonnées — Pack 12 — Typographie cinétique */
const E = (id, cat, intent, feel, params, use, avoid, code, demo, extra) =>
  Object.assign({ id, cat, intent, feel, params, use, avoid, code, demo }, extra || {});

module.exports = [
  E('weight-wave', 'Texte',
    'Une vague de graisse parcourt le titre, de la lettre la plus fine à la plus épaisse.',
    'Vivant, typographique, comme une respiration dans le mot.',
    '- `data-fx-speed` (1) : vitesse de la vague',
    'Titres courts d\'une page d\'accueil, noms de marque.',
    'Les paragraphes : le texte bouge trop pour être lu.',
    '<h1 data-fx="weight-wave">Respire</h1>',
    '<p class="demo-title" data-fx="weight-wave">Respire</p>',
    { a11y: 'Le texte complet est dans `aria-label`. Avec `prefers-reduced-motion: reduce`, la graisse reste fixe.' }),
  E('letter-rain', 'Texte',
    'Les lettres tombent du haut de l\'écran et rebondissent sur la ligne de base.',
    'Physique, joueur, un petit choc à l\'arrivée.',
    '- `data-fx-gravity` (2600) : gravité, en pixels par seconde au carré',
    'Un seul grand titre, une page d\'accueil ludique.',
    'Les pages sérieuses et les textes longs.',
    '<h1 data-fx="letter-rain">Gravité</h1>',
    '<p class="demo-title" data-fx="letter-rain">Gravité</p>',
    { trigger: 'Rejouer' }),
];
