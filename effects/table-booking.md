# `table-booking`

**Catégorie :** Micro-interaction

## Intention
On choisit le nombre de couverts, seuls les créneaux possibles restent et la réservation se confirme.

## Ce qu'on ressent
La table est à vous en trois gestes.

## Utilisation
```html
<div data-fx="table-booking" data-fx-items="19:00:8|20:00:2"></div>
```

## Paramètres
- `data-fx-items` : « h:m:places » séparés par `|`
- `data-fx-party` (2) ; événement `fx:booking`

## Quand l'utiliser
Restaurants, salles, activités.

## Quand l'éviter
De montrer une disponibilité qui ne vient pas de votre outil de réservation.

## Accessibilité
Boutons nommés, créneaux pleins désactivés, choix annoncé.
