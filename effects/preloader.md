# `preloader`

**Catégorie :** Présentation

## Intention
Un écran de chargement chiffré de 0 à 100 %, avec une barre de progression, qui se lève vers le haut pour révéler la page.

## Ce qu'on ressent
Une attente mise en scène, le sentiment de « lancer » une expérience.

## Utilisation
```html
<div data-fx="preloader" data-fx-label="Chargement"></div>
```

## Paramètres
- `data-fx-label` : texte au-dessus du compteur
- `data-fx-duration` (2200, en ms)
- `data-fx-local` : reste dans son conteneur au lieu de couvrir toute la page
- `--fx-preloader-bg`, `--fx-preloader-ink`, `--fx-preloader-accent`
- Événement `fx:done` émis à la fin

## Quand l'utiliser
Portfolios, sites d'événement, expériences immersives, une seule fois à l'arrivée.

## Quand l'éviter
Les sites utilitaires (e-commerce, back-office) : l'utilisateur veut son contenu tout de suite.

## Accessibilité
L'élément a `role="status"`. Avec `prefers-reduced-motion: reduce`, il disparaît immédiatement.
