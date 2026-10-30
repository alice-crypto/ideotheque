# `stroke-fill`

**Catégorie :** Texte

## Intention
Un texte en contour se remplit de couleur au survol, de gauche à droite.

## Ce qu'on ressent
Graphique, affirmé, très « studio ».

## Utilisation
```html
<a href="…" data-fx="stroke-fill">Projets</a>
```

## Paramètres
- Couleur : celle du texte (`color`)
- La classe `fx-active` force l'état rempli

## Quand l'utiliser
Grands titres de navigation, noms de projets dans une liste.

## Quand l'éviter
Les petits textes : le contour devient illisible sous 24 px.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'effet est désactivé et le contenu s'affiche directement.
