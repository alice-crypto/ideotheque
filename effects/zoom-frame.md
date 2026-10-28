# `zoom-frame`

**Catégorie :** Micro-interaction

## Intention
L'image s'approche lentement à l'intérieur de son cadre au survol, sans que le cadre bouge.

## Ce qu'on ressent
Contemplatif, élégant.

## Utilisation
```html
<figure data-fx="zoom-frame"><img src="…" alt="…"></figure>
```

## Paramètres
- `--fx-zoom` (1.08) : grossissement final

## Quand l'utiliser
Vignettes de projets, galeries, articles.

## Quand l'éviter
Les images contenant du texte important sur les bords (il serait rogné).

## Accessibilité
Les effets de survol se déclenchent aussi au focus clavier quand c'est possible. Avec `prefers-reduced-motion: reduce`, les transitions sont instantanées.
