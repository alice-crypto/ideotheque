# `world-clock`

**Catégorie :** État

## Intention
Plusieurs villes affichent leur heure réelle, sur une bande de jour et de nuit.

## Ce qu'on ressent
Le monde entier sur une même ligne.

## Utilisation
```html
<div data-fx="world-clock" data-fx-items="Paris:Europe/Paris|Tokyo:Asia/Tokyo"></div>
```

## Paramètres
- `data-fx-items` : « ville:fuseau IANA » séparés par `|`

## Quand l'utiliser
Équipes à distance, agences, conférences.

## Quand l'éviter
De prendre la bande pour la vraie durée du jour : elle ne tient pas compte de la saison.

## Accessibilité
Heures écrites en texte, bandes décoratives.
