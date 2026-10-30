# `scatter-gather`

**Catégorie :** Entrée

## Intention
Les enfants partent de positions et d'angles éparpillés au hasard, puis se rassemblent à leur place.

## Ce qu'on ressent
Chaotique puis ordonné, magique.

## Utilisation
```html
<div data-fx="scatter-gather">
  <span>…</span>
  <span>…</span>
</div>
```

## Paramètres
- `--fx-duration` (700ms), `--fx-delay` (0ms)
- `data-fx-spread` (140) : distance maximale de dispersion en pixels

## Quand l'utiliser
Logos, mots-clés, éléments décoratifs, une composition de formes.

## Quand l'éviter
Les listes à lire dans l'ordre et les parents sans `overflow: hidden` près des bords.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'effet est désactivé et le contenu s'affiche directement.
