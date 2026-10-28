# Contribuer à Idéothèque

Merci de vouloir enrichir la bibliothèque. Chaque effet est une **idée nommée** : la contribution compte autant pour sa fiche que pour son code.

## Organisation

```
src/
  core.js, core.css      le moteur (observation du défilement, boucle d'animation, transitions, API FX)
  core.end.css           règles « mouvement réduit », placées en fin de fichier
  packs/
    01-entrees.css       le CSS des effets du pack
    01-entrees.js        leur enregistrement : FX.register('nom', { … })
    01-entrees.meta.js   leurs fiches : intention, ressenti, paramètres, démo…
scripts/build.js         assemble dist/, génère effects/*.md, le catalogue, AI.md et le README
```

Ne modifiez jamais `dist/`, `effects/` ni les tableaux entre balises `<!-- … -->` à la main : tout est régénéré par `npm run build`.

## Proposer un effet

1. **Vérifiez qu'il n'existe pas déjà.** Cherchez dans le catalogue (`npm start`) et dans `AI.md`.
2. **Choisissez un nom** en anglais, court, en kebab-case, qui évoque le ressenti plutôt que la technique : `curtain-soft` plutôt que `clip-path-reveal`.
3. **Ajoutez-le au pack qui correspond** (ou créez un pack `11-….css/.js/.meta.js`) :
   - **CSS** : sélecteur `[data-fx="nom"]`, réglages par variables `--fx-*` ;
   - **JS** : `FX.register('nom', définition)` ; un effet purement CSS s'enregistre avec `{}` ;
   - **fiche** : un objet dans le `.meta.js` avec `intent`, `feel`, `params`, `use`, `avoid`, `code`, `demo` (et `a11y`, `trigger` si besoin).
4. **Lancez `npm run build`.** Le script refuse les noms en double, les champs manquants, les effets non enregistrés et les démos qui n'utilisent pas l'effet.

## La définition d'un effet

```js
FX.register('mon-effet', {
  entrance: true,          // déclenché une fois à l'entrée dans l'écran (ajoute .fx-in)
  setup: function (el) {}, // préparation (découpage du texte, création d'éléments…)
  enter: function (el) {}, // à l'entrée dans l'écran
  reset: function (el) {}, // remise à zéro avant FX.replay()
  scroll: true,            // reçoit --fx-p et --fx-pass ; ou function (el, info) {}
  tick: function (el, dt) {},    // chaque image tant que l'élément est visible
  trigger: function (el, e) {},  // FX.trigger(el) ; triggerOn: 'click' pour le brancher au clic
  transition: { pieces: 5, cover: 900, uncover: 1000, build: function (calque) {} }
});
```

Outils partagés : `FX.util` (`splitChars`, `splitWords`, `splitLines`, `tween`, `addTicker`, `bindScroll`, `num`, `cssVar`, `reduced`…).

## Règles de qualité

- **Accessibilité** : respect de `prefers-reduced-motion` (le contenu reste visible et utilisable), focus clavier pour les effets de survol, `aria-*` pour les composants.
- **Aucune dépendance**, aucune ressource externe.
- **Performances** : les animations continues passent par `tick`, qui ne tourne que lorsque l'élément est visible.
- **Noms des propriétés `@property`** : uniques et explicites (`--fx-blinds`, pas `--fx-b`), car une propriété enregistrée refuse toute valeur d'un autre type.

## Règle d'originalité

On peut s'inspirer d'un effet vu sur un site, mais on le **réécrit entièrement**. On ne copie jamais le code, les images, les polices ni les textes d'un autre site. Les visuels de démonstration sont créés pour la bibliothèque (SVG dans `assets/`).

## Tester

```bash
npm run build
npm start
```

Puis ouvrez http://localhost:5180. Ajoutez `?all` à l'adresse pour charger toutes les démos d'un coup. Vérifiez votre effet sur ordinateur, sur mobile et avec le mouvement réduit activé dans le système.
