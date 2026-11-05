# `error-glitch-shake`

**Catégorie :** État

## Intention
Le champ refuse d'une petite secousse, se colore et explique en mots ce qui ne va pas.

## Ce qu'on ressent
Un refus clair, sans gronder.

## Utilisation
```html
<label data-fx="error-glitch-shake" data-fx-error="Adresse incomplète."><input></label>
```

## Paramètres
- `data-fx-error` : le message
- Par code : `FX.trigger(el)` à la validation
- `--fx-err` : couleur

## Quand l'utiliser
Formulaires, connexion, paiement.

## Quand l'éviter
Une secousse sans message : l'effet seul n'explique rien.

## Accessibilité
Le message a le rôle `alert`, et le champ reçoit `aria-invalid`.
