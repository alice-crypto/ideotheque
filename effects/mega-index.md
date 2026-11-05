# `mega-index`

**Catégorie :** Navigation

## Intention
Une liste de très grands liens : l'aperçu du lien survolé apparaît à côté, les autres s'estompent.

## Ce qu'on ressent
Sommaire de magazine, navigation comme un choix à faire.

## Utilisation
```html
<nav data-fx="mega-index"><a href="#" data-fx-img="a.jpg">Projets</a><a href="#" data-fx-img="b.jpg">Studio</a></nav>
```

## Paramètres
- `data-fx-img` sur chaque lien : image d'aperçu
- `--fx-pv` (44%) : largeur de l'aperçu

## Quand l'utiliser
Menus plein écran, listes de projets.

## Quand l'éviter
Les menus longs : au-delà de 7 liens, la hauteur manque.

## Accessibilité
L'aperçu réagit aussi au focus clavier. Il est décoratif et masqué aux lecteurs d'écran.
