# `flow-field`

**Catégorie :** Ambiance

## Intention
Des milliers de petits traits suivent un courant invisible et dessinent des veines qui s'effacent lentement.

## Ce qu'on ressent
Vent sur le sable, topographie vivante.

## Utilisation
```html
<section data-fx="flow-field">…</section>
```

## Paramètres
- `data-fx-count` (140) : nombre de particules
- `data-fx-scale` (.006) : taille des tourbillons
- `--fx-line` : couleur

## Quand l'utiliser
Fonds d'accueil, sections sans image.

## Quand l'éviter
Sous un texte fin, et sur les appareils modestes avec un grand nombre de particules.

## Accessibilité
Le canvas est décoratif. Avec `prefers-reduced-motion: reduce`, il affiche une image fixe.
