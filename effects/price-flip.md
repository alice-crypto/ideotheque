# `price-flip`

**Catégorie :** Micro-interaction

## Intention
Un prix passe d'une valeur à l'autre par un croisement vertical, sans saut de mise en page.

## Ce qu'on ressent
Net et rassurant, on voit ce qui a changé.

## Utilisation
```html
<span data-fx="price-flip" data-fx-values="19 €|190 €" data-fx-toggle="#annuel"></span>
```

## Paramètres
- `data-fx-values` : valeurs séparées par `|`
- `data-fx-toggle` : sélecteur du bouton qui déclenche le changement
- Par code : `FX.trigger(el)`

## Quand l'utiliser
Bascule mensuel / annuel, devises.

## Quand l'éviter
Un prix qui change sans action de la personne.

## Accessibilité
Le changement est annoncé par `aria-live`.
