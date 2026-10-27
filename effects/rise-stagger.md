# `rise-stagger`

**Catégorie :** Entrée

## Intention
Faire arriver une liste élément par élément pour guider l'œil dans l'ordre de lecture.

## Ce qu'on ressent
Rythmé, organisé, vivant.

## Utilisation
```html
<ul data-fx="rise-stagger">
  <li>…</li>
  <li>…</li>
</ul>
```

## Paramètres
- `--fx-stagger` (70ms) : décalage entre deux enfants
- `--fx-duration`, `--fx-distance`

## Quand l'utiliser
Listes de fonctionnalités, grilles de cartes, menus.

## Quand l'éviter
Plus de 12 enfants : l'attente devient pénible. Réduire alors `--fx-stagger`.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'effet est désactivé et le contenu s'affiche directement.
