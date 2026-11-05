# `depth-stack`

**Catégorie :** Défilement

## Intention
Plusieurs couches se déplacent à des vitesses différentes selon leur profondeur.

## Ce qu'on ressent
Un diorama en papier, un paysage qui s'étage.

## Utilisation
```html
<div data-fx="depth-stack"><img data-depth=".2" …><img data-depth=".8" …></div>
```

## Paramètres
- `data-fx-amp` (180) : amplitude en pixels
- `data-depth` sur chaque enfant : profondeur entre 0 et 1

## Quand l'utiliser
Scènes illustrées, en-têtes de page.

## Quand l'éviter
Les textes à lire : ils se chevauchent en mouvement.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'effet est désactivé et le contenu s'affiche directement.
