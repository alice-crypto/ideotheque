# `circle-text`

**Catégorie :** Présentation

## Intention
Un texte écrit en cercle tourne lentement, comme un tampon ou un autocollant.

## Ce qu'on ressent
Graphique, « badge », street.

## Utilisation
```html
<div data-fx="circle-text">Ouvert aux projets</div>
```

## Paramètres
- `--fx-size` (140px) : diamètre
- `--fx-spin` (14s) : durée d'un tour
- Un « • » est ajouté en fin de texte pour boucler

## Quand l'utiliser
Badges « Disponible », « Nouveau », boutons ronds de défilement.

## Quand l'éviter
Les textes longs (plus de 30 caractères) : les lettres se chevauchent.

## Accessibilité
Le texte est exposé via `aria-label`. Avec `prefers-reduced-motion: reduce`, l'animation est figée.
