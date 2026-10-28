# `invert-sweep`

**Catégorie :** Micro-interaction

## Intention
Un aplat balaie l'élément de gauche à droite en inversant ses couleurs.

## Ce qu'on ressent
Radical, graphique, contraste maximal.

## Utilisation
```html
<a href="…" data-fx="invert-sweep">Menu</a>
```

## Paramètres
Aucun paramètre (mode de fusion `difference`).

## Quand l'utiliser
Liens de menu, boutons sur fond uni, titres cliquables.

## Quand l'éviter
Les images (l'inversion les rend négatives).

## Accessibilité
Les effets de survol se déclenchent aussi au focus clavier quand c'est possible. Avec `prefers-reduced-motion: reduce`, les transitions sont instantanées.
