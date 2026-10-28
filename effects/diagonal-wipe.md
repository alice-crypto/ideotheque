# `diagonal-wipe`

**Catégorie :** Entrée

## Intention
Un bord en biais balaie l'élément de gauche à droite et le révèle.

## Ce qu'on ressent
Dynamique, éditorial, sportif.

## Utilisation
```html
<figure data-fx="diagonal-wipe">…</figure>
```

## Paramètres
- `--fx-duration` (700ms), `--fx-delay` (0ms) — durée réelle 1,4 fois plus longue

## Quand l'utiliser
Images de couverture, bandeaux, titres en aplat.

## Quand l'éviter
Les petits éléments : le biais ne se remarque pas.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'effet est désactivé et le contenu s'affiche directement.
