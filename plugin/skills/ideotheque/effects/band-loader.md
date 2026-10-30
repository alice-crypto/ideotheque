# `band-loader`

**Catégorie :** Présentation

## Intention
Un écran de chargement en bandes de couleur, avec des messages qui changent ; à la fin, les bandes s'envolent une à une.

## Ce qu'on ressent
Coloré, chaleureux, une marque qui a du caractère.

## Utilisation
```html
<div data-fx="band-loader" data-fx-messages="On met la table…|C'est prêt !"></div>
```

## Paramètres
- `data-fx-messages` : messages séparés par « | »
- `data-fx-duration` (2600) : durée en ms
- `--fx-c1` à `--fx-c5` : couleurs des bandes
- `data-fx-local` : dans son conteneur ; événement `fx:done` à la fin

## Quand l'utiliser
Sites de restaurants, de festivals, de marques joyeuses, à l'arrivée sur le site.

## Quand l'éviter
Les sites utilitaires où l'on veut le contenu tout de suite.

## Accessibilité
L'élément a `role="status"`. Avec `prefers-reduced-motion: reduce`, il disparaît immédiatement.
