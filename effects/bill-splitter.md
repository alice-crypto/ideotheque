# `bill-splitter`

**Catégorie :** Micro-interaction

## Intention
Le total se partage entre plusieurs personnes, et les centimes restants sont répartis pour tomber juste.

## Ce qu'on ressent
Équitable, plus de calcul de tête à table.

## Utilisation
```html
<div data-fx="bill-splitter" data-fx-total="86.50"></div>
```

## Paramètres
- `data-fx-total` (86.5), `data-fx-people` (3)

## Quand l'utiliser
Paiements entre amis, restaurants.

## Quand l'éviter
Des parts qui doivent différer selon ce que chacun a pris.

## Accessibilité
Boutons nommés et résultat annoncé par `aria-live`.
