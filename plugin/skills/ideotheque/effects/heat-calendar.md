# `heat-calendar`

**Catégorie :** Présentation

## Intention
Un calendrier d'activité : de petites cases plus ou moins colorées s'allument en vague.

## Ce qu'on ressent
Assiduité, une habitude qui se voit.

## Utilisation
```html
<div data-fx="heat-calendar" data-fx-weeks="26" data-fx-values="…"></div>
```

## Paramètres
- `data-fx-weeks` (16) : nombre de semaines
- `data-fx-values` : valeurs entre 0 et 1, sinon des valeurs d'exemple

## Quand l'utiliser
Contributions, habitudes, présence.

## Quand l'éviter
Des données réelles sans `data-fx-values` : les valeurs d'exemple sont aléatoires.

## Accessibilité
Donnez un `aria-label` qui résume l'activité.
