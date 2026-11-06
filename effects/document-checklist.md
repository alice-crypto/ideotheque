# `document-checklist`

**Catégorie :** Micro-interaction

## Intention
Une liste de pièces se coche, une barre avance et le message dit ce qui manque.

## Ce qu'on ressent
On voit la fin de la démarche.

## Utilisation
```html
<div data-fx="document-checklist" data-fx-items="Constat|Photos"></div>
```

## Paramètres
- `data-fx-items` : pièces séparées par `|`
- `--fx-ok` : couleur du dossier complet

## Quand l'utiliser
Sinistres, inscriptions, demandes de prêt, démarches.

## Quand l'éviter
Une liste longue : il vaut mieux la grouper par étape.

## Accessibilité
Vraies cases à cocher, et ce qui manque est annoncé.
