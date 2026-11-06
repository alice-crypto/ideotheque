# `rate-best-row`

**Catégorie :** Présentation

## Intention
Dans un tableau de taux, la meilleure valeur de chaque colonne se remplit de couleur.

## Ce qu'on ressent
Honnête et lisible, la comparaison se fait toute seule.

## Utilisation
```html
<table data-fx="rate-best-row" data-fx-best="min,max">…</table>
```

## Paramètres
- `data-fx-best` (min) : `min` ou `max`, par colonne, séparés par des virgules

## Quand l'utiliser
Taux, frais, abonnements.

## Quand l'éviter
Une colonne où la « meilleure » valeur dépend de la situation.

## Accessibilité
La cellule retenue est annoncée comme la meilleure valeur.
