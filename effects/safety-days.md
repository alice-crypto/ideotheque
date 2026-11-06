# `safety-days`

**Catégorie :** État

## Intention
Un panneau affiche le nombre de jours sans accident et le record d'équipe.

## Ce qu'on ressent
Une fierté d'atelier, qu'on regarde en arrivant.

## Utilisation
```html
<div data-fx="safety-days" data-fx-since="2026-01-05"></div>
```

## Paramètres
- `data-fx-since` : date du dernier incident
- `data-fx-record` (530), `data-fx-title`, `--fx-safe`

## Quand l'utiliser
Usines, chantiers, équipes de garde, projets.

## Quand l'éviter
Une valeur inventée : ce chiffre engage des personnes, il doit être exact.

## Accessibilité
Rôle `img`, tout dans `aria-label`.
