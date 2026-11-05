# `confidence-meter`

**Catégorie :** État

## Intention
Une petite barre indique, en mots et en longueur, à quel point une réponse est sûre.

## Ce qu'on ressent
Honnêteté, la machine admet ses doutes.

## Utilisation
```html
<div data-fx="confidence-meter" data-fx-value="72"></div>
```

## Paramètres
- `data-fx-value` (72) : valeur entre 0 et 100
- `--fx-high`, `--fx-mid`, `--fx-low` : couleurs

## Quand l'utiliser
Réponses d'IA, prédictions, résultats d'analyse.

## Quand l'éviter
Une valeur inventée : il faut une vraie mesure derrière.

## Accessibilité
Rôle `meter`, et le niveau est écrit en toutes lettres.
