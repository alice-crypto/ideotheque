# `tile-cascade`

**Catégorie :** Entrée

## Intention
Les tuiles d'une grille apparaissent en vague diagonale, du coin haut gauche vers le coin bas droit.

## Ce qu'on ressent
Ordonné, satisfaisant, comme un domino.

## Utilisation
```html
<div class="grille" data-fx="tile-cascade">
  <div>…</div>
  <div>…</div>
</div>
```

## Paramètres
- `--fx-duration` (700ms), `--fx-delay` (0ms)
- `--fx-stagger` (70ms) : décalage entre deux diagonales
- L'ordre est recalculé si la grille change de colonnes

## Quand l'utiliser
Galeries, grilles de logos, grilles de fonctionnalités.

## Quand l'éviter
Les grilles de plus de 40 éléments : la vague devient trop longue.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'effet est désactivé et le contenu s'affiche directement.
