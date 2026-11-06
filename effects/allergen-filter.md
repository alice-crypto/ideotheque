# `allergen-filter`

**Catégorie :** Micro-interaction

## Intention
On coche ses allergies, et les produits concernés sortent de la liste.

## Ce qu'on ressent
Rassurant, le rayon se réduit à ce qu'on peut acheter.

## Utilisation
```html
<div data-fx="allergen-filter" data-fx-allergens="Noix" data-fx-items="Baume:Noix|Lait:"></div>
```

## Paramètres
- `data-fx-allergens` : liste séparée par des virgules
- `data-fx-items` : « produit:allergène,… » séparés par `|`

## Quand l'utiliser
Parapharmacie, alimentation, restaurants.

## Quand l'éviter
D'affirmer qu'un produit est sans risque : la liste dépend de vos données.

## Accessibilité
Vraies cases étiquetées, compte annoncé, et lignes masquées retirées pour les lecteurs d'écran.
