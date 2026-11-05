# `hover-zoom-pan`

**Catégorie :** Image

## Intention
Au survol, l'image s'agrandit et suit le curseur pour montrer les détails.

## Ce qu'on ressent
Loupe de joaillier, on inspecte le produit.

## Utilisation
```html
<figure data-fx="hover-zoom-pan"><img src="produit.jpg" alt="…"></figure>
```

## Paramètres
- `--fx-zoom` (2) : agrandissement

## Quand l'utiliser
Fiches produit, cartes, œuvres.

## Quand l'éviter
Une image de faible résolution.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'effet est désactivé et le contenu s'affiche directement.
