# `jelly-list`

**Catégorie :** Micro-interaction

## Intention
Les icônes d'une rangée grossissent à l'approche du curseur et poussent leurs voisines, comme un dock.

## Ce qu'on ressent
Douceur d'un système d'exploitation, précision et rebond.

## Utilisation
```html
<nav data-fx="jelly-list"><a>…</a><a>…</a></nav>
```

## Paramètres
- `data-fx-radius` (110) : rayon d'action
- `--fx-zoom` (.6) : agrandissement maximal

## Quand l'utiliser
Barres d'outils, rangées d'icônes, réseaux sociaux.

## Quand l'éviter
Une navigation principale sur mobile : l'effet ne s'y voit pas.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'effet est désactivé et le contenu s'affiche directement.
