# `dither-reveal`

**Catégorie :** Image

## Intention
L'image apparaît en tramage noir et blanc de type 1-bit, puis passe par paliers à ses vraies couleurs.

## Ce qu'on ressent
Vieil ordinateur, écran qui se réveille.

## Utilisation
```html
<figure data-fx="dither-reveal"><img src="photo.jpg" alt="…"></figure>
```

## Paramètres
- `data-fx-pixel` (3) : taille d'un point
- `--fx-speed` (1.4s) : durée du passage

## Quand l'utiliser
Portfolios, culture numérique, archives.

## Quand l'éviter
Les images hébergées sur un autre domaine sans CORS.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'effet est désactivé et le contenu s'affiche directement.
