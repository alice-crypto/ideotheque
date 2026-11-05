# `cursor-menu-ring`

**Catégorie :** Navigation

## Intention
Un clic droit ouvre un menu en cercle sous le curseur, et les actions rejoignent leur place autour de lui.

## Ce qu'on ressent
Outil de création, geste rapide de professionnel.

## Utilisation
```html
<div style="position:relative"><div data-fx="cursor-menu-ring"><button>A</button><button>B</button></div></div>
```

## Paramètres
- `data-fx-radius` (62) : rayon du cercle
- Le parent de l'élément reçoit le clic droit.

## Quand l'utiliser
Éditeurs, jeux, outils de dessin.

## Quand l'éviter
Un site public : le clic droit n'y est pas un geste attendu.

## Accessibilité
Navigation aux flèches, Échap pour fermer. Prévoyez aussi un accès aux mêmes actions ailleurs.
