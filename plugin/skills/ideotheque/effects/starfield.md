# `starfield`

**Catégorie :** Ambiance

## Intention
Un champ d'étoiles défile vers le spectateur, et le centre suit légèrement le curseur.

## Ce qu'on ressent
Voyage, vitesse, espace.

## Utilisation
```html
<section data-fx="starfield">…</section>
```

## Paramètres
- `data-fx-count` (220) : nombre d'étoiles
- `data-fx-speed` (0.25) : vitesse
- `--fx-star` : couleur

## Quand l'utiliser
Écrans de chargement, héros de sites spatiaux ou tech.

## Quand l'éviter
Les longues pages : l'animation tourne en continu tant qu'elle est visible.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, une seule image fixe est dessinée. Le canvas est masqué aux lecteurs d'écran.
