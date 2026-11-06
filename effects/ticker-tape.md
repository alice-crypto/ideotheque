# `ticker-tape`

**Catégorie :** Présentation

## Intention
Un bandeau fait défiler des cours, avec le sens de chaque variation écrit par une flèche et un signe.

## Ce qu'on ressent
Salle de marché, information en continu.

## Utilisation
```html
<div data-fx="ticker-tape" data-fx-items="OR:2310:0.4|EUR:1,08:-0.1"></div>
```

## Paramètres
- `data-fx-items` : « nom:valeur:variation » séparés par `|`
- `data-fx-pace` (4) : secondes par valeur
- `--fx-up`, `--fx-down` : couleurs

## Quand l'utiliser
Pages de marchés, taux, matières premières.

## Quand l'éviter
Des cours présentés comme réels sans source à jour.

## Accessibilité
Les valeurs sont dans `aria-label`. Le sens est donné par la flèche, pas seulement par la couleur.
