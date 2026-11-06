# `defect-pareto`

**Catégorie :** Présentation

## Intention
Un diagramme de Pareto trie les causes et désigne celles qui font 80 % des défauts.

## Ce qu'on ressent
Où agir en premier, sans débat.

## Utilisation
```html
<div data-fx="defect-pareto" data-fx-items="Rayures:48|Soudure:31"></div>
```

## Paramètres
- `data-fx-items` : « cause:nombre » séparés par `|`

## Quand l'utiliser
Qualité, support, tout classement de causes.

## Quand l'éviter
Des données trop anciennes, ou un tri qui cache un défaut rare mais grave.

## Accessibilité
La conclusion est écrite, et le graphique est décoratif.
