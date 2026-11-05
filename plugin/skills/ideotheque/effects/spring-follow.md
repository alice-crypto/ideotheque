# `spring-follow`

**Catégorie :** Micro-interaction

## Intention
Un point coloré suit le curseur dans l'élément, avec le retard souple d'un ressort.

## Ce qu'on ressent
Un petit compagnon, du poids et du rebond.

## Utilisation
```html
<div data-fx="spring-follow">…</div>
```

## Paramètres
- `data-fx-stiff` (90) : raideur du ressort
- `data-fx-damp` (11) : amorti
- `--fx-size` (28px) : taille du point

## Quand l'utiliser
Cartes de projet, zones d'image, sections d'accueil.

## Quand l'éviter
Les interfaces de travail où chaque clic doit être précis.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'effet est désactivé et le contenu s'affiche directement.
