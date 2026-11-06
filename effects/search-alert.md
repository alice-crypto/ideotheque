# `search-alert`

**Catégorie :** Micro-interaction

## Intention
Un bouton enregistre une recherche, la cloche sonne et les critères sont rappelés.

## Ce qu'on ressent
Le site travaille pour vous pendant que vous dormez.

## Utilisation
```html
<div data-fx="search-alert" data-fx-criteria="T3, Lyon"></div>
```

## Paramètres
- `data-fx-criteria`, `data-fx-key` ; événement `fx:alert`

## Quand l'utiliser
Annonces, emploi, prix de billets.

## Quand l'éviter
De confirmer une alerte sans vrai envoi derrière : branchez l'événement à un service.

## Accessibilité
Bouton `aria-pressed`, message annoncé.
