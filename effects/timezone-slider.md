# `timezone-slider`

**Catégorie :** Micro-interaction

## Intention
Un curseur déplace l'heure, et donne celle des autres villes avec leur vrai fuseau.

## Ce qu'on ressent
Trouver enfin la réunion où personne ne dort.

## Utilisation
```html
<div data-fx="timezone-slider" data-fx-items="Paris:Europe/Paris|Tokyo:Asia/Tokyo"></div>
```

## Paramètres
- `data-fx-items` : « ville:fuseau IANA » séparés par `|`

## Quand l'utiliser
Voyages, équipes à distance, conférences.

## Quand l'éviter
D'oublier les jours fériés locaux : seuls les fuseaux sont gérés.

## Accessibilité
Curseur nommé, heures écrites, bilan annoncé.
