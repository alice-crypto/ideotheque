# `compare`

**Catégorie :** Image

## Intention
Deux images superposées et une poignée qu'on fait glisser pour comparer l'avant et l'après.

## Ce qu'on ressent
Démonstratif, interactif, convaincant.

## Utilisation
```html
<div data-fx="compare">
  <img src="avant.jpg" alt="Avant">
  <img src="apres.jpg" alt="Après">
</div>
```

## Paramètres
- Premier enfant : image « avant », deuxième : image « après »
- `data-fx-start` (50) : position de départ en %
- `data-fx-label` : libellé du curseur pour les lecteurs d'écran

## Quand l'utiliser
Retouches, rénovations, avant/après d'un produit.

## Quand l'éviter
Deux images de proportions différentes.

## Accessibilité
Le curseur est un vrai `<input type="range">` : il fonctionne au clavier (flèches) et au toucher.
