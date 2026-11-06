# `practitioner-sort`

**Catégorie :** Micro-interaction

## Intention
On trie une liste de praticiens, et les lignes glissent à leur nouvelle place.

## Ce qu'on ressent
On garde le fil pendant que la liste change.

## Utilisation
```html
<div data-fx="practitioner-sort" data-fx-items="Dr Aubry:1.2:3|Dr Klein:0.4:12"></div>
```

## Paramètres
- `data-fx-items` : « nom:km:jours » séparés par `|`

## Quand l'utiliser
Annuaires, résultats de recherche, tableaux courts.

## Quand l'éviter
Une très longue liste : l'animation devient confuse. Noms d'exemple fictifs.

## Accessibilité
Boutons `aria-pressed`, ordre réel du document modifié, pas d'animation en mouvement réduit.
