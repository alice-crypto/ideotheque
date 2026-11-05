# `wheel-scroll`

**Catégorie :** Défilement

## Intention
Une liste de mots tourne sur une roue verticale au rythme du défilement.

## Ce qu'on ressent
Sélecteur d'horloge, mécanisme de précision.

## Utilisation
```html
<div data-fx="wheel-scroll"><div>Design</div><div>Code</div><div>Motion</div></div>
```

## Paramètres
- `data-fx-turn` (180) : rotation totale en degrés
- `--fx-rad` (90px) : rayon de la roue
- `--fx-h` (150px) : hauteur visible

## Quand l'utiliser
Courtes listes de services, dates, mots clés.

## Quand l'éviter
Plus d'une dizaine d'éléments.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'effet est désactivé et le contenu s'affiche directement.
