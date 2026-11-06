# `vibration-monitor`

**Catégorie :** État

## Intention
Un signal vibratoire défile, et une alerte apparaît quand il franchit le seuil.

## Ce qu'on ressent
Écouter la machine avant la panne.

## Utilisation
```html
<div data-fx="vibration-monitor" data-fx-threshold="0.7"></div>
```

## Paramètres
- `data-fx-threshold` (0.7), `--fx-h`

## Quand l'utiliser
Maintenance, serveurs, capteurs.

## Quand l'éviter
De montrer ce signal comme réel : il est simulé.

## Accessibilité
L'état est annoncé en mots. Le canvas est figé en mouvement réduit.
