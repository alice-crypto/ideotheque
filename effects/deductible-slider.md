# `deductible-slider`

**Catégorie :** Micro-interaction

## Intention
Un curseur règle la franchise, et la cotisation mensuelle baisse quand la franchise monte.

## Ce qu'on ressent
On comprend l'arbitrage en le manipulant.

## Utilisation
```html
<div data-fx="deductible-slider" data-fx-top="48" data-fx-low="26"></div>
```

## Paramètres
- `data-fx-min` (0), `data-fx-max` (1000), `data-fx-value` (300)
- `data-fx-top` (48), `data-fx-low` (26) : cotisations aux extrêmes

## Quand l'utiliser
Assurance auto, habitation, santé.

## Quand l'éviter
De présenter ces chiffres comme un vrai tarif sans calcul de l'assureur.

## Accessibilité
`aria-valuetext` donne les deux montants à la fois.
