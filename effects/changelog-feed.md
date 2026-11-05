# `changelog-feed`

**Catégorie :** Présentation

## Intention
Un journal des nouveautés dont les lignes arrivent en cascade, filtrable par type.

## Ce qu'on ressent
Un produit vivant, qui progresse sous nos yeux.

## Utilisation
```html
<ul data-fx="changelog-feed"><li data-type="Ajout">Nouveau thème</li><li data-type="Correctif">Bug corrigé</li></ul>
```

## Paramètres
- `data-type` sur chaque ligne : type de changement

## Quand l'utiliser
Journaux de versions, feuilles de route, actualités.

## Quand l'éviter
Une liste sans dates : ajoutez-les pour que le journal ait du sens.

## Accessibilité
Les filtres sont des boutons avec `aria-pressed`.
