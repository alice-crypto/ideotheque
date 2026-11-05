# `sparkline-draw`

**Catégorie :** Présentation

## Intention
Une petite courbe de tendance se dessine, sa zone apparaît et un point marque la dernière valeur.

## Ce qu'on ressent
Compact et précis, l'essentiel d'un coup d'œil.

## Utilisation
```html
<span data-fx="sparkline-draw" data-fx-values="3,5,4,8"></span>
```

## Paramètres
- `data-fx-values` : valeurs
- `--fx-w` (160px), `--fx-h` (48px), `--fx-line`

## Quand l'utiliser
Indicateurs de tableau de bord, lignes de tableau.

## Quand l'éviter
Une analyse détaillée : il n'y a pas d'axes.

## Accessibilité
La tendance est résumée dans `aria-label`.
