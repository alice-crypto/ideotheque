# `flip-clock`

**Catégorie :** État

## Intention
Des chiffres qui basculent comme une horloge à palettes : l'heure actuelle, ou un compte à rebours.

## Ce qu'on ressent
Mécanique, rétro, attente d'un événement.

## Utilisation
```html
<div data-fx="flip-clock" data-fx-to="2026-12-31T23:59:59"></div>
```

## Paramètres
- `data-fx-to` : date cible (format ISO) pour un compte à rebours ; sinon l'heure actuelle
- `--fx-card` : couleur des palettes

## Quand l'utiliser
Lancements de produit, soldes, événements à venir.

## Quand l'éviter
Les comptes à rebours artificiels destinés à presser l'utilisateur.

## Accessibilité
L'élément a `role="timer"` et un `aria-label` mis à jour avec l'heure. Avec `prefers-reduced-motion: reduce`, les chiffres changent sans basculer.
