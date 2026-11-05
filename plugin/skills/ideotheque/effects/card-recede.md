# `card-recede`

**Catégorie :** Défilement

## Intention
En sortant par le haut, une section recule, s'arrondit et s'assombrit, comme une carte glissée sous la suivante.

## Ce qu'on ressent
Pile de feuilles, chaque section passe au second plan.

## Utilisation
```html
<section data-fx="card-recede">…</section>
```

## Paramètres
- `--fx-depth` (.1) : recul
- `--fx-round` (28px) : arrondi final

## Quand l'utiliser
Grandes sections plein écran qui s'enchaînent.

## Quand l'éviter
Les sections sans fond : on ne voit plus la carte.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'effet est désactivé et le contenu s'affiche directement.
