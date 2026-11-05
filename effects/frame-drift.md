# `frame-drift`

**Catégorie :** Défilement

## Intention
L'image glisse lentement à l'intérieur de son cadre, qui reste immobile.

## Ce qu'on ressent
Une fenêtre de train, le monde passe derrière.

## Utilisation
```html
<figure data-fx="frame-drift"><img src="photo.jpg" alt=""></figure>
```

## Paramètres
- `data-fx-range` (16) : course en pourcentage
- `--fx-zoom` (1.25) : agrandissement de l'image

## Quand l'utiliser
Portfolios, images d'articles.

## Quand l'éviter
Les images recadrées avec précision : leurs bords sont coupés.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'effet est désactivé et le contenu s'affiche directement.
