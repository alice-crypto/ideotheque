# `liquid-fill`

**Catégorie :** État

## Intention
Un liquide ondulant monte dans le récipient jusqu'au niveau voulu.

## Ce qu'on ressent
Organique, lisible, ludique.

## Utilisation
```html
<div data-fx="liquid-fill" data-fx-value="65">65 %</div>
```

## Paramètres
- `data-fx-value` (65) : niveau de 0 à 100
- `--fx-liquid` : couleur du liquide

## Quand l'utiliser
Jauges, objectifs de collecte, niveaux de batterie ou d'eau.

## Quand l'éviter
Les valeurs précises : ajoutez le chiffre à côté.

## Accessibilité
La valeur doit aussi être écrite dans l'élément. Avec `prefers-reduced-motion: reduce`, le niveau est atteint directement, sans vagues.
