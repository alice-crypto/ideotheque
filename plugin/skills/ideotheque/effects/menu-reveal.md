# `menu-reveal`

**Catégorie :** Navigation

## Intention
Un menu plein écran s'ouvre en cercle depuis le bouton, puis ses liens arrivent en cascade.

## Ce qu'on ressent
Spectaculaire, immersif, très « agence ».

## Utilisation
```html
<button data-fx="burger-morph" data-fx-toggle="#menu"></button>
<nav id="menu" data-fx="menu-reveal">
  <a href="/">Accueil</a>
  <a href="/projets">Projets</a>
</nav>
```

## Paramètres
- `--fx-origin` : point de départ du cercle (coin haut droit par défaut)
- `--fx-menu-bg`, `--fx-menu-ink` : couleurs
- Ouverture : `FX.trigger(element)` ou un bouton `data-fx-toggle="#id"`
- Fermeture : Échap, un élément `data-fx-close`, ou un nouveau clic sur le bouton
- `data-fx-local` : reste dans son conteneur au lieu de couvrir l'écran

## Quand l'utiliser
Navigation principale de portfolios et sites vitrines.

## Quand l'éviter
Les sites avec beaucoup de rubriques : préférez un menu classique.

## Accessibilité
Le bouton reçoit `aria-expanded`, le composant `aria-hidden` ; Échap ferme et le premier élément focalisable reçoit le focus à l'ouverture. Avec `prefers-reduced-motion: reduce`, l'ouverture est instantanée.
