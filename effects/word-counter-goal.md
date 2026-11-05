# `word-counter-goal`

**Catégorie :** Texte

## Intention
Un compteur de mots avance vers un objectif, et salue d'une pulsation quand il est atteint.

## Ce qu'on ressent
Encouragement, écrire devient un petit jeu.

## Utilisation
```html
<div data-fx="word-counter-goal"><textarea></textarea></div>
```

## Paramètres
- `data-fx-goal` (30) : objectif en mots
- L'élément émet `fx:goal`.

## Quand l'utiliser
Éditeurs, journaux, formulaires.

## Quand l'éviter
Une limite stricte : c'est un objectif, pas une contrainte.

## Accessibilité
Le décompte est annoncé par `aria-live`.
