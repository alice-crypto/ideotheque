# `quote-rotator`

**Catégorie :** Présentation

## Intention
Les témoignages se succèdent dans un fondu flou ; le survol met en pause.

## Ce qu'on ressent
Élégant, posé, crédible.

## Utilisation
```html
<div data-fx="quote-rotator">
  <blockquote>…</blockquote>
  <blockquote>…</blockquote>
</div>
```

## Paramètres
- `data-fx-interval` (4500) : durée par citation en ms

## Quand l'utiliser
Témoignages clients, citations de presse.

## Quand l'éviter
Les citations très longues (le temps de lecture dépasse l'intervalle).

## Accessibilité
Le conteneur est une zone `aria-live="polite"`. Avec `prefers-reduced-motion: reduce`, la première citation reste affichée.
