# `sidebar-collapse`

**Catégorie :** Navigation

## Intention
Une barre latérale se replie sur ses icônes, et retient ce choix.

## Ce qu'on ressent
Application professionnelle, on garde la main.

## Utilisation
```html
<nav data-fx="sidebar-collapse"><button data-toggle>‹</button><a href="#">⌂ <span>Accueil</span></a></nav>
```

## Paramètres
- `data-fx-key` : clé d'enregistrement du choix
- `--fx-w` (180px), `--fx-mini` (52px)

## Quand l'utiliser
Tableaux de bord, applications.

## Quand l'éviter
Des icônes peu claires sans leur libellé.

## Accessibilité
Bouton nommé avec `aria-expanded`. Le libellé reste dans le lien pour les lecteurs d'écran.
