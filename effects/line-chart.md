# `line-chart`

**Catégorie :** Présentation

## Intention
La courbe d'un graphique se trace de gauche à droite, puis ses points apparaissent un à un.

## Ce qu'on ressent
Croissance, tendance, histoire racontée par les chiffres.

## Utilisation
```html
<svg data-fx="line-chart" data-fx-values="12,18,15,26,22,34"></svg>
```

## Paramètres
- `data-fx-values` : valeurs séparées par des virgules
- Couleur : `color` de l'élément (accent par défaut)

## Quand l'utiliser
Évolutions, résultats, tableaux de bord de présentation.

## Quand l'éviter
Les graphiques qui nécessitent des axes et des légendes précises.

## Accessibilité
Le graphique a `role="img"` et un `aria-label` listant les valeurs. Avec `prefers-reduced-motion: reduce`, il est tracé directement.
