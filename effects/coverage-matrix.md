# `coverage-matrix`

**Catégorie :** Présentation

## Intention
Un tableau de garanties éclaire la formule choisie sur toute sa colonne.

## Ce qu'on ressent
Comparaison nette, sans lecture ligne à ligne.

## Utilisation
```html
<div data-fx="coverage-matrix" data-fx-plans="Tiers,Confort" data-fx-items="Vol:0,1"></div>
```

## Paramètres
- `data-fx-plans` : formules séparées par des virgules
- `data-fx-items` : « garantie:1,0,1 » séparés par `|`
- `data-fx-pick` (1) : formule éclairée au départ

## Quand l'utiliser
Comparaison de formules, d'offres, d'abonnements.

## Quand l'éviter
Plus de quatre formules sur mobile : le tableau devient illisible.

## Accessibilité
Vrai tableau avec en-têtes, boutons `aria-pressed`, et chaque marque est nommée.
