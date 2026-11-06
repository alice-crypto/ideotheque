# `traffic-light`

**Catégorie :** État

## Intention
Un feu tricolore indique un état, écrit en toutes lettres à côté.

## Ce qu'on ressent
Universel : tout le monde sait le lire.

## Utilisation
```html
<div data-fx="traffic-light" data-fx-state="2"></div>
```

## Paramètres
- `data-fx-items` : trois mots séparés par `|`
- `data-fx-state` (0, 1 ou 2)

## Quand l'utiliser
Statuts, pré-départ, disponibilité d'un service.

## Quand l'éviter
De se limiter à la couleur : le texte reste indispensable.

## Accessibilité
Le texte est annoncé, et le feu est décoratif.
