# `logo-cycle`

**Catégorie :** Présentation

## Intention
Quelques emplacements font tourner, à tour de rôle, une collection plus grande de logos.

## Ce qu'on ressent
Vivant, preuve sociale sans encombrer.

## Utilisation
```html
<div data-fx="logo-cycle" data-fx-slots="4">
  <img …><img …><img …><img …><img …><img …>
</div>
```

## Paramètres
- `data-fx-slots` (3) : nombre d'emplacements
- `data-fx-interval` (1800) : délai entre deux changements
- `--fx-slot-h` (56px)

## Quand l'utiliser
Logos de clients, partenaires, médias.

## Quand l'éviter
Moins de logos que d'emplacements + 1 : rien ne tourne.

## Accessibilité
Tous les logos restent dans le document ; ceux qui ne sont pas affichés en sont retirés le temps de leur absence. Avec `prefers-reduced-motion: reduce`, l'animation est figée.
