# `sleep-stages`

**Catégorie :** Présentation

## Intention
Une nuit se dessine en escalier, avec le temps passé dans chaque stade.

## Ce qu'on ressent
Une histoire de sa nuit, lisible au réveil.

## Utilisation
```html
<div data-fx="sleep-stages" data-fx-data="0:10,1:40,2:50"></div>
```

## Paramètres
- `data-fx-data` : « stade:minutes » séparés par des virgules (0 éveil, 1 léger, 2 profond, 3 paradoxal)

## Quand l'utiliser
Montres, sommeil, données de capteurs par états.

## Quand l'éviter
Une précision clinique que les capteurs grand public n'ont pas.

## Accessibilité
Le tracé est décoratif : les durées sont écrites dans une liste.
