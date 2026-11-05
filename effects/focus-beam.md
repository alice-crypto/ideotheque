# `focus-beam`

**Catégorie :** Micro-interaction

## Intention
Le cadre de focus glisse d'un champ à l'autre au lieu d'apparaître et de disparaître.

## Ce qu'on ressent
On sent le parcours, le clavier devient un plaisir.

## Utilisation
```html
<form data-fx="focus-beam"><input><input></form>
```

## Paramètres
- `--fx-radius` (8px) : arrondi du cadre

## Quand l'utiliser
Formulaires, barres d'outils, palettes de commandes.

## Quand l'éviter
Rien à éviter en général, mais gardez un focus visible si le JS est absent.

## Accessibilité
Rend le focus plus visible, sans le remplacer pour la navigation au clavier.
