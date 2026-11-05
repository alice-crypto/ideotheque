# `cascade-rows`

**Catégorie :** Entrée

## Intention
Les éléments d'une grille arrivent rangée par rangée, selon leur position réelle à l'écran.

## Ce qu'on ressent
Ordonné, un tableau qui se pose.

## Utilisation
```html
<div data-fx="cascade-rows">…</div>
```

## Paramètres
- `--fx-distance` (24px) : distance de montée

## Quand l'utiliser
Grilles de cartes, listes de produits.

## Quand l'éviter
Un enfant unique : préférez `fade-up`.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'effet est désactivé et le contenu s'affiche directement.
