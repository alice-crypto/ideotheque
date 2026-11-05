# `pricing-toggle-cards`

**Catégorie :** Présentation

## Intention
La bascule mensuel / annuel fait défiler les prix des cartes et fait apparaître le badge d'économie.

## Ce qu'on ressent
Rassurant, on voit tout de suite ce qu'on gagne.

## Utilisation
```html
<div data-fx="pricing-toggle-cards"><label><input type="checkbox"> Annuel</label><b data-month="19" data-year="15"></b></div>
```

## Paramètres
- `data-month` et `data-year` sur chaque prix
- `.fx-save` : badge d'économie

## Quand l'utiliser
Pages de tarifs.

## Quand l'éviter
Des prix sans la même période de référence : indiquez toujours « par mois ».

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'effet est désactivé et le contenu s'affiche directement.
