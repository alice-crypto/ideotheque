# `swipe-card`

**Catégorie :** Micro-interaction

## Intention
Une pile de cartes : on balaye la première vers la gauche ou la droite, et la suivante avance.

## Ce qu'on ressent
Choix rapides, familiers, on tourne les cartes du pouce.

## Utilisation
```html
<div data-fx="swipe-card" style="height:300px"><article>…</article><article>…</article></div>
```

## Paramètres
- `data-fx-distance` (80) : distance de décision en pixels
- L'élément émet `fx:swipe` avec le sens.

## Quand l'utiliser
Sélection de produits, questions rapides, démonstrations mobiles.

## Quand l'éviter
Une comparaison précise : le geste pousse à aller vite.

## Accessibilité
Flèches gauche et droite au clavier. Offrez aussi des boutons visibles.
