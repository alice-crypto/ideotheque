# `carousel-ring`

**Catégorie :** Image

## Intention
Les éléments tournent lentement sur un anneau en 3D ; le survol met la rotation en pause.

## Ce qu'on ressent
Spectaculaire, vitrine, manège.

## Utilisation
```html
<div data-fx="carousel-ring">
  <img …><img …><img …><img …><img …>
</div>
```

## Paramètres
- `--fx-spin` (24s) : durée d'un tour
- `data-fx-gap` (18) : espace entre deux éléments

## Quand l'utiliser
Galeries de produits, logos de clients, couvertures.

## Quand l'éviter
Les contenus à lire : les éléments passent de dos.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'anneau ne tourne pas.
