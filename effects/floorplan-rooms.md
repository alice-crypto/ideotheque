# `floorplan-rooms`

**Catégorie :** Micro-interaction

## Intention
Un plan montre le nom et la surface de la pièce survolée, sur le total du logement.

## Ce qu'on ressent
On se promène déjà dans l'appartement.

## Utilisation
```html
<div data-fx="floorplan-rooms" data-fx-items="Séjour:0,0,100,100:28"></div>
```

## Paramètres
- `data-fx-items` : « pièce:x,y,largeur,hauteur:surface » séparés par `|`

## Quand l'utiliser
Annonces, promoteurs, salles à louer.

## Quand l'éviter
Un plan non contractuel présenté comme exact.

## Accessibilité
Chaque pièce est un bouton, et le détail est annoncé ; il s'obtient aussi au focus.
