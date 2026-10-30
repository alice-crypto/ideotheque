# `image-trail`

**Catégorie :** Image

## Intention
En bougeant la souris, des images apparaissent dans le sillage du curseur puis s'effacent.

## Ce qu'on ressent
Ludique, créatif, très portfolio.

## Utilisation
```html
<section data-fx="image-trail" data-fx-images="a.jpg, b.jpg, c.jpg">…</section>
```

## Paramètres
- `data-fx-images` : liste d'images séparées par des virgules
- `data-fx-gap` (70) : distance entre deux images en pixels
- `--fx-trail-w` (110px) : largeur des images

## Quand l'utiliser
Héros de portfolio, page « à propos », galerie d'ambiance.

## Quand l'éviter
Les zones avec du texte à lire : les images passent devant.

## Accessibilité
Les images du sillage sont décoratives (`alt` vide). Avec `prefers-reduced-motion: reduce`, rien n'apparaît.
