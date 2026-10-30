# `cross-draw`

**Catégorie :** État

## Intention
Une croix rouge se dessine dans un cercle, puis secoue la tête.

## Ce qu'on ressent
Clair, sans agressivité : « ça n'a pas marché ».

## Utilisation
```html
<span data-fx="cross-draw"></span>
```

## Paramètres
- `--fx-size` (72px), `--fx-ko` (#ef4444)
- Rejouable avec `FX.replay(element)`

## Quand l'utiliser
Échec de paiement, erreur d'envoi.

## Quand l'éviter
Sans message d'explication à côté.

## Accessibilité
Reçoit `role="img"` et `aria-label="Erreur"` (personnalisable). Accompagnez-la d'un message écrit.
