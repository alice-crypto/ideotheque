# `half-shift`

**Catégorie :** Texte

## Intention
Le mot est coupé à l'horizontale, et ses deux moitiés glissent en sens contraire au défilement.

## Ce qu'on ressent
Tension, faille, le titre se recale exactement au centre de l'écran.

## Utilisation
```html
<h2 data-fx="half-shift">Rupture</h2>
```

## Paramètres
- `data-fx-shift` (60) : amplitude en pixels

## Quand l'utiliser
Grands titres de section en capitales.

## Quand l'éviter
Les petites tailles et les textes de plusieurs lignes.

## Accessibilité
Le texte est dans `aria-label`, les deux copies sont masquées aux lecteurs d'écran.
