# `slide-in`

**Catégorie :** Entrée

## Intention
Le contenu glisse depuis un côté de l'écran, au choix gauche, droite, haut ou bas.

## Ce qu'on ressent
Directionnel, il indique d'où vient l'information.

## Utilisation
```html
<div data-fx="slide-in" data-fx-from="right">…</div>
```

## Paramètres
- `--fx-duration` (700ms), `--fx-delay` (0ms)
- `data-fx-from` (left) : left, right, up ou down
- `--fx-distance` (24px, multiplié par 2,5)

## Quand l'utiliser
Colonnes texte/image qui arrivent chacune de leur côté, étapes d'un parcours.

## Quand l'éviter
Les éléments collés au bord de l'écran : le glissement provoque un défilement horizontal parasite si le parent ne masque pas le débordement.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'effet est désactivé et le contenu s'affiche directement.
