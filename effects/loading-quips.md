# `loading-quips`

**Catégorie :** État

## Intention
Pendant un chargement, des phrases sympathiques se succèdent au-dessus d'une barre qui avance.

## Ce qu'on ressent
Drôle, humain, l'attente devient un moment de marque.

## Utilisation
```html
<div data-fx="loading-quips" data-fx-messages="On allume le four…|On coupe les légumes…"></div>
```

## Paramètres
- `data-fx-messages` : phrases séparées par « | »
- `data-fx-interval` (1800) : durée par phrase en ms

## Quand l'utiliser
Écrans de chargement de marques à forte personnalité, générations longues.

## Quand l'éviter
Les chargements de moins de deux secondes.

## Accessibilité
Le conteneur a `role="status"` : chaque phrase est annoncée.
