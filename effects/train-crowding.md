# `train-crowding`

**Catégorie :** Présentation

## Intention
Chaque voiture d'un train se remplit selon l'affluence, et la plus calme est indiquée.

## Ce qu'on ressent
Trois pas de plus sur le quai, et une place assise.

## Utilisation
```html
<div data-fx="train-crowding" data-fx-data="90,70,35"></div>
```

## Paramètres
- `data-fx-data` : occupation en % par voiture, séparée par des virgules

## Quand l'utiliser
Trains, métros, salles à plusieurs zones.

## Quand l'éviter
Des données non actualisées : c'est frustrant de se déplacer pour rien.

## Accessibilité
Le schéma a une description complète dans `aria-label`.
