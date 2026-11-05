# `masonry-flow`

**Catégorie :** Navigation

## Intention
Un mur de cartes irrégulier : chacune va dans la colonne la plus courte, et tout glisse quand la largeur change.

## Ce qu'on ressent
Pinterest bien rangé, un mur qui s'ajuste seul.

## Utilisation
```html
<div data-fx="masonry-flow"><img…><img…><img…></div>
```

## Paramètres
- `data-fx-gap` (8), `data-fx-min` (80) : écart et largeur minimale d'une colonne

## Quand l'utiliser
Galeries, inspirations, articles.

## Quand l'éviter
L'ordre de lecture important : le placement visuel ne suit pas exactement le DOM.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, les éléments changent de place sans animation.
