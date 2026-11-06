# `metro-line`

**Catégorie :** Navigation

## Intention
On touche un arrêt sur la ligne pour voir le trajet s'allumer et le temps de parcours.

## Ce qu'on ressent
Un plan de métro, évident pour tout le monde.

## Utilisation
```html
<div data-fx="metro-line" data-fx-items="Gare:0|Parc:4"></div>
```

## Paramètres
- `data-fx-items` : « arrêt:minutes depuis le précédent » séparés par `|`
- `data-fx-from` (0), `--fx-line`

## Quand l'utiliser
Transports, parcours, étapes d'un programme.

## Quand l'éviter
Plus de sept arrêts dans une petite largeur : les noms se chevauchent.

## Accessibilité
Liste ordonnée de boutons, résultat annoncé.
