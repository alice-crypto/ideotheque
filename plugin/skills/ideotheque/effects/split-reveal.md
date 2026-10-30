# `split-reveal`

**Catégorie :** Entrée

## Intention
Deux volets de couleur recouvrent l'élément puis s'écartent vers la gauche et la droite.

## Ce qu'on ressent
Théâtral, comme un rideau de scène qui s'ouvre.

## Utilisation
```html
<figure data-fx="split-reveal" style="--fx-cover:#fff">…</figure>
```

## Paramètres
- `--fx-duration` (700ms), `--fx-delay` (0ms)
- `--fx-cover` (#0c0c0e) : couleur des volets, à accorder avec le fond

## Quand l'utiliser
Visuel principal, ouverture de section, présentation d'un produit.

## Quand l'éviter
Plusieurs fois par écran, et sur un fond dont la couleur diffère de `--fx-cover`.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'effet est désactivé et le contenu s'affiche directement.
