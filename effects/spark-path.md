# `spark-path`

**Catégorie :** Défilement

## Intention
Des grains s'allument un à un le long d'un tracé, comme des bulles qui montent au fil du défilement.

## Ce qu'on ressent
Une trace légère, qui donne envie de la suivre jusqu'au bout.

## Utilisation
```html
<div data-fx="spark-path" style="height:400px;width:200px"></div>
```

## Paramètres
- `data-fx-d` : le tracé SVG (repère 200 × 400)
- `data-fx-count` (46)
- `--fx-accent`
- `data-fx-auto` (en ms) : boucle sans défilement

## Quand l'utiliser
Dans la marge d'une section, pour guider l'œil vers un appel à l'action.

## Quand l'éviter
Par-dessus un texte : les grains deviennent du bruit.

## Accessibilité
Décoratif (`aria-hidden`). Mouvement réduit : le tracé est déjà complet.
