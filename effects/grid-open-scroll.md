# `grid-open-scroll`

**Catégorie :** Défilement

## Intention
Une grille de cases recouvre l'image, et elles disparaissent au hasard au fil du défilement.

## Ce qu'on ressent
Puzzle qu'on découvre, curiosité.

## Utilisation
```html
<figure data-fx="grid-open-scroll"><img src="photo.jpg" alt="…"></figure>
```

## Paramètres
- `data-fx-cols` (8), `data-fx-rows` (6), `--fx-tile`

## Quand l'utiliser
Grandes images de chapitres.

## Quand l'éviter
Du contenu à lire dès l'arrivée.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'effet est désactivé et le contenu s'affiche directement.
