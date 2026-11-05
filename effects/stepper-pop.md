# `stepper-pop`

**Catégorie :** Micro-interaction

## Intention
Un compteur plus / moins dont le chiffre glisse dans le sens du changement et qui tremble aux limites.

## Ce qu'on ressent
Précis, sensible, on comprend sans lire.

## Utilisation
```html
<div data-fx="stepper-pop" data-fx-value="2"></div>
```

## Paramètres
- `data-fx-value` (1), `data-fx-min` (0), `data-fx-max` (99)
- L'élément émet `fx:change`.

## Quand l'utiliser
Quantités dans un panier, nombre de personnes.

## Quand l'éviter
Les grandes plages de valeurs : préférez une saisie directe.

## Accessibilité
Boutons nommés et valeur annoncée par `aria-live`.
