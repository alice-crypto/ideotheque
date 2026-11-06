# `machine-wall`

**Catégorie :** État

## Intention
Un mur de tuiles montre l'état de chaque machine et le temps passé dans cet état.

## Ce qu'on ressent
La salle de contrôle, tout d'un coup d'œil.

## Utilisation
```html
<div data-fx="machine-wall" data-fx-items="P1:run|P3:stop"></div>
```

## Paramètres
- `data-fx-items` : « nom:état » (`run`, `warn`, `stop`) séparés par `|`

## Quand l'utiliser
Ateliers, serveurs, parcs de machines.

## Quand l'éviter
D'en faire une alarme de sécurité : ce composant n'a aucune fiabilité industrielle.

## Accessibilité
L'état et la durée sont écrits en mots. Le résumé est annoncé.
