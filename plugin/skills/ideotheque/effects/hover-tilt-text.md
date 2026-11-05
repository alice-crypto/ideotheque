# `hover-tilt-text`

**Catégorie :** Micro-interaction

## Intention
Le mot pivote en 3D vers le curseur et son ombre se déplace à l'opposé.

## Ce qu'on ressent
Relief d'une enseigne, mot qu'on regarde de biais.

## Utilisation
```html
<h2 data-fx="hover-tilt-text">Relief</h2>
```

## Paramètres
- `data-fx-max` (26) : angle maximal en degrés
- `--fx-tilt-shadow` : couleur de l'ombre

## Quand l'utiliser
Titres courts, numéros, logos.

## Quand l'éviter
Les paragraphes.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'effet est désactivé et le contenu s'affiche directement.
