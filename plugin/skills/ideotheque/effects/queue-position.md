# `queue-position`

**Catégorie :** État

## Intention
Une file d'attente qui avance : on voit sa place et le nombre de personnes restantes.

## Ce qu'on ressent
Attente honnête, on sait où on en est.

## Utilisation
```html
<div data-fx="queue-position" data-fx-start="4"></div>
```

## Paramètres
- `data-fx-start` (6), `data-fx-every` (1.4), `data-fx-loop`
- L'élément émet `fx:ready`.

## Quand l'utiliser
Files d'attente, services très demandés, modèles d'IA.

## Quand l'éviter
De fausses files d'attente, pour créer une rareté qui n'existe pas.

## Accessibilité
Rôle `status`, avec un message en toutes lettres.
