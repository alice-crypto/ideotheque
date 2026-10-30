# `shimmer`

**Catégorie :** État

## Intention
Indiquer un chargement par un reflet qui balaie la forme du futur contenu.

## Ce qu'on ressent
Calme, moderne, la page paraît déjà là.

## Utilisation
```html
<div data-fx="shimmer" style="height:12px"></div>
```

## Paramètres
- `--fx-shimmer-base` : couleur de fond du bloc

## Quand l'utiliser
Squelettes de cartes, listes et profils en attente de données.

## Quand l'éviter
Les chargements de moins de 300 ms (afficher directement) ou de plus de 10 s (montrer une progression).

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'effet est désactivé et le contenu s'affiche directement.
