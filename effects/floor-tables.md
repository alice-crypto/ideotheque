# `floor-tables`

**Catégorie :** Micro-interaction

## Intention
Sur un plan de salle, on choisit une table libre, et sa capacité s'écrit.

## Ce qu'on ressent
On se voit déjà assis près de la fenêtre.

## Utilisation
```html
<div data-fx="floor-tables" data-fx-items="12:18:2:f|38:18:2:o"></div>
```

## Paramètres
- `data-fx-items` : « x:y:places:état (f ou o) » séparés par `|`

## Quand l'utiliser
Restaurants, cinémas, coworkings.

## Quand l'éviter
Un plan non tenu à jour : le choix promis doit rester disponible.

## Accessibilité
Boutons nommés avec capacité et état, tables occupées désactivées.
