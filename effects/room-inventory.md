# `room-inventory`

**Catégorie :** Micro-interaction

## Intention
On estime ses biens pièce par pièce, et la barre se compare au capital assuré.

## Ce qu'on ressent
Prise de conscience sans jargon.

## Utilisation
```html
<div data-fx="room-inventory" data-fx-cap="10000" data-fx-items="Salon:4000|Cuisine:3000"></div>
```

## Paramètres
- `data-fx-items` : « pièce:valeur » séparés par `|`
- `data-fx-cap` (10000) : capital assuré

## Quand l'utiliser
Assurance habitation, valeur d'un parc, budgets par poste.

## Quand l'éviter
D'afficher un conseil d'assurance sans préciser que l'estimation reste indicative.

## Accessibilité
Curseurs nommés par leur pièce, écart écrit et annoncé.
