# `image-pop-link`

**Catégorie :** Micro-interaction

## Intention
Au survol du lien, une petite image s'ouvre au milieu de la ligne et écarte les mots.

## Ce qu'on ressent
Élégance éditoriale, le texte s'ouvre sur l'image.

## Utilisation
```html
<a href="#" data-fx="image-pop-link" data-fx-img="photo.jpg">Notre dernier projet</a>
```

## Paramètres
- `data-fx-img` : adresse de l'image
- `data-fx-at` : place de l'image, en nombre de mots
- `--fx-open` (1.8em) : largeur ouverte

## Quand l'utiliser
Grands liens, listes de projets.

## Quand l'éviter
Les liens sur plusieurs lignes.

## Accessibilité
L'image est décorative et masquée aux lecteurs d'écran.
