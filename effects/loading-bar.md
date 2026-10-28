# `loading-bar`

**Catégorie :** État

## Intention
Une barre de chargement indéterminée : un segment accélère et s'étire en traversant la piste.

## Ce qu'on ressent
Discret, universel, en cours.

## Utilisation
```html
<div data-fx="loading-bar" role="progressbar" aria-label="Chargement"></div>
```

## Paramètres
- `--fx-height` (4px), `--fx-bar`, `--fx-track` : dimensions et couleurs

## Quand l'utiliser
Haut de page pendant un chargement, cartes en attente de données.

## Quand l'éviter
Les chargements dont on connaît la progression : affichez un pourcentage.

## Accessibilité
Ajoutez `role="progressbar"` et un `aria-label`. Avec `prefers-reduced-motion: reduce`, l'animation est figée.
