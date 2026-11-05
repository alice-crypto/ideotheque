# `logo-wall-flip`

**Catégorie :** Présentation

## Intention
Un mur de noms ou de logos : à tour de rôle, une case se retourne pour en montrer un autre.

## Ce qu'on ressent
Une longue liste de références, sans tout montrer à la fois.

## Utilisation
```html
<div data-fx="logo-wall-flip" data-fx-logos="Atlas|Halo"></div>
```

## Paramètres
- `data-fx-logos` : noms séparés par `|`
- `data-fx-cells` (6), `data-fx-every` (1.1)
- `--fx-cell-bg` : fond des cases

## Quand l'utiliser
Logos clients, partenaires, médias.

## Quand l'éviter
Des références inventées : le mur doit rester vrai.

## Accessibilité
Tous les noms sont dans `aria-label`.
