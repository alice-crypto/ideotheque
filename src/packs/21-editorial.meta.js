/* Métadonnées — Pack 21 — Détails éditoriaux */
const E = (id, cat, intent, feel, params, use, avoid, code, demo, extra) =>
  Object.assign({ id, cat, intent, feel, params, use, avoid, code, demo }, extra || {});

module.exports = [
  E('drop-cap-draw', 'Texte',
    'Une grande lettrine entre en réduisant, puis le paragraphe apparaît autour d\'elle.',
    'Magazine imprimé, premier paragraphe d\'un long récit.',
    '- `--fx-cap` (3.4em), `--fx-cap-c`',
    'Début d\'article, histoire d\'une marque.',
    'Les courts textes d\'interface.',
    '<p data-fx="drop-cap-draw">Il était une fois…</p>',
    '<p data-fx="drop-cap-draw" style="width:210px;margin:0;color:var(--ink);font-size:14px">Il était une fois un atelier au bord de la mer, où l\'on faisait encore les choses avec soin.</p>',
    { trigger: 'Rejouer', a11y: 'Le texte complet est dans `aria-label`.' }),
  E('margin-note', 'Texte',
    'Survoler un mot annoté ouvre sa note, numérotée comme dans un livre.',
    'Érudit, on approfondit sans quitter sa ligne.',
    '- `data-note` sur le mot : texte de la note',
    'Articles de fond, documentation, histoires.',
    'Des informations indispensables.',
    '<p data-fx="margin-note">Un <span data-note="Inventé en 1450.">procédé</span> ancien.</p>',
    '<p data-fx="margin-note" style="width:210px;margin:0;color:var(--ink);font-size:16px">Un <span data-note="Inventé vers 1450." data-fx-show>procédé</span> très ancien.</p>',
    { a11y: 'Les notes s\'ouvrent aussi au clavier, le mot annoté pouvant recevoir le focus.' }),
];
