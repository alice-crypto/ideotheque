# `radial-bars`

**Catégorie :** Présentation

## Intention
Des barres rayonnent autour d'un centre et poussent une à une vers l'extérieur.

## Ce qu'on ressent
Soleil de données, cycle, rythme d'une journée.

## Utilisation
```html
<div data-fx="radial-bars" data-fx-values="40,70,55,90"></div>
```

## Paramètres
- `data-fx-values` : valeurs séparées par des virgules
- `--fx-size` (160px), `--fx-w` (6px), `--fx-bar`

## Quand l'utiliser
Données cycliques : heures, mois, semaines.

## Quand l'éviter
Une comparaison précise : les barres longues semblent plus importantes qu'elles ne le sont.

## Accessibilité
Les valeurs sont dans `aria-label`.
