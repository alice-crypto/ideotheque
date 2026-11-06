# `customs-fee`

**Catégorie :** Micro-interaction

## Intention
Selon la valeur du colis, droits et TVA s'additionnent jusqu'au total à payer.

## Ce qu'on ressent
Pas de mauvaise surprise à la livraison.

## Utilisation
```html
<div data-fx="customs-fee" data-fx-duty="6" data-fx-vat="20"></div>
```

## Paramètres
- `data-fx-duty` (6), `data-fx-vat` (20), `data-fx-free` (150), `data-fx-value` (220)

## Quand l'utiliser
Boutiques internationales, transitaires.

## Quand l'éviter
De traiter ces taux comme des chiffres légaux : ils dépendent du produit, de l'origine et du pays.

## Accessibilité
Curseur étiqueté, montants écrits.
