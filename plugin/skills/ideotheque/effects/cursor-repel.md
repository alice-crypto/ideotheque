# `cursor-repel`

**Catégorie :** Texte

## Intention
Les lettres s'écartent du curseur comme des aimants de même pôle, puis reviennent en place.

## Ce qu'on ressent
Tactile, surprenant, on a envie de jouer avec le titre.

## Utilisation
```html
<h1 data-fx="cursor-repel">Approchez</h1>
```

## Paramètres
- `data-fx-radius` (110) : rayon d'action en pixels
- `data-fx-force` (34) : déplacement maximal en pixels

## Quand l'utiliser
Grands titres de portfolios, écrans d'accueil.

## Quand l'éviter
Les écrans tactiles comme seul support : sans curseur, l'effet ne se voit pas.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'effet est désactivé et le contenu s'affiche directement.
