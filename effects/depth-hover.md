# `depth-hover`

**Catégorie :** Micro-interaction

## Intention
Les calques d'une composition bougent à des profondeurs différentes sous le curseur.

## Ce qu'on ressent
Parallaxe, profondeur, immersion.

## Utilisation
```html
<div data-fx="depth-hover">
  <img data-fx-depth="0.2" …>
  <img data-fx-depth="1" …>
</div>
```

## Paramètres
- `data-fx-depth` (0 à 1) sur chaque calque : profondeur
- `data-fx-range` (24) : amplitude en pixels

## Quand l'utiliser
Illustrations en couches, héros de page, cartes produit.

## Quand l'éviter
Les compositions où les calques doivent rester alignés.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, les calques restent immobiles.
