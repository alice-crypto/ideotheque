# `command-dock`

**Catégorie :** Navigation

## Intention
Une palette de commandes : on tape, la liste se filtre en direct, et on valide au clavier.

## Ce qu'on ressent
Rapide, compétent, l'outil d'une personne qui sait ce qu'elle veut.

## Utilisation
```html
<div data-fx="command-dock"><input aria-label="Commande"><ul><li>Nouveau</li><li>Exporter</li></ul></div>
```

## Paramètres
- `data-fx-shortcut="true"` : donne le focus avec Ctrl/Cmd + K
- L'élément émet `fx:pick` avec le texte choisi.

## Quand l'utiliser
Applications, tableaux de bord, documentation.

## Quand l'éviter
Une liste de moins de cinq actions.

## Accessibilité
Rôles `combobox`, `listbox`, `option`, entièrement utilisable au clavier.
