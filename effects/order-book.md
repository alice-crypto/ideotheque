# `order-book`

**Catégorie :** Présentation

## Intention
Les ordres d'achat et de vente s'affichent de part et d'autre du prix, avec une barre de profondeur.

## Ce qu'on ressent
Technique, on voit le marché respirer.

## Utilisation
```html
<div data-fx="order-book" data-fx-mid="100"></div>
```

## Paramètres
- `data-fx-mid` (100), `data-fx-step` (.5), `data-fx-levels` (4)

## Quand l'utiliser
Démonstrations de plateformes d'échange.

## Quand l'éviter
Des volumes aléatoires présentés comme réels : remplacez `_fxR` par vos données.

## Accessibilité
Résumé dans `aria-label`. Avec `prefers-reduced-motion: reduce`, les volumes restent fixes.
