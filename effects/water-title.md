# `water-title`

**Catégorie :** Texte

## Intention
Un grand titre rendu sous l'eau : il apparaît par grains, ondule en continu et se trouble autour du curseur. Les `<em>` deviennent irisés.

## Ce qu'on ressent
Le texte est dans l'élément, comme une matière et pas une étiquette.

## Utilisation
```html
<h1 data-fx="water-title">La lumière naît <em>dans le noir</em></h1>
```

## Paramètres
- `data-fx-amp` (1) : force de l'ondulation
- `<em>` : la partie irisée

## Quand l'utiliser
Un titre d'ouverture très court, en grand corps.

## Quand l'éviter
Du texte courant, ou toute information qu'il faut lire vite.

## Accessibilité
Le vrai texte reste dans le document : lisible et sélectionnable. Sans WebGL ou en mouvement réduit, il s'affiche normalement.
