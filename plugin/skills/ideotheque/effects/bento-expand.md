# `bento-expand`

**Catégorie :** Navigation

## Intention
Une case de la grille s'agrandit au clic, et les autres glissent pour se ranger autour d'elle.

## Ce qu'on ressent
Un tableau de bord qui se réorganise, ordre et fluidité.

## Utilisation
```html
<div data-fx="bento-expand"><div>…</div><div>…</div><div>…</div></div>
```

## Paramètres
- `--fx-cols` (3) : nombre de colonnes
- `--fx-gap` (10px) : écart

## Quand l'utiliser
Présentation de fonctions, galeries, tableaux de bord.

## Quand l'éviter
Une grille de deux colonnes : il n'y a pas de place pour l'agrandissement.

## Accessibilité
Chaque case a le rôle `button` et `aria-expanded`, réagit à Entrée, Espace et Échap.
