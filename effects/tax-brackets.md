# `tax-brackets`

**Catégorie :** Présentation

## Intention
Un curseur de revenu montre la part qui tombe dans chaque tranche et l'impôt moyen.

## Ce qu'on ressent
Enfin compris : seule la part supérieure est taxée plus fort.

## Utilisation
```html
<div data-fx="tax-brackets" data-fx-brackets="0:10000:0|10000:30000:11"></div>
```

## Paramètres
- `data-fx-brackets` : « de:à:taux » séparés par `|`
- `data-fx-income` (42000)

## Quand l'utiliser
Paie, fiscalité, pédagogie.

## Quand l'éviter
De présenter le barème d'exemple comme le vrai : fournissez le barème officiel.

## Accessibilité
Curseur natif, et résultat écrit et annoncé.
