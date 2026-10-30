# `confetti`

**Catégorie :** État

## Intention
Une gerbe de confettis jaillit depuis l'élément, retombe en tournoyant et s'efface.

## Ce qu'on ressent
Célébration, récompense, fête.

## Utilisation
```html
<button data-fx="confetti">Valider</button>
```

## Paramètres
- `data-fx-count` (90) : nombre de confettis
- `data-fx-colors` : couleurs séparées par des virgules
- Se déclenche au clic ou avec `FX.trigger(element)`

## Quand l'utiliser
Inscription réussie, objectif atteint, anniversaire.

## Quand l'éviter
Les actions répétitives : la récompense perd son sens.

## Accessibilité
Le canvas est décoratif. Avec `prefers-reduced-motion: reduce`, aucun confetti n'est lancé.
