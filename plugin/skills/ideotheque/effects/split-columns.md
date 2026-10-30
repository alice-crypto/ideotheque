# `split-columns`

**Catégorie :** Défilement

## Intention
Les colonnes d'une grille défilent en sens opposés : les impaires montent, les paires descendent.

## Ce qu'on ressent
Dynamique, éditorial, un rythme visuel.

## Utilisation
```html
<div data-fx="split-columns" class="grille">
  <div class="colonne">…</div>
  <div class="colonne">…</div>
</div>
```

## Paramètres
- `--fx-split` (140px) : amplitude du décalage

## Quand l'utiliser
Galeries d'images en colonnes, mosaïques de projets.

## Quand l'éviter
Les grilles dont l'ordre de lecture compte.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'élément reste dans son état final, sans suivre le défilement.
