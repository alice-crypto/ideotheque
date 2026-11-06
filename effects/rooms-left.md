# `rooms-left`

**Catégorie :** État

## Intention
Une façade montre les chambres encore libres, avec la date de la donnée et sans fausse urgence.

## Ce qu'on ressent
Honnête : on décide sans être poussé.

## Utilisation
```html
<div data-fx="rooms-left" data-fx-left="4" data-fx-total="32"></div>
```

## Paramètres
- `data-fx-left` (4), `data-fx-total` (32), `data-fx-updated`

## Quand l'utiliser
Hôtels, événements, places limitées.

## Quand l'éviter
D'y afficher des chiffres inventés : la pression fictive est trompeuse, et peut être interdite.

## Accessibilité
Chiffre et date écrits. Pas d'animation qui presse.
