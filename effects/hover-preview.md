# `hover-preview`

**Catégorie :** Image

## Intention
Survoler un élément de liste fait flotter son image près du curseur ; les autres éléments s'estompent.

## Ce qu'on ressent
Éditorial, interactif, galerie d'agence.

## Utilisation
```html
<ul data-fx="hover-preview">
  <li data-fx-image="projet-a.jpg">Projet A</li>
</ul>
```

## Paramètres
- `data-fx-image` sur chaque élément : son image
- `--fx-preview-w` (180px) : largeur de l'aperçu

## Quand l'utiliser
Listes de projets, index d'articles, menus de restaurant.

## Quand l'éviter
Les listes sur mobile (pas de survol) : l'image n'apparaît pas.

## Accessibilité
L'aperçu est décoratif. Le texte des éléments reste la seule information nécessaire.
