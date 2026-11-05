# `hover-marquee`

**Catégorie :** Texte

## Intention
Au repos, une ligne de texte immobile ; au survol, elle défile en continu.

## Ce qu'on ressent
Éditorial, une liste qui s'anime sous la main.

## Utilisation
```html
<a href="#" data-fx="hover-marquee">Tous les projets</a>
```

## Paramètres
- `data-fx-speed` (80) : vitesse en pixels par seconde

## Quand l'utiliser
Listes de projets, sommaires, grands liens.

## Quand l'éviter
Les textes qu'il faut lire entièrement sans survol s'ils sont coupés.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'effet est désactivé et le contenu s'affiche directement.
