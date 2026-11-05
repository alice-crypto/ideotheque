# `fan-scroll`

**Catégorie :** Défilement

## Intention
Des cartes empilées s'ouvrent en éventail à mesure qu'on défile.

## Ce qu'on ressent
Un jeu de cartes qu'on déploie, un geste de magicien.

## Utilisation
```html
<div data-fx="fan-scroll"><div>…</div><div>…</div><div>…</div></div>
```

## Paramètres
- `--fx-angle` (14deg) : angle entre deux cartes

## Quand l'utiliser
Présenter 3 à 7 produits, offres ou projets.

## Quand l'éviter
Plus de 7 cartes : l'éventail devient illisible.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'effet est désactivé et le contenu s'affiche directement.
