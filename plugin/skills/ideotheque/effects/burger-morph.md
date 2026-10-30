# `burger-morph`

**Catégorie :** Navigation

## Intention
Les trois barres du bouton de menu se transforment en croix quand le menu est ouvert.

## Ce qu'on ressent
Évident, fluide, standard bien exécuté.

## Utilisation
```html
<button data-fx="burger-morph" data-fx-toggle="#menu" aria-label="Menu"></button>
```

## Paramètres
- `--fx-burger` (44px) : taille du bouton
- Avec `data-fx-toggle="#menu"`, il suit l'état du menu ciblé

## Quand l'utiliser
Bouton de menu sur mobile ou en navigation compacte.

## Quand l'éviter
Les menus déjà visibles sur grand écran.

## Accessibilité
Le bouton porte `aria-expanded` et un `aria-label` (« Menu » par défaut).
