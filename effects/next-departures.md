# `next-departures`

**Catégorie :** État

## Intention
Un écran liste les prochains passages, et leurs minutes descendent en temps réel.

## Ce qu'on ressent
Le geste de lever les yeux à l'arrêt.

## Utilisation
```html
<div data-fx="next-departures" data-fx-items="12:Gare:2"></div>
```

## Paramètres
- `data-fx-items` : « ligne:direction:minutes » séparés par `|`
- `--fx-led`

## Quand l'utiliser
Transports, navettes, files d'attente.

## Quand l'éviter
Des horaires inventés sur un vrai réseau : branchez les vraies données.

## Accessibilité
Vraie liste, les temps sont écrits. Pas de lecture automatique des changements.
