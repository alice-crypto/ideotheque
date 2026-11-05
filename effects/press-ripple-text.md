# `press-ripple-text`

**Catégorie :** Micro-interaction

## Intention
Au clic, un cercle part du doigt et inverse les couleurs du bouton, y compris celles du texte.

## Ce qu'on ressent
Une encre qui se répand, une confirmation franche.

## Utilisation
```html
<button data-fx="press-ripple-text">Envoyer</button>
```

## Paramètres
- `--fx-prt-bg`, `--fx-prt-fg` : couleurs inversées

## Quand l'utiliser
Boutons d'action principaux.

## Quand l'éviter
Les boutons très fréquents, comme un pavé de chiffres.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'effet est désactivé et le contenu s'affiche directement.
