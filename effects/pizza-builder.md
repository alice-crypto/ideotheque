# `pizza-builder`

**Catégorie :** Micro-interaction

## Intention
Les garnitures se placent sur la moitié choisie, et le prix se met à jour.

## Ce qu'on ressent
La dispute familiale enfin réglée.

## Utilisation
```html
<div data-fx="pizza-builder" data-fx-base="9"></div>
```

## Paramètres
- `data-fx-items` : « garniture:couleur » séparés par `|`
- `data-fx-base` (9)

## Quand l'utiliser
Pizzerias, restauration rapide, personnalisation.

## Quand l'éviter
De reprendre ce calcul si votre carte facture autrement.

## Accessibilité
Vrais boutons, prix annoncé. Le détail de la pizza dépend de l'état des boutons.
