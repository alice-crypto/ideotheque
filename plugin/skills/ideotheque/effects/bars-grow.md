# `bars-grow`

**Catégorie :** Présentation

## Intention
Les barres d'un graphique poussent l'une après l'autre, puis leur valeur apparaît au-dessus.

## Ce qu'on ressent
Factuel, dynamique, satisfaisant.

## Utilisation
```html
<div data-fx="bars-grow">
  <div data-fx-value="40"></div>
  <div data-fx-value="75"></div>
</div>
```

## Paramètres
- `data-fx-value` sur chaque barre : sa valeur (les hauteurs sont relatives à la plus grande)
- `--fx-height` (140px), `--fx-gap` (10px), `--fx-bar`, `--fx-bar-2`

## Quand l'utiliser
Chiffres clés, comparaisons, résultats annuels.

## Quand l'éviter
Les jeux de données de plus de douze valeurs.

## Accessibilité
Chaque barre reçoit un `aria-label` avec sa valeur (et `data-fx-label` s'il existe). Avec `prefers-reduced-motion: reduce`, les barres sont à leur hauteur directement.
