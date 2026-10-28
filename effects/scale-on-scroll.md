# `scale-on-scroll`

**Catégorie :** Défilement

## Intention
L'élément grandit de 70 % à sa taille réelle et devient opaque à mesure qu'il entre à l'écran.

## Ce qu'on ressent
Progressif, il « arrive » vers le lecteur.

## Utilisation
```html
<figure data-fx="scale-on-scroll">…</figure>
```

## Paramètres
Aucun paramètre.

## Quand l'utiliser
Visuels de section, mockups, citations.

## Quand l'éviter
Les éléments en haut de page (ils sont déjà à moitié entrés au chargement).

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'élément reste dans son état final, sans suivre le défilement.
