# `bill-slices`

**Catégorie :** Présentation

## Intention
Une barre découpe la facture en postes, et chacun s'explique au clic.

## Ce qu'on ressent
Enfin comprendre où part l'argent.

## Utilisation
```html
<div data-fx="bill-slices" data-fx-items="Énergie:42:Consommation|Taxes:24:Taxes"></div>
```

## Paramètres
- `data-fx-items` : « poste:montant:explication » séparés par `|`

## Quand l'utiliser
Énergie, télécoms, impôts, tout budget.

## Quand l'éviter
Des parts d'exemple comme parts réelles : affichez la vraie facture.

## Accessibilité
Chaque part est un bouton nommé avec son pourcentage, détail annoncé.
