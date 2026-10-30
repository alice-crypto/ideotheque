# `path-scroll`

**Catégorie :** Défilement

## Intention
Un tracé SVG se dessine au fil du défilement, comme un chemin qui avance avec le lecteur.

## Ce qu'on ressent
Guidé, narratif, on suit la ligne.

## Utilisation
```html
<svg data-fx="path-scroll" viewBox="…"><path d="…" stroke="currentColor"/></svg>
```

## Paramètres
Aucun paramètre : tous les `<path>` de l'élément sont tracés (prévoir `stroke`).

## Quand l'utiliser
Lignes de parcours, frises, signatures, schémas.

## Quand l'éviter
Les tracés remplis (`fill`) : seul le contour se dessine.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, le tracé est affiché en entier.
