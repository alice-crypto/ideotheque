# `drawer-push`

**Catégorie :** Navigation

## Intention
Un panneau latéral s'ouvre et pousse tout le contenu, comme un seul objet.

## Ce qu'on ressent
Physique et net, l'espace se partage.

## Utilisation
```html
<div data-fx="drawer-push"><aside><a href="#">Lien</a></aside><main><button data-open>Menu</button></main></div>
```

## Paramètres
- `--fx-w` (60%), `--fx-drawer-bg`
- Le bouton porte `data-open`.

## Quand l'utiliser
Filtres, menus, panneaux de détail.

## Quand l'éviter
De longs panneaux sur mobile : préférez `drawer`.

## Accessibilité
`aria-expanded`, panneau `inert` tant qu'il est fermé, focus géré et Échap.
