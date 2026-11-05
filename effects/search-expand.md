# `search-expand`

**Catégorie :** Micro-interaction

## Intention
Une icône de recherche s'ouvre en un champ de saisie, et se referme s'il reste vide.

## Ce qu'on ressent
Compact, l'outil apparaît seulement quand on le veut.

## Utilisation
```html
<div data-fx="search-expand"><input aria-label="Rechercher"><button aria-label="Ouvrir la recherche">⌕</button></div>
```

## Paramètres
- `--fx-width` (180px) : largeur ouverte

## Quand l'utiliser
Entêtes, barres d'outils.

## Quand l'éviter
Un site où la recherche est l'action principale : gardez alors le champ ouvert.

## Accessibilité
Bouton nommé, `aria-expanded`, fermeture avec Échap et retour du focus.
