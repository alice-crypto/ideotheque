# `pearl-orb`

**Catégorie :** Ambiance

## Intention
Une perle irisée calculée en temps réel : ses reflets suivent le curseur et, au clic, elle se dissout en poussière de lumière, puis se reforme.

## Ce qu'on ressent
Une matière vivante, précieuse, qu'on a envie de toucher.

## Utilisation
```html
<button data-fx="pearl-orb" aria-label="Libérer la lumière" style="width:320px"></button>
```

## Paramètres
- `data-fx-tint` (#6f6bd8) : teinte des ombres
- `data-fx-points` (9000) : grains de la dissolution
- `FX.trigger(el)` : dissoudre ou reformer

## Quand l'utiliser
Le visuel central d'une page de marque, un bouton signature.

## Quand l'éviter
Plusieurs perles sur la même page : chacune ouvre un contexte WebGL.

## Accessibilité
À poser sur un `<button>` avec un `aria-label` : `aria-pressed` suit l'état. Mouvement réduit : image fixe. Sans WebGL : une perle en dégradés.
