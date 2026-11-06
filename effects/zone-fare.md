# `zone-fare`

**Catégorie :** Micro-interaction

## Intention
Des zones en anneaux s'allument et donnent le tarif du trajet.

## Ce qu'on ressent
La grille de tarifs devient enfin évidente.

## Utilisation
```html
<div data-fx="zone-fare" data-fx-prices="1.9,2.8,3.9"></div>
```

## Paramètres
- `data-fx-prices` : prix par nombre de zones traversées

## Quand l'utiliser
Réseaux de transport, livraison par zones.

## Quand l'éviter
Un réseau qui n'est pas en anneaux : le dessin serait trompeur.

## Accessibilité
Boutons nommés, zones et prix annoncés.
