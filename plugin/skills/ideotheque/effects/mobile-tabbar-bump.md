# `mobile-tabbar-bump`

**Catégorie :** Navigation

## Intention
Une barre d'onglets mobile : une pastille glisse sous l'icône active, qui se soulève.

## Ce qu'on ressent
Ludique et net, on sait d'un coup d'œil où on est.

## Utilisation
```html
<nav data-fx="mobile-tabbar-bump"><a href="#" aria-label="Accueil">⌂</a><a href="#" aria-label="Recherche">⌕</a></nav>
```

## Paramètres
- `--fx-bar-bg` : fond de la barre
- `--fx-bump-ink` : couleur de l'icône active

## Quand l'utiliser
Applications mobiles, maquettes de produit.

## Quand l'éviter
Plus de 5 onglets.

## Accessibilité
Le lien actif porte `aria-current`. Nommez chaque icône avec `aria-label`.
