# `cursor-compass`

**Catégorie :** Micro-interaction

## Intention
Une grille d'aiguilles s'oriente toute entière vers le curseur, comme des boussoles.

## Ce qu'on ressent
La page entière vous regarde, champ magnétique.

## Utilisation
```html
<div data-fx="cursor-compass"></div>
```

## Paramètres
- `data-fx-count` (42), `--fx-cols` (7), `--fx-gap` (10px)

## Quand l'utiliser
Décors de section d'accueil, écrans de jeu.

## Quand l'éviter
De grandes grilles : le calcul se fait à chaque mouvement.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'effet est désactivé et le contenu s'affiche directement.
