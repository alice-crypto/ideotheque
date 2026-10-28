# `view-morph`

**Catégorie :** Transition

## Intention
Les éléments passent d'un état à l'autre en se transformant (position, taille), grâce à l'API View Transitions du navigateur.

## Ce qu'on ressent
Fluide, natif, comme une application.

## Utilisation
```html
<button onclick="FX.play('view-morph', () => galerie.classList.toggle('grille'))">Basculer</button>
```

## Paramètres
- `FX.play('view-morph', callback)` : `callback` modifie la page (ajout de classe, contenu…)
- Donnez `view-transition-name: nom-unique` aux éléments qui doivent se transformer
- Repli immédiat sans animation sur les navigateurs qui ne gèrent pas l'API

## Quand l'utiliser
Filtres de galerie, passage liste/grille, ouverture d'une carte en détail.

## Quand l'éviter
Les changements de page complets (cette version ne gère que les changements dans la même page).

## Accessibilité
Avec `prefers-reduced-motion: reduce`, le changement est immédiat.
