# `dot-matrix`

**Catégorie :** Texte

## Intention
Le titre s'allume point par point, de gauche à droite, comme un panneau d'affichage.

## Ce qu'on ressent
Technique, signalétique, gare ou stade.

## Utilisation
```html
<h2 data-fx="dot-matrix">Départ 08:42</h2>
```

## Paramètres
- `data-fx-step` (4) : écart entre les points en pixels
- `data-fx-duration` (1200) : durée en millisecondes

## Quand l'utiliser
Grands titres techniques, tableaux de bord, chiffres d'annonce.

## Quand l'éviter
Les petites tailles : sous 28 px, les points ne forment plus de lettres.

## Accessibilité
Le texte est dans `aria-label`. Avec `prefers-reduced-motion: reduce`, le panneau s'affiche tout de suite.
