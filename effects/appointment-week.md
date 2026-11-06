# `appointment-week`

**Catégorie :** Micro-interaction

## Intention
On choisit un jour de la semaine, puis une heure, et le rendez-vous s'écrit en toutes lettres.

## Ce qu'on ressent
Rapide, deux gestes et c'est réservé.

## Utilisation
```html
<div data-fx="appointment-week" data-fx-hours="9:00,14:00"></div>
```

## Paramètres
- `data-fx-hours` : heures séparées par des virgules
- `data-fx-days` (5) ; événement `fx:slot`

## Quand l'utiliser
Cabinets, garages, coiffeurs, services.

## Quand l'éviter
De laisser ces créneaux d'exemple : ils doivent venir d'un vrai agenda.

## Accessibilité
Vrais boutons, choix du jour exposé par `aria-pressed`, et rendez-vous annoncé.
