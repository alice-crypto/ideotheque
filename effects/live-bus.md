# `live-bus`

**Catégorie :** État

## Intention
Un point suit le bus d'arrêt en arrêt, et le temps avant votre arrêt se met à jour.

## Ce qu'on ressent
On reste au chaud jusqu'à la bonne minute.

## Utilisation
```html
<div data-fx="live-bus" data-fx-items="Mairie|Vous"></div>
```

## Paramètres
- `data-fx-items` : arrêts dont `Vous`
- `data-fx-step` (2), `data-fx-every` (2800)

## Quand l'utiliser
Bus, livraisons, navettes.

## Quand l'éviter
Une simulation en production : reliez la position à de vraies données.

## Accessibilité
Liste ordonnée, temps annoncé.
