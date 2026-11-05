# `cross-rows`

**Catégorie :** Défilement

## Intention
Plusieurs lignes d'images ou de logos glissent en sens opposé au défilement.

## Ce qu'on ressent
Un tissage, une foule en mouvement.

## Utilisation
```html
<div data-fx="cross-rows"><div>…</div><div>…</div></div>
```

## Paramètres
- `data-fx-travel` (160) : déplacement en pixels
- `--fx-gap` (10px) : écart

## Quand l'utiliser
Murs de logos, galeries d'images, références clients.

## Quand l'éviter
Les contenus qu'il faut comparer ligne à ligne.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'effet est désactivé et le contenu s'affiche directement.
