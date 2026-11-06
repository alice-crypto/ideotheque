# `callback-slots`

**Catégorie :** Micro-interaction

## Intention
On choisit parmi les prochains créneaux celui où l'on veut être rappelé.

## Ce qu'on ressent
Le service se plie à votre emploi du temps.

## Utilisation
```html
<div data-fx="callback-slots" data-fx-from="9" data-fx-to="19"></div>
```

## Paramètres
- `data-fx-from` (9), `data-fx-to` (19), `data-fx-step` (2), `data-fx-count` (4)
- événement `fx:slot`

## Quand l'utiliser
Assurance, banque, cabinets, service commercial.

## Quand l'éviter
De proposer des créneaux qu'aucune équipe n'assure : reliez-les aux vraies disponibilités.

## Accessibilité
Vrais boutons avec `aria-pressed`, et le choix est annoncé.
