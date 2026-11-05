# `bars-scrub`

**Catégorie :** Défilement

## Intention
Les barres d'un graphique montent et redescendent selon qu'on défile dans un sens ou l'autre.

## Ce qu'on ressent
Une donnée qu'on a sous la main, le récit progresse.

## Utilisation
```html
<div data-fx="bars-scrub" data-fx-values="30,55,40,75"></div>
```

## Paramètres
- `data-fx-values` : valeurs séparées par des virgules
- `--fx-h` (120px), `--fx-gap` (6px), `--fx-bar` : hauteur, écart, couleur

## Quand l'utiliser
Récit de données, résultats d'un rapport.

## Quand l'éviter
Un graphique à lire précisément : ajoutez aussi les chiffres.

## Accessibilité
Les valeurs sont dans `aria-label`.
