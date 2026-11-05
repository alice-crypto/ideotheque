# `scroll-gauge`

**Catégorie :** Défilement

## Intention
Une jauge circulaire se remplit jusqu'à sa valeur quand elle entre à l'écran.

## Ce qu'on ressent
Mesure qui monte, un objectif atteint.

## Utilisation
```html
<div data-fx="scroll-gauge" data-fx-goal="82"></div>
```

## Paramètres
- `data-fx-goal` (100) : valeur finale
- `--fx-size` (120px), `--fx-weight` (7) : taille et épaisseur

## Quand l'utiliser
Chiffres clés, résultats d'un rapport.

## Quand l'éviter
Une valeur qu'on doit voir sans défiler.

## Accessibilité
La valeur est exposée par `role="meter"` et `aria-valuenow`.
