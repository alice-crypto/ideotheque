# `blinds-open`

**Catégorie :** Entrée

## Intention
Huit lames horizontales s'ouvrent comme un store vénitien et laissent voir le contenu.

## Ce qu'on ressent
Rythmé, géométrique, rétro.

## Utilisation
```html
<figure data-fx="blinds-open">…</figure>
```

## Paramètres
- `--fx-duration` (700ms), `--fx-delay` (0ms) — durée réelle 1,3 fois plus longue

## Quand l'utiliser
Images, aplats de couleur, visuels de fond.

## Quand l'éviter
Les textes : les lames coupent les lettres pendant l'ouverture.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, le contenu s'affiche directement. Utilise `@property` : sur un navigateur ancien, le contenu apparaît sans animation.
