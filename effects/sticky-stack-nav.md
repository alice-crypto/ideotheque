# `sticky-stack-nav`

**Catégorie :** Navigation

## Intention
Les titres de section s'empilent en haut de l'écran pendant qu'on descend, et ceux à venir attendent en bas.

## Ce qu'on ressent
Un classeur à onglets, tout reste à portée de main.

## Utilisation
```html
<article data-fx="sticky-stack-nav"><h2>Un</h2><p>…</p><h2>Deux</h2><p>…</p></article>
```

## Paramètres
- `data-fx-head` (h2,h3) : sélecteur des titres
- `data-fx-top` (0) : décalage du haut, utile sous une barre
- `--fx-head-bg` : fond des titres

## Quand l'utiliser
Foire aux questions, longues listes, documentation.

## Quand l'éviter
Plus de 8 titres : ils occupent trop d'écran.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'effet est désactivé et le contenu s'affiche directement.
