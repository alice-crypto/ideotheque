# `platform-guide`

**Catégorie :** Micro-interaction

## Intention
On choisit sa sortie, et la voiture où monter s'allume, avec une flèche.

## Ce qu'on ressent
L'astuce d'un habitué, offerte à tout le monde.

## Utilisation
```html
<div data-fx="platform-guide" data-fx-items="Hôpital:1"></div>
```

## Paramètres
- `data-fx-items` : « sortie:voiture » séparés par `|`
- `data-fx-cars` (6)

## Quand l'utiliser
Métro, trains, grands parkings.

## Quand l'éviter
Un quai dont la position change selon le train : l'indication deviendrait fausse.

## Accessibilité
Vraie liste nommée, résultat annoncé.
