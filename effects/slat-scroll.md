# `slat-scroll`

**Catégorie :** Défilement

## Intention
Des lames horizontales recouvrent l'image et s'ouvrent une à une au défilement.

## Ce qu'on ressent
Un store qu'on remonte, la lumière entre par tranches.

## Utilisation
```html
<figure data-fx="slat-scroll"><img src="photo.jpg" alt=""></figure>
```

## Paramètres
- `data-fx-slats` (7) : nombre de lames
- `--fx-slat` : couleur des lames

## Quand l'utiliser
Images plein cadre, ouvertures de sections.

## Quand l'éviter
Les éléments de moins de 120 px de haut.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'effet est désactivé et le contenu s'affiche directement.
