# `block-reveal`

**Catégorie :** Entrée

## Intention
Un bloc de couleur traverse l'élément de gauche à droite ; le contenu apparaît derrière lui.

## Ce qu'on ressent
Graphique, rythmé, très « agence ».

## Utilisation
```html
<h2 data-fx="block-reveal"><span>Projets</span></h2>
```

## Paramètres
- `--fx-duration` (700ms), `--fx-delay` (0ms)
- `--fx-block` (accent) : couleur du bloc
- Le contenu doit être dans des enfants directs de l'élément

## Quand l'utiliser
Titres de section, images de projets, chiffres clés.

## Quand l'éviter
Les éléments sans enfant (texte brut) : il faut au moins un enfant à faire apparaître.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'effet est désactivé et le contenu s'affiche directement.
