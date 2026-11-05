# `zoom-out-frame`

**Catégorie :** Défilement

## Intention
L'image part très agrandie et recule au fil du défilement jusqu'à entrer dans son cadre.

## Ce qu'on ressent
Prise de recul, on découvre le contexte.

## Utilisation
```html
<figure data-fx="zoom-out-frame"><img src="photo.jpg" alt="…"></figure>
```

## Paramètres
- `data-fx-from` (.8) : agrandissement de départ

## Quand l'utiliser
Photos de paysages, de produits.

## Quand l'éviter
Les images de petite résolution.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'effet est désactivé et le contenu s'affiche directement.
