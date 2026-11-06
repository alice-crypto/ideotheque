# `timetable-grid`

**Catégorie :** Présentation

## Intention
Une grille horaire estompe les passages finis et fait ressortir le prochain.

## Ce qu'on ressent
On trouve tout de suite, là où l'œil fatigue sur une vraie fiche.

## Utilisation
```html
<div data-fx="timetable-grid" data-fx-items="7:05,20|8:05"></div>
```

## Paramètres
- `data-fx-items` : « heure:minutes,minutes » séparés par `|`

## Quand l'utiliser
Bus, navettes, séances, créneaux.

## Quand l'éviter
De gérer des jours fériés avec cet outil : prévoyez une grille par calendrier.

## Accessibilité
Vrai tableau, le prochain passage est aussi écrit en phrase.
