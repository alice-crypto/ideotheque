# `smart-meter`

**Catégorie :** État

## Intention
Un compteur communicant affiche son index qui monte et sa puissance qui varie.

## Ce qu'on ressent
La maison consomme, là, en ce moment.

## Utilisation
```html
<div data-fx="smart-meter" data-fx-index="18492.3"></div>
```

## Paramètres
- `data-fx-index`, `data-fx-power`, `data-fx-speed` (40) : accélère la démonstration

## Quand l'utiliser
Énergie, eau, consommation en direct.

## Quand l'éviter
D'afficher cette simulation en production : remplacez-la par le vrai relevé.

## Accessibilité
Valeurs en texte réel. Figé en mouvement réduit.
