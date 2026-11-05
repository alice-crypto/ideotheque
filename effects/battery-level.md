# `battery-level`

**Catégorie :** État

## Intention
Une petite pile se remplit jusqu'à son niveau, et clignote doucement si elle est faible ou en charge.

## Ce qu'on ressent
Familier, compris sans explication.

## Utilisation
```html
<div data-fx="battery-level" data-fx-value="68"></div>
```

## Paramètres
- `data-fx-value` (68), `data-fx-low` (20), `data-fx-charging`
- `--fx-full`, `--fx-empty`, `--fx-w`, `--fx-h`

## Quand l'utiliser
Quotas, crédits restants, appareils connectés.

## Quand l'éviter
Une valeur précise à lire seule : le pourcentage doit rester écrit.

## Accessibilité
Rôle `meter`, et le pourcentage est écrit.
