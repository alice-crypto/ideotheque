# `pixel-dissolve`

**Catégorie :** Entrée

## Intention
Une mosaïque de cases colorées recouvre un visuel, puis s'efface case par case dans un ordre aléatoire.

## Ce qu'on ressent
Numérique, joueur, rétro-tech. Le visuel semble se « charger ».

## Utilisation
```html
<figure data-fx="pixel-dissolve" data-fx-cols="16">
  <img src="…" alt="…">
</figure>
```

## Paramètres
- `data-fx-cols` (14) : nombre de colonnes de la grille
- `data-fx-duration` (1100, en ms), `data-fx-delay` (0)
- `--fx-pixel-color` (#ff5b2e) : couleur des cases
- `--fx-pixel-alt` (#14141a) : couleur de scintillement juste avant la disparition

## Quand l'utiliser
Images vedettes, vignettes de projets, révélation d'un portrait.

## Quand l'éviter
Les petites icônes (moins de 120 px) et les visuels qui doivent être lisibles immédiatement.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, aucune mosaïque n'est créée : l'image est visible tout de suite.
