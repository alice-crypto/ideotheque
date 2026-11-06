# `outage-check`

**Catégorie :** Micro-interaction

## Intention
Un code postal saisi indique s'il y a une coupure, et l'heure de retour prévue.

## Ce qu'on ressent
On sait que ce n'est pas chez soi, et que c'est pris en charge.

## Utilisation
```html
<div data-fx="outage-check" data-fx-data='{"69003":"vers 18 h 30"}'></div>
```

## Paramètres
- `data-fx-data` : JSON code postal vers heure de retour

## Quand l'utiliser
Distributeurs d'énergie, eau, télécoms.

## Quand l'éviter
De laisser ces données dans la page : interrogez un service à jour.

## Accessibilité
Vrai formulaire, résultat annoncé.
