# `toc-minimap`

**Catégorie :** Navigation

## Intention
Une miniature de la page montre la longueur de chaque section et où se trouve l'écran.

## Ce qu'on ressent
Éditeur de code, plan de métro, repère immédiat.

## Utilisation
```html
<aside data-fx="toc-minimap" data-fx-target="article > section"></aside>
```

## Paramètres
- `data-fx-target` (main > section) : sélecteur des sections
- `--fx-w` (34px), `--fx-h` (150px) : dimensions

## Quand l'utiliser
Longues pages, documentation, rapports.

## Quand l'éviter
Les pages courtes.

## Accessibilité
Rôle de navigation, et un lien nommé pour chaque section.
