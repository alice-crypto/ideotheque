# `line-draw-box`

**Catégorie :** Entrée

## Intention
Un cadre se dessine autour du contenu, puis celui-ci apparaît.

## Ce qu'on ressent
Plan d'architecte, soin du détail.

## Utilisation
```html
<div data-fx="line-draw-box"><p>…</p></div>
```

## Paramètres
- `data-fx-radius` (10), `--fx-line`

## Quand l'utiliser
Cartes, chiffres, encadrés.

## Quand l'éviter
Un élément dont la taille change pendant l'animation.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'effet est désactivé et le contenu s'affiche directement.
