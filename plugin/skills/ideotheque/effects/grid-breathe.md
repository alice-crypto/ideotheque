# `grid-breathe`

**Catégorie :** Défilement

## Intention
Les cases d'une grille s'écartent en bord d'écran et se resserrent au centre.

## Ce qu'on ressent
Une mosaïque qui se compose quand on la regarde.

## Utilisation
```html
<div data-fx="grid-breathe" style="display:grid;grid-template-columns:repeat(3,1fr)">…</div>
```

## Paramètres
- `--fx-min` (6px) : écart au centre
- `--fx-max` (34px) : écart ajouté aux bords

## Quand l'utiliser
Galeries en grille, sections bento.

## Quand l'éviter
Les grilles déjà très serrées en hauteur.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'effet est désactivé et le contenu s'affiche directement.
