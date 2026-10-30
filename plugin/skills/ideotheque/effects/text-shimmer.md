# `text-shimmer`

**Catégorie :** Texte

## Intention
Un reflet traverse le texte en boucle, pour dire « en train de réfléchir ».

## Ce qu'on ressent
Patient, discret, technologique.

## Utilisation
```html
<span data-fx="text-shimmer">Réflexion en cours…</span>
```

## Paramètres
- `--fx-shine` (blanc) : couleur du reflet
- `--fx-speed` (2.2s) : durée d'un passage

## Quand l'utiliser
Libellés d'attente courts : « Analyse en cours… », « Réflexion… ».

## Quand l'éviter
Les longs textes ou les titres : le reflet fatigue l'œil.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'effet est désactivé et le contenu s'affiche directement.
