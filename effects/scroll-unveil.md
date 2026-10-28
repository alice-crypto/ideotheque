# `scroll-unveil`

**Catégorie :** Défilement

## Intention
Le visuel se dévoile du bas vers le haut à mesure qu'il entre à l'écran.

## Ce qu'on ressent
Progressif, comme un store qu'on remonte.

## Utilisation
```html
<figure data-fx="scroll-unveil">…</figure>
```

## Paramètres
Aucun paramètre.

## Quand l'utiliser
Grandes images, vidéos, aplats de couleur.

## Quand l'éviter
Les éléments en haut de page : ils seraient à moitié cachés au chargement.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'élément reste dans son état final, sans suivre le défilement.
