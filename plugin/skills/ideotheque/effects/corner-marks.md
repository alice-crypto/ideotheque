# `corner-marks`

**Catégorie :** Micro-interaction

## Intention
Quatre repères d'angle viennent cadrer l'élément au survol, comme un viseur qui fait la mise au point.

## Ce qu'on ressent
Précis, technique, éditorial.

## Utilisation
```html
<article data-fx="corner-marks">…</article>
```

## Paramètres
- `--fx-mark` (14px) : longueur des repères
- `--fx-mark-w` (1.5px) : épaisseur
- `--fx-mark-color` : couleur (couleur du texte par défaut)

## Quand l'utiliser
Cartes de projets, vignettes, éléments sélectionnables.

## Quand l'éviter
Les éléments collés au bord de l'écran (les repères débordent de 7 px).

## Accessibilité
Les repères apparaissent aussi au focus clavier (`:focus-within`).
