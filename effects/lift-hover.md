# `lift-hover`

**Catégorie :** Micro-interaction

## Intention
L'élément se soulève de quelques pixels et son ombre s'allonge au survol.

## Ce qu'on ressent
Matériel, cliquable, sobre.

## Utilisation
```html
<a class="carte" href="…" data-fx="lift-hover">…</a>
```

## Paramètres
Aucun paramètre.

## Quand l'utiliser
Cartes cliquables, vignettes, tuiles.

## Quand l'éviter
Les éléments non cliquables : le soulèvement promet une action.

## Accessibilité
Les effets de survol se déclenchent aussi au focus clavier quand c'est possible. Avec `prefers-reduced-motion: reduce`, les transitions sont instantanées.
