# `tag-filter-flip`

**Catégorie :** Navigation

## Intention
Une grille se filtre par étiquette, et les éléments restants glissent vers leur nouvelle place.

## Ce qu'on ressent
Fluide, on comprend ce qui a bougé.

## Utilisation
```html
<div data-fx="tag-filter-flip"><div data-tags></div><div data-grid><a data-tag="web">…</a></div></div>
```

## Paramètres
- `data-tag` sur chaque élément : étiquettes séparées par des espaces
- Conteneurs `[data-tags]` et `[data-grid]`

## Quand l'utiliser
Portfolios, catalogues, documentation.

## Quand l'éviter
Une très grande grille : l'animation porte sur chaque élément.

## Accessibilité
Les filtres sont des boutons avec `aria-pressed`.
