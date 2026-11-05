# `stairs-scroll`

**Catégorie :** Défilement

## Intention
Une rangée de blocs forme un escalier qui s'aplanit jusqu'à une ligne parfaite.

## Ce qu'on ressent
Ordre qui s'installe, marches qui se rangent.

## Utilisation
```html
<div data-fx="stairs-scroll"><div>…</div><div>…</div><div>…</div></div>
```

## Paramètres
- `--fx-step` (34px) : hauteur d'une marche
- `--fx-gap` (10px) : écart

## Quand l'utiliser
Colonnes de chiffres, rangées d'images.

## Quand l'éviter
Les colonnes de hauteurs déjà irrégulières.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'effet est désactivé et le contenu s'affiche directement.
