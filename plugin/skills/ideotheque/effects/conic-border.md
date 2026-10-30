# `conic-border`

**Catégorie :** Micro-interaction

## Intention
Une bordure dégradée tourne en continu autour de l'élément.

## Ce qu'on ressent
Électrique, technologique, il attire l'œil.

## Utilisation
```html
<div data-fx="conic-border">Recommandé</div>
```

## Paramètres
- `--fx-surface` (#131317) : couleur du fond intérieur
- `--fx-accent`, `--fx-accent-2` : couleurs du dégradé

## Quand l'utiliser
Une carte recommandée, un bouton d'appel, un encart « nouveau ».

## Quand l'éviter
Plusieurs fois par écran : l'œil ne sait plus où aller.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, la bordure reste fixe. Utilise `@property` : sur un navigateur ancien, la bordure est fixe.
