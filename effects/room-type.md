# `room-type`

**Catégorie :** Micro-interaction

## Intention
Le type de chambre choisi affiche ses détails, et un carré montre sa surface à l'échelle.

## Ce qu'on ressent
On compare les chambres sans ouvrir trois pages.

## Utilisation
```html
<div data-fx="room-type" data-fx-items="Classique:18:1 grand lit:Cour:119"></div>
```

## Paramètres
- `data-fx-items` : « nom:m²:lit:vue:prix » séparés par `|`

## Quand l'utiliser
Hôtels, locations, offres à plusieurs niveaux.

## Quand l'éviter
Un prix « à partir de » trop éloigné de la réalité du séjour.

## Accessibilité
Groupe radio nommé, détails annoncés.
