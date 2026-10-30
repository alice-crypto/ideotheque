# `scroll-cue`

**Catégorie :** Présentation

## Intention
Une petite souris dont la molette descend en boucle, pour inviter à faire défiler.

## Ce qu'on ressent
Discret, guide, classique bien fait.

## Utilisation
```html
<span data-fx="scroll-cue" aria-hidden="true"></span>
```

## Paramètres
Aucun paramètre : la couleur suit le texte.

## Quand l'utiliser
Bas d'un écran d'accueil plein écran.

## Quand l'éviter
Les pages courtes, et sur mobile (préférez une flèche).

## Accessibilité
Décoratif : ajoutez `aria-hidden="true"`. Avec `prefers-reduced-motion: reduce`, l'animation est figée.
