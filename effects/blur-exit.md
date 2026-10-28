# `blur-exit`

**Catégorie :** Défilement

## Intention
L'élément devient flou et s'estompe en quittant l'écran par le haut.

## Ce qu'on ressent
Onirique, la page « défocalise » ce qui est passé.

## Utilisation
```html
<header data-fx="blur-exit">…</header>
```

## Paramètres
Aucun paramètre (flou maximal 14 px).

## Quand l'utiliser
Visuels de héros, citations.

## Quand l'éviter
Plusieurs éléments par écran (le flou coûte en performances).

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'élément reste dans son état final, sans suivre le défilement.
