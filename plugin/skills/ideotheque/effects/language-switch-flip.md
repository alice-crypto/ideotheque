# `language-switch-flip`

**Catégorie :** Navigation

## Intention
Un petit bouton rond affiche la langue en cours, et son sigle bascule en 3D quand on change.

## Ce qu'on ressent
Compact et précis, un petit panneau de gare.

## Utilisation
```html
<button data-fx="language-switch-flip" data-fx-langs="FR|EN"></button>
```

## Paramètres
- `data-fx-langs` (FR|EN|ES) : langues séparées par `|`
- L'élément émet `fx:change`, et met à jour `lang` sur `<html>`.

## Quand l'utiliser
Sites en quelques langues.

## Quand l'éviter
Une trentaine de langues : préférez une liste.

## Accessibilité
Bouton nommé. Le code conserve la langue de `<html>` à jour pour les lecteurs d'écran.
