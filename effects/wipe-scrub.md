# `wipe-scrub`

**Catégorie :** Défilement

## Intention
Un balayage en biais au bord adouci dévoile l'élément au fil du défilement.

## Ce qu'on ressent
Essuie-glace sur une vitre embuée.

## Utilisation
```html
<img data-fx="wipe-scrub" src="photo.jpg" alt="">
```

## Paramètres
- `--fx-angle` (110deg) : angle du balayage
- `--fx-soft` (20%) : douceur du bord

## Quand l'utiliser
Images et titres en grand.

## Quand l'éviter
Les contenus qu'il faut lire à l'arrivée.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'effet est désactivé et le contenu s'affiche directement.
