# `dot-swell`

**Catégorie :** Défilement

## Intention
Une vague de points gonfle et traverse une grille au fil du défilement.

## Ce qu'on ressent
Trame d'imprimerie vivante, onde dans un tissu.

## Utilisation
```html
<section data-fx="dot-swell">…</section>
```

## Paramètres
- `data-fx-step` (16) : écart entre les points
- `--fx-dot` : couleur des points

## Quand l'utiliser
Fonds d'une section sans image.

## Quand l'éviter
Sous un texte fin : la trame gêne la lecture.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'effet est désactivé et le contenu s'affiche directement.
