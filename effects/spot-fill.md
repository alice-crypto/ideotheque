# `spot-fill`

**Catégorie :** Texte

## Intention
Un titre en simple contour se remplit de couleur seulement autour du curseur.

## Ce qu'on ressent
Une lampe qu'on promène sur une enseigne éteinte.

## Utilisation
```html
<h1 data-fx="spot-fill">Lumière</h1>
```

## Paramètres
- `--fx-size` (90px) : rayon du halo
- `--fx-fill` : couleur du remplissage
- `--fx-stroke` : couleur du contour

## Quand l'utiliser
Titres sur fond sombre, écrans d'accueil.

## Quand l'éviter
Les petits textes, dont le contour devient illisible.

## Accessibilité
Le texte reste lisible en contour. Avec `prefers-reduced-motion: reduce`, le halo ne se déplace plus tout seul.
