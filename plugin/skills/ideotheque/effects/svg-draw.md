# `svg-draw`

**Catégorie :** Image

## Intention
Les tracés d'une illustration SVG se dessinent l'un après l'autre, comme à la main.

## Ce qu'on ressent
Artisanal, explicatif, élégant.

## Utilisation
```html
<svg data-fx="svg-draw" viewBox="…">
  <path d="…" stroke="currentColor" fill="none"/>
</svg>
```

## Paramètres
- `--fx-duration` (700ms, multiplié par 2,2) : durée d'un tracé
- `data-fx-stagger` (120) : décalage entre deux tracés en ms
- Les formes doivent avoir un `stroke`

## Quand l'utiliser
Icônes, logos au trait, schémas, signatures.

## Quand l'éviter
Les illustrations remplies (`fill`) sans contour.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'illustration est affichée complète.
