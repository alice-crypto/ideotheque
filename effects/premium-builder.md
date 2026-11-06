# `premium-builder`

**Catégorie :** Micro-interaction

## Intention
Des garanties à cocher font varier la cotisation mensuelle, annoncée à chaque changement.

## Ce qu'on ressent
Clair, on sait ce que chaque option coûte.

## Utilisation
```html
<div data-fx="premium-builder" data-fx-base="18" data-fx-items="Vol:6|Assistance:5"></div>
```

## Paramètres
- `data-fx-base` (18) : prix de base
- `data-fx-items` : « nom:prix » séparés par `|`
- `--fx-w` (230px)

## Quand l'utiliser
Devis d'assurance, abonnements à options.

## Quand l'éviter
Un tarif qui dépend d'un calcul de risque : ce total serait trompeur.

## Accessibilité
Vraies cases à cocher, et le total est dans une région `aria-live`.
