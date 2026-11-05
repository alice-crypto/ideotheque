# `color-picker-orbit`

**Catégorie :** Micro-interaction

## Intention
Des pastilles de couleur changent la teinte d'un produit, avec un anneau qui marque le choix.

## Ce qu'on ressent
On essaie sans s'engager, comme en boutique.

## Utilisation
```html
<div data-fx="color-picker-orbit" data-fx-target="#produit"></div>
```

## Paramètres
- `data-fx-colors`, `data-fx-names` : séparés par `|`
- `data-fx-target` : élément qui reçoit `--fx-color`

## Quand l'utiliser
Fiches produit, personnalisation.

## Quand l'éviter
Des couleurs sans nom : donnez-leur un `data-fx-names` pour l'accessibilité.

## Accessibilité
Rôles `radiogroup` et `radio`, chaque couleur a un nom.
