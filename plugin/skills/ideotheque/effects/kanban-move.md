# `kanban-move`

**Catégorie :** Présentation

## Intention
Sur un tableau de tâches, les cartes passent d'une colonne à l'autre comme si une équipe travaillait.

## Ce qu'on ressent
Une équipe invisible avance.

## Utilisation
```html
<div data-fx="kanban-move"><div><p data-card>Écrire</p></div><div></div><div></div></div>
```

## Paramètres
- `data-fx-every` (1.6) : secondes entre deux mouvements
- `data-card` sur les cartes

## Quand l'utiliser
Démonstrations de logiciels, pages d'accueil.

## Quand l'éviter
De faire croire à une activité réelle sur de vrais comptes.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, les cartes ne bougent que sur demande.
