# `tilt-card`

**Catégorie :** Micro-interaction

## Intention
Une carte qui s'incline en 3D sous le curseur, comme un objet qu'on tient.

## Ce qu'on ressent
Matériel, ludique, produit.

## Utilisation
```html
<div data-fx="tilt-card" data-fx-max="10">…</div>
```

## Paramètres
- `data-fx-max` (10) : inclinaison maximale en degrés

## Quand l'utiliser
Cartes produit, visuels de carte bancaire, vignettes de portfolio.

## Quand l'éviter
Les cartes remplies de texte (l'inclinaison nuit à la lecture).

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'effet est désactivé et le contenu s'affiche directement.
