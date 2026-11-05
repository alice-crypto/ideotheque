# `reading-time-bar`

**Catégorie :** Texte

## Intention
Un petit bandeau indique le temps de lecture restant et avance avec la lecture.

## Ce qu'on ressent
Respectueux, on sait à quoi s'engager.

## Utilisation
```html
<div data-fx="reading-time-bar" data-fx-target="article"></div>
```

## Paramètres
- `data-fx-target` (article), `data-fx-wpm` (220) : mots par minute

## Quand l'utiliser
Articles, guides, documentation.

## Quand l'éviter
Les textes de moins d'une minute.

## Accessibilité
Rôle `status` ; le texte ne change que chaque minute, pour ne pas bavarder.
