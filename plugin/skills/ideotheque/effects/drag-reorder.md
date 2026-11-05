# `drag-reorder`

**Catégorie :** Micro-interaction

## Intention
On fait glisser une ligne de la liste, et les autres s'écartent pour lui faire de la place.

## Ce qu'on ressent
Direct et concret, comme déplacer des fiches sur une table.

## Utilisation
```html
<ul data-fx="drag-reorder"><li>…</li><li>…</li></ul>
```

## Paramètres
L'élément émet `fx:change` à chaque changement d'ordre.

## Quand l'utiliser
Listes de priorités, playlists, étapes.

## Quand l'éviter
Les listes longues sur mobile, où le geste entre en conflit avec le défilement.

## Accessibilité
Au clavier : focus sur une ligne, puis Alt + flèche haut ou bas.
