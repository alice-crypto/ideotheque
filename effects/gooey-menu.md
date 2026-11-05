# `gooey-menu`

**Catégorie :** Micro-interaction

## Intention
Les actions s'échappent du bouton comme des gouttes, liées à lui par un pont liquide.

## Ce qu'on ressent
Lampe à lave, organique et ludique.

## Utilisation
```html
<div data-fx="gooey-menu"><button aria-label="Actions">+</button><a href="#">A</a><a href="#">B</a></div>
```

## Paramètres
- `--fx-goo-ink` : couleur des icônes

## Quand l'utiliser
Bouton d'actions flottant.

## Quand l'éviter
Plus de 4 actions, et les sites sobres.

## Accessibilité
Le bouton expose `aria-expanded`. Nommez chaque action avec `aria-label`.
