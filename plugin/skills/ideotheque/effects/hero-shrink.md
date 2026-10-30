# `hero-shrink`

**Catégorie :** Défilement

## Intention
En quittant l'écran, le bloc rétrécit légèrement et ses coins s'arrondissent, comme une carte qu'on range.

## Ce qu'on ressent
Élégant, il donne une profondeur à la page.

## Utilisation
```html
<section data-fx="hero-shrink">…</section>
```

## Paramètres
- `--fx-radius` (32px) : arrondi maximal

## Quand l'utiliser
Grand visuel d'en-tête, vidéo plein écran.

## Quand l'éviter
Les blocs de petite taille : l'effet est imperceptible.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'élément reste dans son état final, sans suivre le défilement.
