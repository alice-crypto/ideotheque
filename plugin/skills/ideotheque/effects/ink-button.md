# `ink-button`

**Catégorie :** Micro-interaction

## Intention
Une goutte de couleur entre dans le bouton par le côté d'où arrive le curseur, et ressort par le côté où il part.

## Ce qu'on ressent
Liquide, le bouton connaît votre geste.

## Utilisation
```html
<a href="#" data-fx="ink-button">Nous écrire</a>
```

## Paramètres
- `--fx-ink-c` : couleur de la goutte
- `--fx-ink-fg` : couleur du texte au survol

## Quand l'utiliser
Boutons et liens en contour.

## Quand l'éviter
Les très petits boutons, où le geste ne se voit pas.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'effet est désactivé et le contenu s'affiche directement.
