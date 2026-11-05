# `agent-graph`

**Catégorie :** État

## Intention
Un agent d'IA parcourt ses étapes : chaque nœud s'active, pulse, puis se valide.

## Ce qu'on ressent
Transparence : on voit le travail se faire.

## Utilisation
```html
<div data-fx="agent-graph" data-fx-steps="Lire|Résumer|Envoyer"></div>
```

## Paramètres
- `data-fx-steps` : étapes séparées par `|`
- `data-fx-step` (800) : durée d'une étape en millisecondes
- L'élément émet `fx:done`.

## Quand l'utiliser
Assistants, automatisations, chaînes d'outils.

## Quand l'éviter
Une fausse progression : branchez l'effet sur les vraies étapes si elles existent.

## Accessibilité
Liste sémantique. Avec `prefers-reduced-motion: reduce`, toutes les étapes s'affichent validées.
