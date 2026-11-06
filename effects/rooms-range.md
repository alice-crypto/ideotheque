# `rooms-range`

**Catégorie :** Micro-interaction

## Intention
Deux clics sur des pastilles définissent une plage continue, soudée en une barre.

## Ce qu'on ressent
Plus rapide que deux menus déroulants.

## Utilisation
```html
<div data-fx="rooms-range" data-fx-items="Studio,2,3,4,5+"></div>
```

## Paramètres
- `data-fx-items` : valeurs séparées par des virgules
- événement `fx:range`

## Quand l'utiliser
Filtres d'annonces, tailles de vêtements, plages de prix.

## Quand l'éviter
Plus de sept valeurs : le geste devient imprécis.

## Accessibilité
Groupe nommé, boutons `aria-pressed`, résumé annoncé.
