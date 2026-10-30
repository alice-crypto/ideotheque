# `scatter-scroll`

**Catégorie :** Défilement

## Intention
Les lettres d'un titre se dispersent dans toutes les directions quand il quitte l'écran, et se rassemblent si on remonte.

## Ce qu'on ressent
Explosif, ludique, interactif.

## Utilisation
```html
<h1 data-fx="scatter-scroll">Explosion</h1>
```

## Paramètres
- `data-fx-spread` (160) : distance de dispersion en pixels

## Quand l'utiliser
Titres de héros, mots isolés.

## Quand l'éviter
Les textes longs.

## Accessibilité
Le texte est exposé via `aria-label`. Avec `prefers-reduced-motion: reduce`, l'élément reste dans son état final, sans suivre le défilement.
