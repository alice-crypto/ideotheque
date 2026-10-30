# `scroll-expand`

**Catégorie :** Défilement

## Intention
Un visuel encadré, aux coins arrondis, s'agrandit jusqu'au plein cadre au fil du défilement, pendant que l'image se recadre doucement.

## Ce qu'on ressent
Immersif, cinématographique : on « entre » dans l'image.

## Utilisation
```html
<figure data-fx="scroll-expand">
  <img src="…" alt="…">
</figure>
```

## Paramètres
- `--fx-inset` (12%) : marge de départ
- `--fx-radius` (28px) : arrondi de départ
- Le premier enfant (l'image) passe d'un zoom de 1,18 à 1

## Quand l'utiliser
Visuel principal d'une page, transition entre deux sections.

## Quand l'éviter
Plusieurs fois dans la même page : l'effet perd sa force.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, le visuel est affiché en plein cadre, sans animation.
