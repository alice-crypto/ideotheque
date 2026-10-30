# `fan-out`

**Catégorie :** Micro-interaction

## Intention
Une pile de cartes s'ouvre en éventail au survol.

## Ce qu'on ressent
Ludique, généreux, comme un jeu de cartes.

## Utilisation
```html
<div data-fx="fan-out">
  <img …><img …><img …>
</div>
```

## Paramètres
Aucun paramètre : écart de 26 px et 12° entre deux cartes.

## Quand l'utiliser
Aperçus de projets, collections, photos.

## Quand l'éviter
Plus de 5 cartes : l'éventail devient trop large.

## Accessibilité
Les effets de survol se déclenchent aussi au focus clavier quand c'est possible. Avec `prefers-reduced-motion: reduce`, les transitions sont instantanées.
