# `stacked-sections-tabs`

**Catégorie :** Navigation

## Intention
Des sections empilées côte à côte, comme les onglets d'un classeur : celle qu'on ouvre prend la place.

## Ce qu'on ressent
Archives bien rangées, on feuillette le contenu.

## Utilisation
```html
<div data-fx="stacked-sections-tabs"><section><button>Un</button><div>…</div></section><section><button>Deux</button><div>…</div></section></div>
```

## Paramètres
- `--fx-tab` (38px) : largeur d'un onglet
- `--fx-h` (260px) : hauteur
- `--fx-width` (220px) : largeur du contenu ouvert

## Quand l'utiliser
Étapes, services, chapitres courts.

## Quand l'éviter
Plus de 5 sections, ou sur un écran très étroit.

## Accessibilité
Chaque onglet est un bouton avec `aria-expanded`.
