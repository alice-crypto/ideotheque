# `record-fold`

**Catégorie :** Présentation

## Intention
Un historique se range par année : la plus récente est ouverte, les autres se déplient.

## Ce qu'on ressent
Ordonné, on retrouve une date sans tout parcourir.

## Utilisation
```html
<div data-fx="record-fold" data-fx-items="2027:Bilan|2026:Vaccin"></div>
```

## Paramètres
- `data-fx-items` : « année:acte » séparés par `|`

## Quand l'utiliser
Historique de soins, factures, entretiens, archives.

## Quand l'éviter
Une année contenant plus de six actes : la hauteur maximale couperait la liste.

## Accessibilité
Boutons avec `aria-expanded` et `aria-controls`. Une année repliée n'est pas lue.
