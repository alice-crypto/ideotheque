# `pixelate`

**Catégorie :** Image

## Intention
L'image s'affiche en gros pixels et devient nette progressivement au survol.

## Ce qu'on ressent
Rétro, jeu vidéo, révélation.

## Utilisation
```html
<figure data-fx="pixelate"><img src="…" alt="…"></figure>
```

## Paramètres
- `data-fx-block` (22) : taille des pixels au repos
- L'image doit venir du même site (ou autoriser le CORS)

## Quand l'utiliser
Vignettes de jeux, contenus « mystère », galeries rétro.

## Quand l'éviter
Les images indispensables à la compréhension : au repos, elles sont illisibles.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'image est nette directement. Gardez un texte alternatif (`alt`) sur l'image d'origine : l'effet ne le modifie pas.
