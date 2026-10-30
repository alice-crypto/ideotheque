# `scroll-rotate`

**Catégorie :** Défilement

## Intention
L'élément tourne sur lui-même au rythme du défilement.

## Ce qu'on ressent
Mécanique, joueur, comme un engrenage.

## Utilisation
```html
<img data-fx="scroll-rotate" src="badge.svg" alt="…">
```

## Paramètres
- `--fx-turn` (360deg) : rotation totale pendant la traversée de l'écran

## Quand l'utiliser
Badges circulaires, logos, formes décoratives.

## Quand l'éviter
Le texte et les images avec un sens de lecture.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'élément reste dans son état final, sans suivre le défilement.
