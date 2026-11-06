# `charger-status`

**Catégorie :** État

## Intention
Des bornes changent d'état en direct, et le nombre de bornes libres s'écrit.

## Ce qu'on ressent
On sait s'il faut faire le détour.

## Utilisation
```html
<div data-fx="charger-status" data-fx-live="false" data-fx-data="f,o,x"></div>
```

## Paramètres
- `data-fx-data` : états `f`, `o`, `x` séparés par des virgules
- `data-fx-live` : simuler des changements, `data-fx-every`

## Quand l'utiliser
Bornes, parkings, salles, machines.

## Quand l'éviter
De laisser la simulation en production : `data-fx-live="false"` et de vraies données.

## Accessibilité
Chaque borne porte son état écrit, et le résumé est annoncé.
