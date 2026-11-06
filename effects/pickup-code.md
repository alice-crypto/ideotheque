# `pickup-code`

**Catégorie :** État

## Intention
Un code de retrait s'affiche en grand, avec sa date limite et un bouton pour le copier.

## Ce qu'on ressent
Facile à montrer au comptoir.

## Utilisation
```html
<div data-fx="pickup-code" data-fx-code="4821"></div>
```

## Paramètres
- `data-fx-code` (4821), `data-fx-days` (3)

## Quand l'utiliser
Retrait en magasin, consignes, billets.

## Quand l'éviter
Un code qui donne seul accès à un médicament sans autre vérification.

## Accessibilité
Code lu chiffre par chiffre grâce à `aria-label`, et le bouton est un vrai bouton.
