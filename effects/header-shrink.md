# `header-shrink`

**Catégorie :** Navigation

## Intention
L'en-tête s'affine, prend un fond et réduit son logo dès qu'on commence à défiler.

## Ce qu'on ressent
Élégant, il libère de la place progressivement.

## Utilisation
```html
<header data-fx="header-shrink"><a class="logo">…</a></header>
```

## Paramètres
- `data-fx-after` (40) : seuil en pixels
- `--fx-header-pad` (28px), `--fx-header-pad-small` (10px), `--fx-header-bg`

## Quand l'utiliser
En-têtes de sites vitrines et de boutiques.

## Quand l'éviter
Les en-têtes déjà très fins.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, le changement est instantané.
