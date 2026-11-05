# `model-switcher`

**Catégorie :** État

## Intention
Un petit bouton ouvre une liste de modes ou de modèles, avec une coche sur le choix en cours.

## Ce qu'on ressent
Précis, un outil de professionnel sans encombrement.

## Utilisation
```html
<div data-fx="model-switcher" data-fx-options="Rapide|Précis"></div>
```

## Paramètres
- `data-fx-options` : choix séparés par `|`
- L'élément émet `fx:change`.

## Quand l'utiliser
Assistants d'IA, modes de rendu, langues.

## Quand l'éviter
Plus de 7 options.

## Accessibilité
Rôles `listbox` et `option`, navigation aux flèches et fermeture avec Échap.
