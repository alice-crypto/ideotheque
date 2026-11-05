# `sound-bars-hover`

**Catégorie :** Micro-interaction

## Intention
Un petit égaliseur dont les barres ne s'animent qu'au survol, ou en continu.

## Ce qu'on ressent
Musique qui démarre, présence sonore discrète.

## Utilisation
```html
<span data-fx="sound-bars-hover"></span>
```

## Paramètres
- `data-fx-bars` (5) : nombre de barres
- `data-fx-auto="true"` : en continu
- `--fx-h` (22px), `--fx-w` (3px)

## Quand l'utiliser
Lecteur audio, titre en cours, bouton « écouter ».

## Quand l'éviter
Un élément sans rapport avec le son.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'effet est désactivé et le contenu s'affiche directement.
