# `kitchen-ticket`

**Catégorie :** État

## Intention
Un bon de cuisine compte le temps écoulé, et ses plats se barrent à l'envoi.

## Ce qu'on ressent
Le rythme d'un service, ses coups de feu.

## Utilisation
```html
<div data-fx="kitchen-ticket" data-fx-table="12"></div>
```

## Paramètres
- `data-fx-items`, `data-fx-table`, `data-fx-limit` (15), `data-fx-past` (7)

## Quand l'utiliser
Restaurants, ateliers, commandes en cours.

## Quand l'éviter
D'en faire un vrai système de caisse : les données restent dans la page.

## Accessibilité
Plats en boutons `aria-pressed`, reste annoncé.
