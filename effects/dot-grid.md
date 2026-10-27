# `dot-grid`

**Catégorie :** Ambiance

## Intention
Une trame de points recouvre le fond ; autour du curseur, les points grossissent et prennent la couleur d'accent.

## Ce qu'on ressent
Technique, interactif : la page réagit à la présence.

## Utilisation
```html
<section data-fx="dot-grid" data-fx-gap="24">…</section>
```

## Paramètres
- `data-fx-gap` (24) : espacement des points en pixels
- `data-fx-reach` (160) : rayon d'influence du curseur
- `--fx-dot-color`, `--fx-dot-accent`

## Quand l'utiliser
Fonds de section d'accueil, pages « à propos », zones d'appel à l'action.

## Quand l'éviter
Derrière un texte dense, et plus d'une fois par écran.

## Accessibilité
La trame est décorative et masquée aux lecteurs d'écran. Avec `prefers-reduced-motion: reduce`, les points réagissent sans transition.
