# `thread-line`

**Catégorie :** Défilement

## Intention
Un fil vertical se remplit de couleur le long d'une section, à mesure qu'on avance.

## Ce qu'on ressent
On suit un parcours, on sait où on en est.

## Utilisation
```html
<section data-fx="thread-line">…</section>
```

## Paramètres
- `--fx-rail` : couleur du rail
- `--fx-pad` (28px) : retrait du contenu

## Quand l'utiliser
Frises, étapes, longs articles.

## Quand l'éviter
Les sections plus courtes qu'un écran : le fil se remplit trop vite.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'effet est désactivé et le contenu s'affiche directement.
