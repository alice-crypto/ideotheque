# `circle-unveil`

**Catégorie :** Défilement

## Intention
Une image apparaît dans un cercle qui s'agrandit à mesure qu'on défile.

## Ce qu'on ressent
Un œil qui s'ouvre, une révélation lente.

## Utilisation
```html
<img data-fx="circle-unveil" src="photo.jpg" alt="">
```

## Paramètres
- `--fx-min` (6%) : taille du cercle au départ
- `--fx-at` (50% 50%) : centre du cercle

## Quand l'utiliser
Grande image de transition entre deux chapitres.

## Quand l'éviter
Un contenu à lire dès l'arrivée à l'écran.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'élément suit toujours le défilement, sans animation en boucle.
