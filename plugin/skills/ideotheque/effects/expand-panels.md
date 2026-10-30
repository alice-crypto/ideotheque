# `expand-panels`

**Catégorie :** Présentation

## Intention
Des panneaux côte à côte ; celui qu'on survole s'élargit pendant que les autres se resserrent.

## Ce qu'on ressent
Exploratoire, généreux, galerie.

## Utilisation
```html
<div data-fx="expand-panels">
  <a href="…">…</a>
  <a href="…">…</a>
</div>
```

## Paramètres
- `--fx-grow` (4) : largeur relative du panneau survolé
- `--fx-gap` (8px)

## Quand l'utiliser
Galeries de destinations, services, membres d'équipe.

## Quand l'éviter
Plus de six panneaux, et sur mobile (pas de survol) : prévoyez une disposition empilée.

## Accessibilité
Fonctionne aussi au focus clavier (`:focus-within`). Avec `prefers-reduced-motion: reduce`, le changement est immédiat.
