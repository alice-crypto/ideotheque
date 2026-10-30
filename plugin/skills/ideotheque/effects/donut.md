# `donut`

**Catégorie :** Présentation

## Intention
Un graphique en anneau dont les parts se tracent l'une après l'autre, avec un libellé au centre.

## Ce qu'on ressent
Synthétique, clair, répartition.

## Utilisation
```html
<div data-fx="donut" data-fx-values="45,25,20,10">Budget</div>
```

## Paramètres
- `data-fx-values` : valeurs séparées par des virgules
- `data-fx-colors` : couleurs
- `--fx-size` (140px)
- Le texte de l'élément devient le libellé central

## Quand l'utiliser
Répartitions de budget, parts de marché, composition.

## Quand l'éviter
Plus de six parts : utilisez plutôt des barres.

## Accessibilité
L'anneau a `role="img"` et un `aria-label` listant les valeurs. Avec `prefers-reduced-motion: reduce`, il est tracé directement.
