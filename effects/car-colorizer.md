# `car-colorizer`

**Catégorie :** Micro-interaction

## Intention
Des pastilles repeignent la voiture, et le prix suit la peinture choisie.

## Ce qu'on ressent
On imagine déjà la voiture devant chez soi.

## Utilisation
```html
<div data-fx="car-colorizer" data-fx-price="24900"></div>
```

## Paramètres
- `data-fx-price` (24900)
- `data-fx-items` : « nom:couleur:supplément » séparés par `|`

## Quand l'utiliser
Configurateurs, vélos, meubles.

## Quand l'éviter
Une couleur écran présentée comme fidèle : le rendu réel diffère.

## Accessibilité
Pastilles nommées, `aria-pressed`, prix et couleur annoncés.
