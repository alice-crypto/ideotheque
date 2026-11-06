# `menu-diet-filter`

**Catégorie :** Micro-interaction

## Intention
Des filtres de régime retirent les plats incompatibles, et le compte s'écrit.

## Ce qu'on ressent
Plus besoin de demander au serveur pour chaque plat.

## Utilisation
```html
<div data-fx="menu-diet-filter" data-fx-items="Velouté:12:vgl"></div>
```

## Paramètres
- `data-fx-items` : « plat:prix:lettres » séparés par `|` (v, g, l)

## Quand l'utiliser
Restaurants, traiteurs, cantines.

## Quand l'éviter
D'affirmer l'absence d'un allergène sans vérification en cuisine.

## Accessibilité
Boutons `aria-pressed`, compte annoncé, lignes masquées retirées pour les lecteurs d'écran.
