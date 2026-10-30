# `stack-cards`

**Catégorie :** Défilement

## Intention
Les cartes restent collées en haut en défilant et s'empilent ; celles du dessous reculent et s'assombrissent.

## Ce qu'on ressent
Physique, ordonné, comme un paquet qu'on constitue.

## Utilisation
```html
<div data-fx="stack-cards">
  <article>…</article>
  <article>…</article>
</div>
```

## Paramètres
- `--fx-top` (24px) : distance au haut de l'écran
- `--fx-step` (12px) : décalage entre deux cartes

## Quand l'utiliser
Étapes d'un processus, études de cas, fonctionnalités clés.

## Quand l'éviter
Les cartes plus hautes que l'écran.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, les cartes s'empilent sans reculer.
