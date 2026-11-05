# `x-ray`

**Catégorie :** Image

## Intention
Le curseur fait apparaître une seconde image dans un cercle, comme une radio de la première.

## Ce qu'on ressent
Regard à travers la matière, on découvre ce qu'il y a dessous.

## Utilisation
```html
<figure data-fx="x-ray"><img src="objet.jpg" alt="…"><img src="coupe.jpg" alt="…"></figure>
```

## Paramètres
- `data-fx-radius` (70) : rayon de la lentille
- `data-fx-auto="true"` : la lentille se déplace seule

## Quand l'utiliser
Avant / après, coupe d'un objet, plan et photo.

## Quand l'éviter
Une seconde image qui porte une information essentielle : elle reste cachée sans curseur.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'effet est désactivé et le contenu s'affiche directement.
