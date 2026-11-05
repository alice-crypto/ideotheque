# `rich-tooltip-follow`

**Catégorie :** Micro-interaction

## Intention
Une info-bulle suit le curseur en restant toujours à l'intérieur de l'écran.

## Ce qu'on ressent
Précision d'outil professionnel.

## Utilisation
```html
<abbr data-fx="rich-tooltip-follow" data-fx-tip="Taux mensuel">TM</abbr>
```

## Paramètres
- `data-fx-tip` : texte
- `data-fx-delay` (120) : délai en millisecondes

## Quand l'utiliser
Graphiques, tableaux, icônes, abréviations.

## Quand l'éviter
Une information indispensable sur écran tactile.

## Accessibilité
`aria-describedby`, s'ouvre au focus, se ferme avec Échap.
