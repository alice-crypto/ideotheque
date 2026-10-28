# `zoom-in-soft`

**Catégorie :** Entrée

## Intention
L'élément grandit doucement de 90 % à sa taille réelle en apparaissant.

## Ce qu'on ressent
Accueillant, il semble se rapprocher.

## Utilisation
```html
<figure data-fx="zoom-in-soft">…</figure>
```

## Paramètres
- `--fx-duration` (700ms), `--fx-delay` (0ms)

## Quand l'utiliser
Visuels, cartes produit, modales.

## Quand l'éviter
Les longs textes : le grossissement rend la lecture floue pendant l'animation.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'effet est désactivé et le contenu s'affiche directement.
