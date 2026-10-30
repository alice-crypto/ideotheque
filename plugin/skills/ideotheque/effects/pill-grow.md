# `pill-grow`

**Catégorie :** Présentation

## Intention
Une gélule s'ouvre au milieu d'un titre, puis une pastille glisse à l'intérieur, comme un interrupteur qu'on active.

## Ce qu'on ressent
Ludique, graphique, moderne.

## Utilisation
```html
<h1>Design <span data-fx="pill-grow" aria-hidden="true"></span> vivant</h1>
```

## Paramètres
- `--fx-w` (1.9em) : largeur finale de la gélule
- `--fx-pill-fill` : couleur de fond (transparente par défaut)
- `--fx-duration`, `--fx-delay`

## Quand l'utiliser
Ponctuer un grand titre de page d'accueil, une seule fois par écran.

## Quand l'éviter
Les textes courants et les titres déjà chargés en effets.

## Accessibilité
L'élément est décoratif : ajoutez `aria-hidden="true"`. Avec `prefers-reduced-motion: reduce`, la gélule apparaît ouverte directement.
