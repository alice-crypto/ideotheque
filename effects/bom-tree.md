# `bom-tree`

**Catégorie :** Navigation

## Intention
Une nomenclature en arbre se déplie, et les coûts remontent des pièces vers le produit.

## Ce qu'on ressent
On voit où part le coût d'un produit.

## Utilisation
```html
<div data-fx="bom-tree"></div>
```

## Paramètres
- `data-fx-tree` : JSON avec `n`, `c` (enfants) et `v` (coût)

## Quand l'utiliser
Industrie, cuisine, budgets hiérarchiques.

## Quand l'éviter
Un arbre très profond : il devient difficile à parcourir au doigt.

## Accessibilité
Boutons `aria-expanded`, navigation au clavier, branches repliées ignorées.
