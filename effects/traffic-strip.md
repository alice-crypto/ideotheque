# `traffic-strip`

**Catégorie :** Présentation

## Intention
Une bande d'itinéraire montre le trafic par tronçon, avec le retard calculé.

## Ce qu'on ressent
On comprend le retard d'un coup d'œil.

## Utilisation
```html
<div data-fx="traffic-strip" data-fx-items="8:60:0|3:15:2"></div>
```

## Paramètres
- `data-fx-items` : « km:vitesse:niveau (0, 1 ou 2) » séparés par `|`

## Quand l'utiliser
Navigation, livraison, itinéraires.

## Quand l'éviter
De se fier à la seule couleur : le retard reste aussi écrit.

## Accessibilité
Le résumé est écrit. La bande est décorative.
