# `marquee-vertical`

**Catégorie :** Présentation

## Intention
Une colonne d'éléments défile à l'infini vers le haut, avec des bords qui s'estompent ; le survol met en pause.

## Ce qu'on ressent
Abondant, preuve sociale, mur d'avis.

## Utilisation
```html
<div data-fx="marquee-vertical">
  <blockquote>…</blockquote>
  <blockquote>…</blockquote>
</div>
```

## Paramètres
- `--fx-speed` (14s) : durée d'un tour
- `--fx-gap` (12px)
- `data-fx-direction="down"` : défile vers le bas

## Quand l'utiliser
Murs de témoignages (plusieurs colonnes en sens opposés), logos, tweets.

## Quand l'éviter
Les contenus qu'il faut pouvoir lire en entier : le défilement presse.

## Accessibilité
Les copies sont masquées aux lecteurs d'écran. Avec `prefers-reduced-motion: reduce`, l'animation est figée.
