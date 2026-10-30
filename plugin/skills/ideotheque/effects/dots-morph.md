# `dots-morph`

**Catégorie :** Navigation

## Intention
L'indicateur d'un diaporama : le point actif s'étire en barre qui se remplit pendant le temps d'affichage.

## Ce qu'on ressent
Clair, il montre le temps qui reste.

## Utilisation
```html
<div data-fx="dots-morph" data-fx-count="5"></div>
```

## Paramètres
- `data-fx-count` (4) : nombre de points si l'élément est vide
- `data-fx-interval` (3000) : durée par diapositive en ms
- `data-fx-auto="false"` : pas d'avance automatique
- Événement `fx:change` (detail.index) à chaque changement

## Quand l'utiliser
Diaporamas, témoignages, histoires façon réseaux sociaux.

## Quand l'éviter
Les diaporamas sans pause possible : prévoyez un bouton pause.

## Accessibilité
Chaque point est un bouton (« Diapositive n ») et l'actif porte `aria-current`. Avec `prefers-reduced-motion: reduce`, pas d'avance automatique.
