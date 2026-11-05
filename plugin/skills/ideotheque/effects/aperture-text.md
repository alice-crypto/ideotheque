# `aperture-text`

**Catégorie :** Défilement

## Intention
Un grand mot grandit au défilement jusqu'à remplir l'écran, et on passe à travers.

## Ce qu'on ressent
Traverser un mot comme une porte.

## Utilisation
```html
<div data-fx="aperture-text"><h2>OUVERT</h2></div>
```

## Paramètres
- `data-fx-max` (18) : échelle finale
- `--fx-origin` (50% 50%) : point visé, par exemple le creux du O

## Quand l'utiliser
Passage entre l'accueil et la section suivante.

## Quand l'éviter
Les mots sans lettre ouverte : l'effet perd son sens.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'effet est désactivé et le contenu s'affiche directement.
