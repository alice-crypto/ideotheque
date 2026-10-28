# `image-text`

**Catégorie :** Texte

## Intention
Une image ou un dégradé se promène lentement à l'intérieur des lettres.

## Ce qu'on ressent
Riche, texturé, éditorial.

## Utilisation
```html
<h1 data-fx="image-text" style="background-image:url(photo.jpg)">MER</h1>
```

## Paramètres
- Image : `style="background-image:url(…)"` sur l'élément (un dégradé par défaut)

## Quand l'utiliser
Très grands titres, mots isolés.

## Quand l'éviter
Les textes fins ou petits : l'image ne se voit pas.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'effet est désactivé et le contenu s'affiche directement.
