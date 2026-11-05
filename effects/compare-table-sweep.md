# `compare-table-sweep`

**Catégorie :** Présentation

## Intention
Dans un tableau comparatif, toute la colonne survolée s'éclaire, jusqu'à son titre.

## Ce qu'on ressent
Lecture guidée, on compare sans se perdre.

## Utilisation
```html
<table data-fx="compare-table-sweep" data-fx-best="2">…</table>
```

## Paramètres
- `data-fx-best` : index de la colonne mise en avant au repos
- `--fx-col` : couleur de la colonne

## Quand l'utiliser
Tableaux de tarifs, comparaisons de produits.

## Quand l'éviter
Les tableaux très larges sur mobile : prévoyez aussi un défilement.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'effet est désactivé et le contenu s'affiche directement.
