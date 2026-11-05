# `particle-text`

**Catégorie :** Ambiance

## Intention
Des particules se rassemblent pour former un mot, et s'écartent quand le curseur passe.

## Ce qu'on ressent
Poussière d'étoiles, un mot qui se tient de justesse.

## Utilisation
```html
<h1 data-fx="particle-text">Stellaire</h1>
```

## Paramètres
- `data-fx-step` (3) : densité des particules

## Quand l'utiliser
Un seul mot en grand, écran d'accueil.

## Quand l'éviter
Les phrases entières : le nombre de particules explose.

## Accessibilité
Le texte est dans `aria-label`. Avec `prefers-reduced-motion: reduce`, le mot s'affiche directement.
