# `spotlight-card`

**Catégorie :** Micro-interaction

## Intention
Une lueur colorée suit le curseur à l'intérieur de la carte.

## Ce qu'on ressent
Interactif, lumineux, très « produit tech ».

## Utilisation
```html
<article data-fx="spotlight-card">…</article>
```

## Paramètres
- `--fx-glow` : couleur de la lueur
- `--fx-size` (260px) : taille de la lueur

## Quand l'utiliser
Grilles de fonctionnalités, cartes de tarifs.

## Quand l'éviter
Les écrans tactiles (pas de survol) : prévoyez un style au repos suffisant.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'effet est désactivé et le contenu s'affiche directement.
