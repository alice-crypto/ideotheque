# `multi-file-progress`

**Catégorie :** État

## Intention
Plusieurs tâches avancent en même temps, chacune avec sa barre, sa valeur et sa coche.

## Ce qu'on ressent
Contrôle, on suit tout sans attendre à l'aveugle.

## Utilisation
```html
<div data-fx="multi-file-progress" data-fx-manual="true" data-fx-items="a.zip|b.pdf"></div>
```

## Paramètres
- `data-fx-items` : noms séparés par `|`
- `data-fx-manual="true"` : progression pilotée par `el._fxSet(i, valeur)`

## Quand l'utiliser
Envois de fichiers, tâches d'agents, exports.

## Quand l'éviter
Une progression simulée pour une vraie tâche : passez en mode manuel.

## Accessibilité
Rôle `progressbar` avec `aria-valuenow` sur chaque ligne.
