# `incident-timer`

**Catégorie :** Micro-interaction

## Intention
Un compteur indique le temps restant pour déclarer un sinistre.

## Ce qu'on ressent
Cadre clair dans un moment confus, sans panique.

## Utilisation
```html
<div data-fx="incident-timer" data-fx-start="2027-01-10" data-fx-days="5"></div>
```

## Paramètres
- `data-fx-start` : instant du sinistre
- `data-fx-days` (5), `data-fx-ago` (2) pour la démonstration

## Quand l'utiliser
Déclarations, garanties à délai, rétractation.

## Quand l'éviter
Un délai faux : il engage. Les jours ouvrés ne sont pas calculés ici, seule une durée continue l'est.

## Accessibilité
Rôle `timer`, et le temps est écrit en jours et en heures.
