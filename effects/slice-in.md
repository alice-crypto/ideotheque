# `slice-in`

**Catégorie :** Image

## Intention
L'image arrive en tranches verticales qui glissent en alternance, vers le haut et vers le bas.

## Ce qu'on ressent
Graphique, rythmé, magazine de mode.

## Utilisation
```html
<figure data-fx="slice-in"><img src="…" alt="…"></figure>
```

## Paramètres
- `data-fx-slices` (6) : nombre de tranches
- `--fx-duration`, `--fx-delay`

## Quand l'utiliser
Images de couverture, visuels de campagne.

## Quand l'éviter
Les petites images (moins de 200 px).

## Accessibilité
L'image d'origine reste dans le document (masquée visuellement) : son `alt` est lu. Avec `prefers-reduced-motion: reduce`, les tranches sont en place directement.
