# `check-draw`

**Catégorie :** État

## Intention
Une coche verte se dessine dans un cercle, puis fait un petit bond de satisfaction.

## Ce qu'on ressent
Rassurant, gratifiant, « c'est fait ».

## Utilisation
```html
<span data-fx="check-draw"></span>
```

## Paramètres
- `--fx-size` (72px), `--fx-ok` (#22c55e)
- Rejouable avec `FX.replay(element)`

## Quand l'utiliser
Confirmation de paiement, envoi de formulaire, tâche terminée.

## Quand l'éviter
Les validations mineures et fréquentes.

## Accessibilité
Reçoit `role="img"` et `aria-label="Réussi"` (personnalisable). Avec `prefers-reduced-motion: reduce`, la coche apparaît directement.
