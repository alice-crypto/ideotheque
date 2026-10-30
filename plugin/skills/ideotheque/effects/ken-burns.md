# `ken-burns`

**Catégorie :** Image

## Intention
L'image avance et glisse très lentement en boucle, comme dans un documentaire.

## Ce qu'on ressent
Contemplatif, narratif, vivant sans être agité.

## Utilisation
```html
<figure data-fx="ken-burns"><img src="…" alt="…"></figure>
```

## Paramètres
- `--fx-kb` (18s) : durée d'un aller
- `--fx-kb-origin` (30% 40%) : point vers lequel on avance

## Quand l'utiliser
Images de fond de héros, diaporamas, portraits.

## Quand l'éviter
Les images contenant du texte.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'image reste fixe. Gardez un texte alternatif (`alt`) sur l'image d'origine : l'effet ne le modifie pas.
