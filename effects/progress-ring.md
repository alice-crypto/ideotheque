# `progress-ring`

**Catégorie :** État

## Intention
Un anneau se remplit jusqu'à sa valeur pendant que le pourcentage défile au centre.

## Ce qu'on ressent
Mesuré, satisfaisant, tableau de bord.

## Utilisation
```html
<div data-fx="progress-ring" data-fx-value="72"></div>
```

## Paramètres
- `data-fx-value` (72) : valeur de 0 à 100
- `--fx-size` (110px), `--fx-ring-color`, `--fx-track`

## Quand l'utiliser
Objectifs, complétion de profil, scores.

## Quand l'éviter
Les valeurs qui changent en continu.

## Accessibilité
Reçoit `role="progressbar"` avec `aria-valuenow`. Avec `prefers-reduced-motion: reduce`, la valeur finale est affichée.
