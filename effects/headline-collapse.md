# `headline-collapse`

**Catégorie :** Texte

## Intention
Un titre très espacé se resserre peu à peu au défilement jusqu'à former un mot compact.

## Ce qu'on ressent
Mise au point progressive, le mot prend corps.

## Utilisation
```html
<h2 data-fx="headline-collapse">Ensemble</h2>
```

## Paramètres
- `data-fx-gap` (.6) : écart de départ, en em

## Quand l'utiliser
Titres d'une seule ligne en tête de section.

## Quand l'éviter
Les titres longs : à l'écart maximal, ils dépassent de l'écran.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, le titre garde sa position selon le défilement mais rien n'est animé en boucle.
