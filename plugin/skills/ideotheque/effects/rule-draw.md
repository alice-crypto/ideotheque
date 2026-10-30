# `rule-draw`

**Catégorie :** Entrée

## Intention
Un filet horizontal se trace depuis le centre jusqu'aux bords.

## Ce qu'on ressent
Structurant, discret, précis.

## Utilisation
```html
<hr data-fx="rule-draw">
```

## Paramètres
- `--fx-duration` (700ms), `--fx-delay` (0ms) — durée réelle 1,4 fois plus longue
- `--fx-origin` (50%) : point de départ (0% = gauche)

## Quand l'utiliser
Séparateurs de section, soulignés de titre, lignes de tableau.

## Quand l'éviter
Les éléments qui ne sont pas des lignes : tout l'élément est écrasé horizontalement au départ.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'effet est désactivé et le contenu s'affiche directement.
