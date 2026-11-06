# `secure-lock`

**Catégorie :** État

## Intention
Un cadenas ouvert se ferme et le message passe à « chiffré ».

## Ce qu'on ressent
Rassurant, juste avant de payer.

## Utilisation
```html
<span data-fx="secure-lock"></span>
```

## Paramètres
- `data-fx-wait`, `data-fx-done` : textes
- `data-fx-wait2` (1200) : durée

## Quand l'utiliser
Pages de paiement, connexions.

## Quand l'éviter
D'afficher ce message sans vraie protection : branchez-le sur une véritable vérification.

## Accessibilité
Rôle `status`, le message est écrit.
