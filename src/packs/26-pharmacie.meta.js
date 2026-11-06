/* Métadonnées — Pack 26 — Pharmacie */
const E = (id, cat, intent, feel, params, use, avoid, code, demo, extra) =>
  Object.assign({ id, cat, intent, feel, params, use, avoid, code, demo }, extra || {});

module.exports = [
  E('dose-grid', 'Micro-interaction',
    'Une grille matin, midi et soir se coche, et le compte des prises s\'écrit.',
    'Simple comme un papier sur le frigo.',
    '- `data-fx-moments`, `data-fx-days` : listes séparées par des virgules',
    'Traitements, routines, plannings de soin.',
    'De remplacer une ordonnance : rien n\'est calculé ni conseillé ici.',
    '<div data-fx="dose-grid" data-fx-days="Lun,Mar"></div>',
    '<div data-fx="dose-grid" style="color:var(--ink)"></div>',
    { a11y: 'Vraies cases nommées par moment et par jour.' }),
];
