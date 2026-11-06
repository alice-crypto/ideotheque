# `bowl-builder`

**Catégorie :** Micro-interaction

## Intention
Des ingrédients tombent dans un bol, avec le prix et les calories recalculés.

## Ce qu'on ressent
Le plaisir de composer, comme au comptoir.

## Utilisation
```html
<div data-fx="bowl-builder" data-fx-base="6"></div>
```

## Paramètres
- `data-fx-items` : « nom:couleur:prix:kcal » séparés par `|`
- `data-fx-base` (6), `--fx-bowl`

## Quand l'utiliser
Restauration rapide, cantines, salades composées.

## Quand l'éviter
Des calories non vérifiées : ces valeurs sont fictives.

## Accessibilité
Ingrédients en boutons `aria-pressed`, total annoncé.
