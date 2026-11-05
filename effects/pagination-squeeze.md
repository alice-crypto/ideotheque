# `pagination-squeeze`

**Catégorie :** Micro-interaction

## Intention
Une pagination dont l'indicateur glisse et rebondit d'une page à l'autre.

## Ce qu'on ressent
Petit détail qui fait dire que tout est soigné.

## Utilisation
```html
<nav data-fx="pagination-squeeze" data-fx-pages="5"></nav>
```

## Paramètres
- `data-fx-pages` (5)
- L'élément émet `fx:page`.

## Quand l'utiliser
Listes, articles, boutiques.

## Quand l'éviter
Des centaines de pages sans raccourci.

## Accessibilité
La page courante porte `aria-current="page"`.
