# `ripple-click`

**Catégorie :** Micro-interaction

## Intention
Une onde circulaire se propage depuis le point exact où l'on clique.

## Ce qu'on ressent
Réactif, rassurant : le clic a bien été reçu.

## Utilisation
```html
<button data-fx="ripple-click">Valider</button>
```

## Paramètres
- `--fx-ripple` (couleur du texte) : couleur de l'onde

## Quand l'utiliser
Boutons, cartes cliquables, éléments de liste.

## Quand l'éviter
Les liens dans un texte.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, aucune onde n'est créée.
