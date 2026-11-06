# `due-date-bar`

**Catégorie :** État

## Intention
Une barre montre le temps écoulé vers une échéance, et le message devient plus ferme à l'approche.

## Ce qu'on ressent
Prévenant, on ne se fait pas surprendre.

## Utilisation
```html
<div data-fx="due-date-bar" data-fx-from="2026-11-01" data-fx-to="2026-12-01"></div>
```

## Paramètres
- `data-fx-from`, `data-fx-to` : dates
- `data-fx-warn` (3) : jours d'alerte

## Quand l'utiliser
Factures, abonnements, paiements.

## Quand l'éviter
Un ton culpabilisant dans les messages.

## Accessibilité
Rôle `progressbar`, et le message est écrit.
