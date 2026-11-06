/* Métadonnées — Pack 27 — Immobilier */
const E = (id, cat, intent, feel, params, use, avoid, code, demo, extra) =>
  Object.assign({ id, cat, intent, feel, params, use, avoid, code, demo }, extra || {});

module.exports = [
  E('budget-reach', 'Micro-interaction',
    'Trois curseurs donnent un budget d\'achat possible, recalculé à chaque geste.',
    'On rêve avec des chiffres qui tiennent la route.',
    '- `data-fx-rate` (3.4) : taux annuel en %\n- `data-fx-part` (35) : part du revenu en %',
    'Portails immobiliers, courtiers, banques.',
    'De présenter ce résultat comme un accord de prêt.',
    '<div data-fx="budget-reach" data-fx-rate="3.4"></div>',
    '<div data-fx="budget-reach" style="color:var(--ink)"></div>',
    { a11y: 'Curseurs étiquetés, résultat annoncé.' }),
];
