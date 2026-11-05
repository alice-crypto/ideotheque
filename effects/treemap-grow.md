# `treemap-grow`

**Catégorie :** Présentation

## Intention
Une carte de rectangles proportionnels s'assemble : plus la valeur est grande, plus la surface l'est.

## Ce qu'on ressent
Vue d'ensemble dense, tout tient en un regard.

## Utilisation
```html
<div data-fx="treemap-grow" data-fx-items="A:60,B:30,C:10"></div>
```

## Paramètres
- `data-fx-items` : « nom:valeur »
- `--fx-h` (150px), `--fx-gap`

## Quand l'utiliser
Stockage, budgets, parts de marché.

## Quand l'éviter
De très petites valeurs : leur nom ne tient plus.

## Accessibilité
Chaque rectangle porte son nom en texte et sa valeur dans `title`.
