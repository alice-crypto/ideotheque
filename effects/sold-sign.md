# `sold-sign`

**Catégorie :** Micro-interaction

## Intention
Une pancarte se balance à chaque changement d'état, jusqu'à « vendu » en rouge.

## Ce qu'on ressent
Un petit plaisir de conclusion.

## Utilisation
```html
<div data-fx="sold-sign" data-fx-step="2"></div>
```

## Paramètres
- `data-fx-items` : états séparés par `|`
- `data-fx-step` (0), `--fx-sold`

## Quand l'utiliser
Annonces, biens conclus, stocks épuisés.

## Quand l'éviter
De laisser un clic public changer l'état : en production, reliez `data-fx-step` à vos données.

## Accessibilité
L'état est écrit dans une région annoncée.
