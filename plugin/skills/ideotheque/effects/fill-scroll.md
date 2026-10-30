# `fill-scroll`

**Catégorie :** Défilement

## Intention
Le texte se remplit de couleur de gauche à droite à mesure qu'il entre à l'écran.

## Ce qu'on ressent
Progressif, une jauge en lettres.

## Utilisation
```html
<h2 data-fx="fill-scroll">Progression</h2>
```

## Paramètres
- `--fx-fill` (couleur du texte) : couleur pleine
- `--fx-empty` : couleur avant remplissage

## Quand l'utiliser
Grands titres, chiffres, mots clés.

## Quand l'éviter
Les textes sur plusieurs lignes : chaque ligne se remplit en même temps.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'élément reste dans son état final, sans suivre le défilement.
