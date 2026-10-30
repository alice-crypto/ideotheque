# `press-squash`

**Catégorie :** Micro-interaction

## Intention
L'élément s'écrase quand on appuie dessus et rebondit au relâchement.

## Ce qu'on ressent
Tactile, élastique, comme un vrai bouton.

## Utilisation
```html
<button data-fx="press-squash">Appuyer</button>
```

## Paramètres
Aucun paramètre.

## Quand l'utiliser
Boutons principaux, icônes cliquables, jeux.

## Quand l'éviter
Les éléments très larges : l'écrasement paraît excessif.

## Accessibilité
Les effets de survol se déclenchent aussi au focus clavier quand c'est possible. Avec `prefers-reduced-motion: reduce`, les transitions sont instantanées.
