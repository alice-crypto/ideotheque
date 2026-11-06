# `cashflow-waterfall`

**Catégorie :** Présentation

## Intention
Un graphique en cascade montre les entrées et les sorties, jusqu'au solde final.

## Ce qu'on ressent
On suit l'argent d'un bout à l'autre.

## Utilisation
```html
<div data-fx="cashflow-waterfall" data-fx-items="Ouverture:40|Ventes:65|Loyer:-12"></div>
```

## Paramètres
- `data-fx-items` : « nom:montant » séparés par `|`
- `--fx-h`, `--fx-pos`, `--fx-neg`

## Quand l'utiliser
Rapports, bilans, trésorerie.

## Quand l'éviter
Plus de 8 étapes : les libellés se coupent.

## Accessibilité
Toutes les valeurs sont dans `aria-label`. Le signe est écrit au-dessus de chaque marche.
