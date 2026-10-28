# `proximity-weight`

**Catégorie :** Texte

## Intention
Les lettres proches du curseur s'épaississent et prennent la couleur d'accent.

## Ce qu'on ressent
Tactile, le texte réagit comme une matière.

## Utilisation
```html
<h1 data-fx="proximity-weight">Survolez-moi</h1>
```

## Paramètres
- `data-fx-reach` (120) : rayon d'influence en pixels
- Fonctionne mieux avec une police variable

## Quand l'utiliser
Grands titres de page d'accueil, mots isolés.

## Quand l'éviter
Les textes de lecture et les écrans tactiles (aucun survol).

## Accessibilité
Le texte d'origine reste lisible par les lecteurs d'écran via `aria-label`.
