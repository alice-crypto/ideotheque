# `orbit-loader`

**Catégorie :** État

## Intention
Deux points tournent à des vitesses différentes autour d'un cœur qui respire.

## Ce qu'on ressent
Vivant, précis, technologique.

## Utilisation
```html
<span data-fx="orbit-loader" role="status" aria-label="Chargement"></span>
```

## Paramètres
- `--fx-size` (48px) : taille

## Quand l'utiliser
Chargements courts, boutons en attente, écrans d'attente.

## Quand l'éviter
Les chargements longs sans indication de durée.

## Accessibilité
Ajoutez `role="status"` et un `aria-label`. Avec `prefers-reduced-motion: reduce`, l'animation est figée.
