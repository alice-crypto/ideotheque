# `spec-duel`

**Catégorie :** Présentation

## Intention
Un tableau compare deux modèles, et la meilleure valeur de chaque ligne ressort.

## Ce qu'on ressent
Le match est clair, sans lire tous les chiffres.

## Utilisation
```html
<div data-fx="spec-duel" data-fx-items="Coffre (L):470:380:+"></div>
```

## Paramètres
- `data-fx-names`
- `data-fx-items` : « critère:a:b:+ ou - » séparés par `|` (+ si plus grand est meilleur)

## Quand l'utiliser
Comparateurs, offres concurrentes, spécifications.

## Quand l'éviter
De croire au score final : toutes les lignes n'ont pas le même poids pour tout le monde.

## Accessibilité
Vrai tableau, en-têtes de lignes et de colonnes.
