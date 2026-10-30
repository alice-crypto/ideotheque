# `badge-bump`

**Catégorie :** État

## Intention
La pastille de compteur rebondit à chaque nouvelle valeur.

## Ce qu'on ressent
Réactif, attire l'œil sans crier.

## Utilisation
```html
<span data-fx="badge-bump">3</span>
```

## Paramètres
- `FX.trigger(element)` ajoute 1 au compteur (99+ au-delà)
- `--fx-badge`, `--fx-badge-size`

## Quand l'utiliser
Panier, notifications, messages non lus.

## Quand l'éviter
Les compteurs qui changent plusieurs fois par seconde.

## Accessibilité
La pastille est une zone `aria-live="polite"` : la nouvelle valeur est annoncée.
