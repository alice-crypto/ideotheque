# `border-trace`

**Catégorie :** Micro-interaction

## Intention
Une bordure se dessine tout autour de l'élément au survol : le haut, la droite, puis le bas et la gauche.

## Ce qu'on ressent
Précis, graphique, un cadre qui se referme.

## Utilisation
```html
<button data-fx="border-trace">Explorer</button>
```

## Paramètres
- `--fx-trace` (accent) : couleur du tracé

## Quand l'utiliser
Boutons sobres, cartes, champs mis en avant.

## Quand l'éviter
Les éléments à coins très arrondis : le tracé reste à angles droits.

## Accessibilité
Les effets de survol se déclenchent aussi au focus clavier quand c'est possible. Avec `prefers-reduced-motion: reduce`, les transitions sont instantanées.
