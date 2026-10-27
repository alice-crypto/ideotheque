# `scanlines`

**Catégorie :** Ambiance

## Intention
Des lignes d'écran cathodique et un balayage lumineux passent sur un visuel, avec un léger scintillement.

## Ce qu'on ressent
Rétro-futuriste, science-fiction, tension.

## Utilisation
```html
<div data-fx="scanlines">
  <img src="…" alt="…">
</div>
```

## Paramètres
Aucun paramètre : l'effet utilise les pseudo-éléments `::before` et `::after` de l'élément.

## Quand l'utiliser
Visuels de jeux, univers science-fiction, sections « archives ».

## Quand l'éviter
Les textes à lire et les grands aplats clairs.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, le balayage et le scintillement sont coupés ; les lignes restent.
