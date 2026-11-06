# `open-hours-call`

**Catégorie :** Micro-interaction

## Intention
Un bouton d'appel indique en direct si la ligne répond, selon l'heure locale.

## Ce qu'on ressent
Humain, on n'appelle pas dans le vide.

## Utilisation
```html
<div data-fx="open-hours-call" data-fx-tel="0100000000" data-fx-from="8" data-fx-to="20"></div>
```

## Paramètres
- `data-fx-tel`, `data-fx-label`
- `data-fx-from` (8), `data-fx-to` (20) : horaires
- `data-fx-always` : ouvert jour et nuit

## Quand l'utiliser
Assistance, service client, cabinets, dépannage.

## Quand l'éviter
Une ligne dont les horaires varient : l'indication serait fausse.

## Accessibilité
Vrai lien `tel:`, et l'état est écrit en toutes lettres.
